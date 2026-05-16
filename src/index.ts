import express from 'express';
import { userHandlers } from './handlers/userHandlers';

const app = express();
const PORT = 3000;

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/api/user/me', userHandlers.getUser);
app.patch('/api/user/me', userHandlers.updateUser);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});