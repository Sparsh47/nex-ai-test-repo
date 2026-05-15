import { updateUserSchema } from '../schemas/user';
import { Logger } from '@nex-ai/logger';

export const getUserHandler = (server) => {
  return (request, reply) => {
    server.log.info(`GET /api/user/me - Authenticated user: ${request.user}`);
    return {
      email: 'user@example.com',
      username: 'mock_user',
    };
  };
};

export const updateUserHandler = (server) => {
  return (request, reply) => {
    server.log.info(`PATCH /api/user/me - Updating user: ${JSON.stringify(request.body)}`);
    return {
      success: true,
      updated_fields: request.body,
    };
  };
};

export const validateUpdateUser = (server) => {
  return {
    body: updateUserSchema,
  };
};