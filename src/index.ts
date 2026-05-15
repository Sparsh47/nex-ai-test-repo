import express from 'express';
import { userRouter } from './handlers/user';

const app = express();
app.use(express.json());
app.use('/api/user', userRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});