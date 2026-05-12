import Fastify from "fastify";
import { z } from "zod";

const fastify = Fastify({
  logger: true,
});

// Mock user data
let mockUser = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
};

// Simple authentication check (expects any Authorization header)
function isAuthenticated(request: any): boolean {
  return !!request.headers?.authorization;
}

fastify.get("/health", async (request, reply) => {
  return { status: "ok", uptime: process.uptime() };
});

// GET /api/user/me - returns mock user if authenticated
fastify.get("/api/user/me", async (request, reply) => {
  if (!isAuthenticated(request)) {
    reply.status(401).send({ error: "Unauthorized" });
    return;
  }
  return mockUser;
});

// Zod schema for PATCH request body
const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});

// PATCH /api/user/me - updates mock user with validated data
fastify.patch("/api/user/me", async (request, reply) => {
  if (!isAuthenticated(request)) {
    reply.status(401).send({ error: "Unauthorized" });
    return;
  }

  const parseResult = updateUserSchema.safeParse(request.body);
  if (!parseResult.success) {
    reply.status(400).send({ error: parseResult.error.format() });
    return;
  }

  const data = parseResult.data;
  mockUser = { ...mockUser, ...data };
  return mockUser;
});

// TODO: Register user routes here once created

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log(`Dummy API listening on port 3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
