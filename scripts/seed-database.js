const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample questions with options
const questionsWithOptions = [
  // Practice - Numeracy - Dosage Calculations
  {
    question_text: 'A patient needs 500mg of paracetamol. The tablets available are 250mg each. How many tablets should you administer?',
    explanation: 'Divide the required dose (500mg) by the tablet strength (250mg): 500 ÷ 250 = 2 tablets',
    module_type: 'practice',
    category: 'Numeracy',
    subdivision: 'Dosage Calculations',
    options: [
      { option_text: '1 tablet', is_correct: false },
      { option_text: '2 tablets', is_correct: true },
      { option_text: '3 tablets', is_correct: false },
      { option_text: '4 tablets', is_correct: false },
    ]
  },
  {
    question_text: 'A patient requires 75mg of aspirin. You have 25mg tablets. How many tablets are needed?',
    explanation: 'Divide 75mg by 25mg per tablet: 75 ÷ 25 = 3 tablets',
    module_type: 'practice',
    category: 'Numeracy',
    subdivision: 'Dosage Calculations',
    options: [
      { option_text: '2 tablets', is_correct: false },
      { option_text: '3 tablets', is_correct: true },
      { option_text: '4 tablets', is_correct: false },
      { option_text: '5 tablets', is_correct: false },
    ]
  },
  {
    question_text: 'Prescription: 1.5g of medication. Available: 500mg tablets. How many tablets?',
    explanation: 'First convert 1.5g to mg: 1.5g = 1500mg. Then divide: 1500mg ÷ 500mg = 3 tablets',
    module_type: 'practice',
    category: 'Numeracy',
    subdivision: 'Dosage Calculations',
    options: [
      { option_text: '2 tablets', is_correct: false },
      { option_text: '3 tablets', is_correct: true },
      { option_text: '4 tablets', is_correct: false },
      { option_text: '1.5 tablets', is_correct: false },
    ]
  },
  // Practice - Numeracy - IV Flow Rate Calculations
  {
    question_text: 'An IV infusion of 1000ml needs to be given over 8 hours. What is the flow rate in ml/hour?',
    explanation: 'Divide total volume by time: 1000ml ÷ 8 hours = 125 ml/hour',
    module_type: 'practice',
    category: 'Numeracy',
    subdivision: 'IV Flow Rate Calculations',
    options: [
      { option_text: '100 ml/hour', is_correct: false },
      { option_text: '125 ml/hour', is_correct: true },
      { option_text: '150 ml/hour', is_correct: false },
      { option_text: '200 ml/hour', is_correct: false },
    ]
  },
  {
    question_text: '500ml of saline to be infused over 4 hours. Calculate the drip rate in ml/hour.',
    explanation: 'Divide volume by time: 500ml ÷ 4 hours = 125 ml/hour',
    module_type: 'practice',
    category: 'Numeracy',
    subdivision: 'IV Flow Rate Calculations',
    options: [
      { option_text: '100 ml/hour', is_correct: false },
      { option_text: '125 ml/hour', is_correct: true },
      { option_text: '150 ml/hour', is_correct: false },
      { option_text: '175 ml/hour', is_correct: false },
    ]
  },
  // Practice - Clinical Knowledge - Medical-Surgical Nursing
  {
    question_text: 'What is the normal respiratory rate for an adult at rest?',
    explanation: 'The normal respiratory rate for adults is 12-20 breaths per minute at rest',
    module_type: 'practice',
    category: 'Clinical Knowledge',
    subdivision: 'Medical-Surgical Nursing',
    options: [
      { option_text: '8-12 breaths/min', is_correct: false },
      { option_text: '12-20 breaths/min', is_correct: true },
      { option_text: '20-30 breaths/min', is_correct: false },
      { option_text: '30-40 breaths/min', is_correct: false },
    ]
  },
  {
    question_text: 'Which position is best for a patient with difficulty breathing?',
    explanation: 'High Fowler\'s position (sitting upright at 60-90 degrees) promotes lung expansion and eases breathing',
    module_type: 'practice',
    category: 'Clinical Knowledge',
    subdivision: 'Medical-Surgical Nursing',
    options: [
      { option_text: 'Supine position', is_correct: false },
      { option_text: 'High Fowler\'s position', is_correct: true },
      { option_text: 'Trendelenburg position', is_correct: false },
      { option_text: 'Prone position', is_correct: false },
    ]
  },
  {
    question_text: 'What is the first sign of shock in a patient?',
    explanation: 'Increased heart rate (tachycardia) is typically the first compensatory sign of shock',
    module_type: 'practice',
    category: 'Clinical Knowledge',
    subdivision: 'Medical-Surgical Nursing',
    options: [
      { option_text: 'Decreased blood pressure', is_correct: false },
      { option_text: 'Increased heart rate', is_correct: true },
      { option_text: 'Decreased respiratory rate', is_correct: false },
      { option_text: 'Increased temperature', is_correct: false },
    ]
  },
  // Learning - The NMC Code
  {
    question_text: 'According to the NMC Code, what is the primary duty of a nurse?',
    explanation: 'The primary duty is to prioritize people - putting the interests of people first',
    module_type: 'learning',
    category: 'The NMC Code',
    options: [
      { option_text: 'Follow hospital policies', is_correct: false },
      { option_text: 'Prioritize people', is_correct: true },
      { option_text: 'Complete documentation', is_correct: false },
      { option_text: 'Maintain equipment', is_correct: false },
    ]
  },
  {
    question_text: 'How many main principles are there in the NMC Code?',
    explanation: 'There are 4 main principles: Prioritize people, Practice effectively, Preserve safety, Promote professionalism',
    module_type: 'learning',
    category: 'The NMC Code',
    options: [
      { option_text: '2 principles', is_correct: false },
      { option_text: '3 principles', is_correct: false },
      { option_text: '4 principles', is_correct: true },
      { option_text: '5 principles', is_correct: false },
    ]
  },
  // Mock Exam - Part A (Numeracy)
  {
    question_text: 'A patient weighs 70kg and requires 15mg/kg of medication. What is the total dose?',
    explanation: 'Multiply weight by dose per kg: 70kg × 15mg/kg = 1050mg',
    module_type: 'mock_exam',
    exam_part: 'part_a',
    options: [
      { option_text: '750mg', is_correct: false },
      { option_text: '1050mg', is_correct: true },
      { option_text: '1250mg', is_correct: false },
      { option_text: '1500mg', is_correct: false },
    ]
  },
  {
    question_text: 'Calculate: 3/4 + 1/8 = ?',
    explanation: 'Find common denominator (8): 6/8 + 1/8 = 7/8',
    module_type: 'mock_exam',
    exam_part: 'part_a',
    options: [
      { option_text: '5/8', is_correct: false },
      { option_text: '7/8', is_correct: true },
      { option_text: '4/8', is_correct: false },
      { option_text: '1', is_correct: false },
    ]
  },
  // Mock Exam - Part B (Clinical Knowledge)
  {
    question_text: 'What is the normal range for adult blood pressure?',
    explanation: 'Normal BP is 90/60 to 120/80 mmHg. Anything above 140/90 is considered hypertension',
    module_type: 'mock_exam',
    exam_part: 'part_b',
    options: [
      { option_text: '80/50 to 100/70', is_correct: false },
      { option_text: '90/60 to 120/80', is_correct: true },
      { option_text: '100/70 to 140/90', is_correct: false },
      { option_text: '110/80 to 160/100', is_correct: false },
    ]
  },
  {
    question_text: 'What does SBAR stand for in nursing communication?',
    explanation: 'Situation, Background, Assessment, Recommendation - a structured communication tool',
    module_type: 'mock_exam',
    exam_part: 'part_b',
    options: [
      { option_text: 'Summary, Background, Action, Result', is_correct: false },
      { option_text: 'Situation, Background, Assessment, Recommendation', is_correct: true },
      { option_text: 'Status, Brief, Action, Review', is_correct: false },
      { option_text: 'Safety, Briefing, Analysis, Report', is_correct: false },
    ]
  },
];

