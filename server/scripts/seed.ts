import { config } from '../src/config';
import { supabase } from '../src/supabase';
import { ensureBucket } from '../src/services/repository';

const DEMO_USER_ID = '11111111-1111-1111-1111-111111111111';

const seedCourse = async () => {
  const title = process.env.SEED_COURSE_TITLE || 'Sample Biology 101';

  const { data: existing } = await supabase
    .from('courses')
    .select('id')
    .eq('title', title)
    .eq('user_id', DEMO_USER_ID)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data, error } = await supabase
    .from('courses')
    .insert({ title, user_id: DEMO_USER_ID })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
};

const main = async () => {
  console.log('Ensuring storage bucket...');
  await ensureBucket(config.supabaseBucket);

  console.log('Creating sample course...');
  const courseId = await seedCourse();
  console.log(`Seed complete. Course ID: ${courseId}`);
  console.log(`Demo userId: ${DEMO_USER_ID}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
