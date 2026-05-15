import Fastify from "fastify";
import { z } from "zod";
import jwt from "jsonwebtoken";

const fastify = Fastify({
  logger: true,
});

// Mock user data
let userData = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
};

// JWT authentication middleware
const authenticate = async (request, reply) => {
  const authHeader = request.headers["authorization"];
  if (!authHeader) {
    throw fastify.httpErrors.unauthorized("Missing authorization header");
  }

  const token = authHeader.split(" ")[1];
  try {
    // In production, verify with your secret key
    const decoded = jwt.verify(token, "secret-key");
    request.user = decoded;
  } catch (err) {
    throw fastify.httpErrors.unauthorized("Invalid token");
  }
};

// Zod validation schema for PATCH
const patchUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});

fastify.get("/api/user/me", { preHandler: authenticate }, async (request) => {
  fastify.log.info("GET /api/user/me accessed");
  return userData;
});

fastify.patch("/api/user/me", {
  preHandler: authenticate,
  schema: {
    body: patchUserSchema,
  },
}, async (request) => {
  fastify.log.info("PATCH /api/user/me accessed with data:", request.body);

  // Update mock data
  const updates = request.body;
  if (updates.name) userData.name = updates.name;
  if (updates.email) userData.email = updates.email;

  return userData;
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