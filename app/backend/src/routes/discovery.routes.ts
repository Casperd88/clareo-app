import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { generateSignedUrl } from "../lib/storage.js";

const router = Router();

router.use(authenticate);

interface FormattedAudiobook {
  id: string;
  title: string;
  description: string | null;
  coverImageKey: string | null;
  coverVideoKey: string | null;
  coverImageUrl: string | null;
  totalDuration: number;
  language: string;
  author: { id: string; name: string };
  narrators: { id: string; name: string }[];
  genres: { id: string; name: string }[];
  _count: { chapters: number };
}

async function formatAudiobook(book: {
  id: string;
  title: string;
  description: string | null;
  coverImageKey: string | null;
  coverVideoKey: string | null;
  totalDuration: number;
  language: string;
  author: { id: string; name: string };
  narrators: { narrator: { id: string; name: string } }[];
  genres: { genre: { id: string; name: string } }[];
  _count: { chapters: number };
}): Promise<FormattedAudiobook> {
  let coverImageUrl: string | null = null;
  if (book.coverImageKey) {
    try {
      coverImageUrl = await generateSignedUrl(book.coverImageKey, 7200);
    } catch {
      // Ignore errors - cover just won't be available
    }
  }
  
  return {
    ...book,
    coverImageUrl,
    narrators: book.narrators.map((n) => n.narrator),
    genres: book.genres.map((g) => g.genre),
  };
}

const GENRE_ID_TO_NAME: Record<string, string> = {
  "personal-development": "Personal Development",
  productivity: "Productivity",
  business: "Business & Entrepreneurship",
  psychology: "Psychology & Mindset",
  money: "Money & Finance",
  leadership: "Leadership",
  health: "Health & Wellness",
  communication: "Communication",
  relationships: "Relationships",
  career: "Career & Success",
  creativity: "Creativity",
  science: "Science & Technology",
  philosophy: "Philosophy",
  history: "History",
  parenting: "Parenting & Education",
};

const audiobookInclude = {
  author: { select: { id: true, name: true } },
  narrators: {
    include: { narrator: { select: { id: true, name: true } } },
  },
  genres: { include: { genre: { select: { id: true, name: true } } } },
  _count: { select: { chapters: true } },
};

interface DiscoverySection {
  id: string;
  title: string;
  subtitle?: string;
  type: "horizontal" | "grid" | "featured";
  audiobooks: FormattedAudiobook[];
}

