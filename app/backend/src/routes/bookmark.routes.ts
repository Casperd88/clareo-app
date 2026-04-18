import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { audiobookId } = req.query;

    const where: Record<string, unknown> = { userId: req.user!.userId };
    if (audiobookId) {
      where.audiobookId = audiobookId as string;
    }

    const bookmarks = await prisma.bookmark.findMany({
      where,
      include: {
        audiobook: { select: { id: true, title: true } },
        chapter: { select: { id: true, title: true, chapterNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ bookmarks });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { audiobookId, chapterId, position, note } = req.body;

    if (!audiobookId || !chapterId || position === undefined) {
      throw new AppError(
        400,
        "Audiobook ID, chapter ID, and position are required"
      );
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter || chapter.audiobookId !== audiobookId) {
      throw new AppError(404, "Chapter not found");
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: req.user!.userId,
        audiobookId,
        chapterId,
        position,
        note,
      },
      include: {
        audiobook: { select: { id: true, title: true } },
        chapter: { select: { id: true, title: true, chapterNumber: true } },
      },
    });

    res.status(201).json(bookmark);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { note } = req.body;

    const existing = await prisma.bookmark.findUnique({ where: { id } });

    if (!existing || existing.userId !== req.user!.userId) {
      throw new AppError(404, "Bookmark not found");
    }

    const bookmark = await prisma.bookmark.update({
      where: { id },
      data: { note },
      include: {
        audiobook: { select: { id: true, title: true } },
        chapter: { select: { id: true, title: true, chapterNumber: true } },
      },
    });

    res.json(bookmark);
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const existing = await prisma.bookmark.findUnique({ where: { id } });

      if (!existing || existing.userId !== req.user!.userId) {
        throw new AppError(404, "Bookmark not found");
      }

      await prisma.bookmark.delete({ where: { id } });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
