import { Server, Origins } from "boardgame.io/server";
import * as Logic from "@muko/logic";
import { randomBytes } from "node:crypto";
import pino from "pino";

const { Muko } = Logic;

const log = pino({ level: process.env.LOG_LEVEL ?? "info" });

// Match ID generator: 6 uppercase alphanumeric chars via CSPRNG.
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const BIAS_LIMIT = 252; // floor(256 / 36) * 36 — rejection-sampling limit

const customGenerator = (): string => {
  let id = "";
  while (id.length < 6) {
    const byte = randomBytes(1)[0];
    if (byte < BIAS_LIMIT) id += CHARS[byte % 36];
  }
  return id;
};

// In-memory rate limiter: 10 creates/IP/min, 5 joins/IP/min, 300 default.
interface RateEntry {
  count: number;
  resetAt: number;
}
const rateMap = new Map<string, RateEntry>();
const WINDOW_MS = 60_000;
const ROUTE_LIMITS: Array<[string, number]> = [
  ["/create", 300],
  ["/join", 200],
];
const DEFAULT_LIMIT = 5000;

function getLimit(path: string): number {
  for (const [suffix, limit] of ROUTE_LIMITS) {
    if (path.endsWith(suffix)) return limit;
  }
  return DEFAULT_LIMIT;
}

// Prune stale entries every 5 min to prevent unbounded memory growth.
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap.entries()) {
    if (now > entry.resetAt) rateMap.delete(ip);
  }
}, 5 * 60_000).unref();

const rateLimiter = async (ctx: any, next: () => Promise<void>) => {
  const ip: string = ctx.ip ?? "unknown";
  const now = Date.now();
  let entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    rateMap.set(ip, entry);
  }
  entry.count++;
  const limit = getLimit(ctx.path);
  ctx.set("X-RateLimit-Limit", String(limit));
  ctx.set("X-RateLimit-Remaining", String(Math.max(0, limit - entry.count)));
  if (entry.count > limit) {
    ctx.status = 429;
    ctx.body = { error: "Too Many Requests" };
    log.warn({ ip, path: ctx.path }, "Rate limit exceeded");
    return;
  }
  await next();
};

const requestLogger = async (ctx: any, next: () => Promise<void>) => {
  const start = Date.now();
  try {
    await next();
  } finally {
    log.info({
      method: ctx.method,
      path: ctx.path,
      status: ctx.status,
      ms: Date.now() - start,
      ip: ctx.ip,
    });
  }
};

const server = Server({
  games: [Muko],
  uuid: customGenerator,
  origins: [
    Origins.LOCALHOST,
    process.env.FRONTEND_URL ?? "https://muko.romancino.com",
  ],
});

// Prepend both middlewares so they wrap boardgame.io's internals entirely,
// ensuring ALL requests (including CORS preflights) are rate-limited and logged.
(server.app.middleware as any[]).unshift(requestLogger);
(server.app.middleware as any[]).unshift(rateLimiter);

const port = Number(process.env.PORT) || 8000;
server.run(port);
log.info({ port }, "Muko game server started");
