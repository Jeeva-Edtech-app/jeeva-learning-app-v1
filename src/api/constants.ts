export const FIXED_MODULE_IDS = {
  PRACTICE: '11111111-1111-1111-1111-111111111111',
  LEARNING: '22222222-2222-2222-2222-222222222222',
  MOCK_EXAM: '33333333-3333-3333-3333-333333333333',
} as const

export const LEARNING_STRUCTURE = [
  {
    id: '22222222-2222-0001-0000-000000000001',
    topic: 'Numeracy',
    category: 'Numeracy',
    icon: '🧮',
    description:
      'Master calculations, conversions, IV infusions, and fluid balance scenarios tested in the CBT numeracy exam.',
    subtopics: [
      {
        id: '1.1',
        title: 'Dosage Calculations',
        category: 'Numeracy',
        focus: 'Tablets, liquids, IV medications.',
        durationMinutes: 10,
      },
      {
        id: '1.2',
        title: 'Unit Conversions',
        category: 'Numeracy',
        focus: 'mg ↔ mcg, kg ↔ lbs, mL ↔ L.',
        durationMinutes: 8,
      },
      {
        id: '1.3',
        title: 'IV Flow Rate Calculations',
        category: 'Numeracy',
        focus: 'Drip rates, infusion times.',
        durationMinutes: 9,
      },
      {
        id: '1.4',
        title: 'Fluid Balance',
        category: 'Numeracy',
        focus: 'Fluid charts, BMI, nutrition.',
        durationMinutes: 8,
      },
    ],
  },
  {
    id: '22222222-2222-0002-0000-000000000002',
    topic: 'The NMC Code',
    category: 'The NMC Code',
    icon: '📋',
    description:
      'Understand the four pillars of the NMC Code—People, Practice, Safety, Professionalism—to deliver accountable and compassionate care.',
    subtopics: [
      {
        id: '2.1',
        title: 'Prioritise People',
        category: 'The NMC Code',
        focus: 'Patient dignity, consent, advocacy.',
        durationMinutes: 8,
      },
      {
        id: '2.2',
        title: 'Practice Effectively',
        category: 'The NMC Code',
        focus: 'Evidence-based care, delegation, continuous learning.',
        durationMinutes: 12,
      },
      {
        id: '2.3',
        title: 'Preserve Safety',
        category: 'The NMC Code',
        focus: 'Risk reporting, infection control, safeguarding.',
        durationMinutes: 10,
      },
      {
        id: '2.4',
        title: 'Promote Professionalism',
        category: 'The NMC Code',
        focus: 'Social media ethics, accountability, revalidation.',
        durationMinutes: 5,
      },
    ],
  },
  {
    id: '22222222-2222-0003-0000-000000000003',
    topic: 'Mental Capacity Act',
    category: 'Mental Capacity Act',
    icon: '🧠',
    description:
      'Apply the Mental Capacity Act to assess decision-making ability, plan best-interest care, and respect autonomy.',
    subtopics: [
      {
        id: '3.1',
        title: 'Presumption of Capacity',
        category: 'Mental Capacity Act',
        focus: 'Assume capacity unless proven otherwise.',
        durationMinutes: 8,
      },
      {
        id: '3.2',
        title: 'Assessing Capacity',
        category: 'Mental Capacity Act',
        focus: '2-stage test (understanding, retaining, weighing, communicating).',
        durationMinutes: 12,
      },
      {
        id: '3.3',
        title: 'Best Interests Decisions',
        category: 'Mental Capacity Act',
        focus: 'Involving families, advanced care plans.',
        durationMinutes: 10,
      },
      {
        id: '3.4',
        title: 'Advanced Care Planning',
        category: 'Mental Capacity Act',
        focus: 'Living wills, lasting power of attorney.',
        durationMinutes: 8,
      },
    ],
  },
  {
    id: '22222222-2222-0004-0000-000000000004',
    topic: 'Safeguarding',
    category: 'Safeguarding',
    icon: '🛡️',
    description:
      'Safeguard adults and children by recognising abuse, following reporting protocols, and fulfilling statutory duties.',
    subtopics: [
      {
        id: '4.1',
        title: 'Recognising Abuse',
        category: 'Safeguarding',
        focus: 'Physical, emotional, financial abuse in adults/children.',
        durationMinutes: 9,
      },
      {
        id: '4.2',
        title: 'Reporting Protocols',
        category: 'Safeguarding',
        focus: 'Care Act 2014, whistleblowing, escalation.',
        durationMinutes: 11,
      },
      {
        id: '4.3',
        title: 'Child Protection',
        category: 'Safeguarding',
        focus: 'Children Act 1989, signs of neglect.',
        durationMinutes: 10,
      },
    ],
  },
  {
    id: '22222222-2222-0005-0000-000000000005',
    topic: 'Consent & Confidentiality',
    category: 'Consent & Confidentiality',
    icon: '🔒',
    description:
      'Balance informed consent, data protection, and safeguarding disclosure requirements in UK nursing practice.',
    subtopics: [
      {
        id: '5.1',
        title: 'Valid Consent',
        category: 'Consent & Confidentiality',
        focus: 'Informed, voluntary, capacitous consent.',
        durationMinutes: 8,
      },
      {
        id: '5.2',
        title: 'GDPR & Confidentiality',
        category: 'Consent & Confidentiality',
        focus: 'Data protection, sharing information.',
        durationMinutes: 9,
      },
      {
        id: '5.3',
        title: 'Confidentiality vs. Safeguarding',
        category: 'Consent & Confidentiality',
        focus: 'Disclosing info without consent for protection.',
        durationMinutes: 8,
      },
    ],
  },
  {
    id: '22222222-2222-0006-0000-000000000006',
    topic: 'Equality & Diversity',
    category: 'Equality & Diversity',
    icon: '🤝',
    description:
      'Deliver culturally competent care that meets Equality Act duties, respects diversity, and provides reasonable adjustments.',
    subtopics: [
      {
        id: '6.1',
        title: 'Equality Act 2010',
        category: 'Equality & Diversity',
        focus: 'Protected characteristics, non-discrimination.',
        durationMinutes: 7,
      },
      {
        id: '6.2',
        title: 'Cultural Competence',
        category: 'Equality & Diversity',
        focus: 'Religious dietary needs, prayer times.',
        durationMinutes: 9,
      },
      {
        id: '6.3',
        title: 'Reasonable Adjustments',
        category: 'Equality & Diversity',
        focus: 'Disability access, communication aids.',
        durationMinutes: 8,
      },
    ],
  },
  {
    id: '22222222-2222-0007-0000-000000000007',
    topic: 'Duty of Candour',
    category: 'Duty of Candour',
    icon: '💬',
    description:
      'Meet statutory duty of candour obligations by communicating openly after incidents and documenting actions.',
    subtopics: [
      {
        id: '7.1',
        title: 'Transparency After Errors',
        category: 'Duty of Candour',
        focus: 'Apologising, explaining harm, documentation.',
        durationMinutes: 8,
      },
      {
        id: '7.2',
        title: 'NHS Incident Reporting',
        category: 'Duty of Candour',
        focus: 'DATIX forms, root cause analysis.',
        durationMinutes: 7,
      },
    ],
  },
  {
    id: '22222222-2222-0008-0000-000000000008',
    topic: 'Cultural Adaptation',
    category: 'Cultural Adaptation',
    icon: '🌍',
    description:
      'Bridge cultural expectations between Indian practice and UK standards, focusing on autonomy and communication.',
    subtopics: [
      {
        id: '8.1',
        title: 'Autonomy vs. Family Decisions',
        category: 'Cultural Adaptation',
        focus: 'UK patient-led vs. India family-led care.',
        durationMinutes: 9,
      },
      {
        id: '8.2',
        title: 'UK Communication Styles',
        category: 'Cultural Adaptation',
        focus: 'Assertiveness, multidisciplinary teamwork.',
        durationMinutes: 8,
      },
    ],
  },
] as const

// Keep the simple array for backward compatibility
export const LEARNING_TOPICS = LEARNING_STRUCTURE.map(item => item.topic)

export const PRACTICE_CATEGORIES = {
  NUMERACY: 'Numeracy',
  CLINICAL_KNOWLEDGE: 'Clinical Knowledge',
} as const

export const NUMERACY_SUBDIVISIONS = [
  'Dosage Calculations',
  'Unit Conversions',
  'IV Flow Rate Calculations',
  'Fluid Balance',
] as const

export const CLINICAL_SUBDIVISIONS = [
  'Medical-Surgical Nursing',
  'Pharmacology',
  'Infection Control',
  'Wound Care',
  'Palliative Care',
] as const

export const MOCK_EXAM_CONFIG = {
  PART_A: {
    title: 'Part A: Numeracy',
    questionCount: 15,
    durationMinutes: 30,
    examPart: 'part_a' as const,
  },
  PART_B: {
    title: 'Part B: Clinical Knowledge',
    questionCount: 120,
    durationMinutes: 150,
    examPart: 'part_b' as const,
  },
} as const
