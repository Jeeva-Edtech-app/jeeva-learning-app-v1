# Learning Module Structure Migration Plan

## Current Status
- Application now references `LEARNING_STRUCTURE` blueprint (topics, subtopics, durations).
- Lesson list screen consumes blueprint metadata; Supabase still holds legacy categories (1.x etc.).
- README/docs updated with new subtopic table; DB migration pending.

## Required Database Migration
1. **Backup tables** (`lessons`, `questions`, `flashcards`).
2. **Update category/subdivision IDs** per mapping table below.
3. **Assign Numeracy content** to new subtopics (manual classification).
4. **Optional**: add `duration_minutes`, `key_focus` columns if storing in DB (currently only blueprint).

### Subtopic ID mapping
| Old ID | Old Location | New ID | New Location |
| --- | --- | --- | --- |
| – | Numeracy | 1.1 | Numeracy → Dosage Calculations |
| – | Numeracy | 1.2 | Numeracy → Unit Conversions |
| – | Numeracy | 1.3 | Numeracy → IV Flow Rate Calculations |
| – | Numeracy | 1.4 | Numeracy → Fluid Balance |
| 1.1 | The NMC Code → Prioritise People | 2.1 | 2. The NMC Code → Prioritise People |
| 1.2 | The NMC Code → Practice Effectively | 2.2 | 2. The NMC Code → Practice Effectively |
| 1.3 | The NMC Code → Preserve Safety | 2.3 | 2. The NMC Code → Preserve Safety |
| 1.4 | The NMC Code → Promote Professionalism | 2.4 | 2. The NMC Code → Promote Professionalism |
| 2.1 | Mental Capacity Act → Presumption of Capacity | 3.1 | 3. Mental Capacity Act → Presumption of Capacity |
| 2.2 | Mental Capacity Act → Assessing Capacity | 3.2 | 3. Mental Capacity Act → Assessing Capacity |
| 2.3 | Mental Capacity Act → Best Interests Decisions | 3.3 | 3. Mental Capacity Act → Best Interests Decisions |
| 2.4 | Mental Capacity Act → Advanced Care Planning | 3.4 | 3. Mental Capacity Act → Advanced Care Planning |
| 3.1 | Safeguarding → Recognising Abuse | 4.1 | 4. Safeguarding → Recognising Abuse |
| 3.2 | Safeguarding → Reporting Protocols | 4.2 | 4. Safeguarding → Reporting Protocols |
| 3.3 | Safeguarding → Child Protection | 4.3 | 4. Safeguarding → Child Protection |
| 4.1 | Consent & Confidentiality → Valid Consent | 5.1 | 5. Consent & Confidentiality → Valid Consent |
| 4.2 | Consent & Confidentiality → GDPR & Confidentiality | 5.2 | 5. Consent & Confidentiality → GDPR & Confidentiality |
| 4.3 | Consent & Confidentiality → Confidentiality vs. Safeguarding | 5.3 | 5. Consent & Confidentiality → Confidentiality vs. Safeguarding |
| 5.1 | Equality & Diversity → Equality Act 2010 | 6.1 | 6. Equality & Diversity → Equality Act 2010 |
| 5.2 | Equality & Diversity → Cultural Competence | 6.2 | 6. Equality & Diversity → Cultural Competence |
| 5.3 | Equality & Diversity → Reasonable Adjustments | 6.3 | 6. Equality & Diversity → Reasonable Adjustments |
| 6.1 | Duty of Candour → Transparency After Errors | 7.1 | 7. Duty of Candour → Transparency After Errors |
| 6.2 | Duty of Candour → NHS Incident Reporting | 7.2 | 7. Duty of Candour → NHS Incident Reporting |
| 7.1 | Cultural Adaptation → Autonomy vs. Family Decisions | 8.1 | 8. Cultural Adaptation → Autonomy vs. Family Decisions |
| 7.2 | Cultural Adaptation → UK Communication Styles | 8.2 | 8. Cultural Adaptation → UK Communication Styles |

## Blueprint Reference
| Topic | Lesson | Focus | Duration (min) |
| --- | --- | --- | --- |
| **1. Numeracy** | 1.1 Dosage Calculations | Tablets, liquids, IV medications. | 10 |
|  | 1.2 Unit Conversions | mg ↔ mcg, kg ↔ lbs, mL ↔ L. | 8 |
|  | 1.3 IV Flow Rate Calculations | Drip rates, infusion times. | 9 |
|  | 1.4 Fluid Balance | Fluid charts, BMI, nutrition. | 8 |
| **2. The NMC Code** | 2.1 Prioritise People | Patient dignity, consent, advocacy. | 8 |
|  | 2.2 Practice Effectively | Evidence-based care, delegation, continuous learning. | 12 |
|  | 2.3 Preserve Safety | Risk reporting, infection control, safeguarding. | 10 |
|  | 2.4 Promote Professionalism | Social media ethics, accountability, revalidation. | 5 |
| **3. Mental Capacity Act** | 3.1 Presumption of Capacity | Assume capacity unless proven otherwise. | 8 |
|  | 3.2 Assessing Capacity | 2-stage test (understanding, retaining, weighing, communicating). | 12 |
|  | 3.3 Best Interests Decisions | Involving families, advanced care plans. | 10 |
|  | 3.4 Advanced Care Planning | Living wills, lasting power of attorney. | 8 |
| **4. Safeguarding** | 4.1 Recognising Abuse | Physical, emotional, financial abuse in adults/children. | 9 |
|  | 4.2 Reporting Protocols | Care Act 2014, whistleblowing, escalation. | 11 |
|  | 4.3 Child Protection | Children Act 1989, signs of neglect. | 10 |
| **5. Consent & Confidentiality** | 5.1 Valid Consent | Informed, voluntary, capacitous consent. | 8 |
|  | 5.2 GDPR & Confidentiality | Data protection, sharing information. | 9 |
|  | 5.3 Confidentiality vs. Safeguarding | Disclosing info without consent for protection. | 8 |
| **6. Equality & Diversity** | 6.1 Equality Act 2010 | Protected characteristics, non-discrimination. | 7 |
|  | 6.2 Cultural Competence | Religious dietary needs, prayer times. | 9 |
|  | 6.3 Reasonable Adjustments | Disability access, communication aids. | 8 |
| **7. Duty of Candour** | 7.1 Transparency After Errors | Apologising, explaining harm, documentation. | 8 |
|  | 7.2 NHS Incident Reporting | DATIX forms, root cause analysis. | 7 |
| **8. Cultural Adaptation** | 8.1 Autonomy vs. Family Decisions | UK patient-led vs. India family-led care. | 9 |
|  | 8.2 UK Communication Styles | Assertiveness, multidisciplinary teamwork. | 8 |

## Implementation Checklist
- [x] Run mapping SQL on lessons, questions, flashcards, other custom tables.
- [ ] Update admin portal options to use new subtopic IDs.
- [x] Audit practice question coverage for new Numeracy subtopics.
- [ ] Populate Supabase lesson duration & key focus (if moving beyond blueprint).
- [ ] Smoke test lesson list screen after migration.
- [x] Seed Supabase with numeracy, practice, and mock exam question datasets (`scripts/seed-question-datasets.js`).

### Sync script (optional)
Run the helper script to align Supabase `topics`/`lessons` metadata with the blueprint:

```bash
SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
node scripts/sync-learning-structure.js
```

The script will upsert topic descriptions, ensure each sub-topic lesson exists, update `category`,
`duration`, `notes` (used for key focus), and archive any obsolete lesson rows.
