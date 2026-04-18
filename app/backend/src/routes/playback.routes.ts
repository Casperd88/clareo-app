import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get(
  "/:audiobookId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const audiobookId = req.params.audiobookId as string;

      const state = await prisma.playbackState.findUnique({
        where: {
          userId_audiobookId: {
            userId: req.user!.userId,
            audiobookId,
          },
        },
      });

      res.json({ playbackState: state });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:audiobookId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const audiobookId = req.params.audiobookId as string;
      const { currentPosition, currentChapter, playbackSpeed, isCompleted } =
        req.body;

      const audiobook = await prisma.audiobook.findUnique({
        where: { id: audiobookId },
      });

      if (!audiobook) {
        throw new AppError(404, "Audiobook not found");
      }

      const state = await prisma.playbackState.upsert({
        where: {
          userId_audiobookId: {
            userId: req.user!.userId,
            audiobookId,
          },
        },
        create: {
          userId: req.user!.userId,
          audiobookId,
          currentPosition: currentPosition ?? 0,
          currentChapter: currentChapter ?? 1,
          playbackSpeed: playbackSpeed ?? 1.0,
          isCompleted: isCompleted ?? false,
        },
        update: {
          ...(currentPosition !== undefined && { currentPosition }),
          ...(currentChapter !== undefined && { currentChapter }),
          ...(playbackSpeed !== undefined && { playbackSpeed }),
          ...(isCompleted !== undefined && { isCompleted }),
          lastPlayedAt: new Date(),
        },
      });

      res.json({ playbackState: state });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const states = await prisma.playbackState.findMany({
      where: { userId: req.user!.userId },
      include: {
        audiobook: {
          select: {
            id: true,
            title: true,
            coverImageKey: true,
            totalDuration: true,
          },
        },
      },
      orderBy: { lastPlayedAt: "desc" },
    });

    res.json({ playbackStates: states });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/continue",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recentState = await prisma.playbackState.findFirst({
        where: {
          userId: req.user!.userId,
          isCompleted: false,
        },
        include: {
          audiobook: {
            include: {
              author: { select: { id: true, name: true } },
              chapters: { orderBy: { chapterNumber: "asc" } },
            },
          },
        },
        orderBy: { lastPlayedAt: "desc" },
      });

      res.json({ continueListening: recentState });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
