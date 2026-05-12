import Fastify from "fastify";

const fastify = Fastify({
  logger: true,
});

fastify.get("/health", async (request, reply) => {
  return { status: "ok", uptime: process.uptime() };
});

// TODO: Register user routes here once created

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log("Dummy API listening on port 3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();