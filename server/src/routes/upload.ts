import { FastifyInstance } from 'fastify';
import { config } from '../config';
import { openai } from '../openai';
import {
  ensureBucket,
  saveChunks,
  saveFileRecord,
  saveOutline,
  updateFileStatus,
  uploadToBucket
} from '../services/repository';
import { chunkText } from '../services/chunker';
import { embedChunks } from '../services/embeddings';
import { detectFileKind, extractText } from '../services/extractors';
import { generateOutline } from '../services/generator';
import { streamToBuffer } from '../utils/stream';

export default async function uploadRoutes(fastify: FastifyInstance) {
  fastify.post('/api/upload', async (request, reply) => {
    const parts = request.parts();
    let filePart: any = null;
    const fields: Record<string, string> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        filePart = part;
      } else {
        const key = String(part.fieldname);
        fields[key] = String(part.value ?? '');
      }
    }

    if (!filePart) {
      return reply.code(400).send({ error: 'No file provided' });
    }

    const courseId = fields.courseId;
    const userId = fields.userId;
    const courseTitle = fields.courseTitle || 'Course';
    const module = fields.module;

    if (!courseId || !userId) {
      return reply.code(400).send({ error: 'courseId and userId are required' });
    }

    const buffer = await streamToBuffer(filePart.file);
    const kind = detectFileKind(filePart.filename, filePart.mimetype);
    const storagePath = `${courseId}/${Date.now()}-${filePart.filename}`;

    let fileId: string | undefined;
    try {
      await ensureBucket(config.supabaseBucket);
      await uploadToBucket(config.supabaseBucket, storagePath, buffer, filePart.mimetype);

      const fileRecord = await saveFileRecord({
        course_id: courseId,
        user_id: userId,
        filename: filePart.filename,
        storage_path: storagePath,
        mime_type: filePart.mimetype || null,
        status: 'uploaded'
      });
      fileId = fileRecord.id as string;

      const extraction = await extractText(openai, buffer, filePart.filename, filePart.mimetype);
      await updateFileStatus(fileId, 'processing');
      const outline = await generateOutline(openai, courseId, courseTitle, extraction.text);

      const baseChunks = chunkText(extraction.text, {
        chunkSize: config.chunkSize,
        overlap: config.chunkOverlap
      });
      const chunks = baseChunks.map((chunk) => ({
        ...chunk,
        metadata: {
          module: module || null,
          storage_path: storagePath,
          filename: filePart.filename,
          pages: extraction.pages
        }
      }));

      const embeddings = await embedChunks(openai, chunks);
      await saveChunks(fileId, courseId, chunks, embeddings);
      await saveOutline(outline);
      await updateFileStatus(fileId, 'processed');

      return reply.send({
        file: fileRecord,
        outline: outline.outline
      });
    } catch (error: any) {
      request.log.error(error);
      if (fileId) {
        await updateFileStatus(fileId, 'error').catch(() => {});
      }
      return reply.code(500).send({ error: error.message || 'Upload failed' });
    }
  });
}
