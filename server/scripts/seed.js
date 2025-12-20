"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../src/config");
const supabase_1 = require("../src/supabase");
const repository_1 = require("../src/services/repository");
const seedCourse = async () => {
    const title = process.env.SEED_COURSE_TITLE || 'Sample Biology 101';
    const description = 'Demo course used to validate the ingestion and generation pipeline.';
    const { data: existing } = await supabase_1.supabase
        .from('courses')
        .select('id')
        .eq('title', title)
        .limit(1)
        .maybeSingle();
    if (existing?.id) {
        return existing.id;
    }
    const { data, error } = await supabase_1.supabase
        .from('courses')
        .insert({ title, description })
        .select('id')
        .single();
    if (error)
        throw error;
    return data.id;
};
const main = async () => {
    console.log('Ensuring storage bucket...');
    await (0, repository_1.ensureBucket)(config_1.config.supabaseBucket);
    console.log('Creating sample course...');
    const courseId = await seedCourse();
    console.log(`Seed complete. Course ID: ${courseId}`);
};
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
