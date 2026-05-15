import fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { z } from 'zod';
import { createWriteStream } from 'fs';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

const app = fastify();

app.register(fastifyJwt, {
  secret: 'your-secret-key'
});

const patchSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional()
});

app.get('/api/user/me', { preValidation: (req, res) => req.user }, (req, res) => {
  logger.info('GET /api/user/me accessed');
  res.send({ user: { id: 1, name: 'Mock User' } });
});

app.patch('/api/user/me', {
  preValidation: (req, res) => req.user,
  schema: {
    body: {
      type: 'object',
      properties: {
        display_name: { type: 'string' },
        bio: { type: 'string' }
      },
      required: []
    }
  }
}, (req, res) => {
  logger.info('PATCH /api/user/me accessed');
  const validated = patchSchema.parse(req.body);
  res.send({ updated: validated });
});

app.listen(3000, () => logger.info('Server running on port 3000'));
