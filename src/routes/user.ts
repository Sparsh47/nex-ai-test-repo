import { FastifyInstance } from "fastify";
import { UserUpdateSchema } from "../schemas/user";
import { logger } from "@nex-ai/logger";

export async function registerUserRoutes(fastify: FastifyInstance) {
  fastify.get("/api/user/me", { preValidation: [fastify.authenticate] }, async (request, reply) => {
    logger.info({ message: 'User info requested', userId: request.user.id });
    return {
      id: request.user.id,
      email: request.user.email,
      name: request.user.name
    };
  });

  fastify.patch("/api/user/me", { preValidation: [fastify.authenticate] }, async (request, reply) => {
    const updateData = UserUpdateSchema.parse(request.body);
    logger.info({ message: 'User update requested', userId: request.user.id, updates: updateData });

    // In production, this would update a real user record
    return {
      ...request.user,
      ...updateData
    };
  });
}