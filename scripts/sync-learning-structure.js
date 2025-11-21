#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase URL or service role key.');
  console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) before running.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

const LEARNING_MODULE_ID = '22222222-2222-2222-2222-222222222222';

const LEARNING_BLUEPRINT = [
  {
    id: '22222222-2222-0001-0000-000000000001',
    order: 1,
    title: 'Numeracy',
    description:
      'Master calculations, conversions, IV infusions, and fluid balance scenarios tested in the CBT numeracy exam.',
    lessons: [
      { id: '1.1', title: 'Dosage Calculations', focus: 'Tablets, liquids, IV medications.', duration: 10 },
      { id: '1.2', title: 'Unit Conversions', focus: 'mg ↔ mcg, kg ↔ lbs, mL ↔ L.', duration: 8 },
      { id: '1.3', title: 'IV Flow Rate Calculations', focus: 'Drip rates, infusion times.', duration: 9 },
      { id: '1.4', title: 'Fluid Balance', focus: 'Fluid charts, BMI, nutrition.', duration: 8 },
    ],
  },
  {
    id: '22222222-2222-0002-0000-000000000002',
    order: 2,
    title: 'The NMC Code',
    description:
      'Understand the four pillars of the NMC Code—People, Practice, Safety, Professionalism—to deliver accountable care.',
    lessons: [
      { id: '2.1', title: 'Prioritise People', focus: 'Patient dignity, consent, advocacy.', duration: 8 },
      { id: '2.2', title: 'Practice Effectively', focus: 'Evidence-based care, delegation, continuous learning.', duration: 12 },
      { id: '2.3', title: 'Preserve Safety', focus: 'Risk reporting, infection control, safeguarding.', duration: 10 },
      { id: '2.4', title: 'Promote Professionalism', focus: 'Social media ethics, accountability, revalidation.', duration: 5 },
    ],
  },
  {
    id: '22222222-2222-0003-0000-000000000003',
    order: 3,
    title: 'Mental Capacity Act',
    description:
      'Apply the Mental Capacity Act to assess decision-making ability, plan best-interest care, and respect autonomy.',
    lessons: [
      { id: '3.1', title: 'Presumption of Capacity', focus: 'Assume capacity unless proven otherwise.', duration: 8 },
      { id: '3.2', title: 'Assessing Capacity', focus: '2-stage test (understanding, retaining, weighing, communicating).', duration: 12 },
      { id: '3.3', title: 'Best Interests Decisions', focus: 'Involving families, advanced care plans.', duration: 10 },
      { id: '3.4', title: 'Advanced Care Planning', focus: 'Living wills, lasting power of attorney.', duration: 8 },
    ],
  },
  {
    id: '22222222-2222-0004-0000-000000000004',
    order: 4,
    title: 'Safeguarding',
    description:
      'Safeguard adults and children by recognising abuse, reporting correctly, and fulfilling statutory duties.',
    lessons: [
      { id: '4.1', title: 'Recognising Abuse', focus: 'Physical, emotional, financial abuse in adults/children.', duration: 9 },
      { id: '4.2', title: 'Reporting Protocols', focus: 'Care Act 2014, whistleblowing, escalation.', duration: 11 },
      { id: '4.3', title: 'Child Protection', focus: 'Children Act 1989, signs of neglect.', duration: 10 },
    ],
  },
  {
    id: '22222222-2222-0005-0000-000000000005',
    order: 5,
    title: 'Consent & Confidentiality',
    description:
      'Balance informed consent, data protection, and safeguarding disclosure requirements in UK nursing.',
    lessons: [
      { id: '5.1', title: 'Valid Consent', focus: 'Informed, voluntary, capacitous consent.', duration: 8 },
      { id: '5.2', title: 'GDPR & Confidentiality', focus: 'Data protection, sharing information.', duration: 9 },
      { id: '5.3', title: 'Confidentiality vs. Safeguarding', focus: 'Disclosing info without consent for protection.', duration: 8 },
    ],
  },
  {
    id: '22222222-2222-0006-0000-000000000006',
    order: 6,
    title: 'Equality & Diversity',
    description:
      'Deliver culturally competent care that upholds Equality Act duties and provides reasonable adjustments.',
    lessons: [
      { id: '6.1', title: 'Equality Act 2010', focus: 'Protected characteristics, non-discrimination.', duration: 7 },
      { id: '6.2', title: 'Cultural Competence', focus: 'Religious dietary needs, prayer times.', duration: 9 },
      { id: '6.3', title: 'Reasonable Adjustments', focus: 'Disability access, communication aids.', duration: 8 },
    ],
  },
  {
    id: '22222222-2222-0007-0000-000000000007',
    order: 7,
    title: 'Duty of Candour',
    description:
      'Meet statutory duty of candour obligations by communicating openly after incidents and documenting actions.',
    lessons: [
      { id: '7.1', title: 'Transparency After Errors', focus: 'Apologising, explaining harm, documentation.', duration: 8 },
      { id: '7.2', title: 'NHS Incident Reporting', focus: 'DATIX forms, root cause analysis.', duration: 7 },
    ],
  },
  {
    id: '22222222-2222-0008-0000-000000000008',
    order: 8,
    title: 'Cultural Adaptation',
    description:
      'Bridge cultural expectations between Indian practice and UK standards, focusing on autonomy and communication.',
    lessons: [
      { id: '8.1', title: 'Autonomy vs. Family Decisions', focus: 'UK patient-led vs. India family-led care.', duration: 9 },
      { id: '8.2', title: 'UK Communication Styles', focus: 'Assertiveness, multidisciplinary teamwork.', duration: 8 },
    ],
  },
];

