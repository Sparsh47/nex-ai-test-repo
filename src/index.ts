import Fastify from "fastify";
import { updateUserSchema } from "./schemas/user";

const fastify = Fastify({
  logger: true,
});

// Register JWT authentication plugin
fastify.register(import("fastify-jwt"), {
  secret: "supersecretkey",
});

// Mock user data
let mockUser = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
};

// GET /user route with authentication
fastify.get("/user", async (request, reply) => {
  // JWT authentication check
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  // Log request using Fastify's built-in logger
  fastify.log.info("GET /user accessed by authenticated user");

  return mockUser;
});

// PATCH /user route with validation and authentication
fastify.patch("/user", async (request, reply) => {
  // JWT authentication check
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  // Validate and parse request body
  const validatedData = updateUserSchema.parse(request.body);

  // Update mock user data
  mockUser = {
    ...mockUser,
    ...validatedData,
  };

  // Log request with validation details
  fastify.log.info({
    message: "User data updated",
    changes: validatedData,
  });

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