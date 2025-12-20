import { FastifyInstance } from 'fastify';
import { openai } from '../openai';
import { generateFlashcards, generateNotes, generateQuiz } from '../services/generator';
import { fetchCourseText, saveFlashcards, saveNote, saveQuiz } from '../services/repository';
import { GenerationScope } from '../types';

const scopes: GenerationScope[] = ['course', 'module', 'lesson'];

export default async function generationRoutes(fastify: FastifyInstance) {
  fastify.post('/api/notes', async (request, reply) => {
    const { courseId, scope, target } = request.body as {
      courseId?: string;
      scope?: GenerationScope;
      target?: string;
    };
    if (!courseId || !scope || !target || !scopes.includes(scope)) {
      return reply.code(400).send({ error: 'courseId, scope, and target are required' });
    }

    try {
      const source = await fetchCourseText(courseId, scope === 'course' ? undefined : target);
      const record = await generateNotes(openai, courseId, scope, target, source);
      const saved = await saveNote(record);
      return reply.send(saved);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message || 'Note generation failed' });
    }
  });

  fastify.post('/api/quiz', async (request, reply) => {
    const { courseId, scope, target, count } = request.body as {
      courseId?: string;
      scope?: GenerationScope;
      target?: string;
      count?: number;
    };
    if (!courseId || !scope || !target || !scopes.includes(scope)) {
      return reply.code(400).send({ error: 'courseId, scope, and target are required' });
    }

    try {
      const source = await fetchCourseText(courseId, scope === 'course' ? undefined : target);
      const record = await generateQuiz(openai, courseId, scope, target, source, count || 5);
      const saved = await saveQuiz(record);
      return reply.send(saved);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message || 'Quiz generation failed' });
    }
  });

  fastify.post('/api/flashcards', async (request, reply) => {
    const { courseId, scope, target, count } = request.body as {
      courseId?: string;
      scope?: GenerationScope;
      target?: string;
      count?: number;
    };
    if (!courseId || !scope || !target || !scopes.includes(scope)) {
      return reply.code(400).send({ error: 'courseId, scope, and target are required' });
    }

    try {
      const source = await fetchCourseText(courseId, scope === 'course' ? undefined : target);
      const record = await generateFlashcards(openai, courseId, scope, target, source, count || 10);
      const saved = await saveFlashcards(record);
      return reply.send(saved);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message || 'Flashcard generation failed' });
    }
  });
}
