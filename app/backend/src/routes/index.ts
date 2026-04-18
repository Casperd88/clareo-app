import { Router } from "express";
import authRoutes from "./auth.routes.js";
import audiobookRoutes from "./audiobook.routes.js";
import libraryRoutes from "./library.routes.js";
import playbackRoutes from "./playback.routes.js";
import bookmarkRoutes from "./bookmark.routes.js";
import mediaRoutes from "./media.routes.js";
import usersRoutes from "./users.routes.js";
import discoveryRoutes from "./discovery.routes.js";

export const router = Router();

router.use("/auth", authRoutes);
router.use("/audiobooks", audiobookRoutes);
router.use("/library", libraryRoutes);
router.use("/playback", playbackRoutes);
router.use("/bookmarks", bookmarkRoutes);
router.use("/media", mediaRoutes);
router.use("/users", usersRoutes);
router.use("/discovery", discoveryRoutes);
