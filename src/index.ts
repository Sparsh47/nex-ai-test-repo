import Fastify from 'fastify';
import userRoutes from './routes/user';

const app = Fastify();

app.register(userRoutes, { prefix: '/api' });

const PORT = 3000;
app.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});