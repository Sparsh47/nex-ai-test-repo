import express from 'express';
import { createLogger, format, transports } from 'winston';
import userRouter from './handlers/user';

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Winston logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [new transports.Console()]
});

// Middleware
app.use(express.json());

// Routes
app.use('/api/user', userRouter);

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});