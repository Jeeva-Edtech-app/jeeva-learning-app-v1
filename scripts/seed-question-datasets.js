#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

const LESSON_IDS = {
  '1.1': '5f94440a-d509-4aad-95e0-b65b2ea93faa',
  '1.2': '76fd07d8-4052-4154-ab77-b6badc945324',
  '1.3': '37177952-39c9-404d-b39c-6e39375c4797',
  '1.4': '95434e6e-767f-4831-afa1-03b1786a25b9',
  '2.1': '591c633c-090a-46e7-aacb-c565b2121ad0',
  '2.2': '22e07731-79bd-46d3-9975-ee68b6da1882',
  '2.3': '1b9ddea8-dade-45d0-ad98-7d860b10bf3f',
  '2.4': '708d9dcd-2d0f-42f9-9639-bc1700bc3bbf',
  '3.1': '39690180-8c33-43e5-9328-b3dbb99d539e',
  '3.2': '08a24b59-5eea-4f57-89a5-61da3044d53c',
  '3.3': '0541fc09-0d81-45e0-820a-636190468cbe',
  '3.4': '52e56539-9fdf-4849-998e-03aab04fe714',
  '4.1': '3a808935-99a0-4a7e-a250-b2ceab5678e3',
  '4.2': 'd88ba8f4-49cb-4a34-8eee-84720462a21b',
  '4.3': 'e9386cd8-3a94-48aa-a791-cb1b0aab46a0',
  '5.1': '81015371-3fda-4907-9bfe-a2786b32791f',
  '5.2': 'c0ad07f6-54c6-4b19-9be0-cc85c1d76139',
  '5.3': 'ba2c389d-13b7-4c00-a478-ba357820bd2d',
  '6.1': '3fae1fd1-fdd0-4d8b-aac0-21e0309c71c8',
  '6.2': '3084b684-9962-4bfd-879a-b4f117439af3',
  '6.3': 'c88b6a88-252f-4375-a7ea-03b44464666f',
  '7.1': '1cffa560-39c2-4109-ad5c-dc63908531fc',
  '7.2': 'e766bfad-194b-477b-acb0-040d1dacbe5f',
  '8.1': '13431028-8f7a-4500-a02a-45cf995686a5',
  '8.2': '81a165b6-9313-48f7-963a-7466746c59c2',
};

const createOption = (text, isCorrect = false) => ({
  id: randomUUID(),
  option_text: text,
  is_correct: isCorrect,
  display_order: 1,
});

const numeracyQuestions = [
  {
    category: 'Numeracy',
    subdivision: '1.1',
    lessonId: LESSON_IDS['1.1'],
    question: 'A patient requires 500 mg of a drug. You have 250 mg tablets. How many tablets do you administer?',
    options: [
      createOption('2 tablets', true),
      createOption('1 tablet'),
      createOption('3 tablets'),
      createOption('4 tablets'),
    ],
    explanation: 'Divide required dose by strength per tablet: 500 mg ÷ 250 mg = 2 tablets.',
  },
  {
    category: 'Numeracy',
    subdivision: '1.2',
    lessonId: LESSON_IDS['1.2'],
    question: 'Convert 0.75 litres to millilitres.',
    options: [
      createOption('750 mL', true),
      createOption('75 mL'),
      createOption('7.5 mL'),
      createOption('150 mL'),
    ],
    explanation: '1 litre equals 1000 mL, so 0.75 × 1000 = 750 mL.',
  },
  {
    category: 'Numeracy',
    subdivision: '1.3',
    lessonId: LESSON_IDS['1.3'],
    question: 'An infusion of 1 L must run over 8 hours. What is the required mL/hour rate?',
    options: [
      createOption('125 mL/hour', true),
      createOption('250 mL/hour'),
      createOption('80 mL/hour'),
      createOption('100 mL/hour'),
    ],
    explanation: '1000 mL ÷ 8 hours = 125 mL per hour.',
  },
  {
    category: 'Numeracy',
    subdivision: '1.4',
    lessonId: LESSON_IDS['1.4'],
    question: 'A patient’s 24-hour intake is 2100 mL and output is 1850 mL. What is the fluid balance?',
    options: [
      createOption('+250 mL', true),
      createOption('-250 mL'),
      createOption('+150 mL'),
      createOption('-150 mL'),
    ],
    explanation: 'Balance = Intake – Output = 2100 – 1850 = +250 mL.',
  },
];

const practiceSubdivisions = [
  { category: 'Numeracy', subdivision: '1.1', label: 'Dosage Calculations' },
  { category: 'Numeracy', subdivision: '1.2', label: 'Unit Conversions' },
  { category: 'Numeracy', subdivision: '1.3', label: 'IV Flow Rate Calculations' },
  { category: 'Numeracy', subdivision: '1.4', label: 'Fluid Balance' },
  { category: 'The NMC Code', subdivision: '2.1', label: 'Prioritise People' },
  { category: 'The NMC Code', subdivision: '2.2', label: 'Practice Effectively' },
  { category: 'Mental Capacity Act', subdivision: '3.2', label: 'Assessing Capacity' },
  { category: 'Safeguarding', subdivision: '4.2', label: 'Reporting Protocols' },
];

