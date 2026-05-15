import Fastify from "fastify";
import { jwtVerify } from "fastify-jwt";
import { z } from "zod";
import { createLogger } from "@nex-ai/logger";

const logger = createLogger({ name: "user-api" });

const fastify = Fastify({
  logger: true,
});

// JWT Secret (in production, use environment variable)
const JWT_SECRET = "supersecretkey";

// Zod validation schema for PATCH request
const UserUpdateSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional(),
});

// Mock user data
const mockUser = {
  id: "123",
  display_name: "JohnDoe",
  bio: "Software Engineer",
};

// Register JWT plugin
fastify.register(import("fastify-jwt"), {
  secret: JWT_SECRET,
});

// GET /api/user/me
fastify.get("/api/user/me", async (request, reply) => {
  try {
    // Verify JWT token
    await request.jwtVerify();
    
    logger.info("User profile requested");
    return mockUser;
  } catch (error) {
    logger.error("Authentication failed", { error });
    reply.status(401).send({ error: "Unauthorized" });
  }
});

// PATCH /api/user/me
fastify.patch("/api/user/me", async (request, reply) => {
  try {
    // Verify JWT token
    await request.jwtVerify();
    
    // Validate request body
    const validatedData = UserUpdateSchema.parse(request.body);
    
    // Update mock user data
    if (validatedData.display_name) {
      mockUser.display_name = validatedData.display_name;
    }
    if (validatedData.bio) {
      mockUser.bio = validatedData.bio;
    }
    
    logger.info("User profile updated", { updates: validatedData });
    return mockUser;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid request body", { error: error.issues });
      reply.status(400).send({ error: "Invalid request body" });
    } else {
      logger.error("Update failed", { error });
      reply.status(500).send({ error: "Internal server error" });
    }
  }
});

fastify.get("/health", async (request, reply) => {
  return { status: "ok", uptime: process.uptime() };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    logger.info("Server listening on port 3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();