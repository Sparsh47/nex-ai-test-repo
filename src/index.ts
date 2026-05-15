import express from 'express';
import { getUserHandler, updateUserHandler } from './handlers/user';
import { validate } from '@nex-ai/logger';

const app = express();
const PORT = 3000;

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Auth middleware
app.use((req, res, next) => {
  if (req.headers.authorization === 'Bearer mock-token') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/api/user/me', getUserHandler);
app.patch('/api/user/me', updateUserHandler);

app.listen(PORT, () => {
  console.log(`\nServer running on port ${PORT}`);
});