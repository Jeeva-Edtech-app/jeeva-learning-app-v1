import { supabase } from '@/lib/supabase';

/**
 * Fix lesson data by activating all inactive records
 * This resolves the "lessons not showing" issue
 * 
 * Run this ONCE from admin only - this should be a one-time fix
 */
export const fixLessonData = async () => {
  console.log('🔧 Starting lesson data fix...\n');

  try {
    // 1. Activate modules
    console.log('1️⃣ Activating modules...');
    const { data: modulesData, error: modulesError } = await supabase
      .from('modules')
      .update({ is_active: true })
      .eq('is_active', false)
      .select('id, title');

    if (modulesError) {
      console.error('❌ Error activating modules:', modulesError);
    } else {
      console.log(`✅ Activated ${modulesData?.length || 0} modules`);
    }

    // 2. Activate topics
    console.log('\n2️⃣ Activating topics...');
    const { data: topicsData, error: topicsError } = await supabase
      .from('topics')
      .update({ is_active: true })
      .eq('is_active', false)
      .select('id, title');

    if (topicsError) {
      console.error('❌ Error activating topics:', topicsError);
    } else {
      console.log(`✅ Activated ${topicsData?.length || 0} topics`);
    }

    // 3. Activate lessons
    console.log('\n3️⃣ Activating lessons...');
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .update({ is_active: true })
      .eq('is_active', false)
      .select('id, title');

    if (lessonsError) {
      console.error('❌ Error activating lessons:', lessonsError);
    } else {
      console.log(`✅ Activated ${lessonsData?.length || 0} lessons`);
    }

    // 4. Activate flashcards
    console.log('\n4️⃣ Activating flashcards...');
    const { data: flashcardsData, error: flashcardsError } = await supabase
      .from('flashcards')
      .update({ is_active: true })
      .eq('is_active', false)
      .select('id');

    if (flashcardsError) {
      console.error('❌ Error activating flashcards:', flashcardsError);
    } else {
      console.log(`✅ Activated ${flashcardsData?.length || 0} flashcards`);
    }

    // 5. Verify counts
    console.log('\n5️⃣ Verifying final counts...');
    const { data: moduleCounts } = await supabase
      .from('modules')
      .select('id', { count: 'exact', head: true });
    
    const { data: topicCounts } = await supabase
      .from('topics')
      .select('id', { count: 'exact', head: true });
    
    const { data: lessonCounts } = await supabase
      .from('lessons')
      .select('id', { count: 'exact', head: true });

    console.log(`\n📊 Final Counts:`);
    console.log(`   Modules: ${moduleCounts?.length || 0}`);
    console.log(`   Topics: ${topicCounts?.length || 0}`);
    console.log(`   Lessons: ${lessonCounts?.length || 0}`);

    console.log('\n✨ Fix complete! Refresh your app to see lessons.');

    return {
      success: true,
      modulesActivated: modulesData?.length || 0,
      topicsActivated: topicsData?.length || 0,
      lessonsActivated: lessonsData?.length || 0,
      flashcardsActivated: flashcardsData?.length || 0,
    };
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return { success: false, error };
  }
};

/**
 * Verify lesson data is properly set up
 */
export const verifyLessonData = async () => {
  console.log('✅ Verifying lesson data...\n');

  try {
    // Check active records with proper joins
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        is_active,
        topics(id, title, is_active, modules(id, title))
      `)
      .eq('is_active', true)
      .limit(5);

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return false;
    }

    if (!lessons || lessons.length === 0) {
      console.warn('⚠️ No active lessons found - data might not be seeded or all marked inactive');
      return false;
    }

    console.log(`✅ Found ${lessons.length} active lessons`);
    lessons.forEach((lesson, i) => {
      console.log(`   ${i + 1}. "${lesson.title}" (Topic: ${(lesson as any).topics?.title || 'N/A'})`);
    });

    return true;
  } catch (error) {
    console.error('💥 Error:', error);
    return false;
  }
};