async function main() {
  console.log('🔄 Syncing learning module structure with Supabase...');

  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id,title,module_id,description,display_order')
    .eq('module_id', LEARNING_MODULE_ID);

  if (topicsError) {
    console.error('❌ Failed to fetch topics:', topicsError.message);
    process.exit(1);
  }

  for (const topicBlueprint of LEARNING_BLUEPRINT) {
    const existing = topics?.find((row) => row.title === topicBlueprint.title);
    let topicId = existing?.id;

    if (existing) {
      const updates = {
        description: topicBlueprint.description,
        display_order: topicBlueprint.order,
        is_active: true,
      };
      await supabase.from('topics').update(updates).eq('id', existing.id);
      console.log(`✅ Topic updated: ${topicBlueprint.title}`);
    } else {
      topicId = topicBlueprint.id || randomUUID();
      const insertPayload = {
        id: topicId,
        module_id: LEARNING_MODULE_ID,
        title: topicBlueprint.title,
        description: topicBlueprint.description,
        display_order: topicBlueprint.order,
        is_active: true,
      };
      const { error: insertError } = await supabase.from('topics').insert(insertPayload);
      if (insertError) {
        console.error(`❌ Failed to insert topic ${topicBlueprint.title}:`, insertError.message);
        continue;
      }
      console.log(`➕ Topic inserted: ${topicBlueprint.title}`);
    }

    if (!topicId) {
      console.warn(`⚠️  Skipping lessons for ${topicBlueprint.title} because topic id was not resolved.`);
      continue;
    }

    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id,title,category,display_order,duration,notes')
      .eq('topic_id', topicId);

    if (lessonsError) {
      console.error(`❌ Failed to fetch lessons for ${topicBlueprint.title}:`, lessonsError.message);
      continue;
    }

    const keepLessonIds = new Set();

    for (const [index, lessonBlueprint] of topicBlueprint.lessons.entries()) {
      const displayOrder = index + 1;
      const match = lessons?.find((row) => row.category === lessonBlueprint.id)
        || lessons?.find((row) => row.title.trim().toLowerCase() === lessonBlueprint.title.toLowerCase());

      const lessonPayload = {
        title: lessonBlueprint.title,
        category: lessonBlueprint.id,
        duration: lessonBlueprint.duration,
        notes: lessonBlueprint.focus,
        display_order: displayOrder,
        is_active: true,
      };

      if (match) {
        keepLessonIds.add(match.id);
        const { error: updateError } = await supabase
          .from('lessons')
          .update(lessonPayload)
          .eq('id', match.id);
        if (updateError) {
          console.error(`  ❌ Failed to update lesson ${lessonBlueprint.title}:`, updateError.message);
        } else {
          console.log(`  ✅ Lesson updated: ${lessonBlueprint.id} ${lessonBlueprint.title}`);
        }
      } else {
        const lessonId = randomUUID();
        keepLessonIds.add(lessonId);
        const insertPayload = {
          id: lessonId,
          topic_id: topicId,
          title: lessonBlueprint.title,
          category: lessonBlueprint.id,
          duration: lessonBlueprint.duration,
          notes: lessonBlueprint.focus,
          content: 'Lesson content coming soon.',
          display_order: displayOrder,
          is_active: true,
        };
        const { error: insertError } = await supabase
          .from('lessons')
          .insert(insertPayload);
        if (insertError) {
          console.error(`  ❌ Failed to insert lesson ${lessonBlueprint.title}:`, insertError.message);
        } else {
          console.log(`  ➕ Lesson inserted: ${lessonBlueprint.id} ${lessonBlueprint.title}`);
        }
      }
    }

    const extraLessons = (lessons || []).filter((row) => !keepLessonIds.has(row.id));
    for (const extra of extraLessons) {
      const { error: archiveError } = await supabase
        .from('lessons')
        .update({ is_active: false })
        .eq('id', extra.id);
      if (archiveError) {
        console.error(`  ❌ Failed to archive obsolete lesson ${extra.id}:`, archiveError.message);
      } else {
        console.log(`  ⚠️  Archived obsolete lesson ${extra.title || extra.id}`);
      }
    }
  }

  console.log('\n✅ Sync complete. Review Supabase data to confirm.');
}

main().catch((error) => {
  console.error('Unexpected failure:', error);
  process.exit(1);
});
