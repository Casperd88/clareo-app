import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = "1", limit = "20", search, genre } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { author: { name: { contains: search as string, mode: "insensitive" } } },
      ];
    }

    if (genre) {
      where.genres = { some: { genre: { name: genre as string } } };
    }

    const [audiobooks, total] = await Promise.all([
      prisma.audiobook.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: {
          author: { select: { id: true, name: true } },
          narrators: { include: { narrator: { select: { id: true, name: true } } } },
          genres: { include: { genre: { select: { id: true, name: true } } } },
          _count: { select: { chapters: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.audiobook.count({ where }),
    ]);

    const formatted = audiobooks.map((book) => ({
      ...book,
      narrators: book.narrators.map((n) => n.narrator),
      genres: book.genres.map((g) => g.genre),
    }));

    res.json({
      audiobooks: formatted,
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
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const audiobook = await prisma.audiobook.findUnique({
      where: { id },
      include: {
        author: true,
        narrators: { include: { narrator: true } },
        genres: { include: { genre: true } },
        chapters: { orderBy: { chapterNumber: "asc" } },
      },
    });

    if (!audiobook) {
      throw new AppError(404, "Audiobook not found");
    }

    res.json({
      ...audiobook,
      narrators: audiobook.narrators.map((n: { narrator: unknown }) => n.narrator),
      genres: audiobook.genres.map((g: { genre: unknown }) => g.genre),
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, authorId, narratorIds, genreIds, chapters } =
        req.body;

      if (!title || !authorId) {
        throw new AppError(400, "Title and author are required");
      }

      const audiobook = await prisma.audiobook.create({
        data: {
          title,
          description,
          authorId,
          narrators: narratorIds
            ? {
                create: narratorIds.map((id: string) => ({ narratorId: id })),
              }
            : undefined,
          genres: genreIds
            ? { create: genreIds.map((id: string) => ({ genreId: id })) }
            : undefined,
          chapters: chapters
            ? { create: chapters }
            : undefined,
        },
        include: {
          author: true,
          narrators: { include: { narrator: true } },
          genres: { include: { genre: true } },
          chapters: true,
        },
      });

      const formatted = {
        ...audiobook,
        narrators: audiobook.narrators.map((n) => n.narrator),
        genres: audiobook.genres.map((g) => g.genre),
      };

      res.status(201).json(formatted);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id/chapters",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const chapters = await prisma.chapter.findMany({
        where: { audiobookId: id },
        orderBy: { chapterNumber: "asc" },
      });

      res.json({ chapters });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
