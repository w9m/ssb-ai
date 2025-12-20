import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const authHeaders = async (): Promise<Record<string, string> | undefined> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const createCourse = async (title: string, description?: string) => {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) throw new Error('Not authenticated');
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/api/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: JSON.stringify({ title, description, userId })
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create course');
  return res.json();
};

export const uploadCourseFile = async (
  courseId: string,
  file: File,
  courseTitle: string,
  module?: string
) => {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) throw new Error('Not authenticated');
  const form = new FormData();
  form.append('courseId', courseId);
  form.append('courseTitle', courseTitle);
  form.append('userId', userId);
  if (module) form.append('module', module);
  form.append('file', file);
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: headers || undefined,
    body: form
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Upload failed');
  return json;
};

export const fetchOutline = async (courseId: string) => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/api/courses/${courseId}/outline`, { headers: headers || undefined });
  if (!res.ok) throw new Error('Outline not found');
  return res.json();
};

export const askQuestion = async (courseId: string, question: string) => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: JSON.stringify({ courseId, question })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Chat failed');
  return json;
};

export const generateContent = async (
  type: 'notes' | 'quiz' | 'flashcards',
  courseId: string,
  scope: 'course' | 'module' | 'lesson',
  target: string,
  count?: number
) => {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/api/${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: JSON.stringify({ courseId, scope, target, count })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `${type} failed`);
  return json;
};
