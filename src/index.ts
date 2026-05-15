import Fastify from "fastify";
import fastifyJwt from "fastify-jwt";
import { z } from "zod";
import { Logger } from "@nex-ai/logger";

const logger = new Logger({ name: "user-api" });

const fastify = Fastify({
  logger: true,
});

// Register JWT authentication
fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "test-secret-key",
});

// Mock user data
const mockUser = {
  id: 1,
  display_name: "Test User",
  bio: "Original bio",
};

// Zod validation schema for PATCH request
const updateUserSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional(),
}).refine(data => data.display_name || data.bio, {
  message: "At least one field (display_name or bio) is required",
});

// GET /api/user/me
fastify.get("/api/user/me", {
  preValidation: [fastify.jwt],
}, async (request, reply) => {
  logger.info("User requested their profile data");
  return mockUser;
});

// PATCH /api/user/me
fastify.patch("/api/user/me", {
  preValidation: [fastify.jwt],
  schema: {
    body: updateUserSchema,
  },
}, async (request, reply) => {
  logger.info("User requested to update their profile");
  const updates = request.body as z.infer<typeof updateUserSchema>;
  
  // Update mock user data
  Object.assign(mockUser, updates);
  
  return {
    success: true,
    user: mockUser,
  };
});

// Error handling for JWT authentication
fastify.setErrorHandler((error, request, reply) => {
  if (error.name === "ValidationError") {
    logger.warn("Validation error: %s", error.message);
    return reply.status(400).send({ error: error.message });
  }
  
  if (error.name === "JsonWebTokenError") {
    logger.warn("JWT error: %s", error.message);
    return reply.status(401).send({ error: "Unauthorized" });
  }

  logger.error("Unexpected error: %s", error.message);
  return reply.status(500).send({ error: "Internal server error" });
});

fastify.get("/health", async (request, reply) => {
  return { status: "ok", uptime: process.uptime() };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    logger.info("Dummy API listening on port 3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();