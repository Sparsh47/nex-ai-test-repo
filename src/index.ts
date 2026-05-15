import Fastify from "fastify";
import userRoutes from "./routes/user";

const server = Fastify({ logger: true });

server.get("/health", async () => {
  return { status: "OK" };
});

// Register user routes
server.register(userRoutes, { prefix: "/api/user" });

export default server;