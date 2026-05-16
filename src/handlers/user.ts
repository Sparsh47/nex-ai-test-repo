import { userPatchSchema } from '../schemas/user';
import { logger } from '../utils/logger';

export const userHandler = async (request: any, reply: any) => {
  try {
    // Validate request body
    const validatedData = userPatchSchema.parse(request.body);

    // Log update attempt
    logger.info(`User update attempt: ${JSON.stringify(validatedData)}`);

    // Mock user data (in real app this would be from DB)
    const mockUser = {
      id: '123',
      display_name: 'Test User',
      bio: 'Default bio',
    };

    // Apply updates
    if (validatedData.display_name) {
      mockUser.display_name = validatedData.display_name;
    }
    if (validatedData.bio) {
      mockUser.bio = validatedData.bio;
    }

    // Log successful update
    logger.info(`User updated successfully: ${mockUser.id}`);

    // Return updated user
    return reply.status(200).send(mockUser);
  } catch (error) {
    // Log validation errors
    logger.error(`Validation error: ${error.message}`);
    return reply.status(400).send({ error: 'Invalid request data' });
  }
};