import { FastifyInstance } from 'fastify';
import { supabase } from '../supabase';

export default async function courseRoutes(fastify: FastifyInstance) {
  fastify.post('/api/courses', async (request, reply) => {
    const { title, description, userId } = request.body as {
      title?: string;
      description?: string;
      userId?: string;
    };
    if (!title) {
      return reply.code(400).send({ error: 'title is required' });
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({ title, description, user_id: userId || null })
      .select()
      .single();

    if (error) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
    return reply.send(data);
  });

  fastify.get('/api/courses/:id/outline', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { data, error } = await supabase.from('outlines').select('*').eq('course_id', id).single();
    if (error) return reply.code(404).send({ error: 'Outline not found' });
    return reply.send(data);
  });
}
