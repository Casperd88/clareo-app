import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Dev-only handler so `npm run dev` can POST /api/subscribe without Wrangler. */
function waitlistDevApi() {
  return {
    name: "waitlist-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] || "";
        if (url !== "/api/subscribe") {
          next();
          return;
        }

        const sendCors = () => {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        };

        if (req.method === "OPTIONS") {
          sendCors();
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }

        const raw = await new Promise((resolve, reject) => {
          const chunks = [];
          req.on("data", (c) => chunks.push(c));
          req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
          req.on("error", reject);
        });

        sendCors();
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        try {
          const body = JSON.parse(raw || "{}");
          const email =
            typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
          const ok =
            email.length > 0 &&
            email.length <= 254 &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          if (!ok) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Invalid email" }));
            return;
          }
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true }));
          console.info("[dev /api/subscribe]", email);
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Bad request" }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), waitlistDevApi()],
});
