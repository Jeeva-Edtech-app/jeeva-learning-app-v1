# Jeeva Admin Portal – Supabase Schema & RLS Guide (`supabase.md`)

---

## 📦 Tables, Fields, and Relationships

| Table Name           | Key Fields (PK)                  | FK / Relationships         | Purpose                             |

|----------------------|----------------------------------|----------------------------|-------------------------------------|

| users                | id (UUID), email, role           | N/A                        | End-user (student) registry         |

| user_profiles        | id (UUID), user_id (FK)           | user_id ➔ users.id         | Profile info                        |

| subscriptions        | id (PK), user_id (FK)            | user_id ➔ users.id         | Subscription plans/records          |

| admin_users          | id (PK), email, role             | N/A                        | Admin user list/roles               |

| modules              | id (PK), name                    | N/A                        | Course/module registry              |

| topics               | id (PK), module_id (FK)          | module_id ➔ modules.id     | Topic to module link                |

| subtopics            | id (PK), topic_id (FK)           | topic_id ➔ topics.id       | Subtopic to topic                   |

| lessons              | id (PK), subtopic_id (FK)        | subtopic_id ➔ subtopics.id | Lesson content                      |

| flashcards           | id (PK), lesson_id (FK)          | lesson_id ➔ lessons.id     | Flashcard learning                  |

| questions            | id (PK), lesson_id (FK)          | lesson_id ➔ lessons.id     | Question bank                       |

| question_options     | id (PK), question_id (FK)        | question_id ➔ questions.id | MCQ options                         |

| question_media       | id (PK), question_id (FK)        | question_id ➔ questions.id | Images, media                       |

| practice_sessions    | id (PK), user_id (FK)            | user_id ➔ users.id         | Practice sessions log               |

| practice_results     | id (PK), session_id (FK)         | session_id ➔ practice_sessions.id | Answer log                  |

| lesson_quizzes       | id (PK), lesson_id/user_id (FK)  | lesson_id, user_id         | Quiz participation                  |

| mock_exams           | id (PK), user_id (FK)            | user_id                    | Mock exam attempts                  |

| mock_exam_results    | id (PK), exam_id (FK)            | exam_id                    | Mock exam results                   |

| learning_completions | id (PK), user_id, lesson_id      | user_id, lesson_id         | Lesson/module completion            |

| ai_recommendations   | id (PK), user_id (FK)            | user_id                    | AI-driven learning recommendation   |

| learning_paths       | id (PK), user_id (FK)            | user_id                    | Adaptive learning paths             |

| user_analytics       | id (PK), user_id (FK)            | user_id                    | Progress, engagement, metrics       |

| content_approvals    | id (PK), resource_id, by_admin_id(FK)| by_admin_id ➔ admin_users.id| Content review queue         |

| app_settings         | id (PK), key, value              | N/A                        | System, feature flags               |

| dashboard_hero       | id (PK), title, active           | N/A                        | Dashboard/banner/hero               |

All content relationships are hierarchical (modules > topics > subtopics > lessons > questions/flashcards). Practice/results, analytics, and AI are user-linked.

---

## 🔐 Role & Access Matrix

**Admin roles (web):**

| Route/Section     | superadmin | editor               | moderator              |

|-------------------|:----------:|:--------------------:|:----------------------:|

| All content       | Yes        | Yes                  | Limited/review         |

| User management   | Yes        | No                   | No                     |

| Admin mgmt        | Yes        | No                   | No                     |

| Subscriptions     | Yes        | No                   | No                     |

| Analytics         | Yes        | Content only         | Review only            |

| Approvals         | Yes        | Yes                  | Yes                    |

| Settings          | Yes        | No                   | No                     |

**Student roles (mobile):**

| Feature Access    | guest      | trial user           | paid user              | coaching user           |

|-------------------|:----------:|:--------------------:|:----------------------:|:----------------------:|

| Content Preview   | Yes        | Yes                  | Yes                    | Yes                    |

| Full content      | No         | Limited              | Yes                    | Yes (+coaching)        |

| Quizzes/Practice  | No         | Limited              | Yes                    | Yes                    |

| AI/Personalization| No         | Basic                | Yes                    | Advanced/Coach         |

| Analytics         | No         | Basic                | Full                   | Full+                  |

---

## 🔑 RLS (Row Level Security) Policy Matrix

| Table                | SELECT        | INSERT         | UPDATE        | DELETE        |

|----------------------|--------------|---------------|--------------|--------------|

| users                | self/admin   | anyone        | self/admin   | self/admin   |

| user_profiles        | self         | self          | self         | self         |

| subscriptions        | self         | self/payment  | self/admin   | self/admin   |

| admin_users          | self-active  | superadmin    | superadmin   | superadmin   |

| content/lessons/etc. | public       | editor/super  | editor/super | superadmin   |

| question_options/media| public      | editor/super  | editor/super | superadmin   |

| practice_sessions    | self         | self          | self         | self         |

| etc...               | -            | -             | -            | -            |

---

## 📝 Example RLS Policy SQL

```sql
-- Superadmin gets all privileges
CREATE POLICY "Superadmin full control"
ON admin_users
FOR ALL
USING (role = 'superadmin' AND is_active);

-- Editor can update lessons
CREATE POLICY "Editor content update"
ON lessons
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND admin_users.role = 'editor' AND admin_users.is_active
));
```

- Add similar rules for all roles and tables as mapped in the policy matrix.

---

## ⚡ Best Practices

- All tables must have RLS **enabled**.

- Never expose `service_key` or admin credentials to clients.

- Match new/changed features in the schema and RLS docs.

- All onboarding, migrations, and code reviews must reference this doc to avoid drift or privilege errors.

---
