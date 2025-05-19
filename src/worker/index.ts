import { Hono } from "hono";
import type { Context, Next } from "hono";

// Define our environment interface
interface Env {
  API_TOKEN: string;  // Cloudflare Worker environment variable
}

interface User {
  id: string;
  role: string;
  permissions: string[];
}

// Simulated database (in memory for demo)
const users: Record<string, User> = {
  "admin": {
    id: "admin",
    role: "admin",
    permissions: ["read", "write", "delete"]
  },
  "user": {
    id: "user",
    role: "user",
    permissions: ["read"]
  }
};

const app = new Hono<{ Bindings: Env }>();

// Middleware to check API token
const authMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token || token !== c.env.API_TOKEN) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
};

// Public endpoints
app.get("/api/", (c) => c.json({ name: "TimmyAPI" }));

// Echo endpoint - returns whatever is sent
app.post("/api/echo", async (c) => {
  const body = await c.req.json();
  return c.json(body);
});

// Status code tester
app.get("/api/status/:code", (c) => {
  const statusCode = parseInt(c.req.param("code")) as 200 | 201 | 400 | 401 | 403 | 404 | 500;
  return c.json({ 
    status: statusCode,
    message: `Returned status code ${statusCode}`
  }, statusCode);
});

// Request info endpoint
app.get("/api/request-info", (c) => {
  return c.json({
    method: c.req.method,
    url: c.req.url,
    headers: c.req.header(),
    timestamp: new Date().toISOString()
  });
});

// Protected endpoints
app.use("/api/protected/*", authMiddleware);

// Get API token info
app.get("/api/protected/token-info", (c) => {
  return c.json({
    message: "Token information",
    isValid: true,
    permissions: ["read", "write", "execute"],
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    tokenType: "Bearer"
  });
});

// User management
app.get("/api/protected/users", (c) => {
  return c.json({
    users: Object.values(users),
    total: Object.keys(users).length,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/protected/users/:id", (c) => {
  const userId = c.req.param("id");
  const user = users[userId];

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(user);
});

// Protected data operations
app.post("/api/protected/data/transform", async (c) => {
  const body = await c.req.json();
  
  // Example of data transformation
  return c.json({
    original: body,
    transformed: {
      timestamp: new Date().toISOString(),
      uppercase: typeof body.text === 'string' ? body.text.toUpperCase() : undefined,
      reversed: typeof body.text === 'string' ? body.text.split('').reverse().join('') : undefined,
      length: typeof body.text === 'string' ? body.text.length : undefined,
      type: typeof body.text
    }
  });
});

// Analytics endpoint (simulated)
app.get("/api/protected/analytics", (c) => {
  return c.json({
    apiCalls: {
      total: 1234,
      successful: 1200,
      failed: 34
    },
    popularEndpoints: [
      { path: "/api/", calls: 500 },
      { path: "/api/echo", calls: 300 },
      { path: "/api/protected/data", calls: 200 }
    ],
    averageResponseTime: "120ms",
    uptime: "99.99%",
    lastUpdated: new Date().toISOString()
  });
});

// System status (simulated)
app.get("/api/protected/system", (c) => {
  return c.json({
    status: "healthy",
    version: "1.0.0",
    environment: "production",
    services: {
      database: "connected",
      cache: "operational",
      worker: "running"
    },
    resources: {
      cpu: "23%",
      memory: "45%",
      requests: "150/min"
    },
    timestamp: new Date().toISOString()
  });
});

export default app;
