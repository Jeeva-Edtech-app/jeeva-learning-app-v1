import { supabase } from '@/lib/supabase';

/**
 * Debug RLS issues by testing queries directly
 * Call this function from your screen to see what's happening
 */
export const debugRLS = async () => {
  console.log('🔍 Starting RLS Debug...\n');

  try {
    // 1. Check if user is authenticated
    console.log('1️⃣ Checking authentication...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('❌ Auth error:', authError);
    } else {
      console.log(`✅ Authenticated as: ${session?.user?.email || 'Anonymous'}`);
    }

    // 2. Test lessons query (most likely failing)
    console.log('\n2️⃣ Testing lessons query...');
    const { data: lessonsData, error: lessonsError, status: lessonsStatus } = await supabase
      .from('lessons')
      .select('id, title, is_active, topic_id')
      .limit(5);
    
    if (lessonsError) {
      console.error('❌ Lessons query failed:', lessonsError);
      console.error('   Status:', lessonsStatus);
      console.error('   Message:', lessonsError.message);
    } else {
      console.log(`✅ Lessons query succeeded: ${lessonsData?.length || 0} records found`);
      if (lessonsData && lessonsData.length > 0) {
        console.log('   Sample:', lessonsData[0]);
      }
    }

    // 3. Test topics query
    console.log('\n3️⃣ Testing topics query...');
    const { data: topicsData, error: topicsError } = await supabase
      .from('topics')
      .select('id, title, is_active, module_id')
      .limit(5);
    
    if (topicsError) {
      console.error('❌ Topics query failed:', topicsError);
    } else {
      console.log(`✅ Topics query succeeded: ${topicsData?.length || 0} records found`);
      if (topicsData && topicsData.length > 0) {
        console.log('   Sample:', topicsData[0]);
      }
    }

    // 4. Test modules query
    console.log('\n4️⃣ Testing modules query...');
    const { data: modulesData, error: modulesError } = await supabase
      .from('modules')
      .select('id, title, is_active')
      .limit(5);
    
    if (modulesError) {
      console.error('❌ Modules query failed:', modulesError);
    } else {
      console.log(`✅ Modules query succeeded: ${modulesData?.length || 0} records found`);
    }

    // 5. Count records in each table
    console.log('\n5️⃣ Counting records in each table...');
    const tables = ['lessons', 'topics', 'modules', 'flashcards'];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count} total records`);
      }
    }

    // 6. Check is_active filtering
    console.log('\n6️⃣ Checking is_active filtering...');
    const { data: allLessons, error: allError } = await supabase
      .from('lessons')
      .select('id, title, is_active')
      .limit(10);
    
    if (allError) {
      console.error('❌ Error fetching all lessons:', allError);
    } else {
      const activeCount = allLessons?.filter(l => l.is_active).length || 0;
      const inactiveCount = allLessons?.filter(l => !l.is_active).length || 0;
      console.log(`✅ Active lessons: ${activeCount}, Inactive: ${inactiveCount}`);
    }

    // 7. Test with is_active filter
    console.log('\n7️⃣ Testing with is_active=true filter...');
    const { data: activeOnly, error: activeError } = await supabase
      .from('lessons')
      .select('id, title')
      .eq('is_active', true)
      .limit(5);
    
    if (activeError) {
      console.error('❌ Filtered query failed:', activeError);
    } else {
      console.log(`✅ Active lessons query: ${activeOnly?.length || 0} records`);
    }

    console.log('\n✨ Debug complete!');
    
    return {
      authenticated: !!session,
      lessonsOk: !lessonsError,
      topicsOk: !topicsError,
      modulesOk: !modulesError,
      lessonsCount: lessonsData?.length || 0,
      topicsCount: topicsData?.length || 0,
      modulesCount: modulesData?.length || 0,
    };
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return null;
  }
};

/**
 * Call this to test a specific topic's lessons
 */
export const debugTopicLessons = async (topicId: string) => {
  console.log(`\n📚 Debugging lessons for topic: ${topicId}`);
  
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        is_active,
        topic_id,
        topics(id, title, module_id)
      `)
      .eq('topic_id', topicId)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return null;
    }
    
    console.log(`✅ Found ${data?.length || 0} lessons for topic ${topicId}`);
    data?.forEach((lesson, i) => {
      console.log(`   ${i + 1}. ${lesson.title} (active: ${lesson.is_active})`);
    });
    
    return data;
  } catch (error) {
    console.error('💥 Error:', error);
    return null;
  }
};
