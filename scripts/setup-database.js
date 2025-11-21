const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndSetupDatabase() {
  console.log('🔍 Checking Supabase database structure...\n');

  try {
    // Check questions table
    console.log('Checking questions table...');
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('*')
      .limit(1);

    if (qError) {
      console.log('❌ Questions table error:', qError.message);
      console.log('\n📋 You need to create the questions table in your Supabase dashboard.');
      console.log('   Go to: SQL Editor and run the schema from docs/SUPABASE_SETUP.sql\n');
    } else {
      console.log('✅ Questions table exists');
      if (questions && questions.length > 0) {
        console.log('   Sample question fields:', Object.keys(questions[0]).join(', '));
        
        // Check for new fields
        const hasModuleType = 'module_type' in questions[0];
        const hasCategory = 'category' in questions[0];
        const hasSubdivision = 'subdivision' in questions[0];
        const hasExamPart = 'exam_part' in questions[0];
        
        console.log(`   - module_type: ${hasModuleType ? '✅' : '❌ MISSING'}`);
        console.log(`   - category: ${hasCategory ? '✅' : '❌ MISSING'}`);
        console.log(`   - subdivision: ${hasSubdivision ? '✅' : '❌ MISSING'}`);
        console.log(`   - exam_part: ${hasExamPart ? '✅' : '❌ MISSING'}`);
      } else {
        console.log('   ⚠️  Questions table is empty - no test data');
      }
    }

    // Check flashcards table
    console.log('\nChecking flashcards table...');
    const { data: flashcards, error: fError } = await supabase
      .from('flashcards')
      .select('*')
      .limit(1);

    if (fError) {
      console.log('❌ Flashcards table error:', fError.message);
    } else {
      console.log('✅ Flashcards table exists');
      if (flashcards && flashcards.length > 0) {
        const hasCategory = 'category' in flashcards[0];
        console.log(`   - category field: ${hasCategory ? '✅' : '❌ MISSING'}`);
      } else {
        console.log('   ⚠️  Flashcards table is empty');
      }
    }

    // Check other tables
    const tables = [
      'modules',
      'lesson_quiz_results',
      'practice_sessions',
      'users',
      'user_profiles'
    ];

    console.log('\nChecking other tables...');
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      console.log(`   ${table}: ${error ? '❌' : '✅'}`);
    }

  } catch (error) {
    console.error('\n❌ Database check failed:', error.message);
  }
}

checkAndSetupDatabase();