const buildPracticeQuestions = () =>
  practiceSubdivisions.map((topic, index) => ({
    category: topic.category,
    subdivision: topic.subdivision,
    lessonId: LESSON_IDS[topic.subdivision] ?? null,
    module_type: 'practice',
    question: `Practice drill ${index + 1}: ${topic.label}`,
    options: [
      createOption('Correct response illustrating best practice', true),
      createOption('Incorrect option A'),
      createOption('Incorrect option B'),
      createOption('Incorrect option C'),
    ],
    explanation: 'Review the associated lesson notes to understand why this option is best.',
  }));

const buildMockExamQuestions = () => {
  const partA = [];
  for (let i = 1; i <= 15; i += 1) {
    partA.push({
      question: `Part A Numeracy scenario ${i}: Calculate the safe medication dose.`,
      exam_part: 'part_a',
      category: 'Mock Exam Part A',
      subdivision: null,
      module_type: 'mock_exam',
      lessonId: null,
      options: [
        createOption('Correct calculation', true),
        createOption('Common incorrect calculation'),
        createOption('Unsafe overdose'),
        createOption('Underdose value'),
      ],
      explanation: 'Apply dimensional analysis for the numeracy calculation.',
    });
  }

  const partB = [];
  for (let i = 1; i <= 120; i += 1) {
    partB.push({
      question: `Part B Clinical question ${i}: Select the safest nursing action.`,
      exam_part: 'part_b',
      category: 'Mock Exam Part B',
      subdivision: null,
      module_type: 'mock_exam',
      lessonId: null,
      options: [
        createOption('Most appropriate intervention', true),
        createOption('Less effective option'),
        createOption('Contraindicated action'),
        createOption('Irrelevant response'),
      ],
      explanation: 'Consider the NMC Code and current clinical guidelines.',
    });
  }

  return [...partA, ...partB];
};

const datasets = [
  ...numeracyQuestions.map((question) => ({ ...question, module_type: 'learning' })),
  ...buildPracticeQuestions(),
  ...buildMockExamQuestions(),
];

async function questionExists({ question, module_type, subdivision, exam_part }) {
  let query = supabase.from('questions').select('id').eq('question_text', question).limit(1);

  if (module_type) {
    query = query.eq('module_type', module_type);
  } else {
    query = query.is('module_type', null);
  }

  if (subdivision) {
    query = query.eq('subdivision', subdivision);
  } else {
    query = query.is('subdivision', null);
  }

  if (exam_part) {
    query = query.eq('exam_part', exam_part);
  } else {
    query = query.is('exam_part', null);
  }

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.warn('⚠️  Existence check failed', question, error.message);
  }

  return data?.id ?? null;
}

async function insertQuestion(entry) {
  if (!entry.question || !entry.options || entry.options.length < 2) {
    console.warn('⚠️  Skipping malformed question payload:', entry);
    return;
  }

  const existingId = await questionExists(entry);
  if (existingId) {
    return;
  }

  const questionPayload = {
    question_text: entry.question,
    question_type: 'multiple_choice',
    difficulty: 'medium',
    points: 1,
    explanation: entry.explanation,
    module_type: entry.module_type || null,
    category: entry.category,
    subdivision: entry.subdivision,
    exam_part: entry.exam_part || null,
    lesson_id: entry.lessonId || null,
    is_active: true,
  };

  const { data, error } = await supabase
    .from('questions')
    .insert(questionPayload)
    .select('id')
    .single();

  if (error) {
    console.error('❌ Failed to insert question:', entry.question, error.message);
    return;
  }

  const questionId = data.id;

  const optionsPayload = entry.options.map((option, index) => ({
    question_id: questionId,
    option_text: option.option_text,
    is_correct: option.is_correct,
    display_order: index + 1,
  }));

  const { error: optionsError } = await supabase.from('question_options').insert(optionsPayload);

  if (optionsError) {
    console.error('❌ Failed to insert options for question:', entry.question, optionsError.message);
    return;
  }

  console.log(`✅ Inserted question: "${entry.question}"`);
}

async function main() {
  console.log('📦 Seeding question datasets (numeracy, practice, mock exam)...');
  for (const entry of datasets) {
    // eslint-disable-next-line no-await-in-loop
    await insertQuestion(entry);
  }
  console.log('✅ Seeding complete.');
}

main().catch((error) => {
  console.error('Unexpected failure while seeding questions.', error);
  process.exit(1);
});
