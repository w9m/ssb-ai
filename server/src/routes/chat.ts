import { FastifyInstance } from 'fastify';
import { openai } from '../openai';
import { answerQuestion } from '../services/rag';

export default async function chatRoutes(fastify: FastifyInstance) {
  fastify.post('/api/chat', async (request, reply) => {
    const { courseId, question } = request.body as { courseId?: string; question?: string };

    if (!courseId || !question) {
      return reply.code(400).send({ error: 'courseId and question are required' });
    }

    try {
      const result = await answerQuestion(openai, courseId, question);
      return reply.send(result);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message || 'Chat failed' });
    }
  });
}
