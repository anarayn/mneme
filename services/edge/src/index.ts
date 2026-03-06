/**
 * mneme-edge — Cloudflare Workers
 *
 * Responsibilities:
 *   - JWT validation & auth
 *   - Rate limiting via KV counters
 *   - Session routing to Go gateway
 *   - WebSocket upgrade handling
 *   - DDoS protection via rate limits
 */

export interface Env {
  SESSIONS: KVNamespace;
  SESSION_DO: DurableObjectNamespace;
  GATEWAY_URL: string;
  JWT_SECRET: string;
}

async function validateJWT(
  token: string,
  secret: string
): Promise<{ userId: string } | null> {
  // TODO: implement JOSE JWT validation
  void token;
  void secret;
  return null;
}

async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const countStr = await kv.get(key);
  const count = countStr ? parseInt(countStr, 10) : 0;
  if (count >= limit) return false;
  await kv.put(key, String(count + 1), {
    expirationTtl: windowSeconds,
  });
  return true;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "content-type": "application/json" },
      });
    }

    // Auth: extract JWT from Authorization header or cookie
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const claims = await validateJWT(token, env.JWT_SECRET);
    if (!claims) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Rate limiting: 100 req/min per user
    const allowed = await checkRateLimit(
      env.SESSIONS,
      `rl:${claims.userId}`,
      100,
      60
    );
    if (!allowed) {
      return new Response("Rate limit exceeded", { status: 429 });
    }

    // WebSocket upgrade for session connections
    if (
      url.pathname === "/session" &&
      request.headers.get("Upgrade") === "websocket"
    ) {
      const gatewayReq = new Request(`${env.GATEWAY_URL}/session`, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers),
          "X-User-Id": claims.userId,
          "X-Session-Token": token,
        },
      });
      return fetch(gatewayReq);
    }

    // Proxy all other requests to gateway
    const gatewayReq = new Request(
      `${env.GATEWAY_URL}${url.pathname}${url.search}`,
      {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers),
          "X-User-Id": claims.userId,
        },
        body: request.body,
      }
    );
    return fetch(gatewayReq);
  },
} satisfies ExportedHandler<Env>;

/**
 * Durable Object — sticky session state per user
 * Maintains WebSocket connection lifecycle across Workers
 */
export class SessionDurableObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    void request;
    // TODO: implement Durable Object session logic
    return new Response("Not implemented", { status: 501 });
  }
}
