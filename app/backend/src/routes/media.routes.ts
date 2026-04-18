import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";
import {
  generateSignedUrl,
  generateUploadUrl,
  getMediaPath,
  MediaType,
} from "../lib/storage.js";

const router = Router();

router.get(
  "/audiobooks/:audiobookId/signed-urls",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const audiobookId = req.params.audiobookId as string;
      const expiresIn = parseInt(req.query.expiresIn as string) || 3600;

      const audiobook = await prisma.audiobook.findUnique({
        where: { id: audiobookId },
        include: {
          chapters: {
            orderBy: { chapterNumber: "asc" },
          },
        },
      });

      if (!audiobook) {
        throw new AppError(404, "Audiobook not found");
      }

      const urls: Record<string, string | null> = {
        coverImage: null,
        coverVideo: null,
        audio: null,
      };

      if (audiobook.coverImageKey) {
        urls.coverImage = await generateSignedUrl(
          audiobook.coverImageKey,
          expiresIn
        );
      }

      if (audiobook.coverVideoKey) {
        urls.coverVideo = await generateSignedUrl(
          audiobook.coverVideoKey,
          expiresIn
        );
      }

      const audioKey = getMediaPath(audiobookId, "audio", "full.mp3");
      try {
        urls.audio = await generateSignedUrl(audioKey, expiresIn);
      } catch {
        urls.audio = null;
      }

      const chapterUrls = await Promise.all(
        audiobook.chapters.map(async (chapter) => {
          let audioUrl = null;
          if (chapter.audioFileKey) {
            try {
              audioUrl = await generateSignedUrl(
                chapter.audioFileKey,
                expiresIn
              );
            } catch {
              audioUrl = null;
            }
          }
          return {
            chapterId: chapter.id,
            chapterNumber: chapter.chapterNumber,
            audioUrl,
          };
        })
      );

      res.json({
        audiobookId,
        expiresIn,
        urls,
        chapters: chapterUrls,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/audiobooks/:audiobookId/upload-url",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const audiobookId = req.params.audiobookId as string;
      const { type, filename, contentType } = req.body as {
        type: MediaType;
        filename: string;
        contentType: string;
      };

      if (!type || !filename || !contentType) {
        throw new AppError(400, "type, filename, and contentType are required");
      }

      const validTypes: MediaType[] = ["audio", "cover", "video", "subtitle"];
      if (!validTypes.includes(type)) {
        throw new AppError(400, `Invalid type. Must be one of: ${validTypes.join(", ")}`);
      }

      const audiobook = await prisma.audiobook.findUnique({
        where: { id: audiobookId },
      });

      if (!audiobook) {
        throw new AppError(404, "Audiobook not found");
      }

      const key = getMediaPath(audiobookId, type, filename);
      const uploadUrl = await generateUploadUrl(key, contentType, 3600);

      if (type === "cover" && filename.match(/\.(jpg|jpeg|png|webp)$/i)) {
        await prisma.audiobook.update({
          where: { id: audiobookId },
          data: { coverImageKey: key },
        });
      } else if (type === "video" && filename.match(/\.(mp4|webm|mov)$/i)) {
        await prisma.audiobook.update({
          where: { id: audiobookId },
          data: { coverVideoKey: key },
        });
      }

      res.json({
        uploadUrl,
        key,
        expiresIn: 3600,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/audiobooks/:audiobookId/subtitles",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const audiobookId = req.params.audiobookId as string;
      const chapterNumber = parseInt(req.query.chapter as string);
      const startTime = parseFloat(req.query.startTime as string) || 0;
      const endTime = parseFloat(req.query.endTime as string) || Infinity;

      const audiobook = await prisma.audiobook.findUnique({
        where: { id: audiobookId },
      });

      if (!audiobook) {
        throw new AppError(404, "Audiobook not found");
      }

      const where: Record<string, unknown> = {};

      if (!isNaN(chapterNumber)) {
        const chapter = await prisma.chapter.findFirst({
          where: { audiobookId, chapterNumber },
        });
        if (chapter) {
          where.chapterId = chapter.id;
        }
      }

      const segments = await prisma.segment.findMany({
        where: {
          chapter: { audiobookId },
          ...where,
          startTime: { gte: startTime },
          endTime: { lte: endTime === Infinity ? undefined : endTime },
        },
        orderBy: { startTime: "asc" },
        take: 500,
      });

      res.json({ segments });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
