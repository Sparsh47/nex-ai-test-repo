import Fastify from "fastify";
import fastifyJWT from "fastify-jwt";
import { UserPatchSchema } from "./schemas/user";

const fastify = Fastify({
  logger: true,
});

// Register JWT authentication plugin
fastify.register(fastifyJWT, {
  secret: "my-secret-key", // In production, use environment variable
});

// Mock user data
const mockUser = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  role: "user",
};

// Authentication middleware
const authenticate = async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
};

// GET /user route with JWT auth
fastify.get("/user", {
  preValidation: [authenticate],
  schema: {
    response: {
      200: {
        type: "object",
        properties: Object.assign({}, mockUser),
      },
    },
  },
}, async (request, reply) => {
  fastify.log.info("GET /user accessed by authenticated user");
  return mockUser;
});

// PATCH /user route with JWT auth and Zod validation
fastify.patch("/user", {
  preValidation: [authenticate],
  schema: {
    body: UserPatchSchema.shape,
    response: {
      200: {
        type: "object",
        properties: Object.assign({}, mockUser),
      },
    },
  },
}, async (request, reply) => {
  fastify.log.info("PATCH /user with data:", request.body);
  
  // Apply partial updates
  Object.keys(request.body).forEach((key) => {
    if (mockUser.hasOwnProperty(key)) {
      mockUser[key] = request.body[key];
    }
  });

  return mockUser;
});

fastify.get("/health", async (request, reply) => {
  return { status: "ok", uptime: process.uptime() };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log(`Server running on port 3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();