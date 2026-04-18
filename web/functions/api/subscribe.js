/**
 * POST /api/subscribe — waitlist / newsletter signup (Cloudflare Pages Function)
 *
 * Bindings (wrangler / Pages project settings):
 * - WAITLIST: KV namespace — one key per normalized email: `signup:{email}`
 *
 * Optional env:
 * - ALLOWED_ORIGINS — comma-separated origins for CORS (e.g. https://tryclareo.com,https://www.tryclareo.com).
 *   If unset, Access-Control-Allow-Origin mirrors the request Origin when present, else *.
 * - WEBHOOK_URL — optional POST target (Zapier, Slack, etc.) with JSON { email, event, ts }.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const headers = new Headers();
  if (allowed.length > 0) {
    if (origin && allowed.includes(origin)) {
      headers.set("Access-Control-Allow-Origin", origin);
    }
  } else if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
  } else {
    headers.set("Access-Control-Allow-Origin", "*");
  }
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  return headers;
}

function json(body, status, request, env) {
  const headers = corsHeaders(request, env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const ct = request.headers.get("Content-Type") || "";
    if (!ct.includes("application/json")) {
      return json({ error: "Expected application/json" }, 415, request, env);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, request, env);
    }

    const raw = typeof body.email === "string" ? body.email.trim() : "";
    const email = raw.toLowerCase();
    if (!email || !EMAIL_RE.test(email) || email.length > 254) {
      return json({ error: "Invalid email" }, 400, request, env);
    }

    if (!env.WAITLIST) {
      return json({ error: "Waitlist storage is not configured" }, 503, request, env);
    }

    const key = `signup:${email}`;
    const existing = await env.WAITLIST.get(key);
    if (existing) {
      return json({ ok: true }, 200, request, env);
    }

    const record = {
      email,
      createdAt: new Date().toISOString(),
      source: "waitlist",
    };
    await env.WAITLIST.put(key, JSON.stringify(record));

    const webhook = env.WEBHOOK_URL;
    if (webhook) {
      context.waitUntil(
        fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            event: "waitlist_signup",
            ts: record.createdAt,
          }),
        }).catch(() => {})
      );
    }

    return json({ ok: true }, 200, request, env);
  } catch (e) {
    console.error("subscribe error:", e);
    return json({ error: "Server error" }, 500, request, env);
  }
}

export async function onRequestOptions(context) {
  const { request, env } = context;
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}
