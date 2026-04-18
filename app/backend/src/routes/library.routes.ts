import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.libraryItem.findMany({
      where: { userId: req.user!.userId },
      include: {
        audiobook: {
          include: {
            author: { select: { id: true, name: true } },
            narrators: { include: { narrator: { select: { id: true, name: true } } } },
            _count: { select: { chapters: true } },
          },
        },
      },
      orderBy: { addedAt: "desc" },
    });

    const library = await Promise.all(
      items.map(async (item) => {
        const playbackState = await prisma.playbackState.findUnique({
          where: {
            userId_audiobookId: {
              userId: req.user!.userId,
              audiobookId: item.audiobookId,
            },
          },
        });

        return {
          ...item,
          audiobook: {
            ...item.audiobook,
            narrators: item.audiobook.narrators.map((n) => n.narrator),
          },
          playbackState,
        };
      })
    );

    res.json({ library });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { audiobookId } = req.body;

    if (!audiobookId) {
      throw new AppError(400, "Audiobook ID is required");
    }

    const audiobook = await prisma.audiobook.findUnique({
      where: { id: audiobookId },
    });

    if (!audiobook) {
      throw new AppError(404, "Audiobook not found");
    }

    const existing = await prisma.libraryItem.findUnique({
      where: {
        userId_audiobookId: {
          userId: req.user!.userId,
          audiobookId,
        },
      },
    });

    if (existing) {
      throw new AppError(409, "Already in library");
    }

    const item = await prisma.libraryItem.create({
      data: {
        userId: req.user!.userId,
        audiobookId,
      },
      include: {
        audiobook: {
          include: {
            author: { select: { id: true, name: true } },
          },
        },
      },
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/:audiobookId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const audiobookId = req.params.audiobookId as string;

      await prisma.libraryItem.delete({
        where: {
          userId_audiobookId: {
            userId: req.user!.userId,
            audiobookId,
          },
        },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
