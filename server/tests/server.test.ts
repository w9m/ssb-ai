import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { buildServer } from '../src/index';

describe('server', () => {
  it('returns health', async () => {
    const app = buildServer();
    await app.ready();
    const res = await request(app.server).get('/health');
    await app.close();
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
