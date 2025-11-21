import { supabase } from '../src/lib/supabase';

async function checkDatabase() {
  try {
    console.log('Checking Supabase database...\n');

    // Check if questions table exists
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('*')
      .limit(1);

    if (qError) {
      console.log('Questions table error:', qError.message);
    } else {
      console.log('✅ Questions table exists');
      if (questions && questions.length > 0) {
        console.log('Sample question structure:', Object.keys(questions[0]));
      } else {
        console.log('Questions table is empty');
      }
    }

    // Check if flashcards table exists
    const { data: flashcards, error: fError } = await supabase
      .from('flashcards')
      .select('*')
      .limit(1);

    if (fError) {
      console.log('Flashcards table error:', fError.message);
    } else {
      console.log('✅ Flashcards table exists');
      if (flashcards && flashcards.length > 0) {
        console.log('Sample flashcard structure:', Object.keys(flashcards[0]));
      } else {
        console.log('Flashcards table is empty');
      }
    }

    // Check modules table
    const { data: modules, error: mError } = await supabase
      .from('modules')
      .select('*')
      .limit(5);

    if (mError) {
      console.log('Modules table error:', mError.message);
    } else {
      console.log('✅ Modules table exists');
      console.log(`Found ${modules?.length || 0} modules`);
    }

    // Check lesson_quiz_results table
    const { data: quizResults, error: qrError } = await supabase
      .from('lesson_quiz_results')
      .select('*')
      .limit(1);

    if (qrError) {
      console.log('lesson_quiz_results table error:', qrError.message);
    } else {
      console.log('✅ lesson_quiz_results table exists');
    }

  } catch (error) {
    console.error('Database check failed:', error);
  }
}

checkDatabase();