router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const userId = req.user.userId;

      // Fetch user data in parallel
      const [preferences, userLibrary, userPlaybackStates] = await Promise.all([
        prisma.userPreferences.findUnique({
          where: { userId },
        }),
        prisma.libraryItem.findMany({
          where: { userId },
          select: { audiobookId: true },
        }),
        prisma.playbackState.findMany({
          where: { userId },
          select: { audiobookId: true, currentPosition: true, isCompleted: true },
        }),
      ]);

      const userGenres = preferences?.genres || [];
      const userHabits = preferences?.listeningHabits || [];
      const displayName = preferences?.displayName || "there";

      // User data flags
      const hasPreferences = userGenres.length > 0;
      const hasLibrary = userLibrary.length > 0;
      const hasListeningHistory = userPlaybackStates.some(s => s.currentPosition > 0);
      
      // IDs to potentially exclude from recommendations (already in library)
      const libraryIds = new Set(userLibrary.map(item => item.audiobookId));

      const sections: DiscoverySection[] = [];
      const genreNames = userGenres.map((id) => GENRE_ID_TO_NAME[id]).filter(Boolean);

      // ═══════════════════════════════════════════════════════════════════════════
      // SECTION 1: FOR YOU (personalized) or POPULAR PICKS (cold start)
      // ═══════════════════════════════════════════════════════════════════════════
      
      if (hasPreferences && genreNames.length > 0) {
        // WITH DATA: Show books matching user's interests, excluding already in library
        const forYouBooks = await prisma.audiobook.findMany({
          where: {
            genres: {
              some: {
                genre: { name: { in: genreNames } },
              },
            },
            // Exclude books already in library if user has some
            ...(hasLibrary ? { id: { notIn: Array.from(libraryIds) } } : {}),
          },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: audiobookInclude,
        });

        if (forYouBooks.length > 0) {
          sections.push({
            id: "for-you",
            title: `For You, ${displayName}`,
            subtitle: "Based on your interests",
            type: "featured",
            audiobooks: await Promise.all(forYouBooks.map(formatAudiobook)),
          });
        }
      } else {
        // COLD START: No preferences - show curated popular picks
        const popularPicks = await prisma.audiobook.findMany({
          where: {
            // Books with cover images are typically our "premium" content
            coverImageKey: { not: null },
          },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: audiobookInclude,
        });

        if (popularPicks.length > 0) {
          sections.push({
            id: "popular-picks",
            title: "Start Your Journey",
            subtitle: "Popular titles to get you started",
            type: "featured",
            audiobooks: await Promise.all(popularPicks.map(formatAudiobook)),
          });
        }
      }

      // ═══════════════════════════════════════════════════════════════════════════
      // SECTION 2: TRENDING NOW
      // ═══════════════════════════════════════════════════════════════════════════
      
      // Get actual popularity data (library additions count)
      const popularityData = await prisma.libraryItem.groupBy({
        by: ["audiobookId"],
        _count: { audiobookId: true },
        orderBy: { _count: { audiobookId: "desc" } },
        take: 20,
      });

      // Always prioritize books with cover images first (premium content)
      const booksWithCovers = await prisma.audiobook.findMany({
        where: {
          coverImageKey: { not: null },
        },
        take: 6,
        orderBy: { createdAt: "desc" },
        include: audiobookInclude,
      });
      
      const coverIds = booksWithCovers.map(b => b.id);
      
      let remainingBooks;
      if (popularityData.length >= 5) {
        // WITH DATA: Fill remaining slots with popular books (that don't have covers)
        const popularIds = popularityData
          .map(p => p.audiobookId)
          .filter(id => !coverIds.includes(id));
        const books = await prisma.audiobook.findMany({
          where: { id: { in: popularIds } },
          include: audiobookInclude,
        });
        remainingBooks = popularIds
          .map(id => books.find(b => b.id === id))
          .filter((book): book is NonNullable<typeof book> => book !== undefined)
          .slice(0, 12 - booksWithCovers.length);
      } else {
        // COLD START: Fill with recent books that have chapters
        remainingBooks = await prisma.audiobook.findMany({
          where: {
            chapters: { some: {} },
            id: { notIn: coverIds },
          },
          take: 12 - booksWithCovers.length,
          orderBy: { createdAt: "desc" },
          include: audiobookInclude,
        });
      }
      
      const trendingBooks = [...booksWithCovers, ...remainingBooks];

      if (trendingBooks.length > 0) {
        sections.push({
          id: "trending",
          title: "Trending Now",
          subtitle: popularityData.length >= 5 
            ? "Most popular this week" 
            : "Editor's picks",
          type: "horizontal",
          audiobooks: await Promise.all(trendingBooks.map(formatAudiobook)),
        });
      }

      // ═══════════════════════════════════════════════════════════════════════════
      // SECTION 3: HABIT-BASED SECTIONS (only if user has habits selected)
      // ═══════════════════════════════════════════════════════════════════════════

      if (userHabits.includes("commute")) {
        const quickListens = await prisma.audiobook.findMany({
          where: { totalDuration: { gt: 0, lte: 900 } }, // Under 15 min
          take: 10,
          orderBy: { totalDuration: "asc" },
          include: audiobookInclude,
        });

        if (quickListens.length > 0) {
          sections.push({
            id: "quick-listens",
            title: "Quick Listens",
            subtitle: "Under 15 minutes",
            type: "horizontal",
            audiobooks: await Promise.all(quickListens.map(formatAudiobook)),
          });
        }
      }

      if (userHabits.includes("bedtime")) {
        const windDownBooks = await prisma.audiobook.findMany({
          where: {
            genres: {
              some: {
                genre: {
                  name: { in: ["Philosophy", "Health & Wellness", "Personal Development"] },
                },
              },
            },
          },
          take: 10,
          include: audiobookInclude,
        });

        if (windDownBooks.length > 0) {
          sections.push({
            id: "wind-down",
            title: "Wind Down",
            subtitle: "Perfect for bedtime",
            type: "horizontal",
            audiobooks: await Promise.all(windDownBooks.map(formatAudiobook)),
          });
        }
      }

      if (userHabits.includes("exercise")) {
        const motivationBooks = await prisma.audiobook.findMany({
          where: {
            genres: {
              some: {
                genre: {
                  name: { in: ["Personal Development", "Psychology & Mindset", "Health & Wellness"] },
                },
              },
            },
          },
          take: 10,
          include: audiobookInclude,
        });

        if (motivationBooks.length > 0) {
          sections.push({
            id: "motivation",
            title: "Get Motivated",
            subtitle: "Fuel your workout",
            type: "horizontal",
            audiobooks: await Promise.all(motivationBooks.map(formatAudiobook)),
          });
        }
      }

      // ═══════════════════════════════════════════════════════════════════════════
      // SECTION 4: GENRE-SPECIFIC (only if user has interests)
      // ═══════════════════════════════════════════════════════════════════════════

      if (hasPreferences) {
        for (const genreName of genreNames.slice(0, 3)) {
          const genreBooks = await prisma.audiobook.findMany({
            where: {
              genres: {
                some: { genre: { name: genreName } },
              },
            },
            take: 10,
            include: audiobookInclude,
          });

          if (genreBooks.length > 0) {
            sections.push({
              id: `genre-${genreName.toLowerCase().replace(/\s+/g, "-")}`,
              title: genreName,
              type: "horizontal",
              audiobooks: await Promise.all(genreBooks.map(formatAudiobook)),
            });
          }
        }
      } else {
        // COLD START: Show diverse default categories for new users
        const defaultCategories = ["Personal Development", "Business & Entrepreneurship", "Psychology & Mindset"];
        
        for (const category of defaultCategories) {
          const categoryBooks = await prisma.audiobook.findMany({
            where: {
              genres: {
                some: { genre: { name: category } },
              },
            },
            take: 10,
            include: audiobookInclude,
          });

          if (categoryBooks.length > 0) {
            sections.push({
              id: `genre-${category.toLowerCase().replace(/\s+/g, "-")}`,
              title: category,
              subtitle: "Explore this category",
              type: "horizontal",
              audiobooks: await Promise.all(categoryBooks.map(formatAudiobook)),
            });
          }
        }
      }

      // ═══════════════════════════════════════════════════════════════════════════
      // SECTION 5: NEW RELEASES (always show)
      // ═══════════════════════════════════════════════════════════════════════════

      const newReleases = await prisma.audiobook.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        skip: 12, // Skip what's already in trending
        include: audiobookInclude,
      });

      if (newReleases.length > 0) {
        sections.push({
          id: "new-releases",
          title: "New Releases",
          subtitle: "Fresh additions",
          type: "horizontal",
          audiobooks: await Promise.all(newReleases.map(formatAudiobook)),
        });
      }

      // ═══════════════════════════════════════════════════════════════════════════
      // SECTION 6: DISCOVER MORE (always show - helps with exploration)
      // ═══════════════════════════════════════════════════════════════════════════

      const totalBooks = await prisma.audiobook.count();
      const randomSkip = Math.floor(Math.random() * Math.max(0, totalBooks - 10));
      const discoverMore = await prisma.audiobook.findMany({
        take: 10,
        skip: randomSkip,
        include: audiobookInclude,
      });

      if (discoverMore.length > 0) {
        sections.push({
          id: "discover-more",
          title: "Discover More",
          subtitle: "Expand your horizons",
          type: "horizontal",
          audiobooks: await Promise.all(discoverMore.map(formatAudiobook)),
        });
      }

      // ═══════════════════════════════════════════════════════════════════════════
      // BUILD RESPONSE with metadata
      // ═══════════════════════════════════════════════════════════════════════════

      res.json({
        sections,
        greeting: `Good ${getTimeOfDayGreeting()}, ${displayName}`,
        totalBooks,
        // Metadata for frontend to adapt UI
        meta: {
          hasPreferences,
          hasLibrary,
          hasListeningHistory,
          isNewUser: !hasPreferences && !hasLibrary,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/genre/:genreId",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const genreId = req.params.genreId as string;
      const { page = "1", limit = "20" } = req.query;

      const genreName = GENRE_ID_TO_NAME[genreId];

      if (!genreName) {
        res.status(404).json({ error: "Genre not found" });
        return;
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [audiobooks, total] = await Promise.all([
        prisma.audiobook.findMany({
          where: {
            genres: {
              some: { genre: { name: genreName } },
            },
          },
          skip,
          take: parseInt(limit as string),
          include: audiobookInclude,
        }),
        prisma.audiobook.count({
          where: {
            genres: {
              some: { genre: { name: genreName } },
            },
          },
        }),
      ]);

      res.json({
        genre: { id: genreId, name: genreName },
        audiobooks: await Promise.all(audiobooks.map(formatAudiobook)),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default router;
