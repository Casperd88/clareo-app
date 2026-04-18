import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

router.use(authenticate);

interface PreferencesBody {
  displayName?: string;
  genres?: string[];
  listeningHabits?: string[];
  monthlyGoal?: number;
  preferredSpeed?: number;
  onboardingCompleted?: boolean;
}

router.get(
  "/preferences",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: req.user.userId },
      });

      if (!preferences) {
        res.json({
          success: true,
          preferences: null,
        });
        return;
      }

      res.json({
        success: true,
        preferences: {
          displayName: preferences.displayName,
          genres: preferences.genres,
          listeningHabits: preferences.listeningHabits,
          monthlyGoal: preferences.monthlyGoal,
          preferredSpeed: preferences.preferredSpeed,
          onboardingCompleted: preferences.onboardingCompleted,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/preferences",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const {
        displayName,
        genres,
        listeningHabits,
        monthlyGoal,
        preferredSpeed,
        onboardingCompleted,
      } = req.body as PreferencesBody;

      const preferences = await prisma.userPreferences.upsert({
        where: { userId: req.user.userId },
        update: {
          displayName: displayName ?? undefined,
          genres: genres ?? undefined,
          listeningHabits: listeningHabits ?? undefined,
          monthlyGoal: monthlyGoal ?? undefined,
          preferredSpeed: preferredSpeed ?? undefined,
          onboardingCompleted: onboardingCompleted ?? undefined,
        },
        create: {
          userId: req.user.userId,
          displayName: displayName ?? null,
          genres: genres ?? [],
          listeningHabits: listeningHabits ?? [],
          monthlyGoal: monthlyGoal ?? 2,
          preferredSpeed: preferredSpeed ?? 1.0,
          onboardingCompleted: onboardingCompleted ?? false,
        },
      });

      if (displayName) {
        await prisma.user.update({
          where: { id: req.user.userId },
          data: { name: displayName },
        });
      }

      res.json({
        success: true,
        preferences: {
          displayName: preferences.displayName,
          genres: preferences.genres,
          listeningHabits: preferences.listeningHabits,
          monthlyGoal: preferences.monthlyGoal,
          preferredSpeed: preferences.preferredSpeed,
          onboardingCompleted: preferences.onboardingCompleted,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/preferences",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      const {
        displayName,
        genres,
        listeningHabits,
        monthlyGoal,
        preferredSpeed,
        onboardingCompleted,
      } = req.body as PreferencesBody;

      const existingPreferences = await prisma.userPreferences.findUnique({
        where: { userId: req.user.userId },
      });

      if (!existingPreferences) {
        throw new AppError(404, "Preferences not found. Use POST to create.");
      }

      const preferences = await prisma.userPreferences.update({
        where: { userId: req.user.userId },
        data: {
          displayName: displayName !== undefined ? displayName : undefined,
          genres: genres !== undefined ? genres : undefined,
          listeningHabits: listeningHabits !== undefined ? listeningHabits : undefined,
          monthlyGoal: monthlyGoal !== undefined ? monthlyGoal : undefined,
          preferredSpeed: preferredSpeed !== undefined ? preferredSpeed : undefined,
          onboardingCompleted: onboardingCompleted !== undefined ? onboardingCompleted : undefined,
        },
      });

      if (displayName !== undefined) {
        await prisma.user.update({
          where: { id: req.user.userId },
          data: { name: displayName },
        });
      }

      res.json({
        success: true,
        preferences: {
          displayName: preferences.displayName,
          genres: preferences.genres,
          listeningHabits: preferences.listeningHabits,
          monthlyGoal: preferences.monthlyGoal,
          preferredSpeed: preferences.preferredSpeed,
          onboardingCompleted: preferences.onboardingCompleted,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user reading stats (books completed this month, total listening time, etc.)
router.get(
  "/stats",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, "Authentication required");
      }

      // Get start and end of current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Count completed books this month
      const completedThisMonth = await prisma.playbackState.count({
        where: {
          userId: req.user.userId,
          isCompleted: true,
          updatedAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      // Get total completed books
      const totalCompleted = await prisma.playbackState.count({
        where: {
          userId: req.user.userId,
          isCompleted: true,
        },
      });

      // Get current listening progress (books started but not finished)
      const inProgress = await prisma.playbackState.findMany({
        where: {
          userId: req.user.userId,
          isCompleted: false,
          currentPosition: { gt: 0 },
        },
        include: {
          audiobook: {
            select: {
              id: true,
              title: true,
              totalDuration: true,
            },
          },
        },
      });

      // Calculate partial progress toward next book
      let partialProgress = 0;
      if (inProgress.length > 0) {
        // Sum up progress across all in-progress books as fraction of a book
        const progressSum = inProgress.reduce((sum, item) => {
          const bookProgress = item.audiobook.totalDuration > 0
            ? item.currentPosition / item.audiobook.totalDuration
            : 0;
          return sum + bookProgress;
        }, 0);
        partialProgress = Math.min(progressSum, 1); // Cap at 1 book worth
      }

      // Get total listening time this month
      const playbackStates = await prisma.playbackState.findMany({
        where: {
          userId: req.user.userId,
        },
        select: {
          currentPosition: true,
        },
      });
      const totalListeningSeconds = playbackStates.reduce(
        (sum, state) => sum + state.currentPosition,
        0
      );

      // Get user's monthly goal
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: req.user.userId },
        select: { monthlyGoal: true },
      });
      const monthlyGoal = preferences?.monthlyGoal || 2;

      res.json({
        completedThisMonth,
        totalCompleted,
        monthlyGoal,
        partialProgress: Math.round(partialProgress * 100) / 100,
        totalListeningMinutes: Math.round(totalListeningSeconds / 60),
        inProgressCount: inProgress.length,
        progressPercent: Math.round(((completedThisMonth + partialProgress) / monthlyGoal) * 100),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
