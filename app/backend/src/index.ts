import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import { router } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { prisma } from "./lib/prisma.js";
import { passport } from "./lib/passport.js";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS_ORIGIN may be:
//  - "*" (no credentials reflected; browsers block credentialed requests)
//  - a comma-separated list of explicit origins
//  - unset → sensible local dev defaults (Cloudflare tunnel + localhost)
const DEFAULT_DEV_ORIGINS = [
  "https://local.tryclareo.com",
  "https://app-local.tryclareo.com",
  "http://localhost:5173",
  "http://localhost:8081",
];
const RAW_CORS = (process.env.CORS_ORIGIN ?? "").trim();
const ALLOWED_ORIGINS =
  RAW_CORS === "" ? DEFAULT_DEV_ORIGINS : RAW_CORS.split(",").map((s) => s.trim()).filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Allow requests with no Origin header (mobile apps, curl, server-to-server).
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes("*")) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, origin);
      return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/uploads", express.static("uploads"));

app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", router);

app.use(errorHandler);

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to database");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