async function seedDatabase() {
  console.log('🌱 Seeding database with test data...\n');

  try {
    // First, check if questions already exist
    const { data: existing, error: checkError } = await supabase
      .from('questions')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking questions:', checkError.message);
      console.log('\n⚠️  Make sure you run the migration SQL first in your Supabase SQL Editor:');
      console.log('   File: docs/DATABASE_MIGRATION.sql\n');
      return;
    }

    if (existing && existing.length > 0) {
      console.log('⚠️  Database already has questions. Skipping seed to avoid duplicates.');
      console.log('   Delete existing questions first if you want to reseed.\n');
      return;
    }

    // Insert questions with options
    for (const q of questionsWithOptions) {
      console.log(`Adding: ${q.question_text.substring(0, 50)}...`);
      
      // Insert question
      const { data: question, error: qError } = await supabase
        .from('questions')
        .insert({
          question_text: q.question_text,
          explanation: q.explanation,
          module_type: q.module_type,
          category: q.category,
          subdivision: q.subdivision,
          exam_part: q.exam_part,
        })
        .select()
        .single();

      if (qError) {
        console.error('  ❌ Error inserting question:', qError.message);
        continue;
      }

      // Insert options
      const optionsWithQuestionId = q.options.map(opt => ({
        question_id: question.id,
        option_text: opt.option_text,
        is_correct: opt.is_correct,
      }));

      const { error: optError } = await supabase
        .from('question_options')
        .insert(optionsWithQuestionId);

      if (optError) {
        console.error('  ❌ Error inserting options:', optError.message);
      } else {
        console.log('  ✅ Added with 4 options');
      }
    }

    console.log('\n✅ Database seeding complete!');
    console.log(`\nAdded ${questionsWithOptions.length} questions with options`);
    
    // Show summary
    const { data: summary } = await supabase
      .from('questions')
      .select('module_type, category, subdivision, exam_part')
      .not('module_type', 'is', null);

    if (summary) {
      console.log('\n📊 Questions by type:');
      const grouped = summary.reduce((acc, q) => {
        const key = q.module_type;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      console.log(grouped);
    }

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
  }
}

seedDatabase();
