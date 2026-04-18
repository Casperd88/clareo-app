import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { authenticate, generateToken } from "../middleware/auth.js";
import { passport } from "../lib/passport.js";

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "audiobook://";

interface OAuthUser {
  id: string;
  email: string;
}

function handleOAuthCallback(req: Request, res: Response) {
  const user = req.user as OAuthUser | undefined;
  if (!user) {
    res.redirect(`${FRONTEND_URL}auth/error?message=Authentication failed`);
    return;
  }
  const token = generateToken({ userId: user.id, email: user.email });
  
  res.redirect(`${FRONTEND_URL}auth/callback?token=${token}`);
}

router.get("/google", passport.authenticate("google", { session: false }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  handleOAuthCallback
);

router.post("/apple", passport.authenticate("apple", { session: false }));

router.post(
  "/apple/callback",
  passport.authenticate("apple", { session: false, failureRedirect: "/login" }),
  handleOAuthCallback
);

router.get("/providers", (_req: Request, res: Response) => {
  const providers = [];
  
  if (process.env.GOOGLE_CLIENT_ID) {
    providers.push({
      id: "google",
      name: "Google",
      type: "oauth",
    });
  }
  
  if (process.env.APPLE_CLIENT_ID) {
    providers.push({
      id: "apple", 
      name: "Apple",
      type: "oauth",
    });
  }
  
  providers.push({
    id: "credentials",
    name: "Email & Password",
    type: "credentials",
  });
  
  res.json({ providers });
});

router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        throw new AppError(400, "Email and password are required");
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new AppError(409, "User already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name },
        select: { id: true, email: true, name: true, createdAt: true },
      });

      const token = generateToken({ userId: user.id, email: user.email });

      res.status(201).json({ user, token });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(400, "Email and password are required");
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { accounts: { select: { provider: true } } },
      });

      if (!user) {
        throw new AppError(401, "Invalid credentials");
      }

      if (!user.password) {
        const providers = user.accounts.map((a) => a.provider).join(", ");
        throw new AppError(
          400,
          `This account uses ${providers} sign-in. Please use that method to log in.`
        );
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AppError(401, "Invalid credentials");
      }

      const token = generateToken({ userId: user.id, email: user.email });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/me",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
          accounts: {
            select: {
              provider: true,
              providerAccountId: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError(404, "User not found");
      }

      const hasPassword = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { password: true },
      });

      res.json({
        user: {
          ...user,
          hasPassword: !!hasPassword?.password,
          linkedProviders: user.accounts.map((a) => a.provider),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/set-password",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { password, currentPassword } = req.body;

      if (!password || password.length < 8) {
        throw new AppError(400, "Password must be at least 8 characters");
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
      });

      if (!user) {
        throw new AppError(404, "User not found");
      }

      if (user.password && currentPassword) {
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
          throw new AppError(401, "Current password is incorrect");
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { password: hashedPassword },
      });

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/accounts/:provider",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { provider } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: { accounts: true },
      });

      if (!user) {
        throw new AppError(404, "User not found");
      }

      if (!user.password && user.accounts.length <= 1) {
        throw new AppError(
          400,
          "Cannot unlink the only sign-in method. Set a password first."
        );
      }

      await prisma.account.deleteMany({
        where: {
          userId: req.user!.userId,
          provider: provider as string,
        },
      });

      res.json({ message: `${provider} account unlinked successfully` });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
