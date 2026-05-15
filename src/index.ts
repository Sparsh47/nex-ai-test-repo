import Fastify from "fastify";
import jwt from "fastify-jwt";
import { z } from "zod";
import { logger } from "@nex-ai/logger";

const fastify = Fastify({
  logger: true,
});

// Register JWT plugin
fastify.register(jwt, {
  secret: "supersecretkey",
});

// Zod schema for PATCH validation
const patchUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
});

// Mock user data
const mockUser = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  bio: "Software Engineer",
};

// Authentication middleware
fastify.addHook("preHandler", async (request, reply) => {
  try {
    const token = request.headers.authorization?.split(" ")[1];
    if (!token) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
    const decoded = await request.jwtVerify<{ id: number }>();
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({ error: "Invalid token" });
  }
});

// GET /api/user/me
fastify.get("/api/user/me", async (request, reply) => {
  logger.info("User profile requested");
  return mockUser;
});

// PATCH /api/user/me
fastify.patch("/api/user/me", async (request, reply) => {
  logger.info("User profile update requested");
  const { name, email, bio } = patchUserSchema.parse(request.body);
  
  // Update mock user data
  if (name) mockUser.name = name;
  if (email) mockUser.email = email;
  if (bio) mockUser.bio = bio;

  return mockUser;
});

fastify.get("/health", async (request, reply) => {
  return { status: "ok", uptime: process.uptime() };
});

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