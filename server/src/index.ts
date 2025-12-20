import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { config } from './config';
import courseRoutes from './routes/courses';
import uploadRoutes from './routes/upload';
import chatRoutes from './routes/chat';
import generationRoutes from './routes/generate';

export const buildServer = () => {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });
  app.register(multipart, { limits: { fileSize: 25 * 1024 * 1024 } });

  app.get('/health', async () => ({ status: 'ok' }));

  app.register(courseRoutes);
  app.register(uploadRoutes);
  app.register(chatRoutes);
  app.register(generationRoutes);

  return app;
};

if (require.main === module) {
  const server = buildServer();
  server.listen({ port: config.port, host: '0.0.0.0' }).catch((err) => {
    server.log.error(err);
    process.exit(1);
  });
}
