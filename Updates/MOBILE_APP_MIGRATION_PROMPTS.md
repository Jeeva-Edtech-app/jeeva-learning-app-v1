# Mobile App Migration Prompts - Copy & Paste Guide

## 📋 Overview

This guide provides step-by-step prompts to migrate your mobile app from a dynamic CMS structure to the fixed 7-topic Learning Module system. The admin portal has been updated to support this new structure with:

- **7 Fixed Learning Topics** (Numeracy, NMC Code, Mental Capacity Act, Safeguarding, Consent & Confidentiality, Equality & Diversity, Duty of Candour, Cultural Adaptation)
- **25 Subtopics** organized hierarchically (e.g., "1.1 Prioritise People", "2.1 Presumption of Capacity")
- **Category-based Organization** for lessons and flashcards
- **Topic-level Flashcards** in addition to lesson-level flashcards

---

## Database Setup

### Prompt 1: Run Database Migration

```
Run this SQL migration in Supabase SQL Editor to add the category column to lessons table:

-- Add category column to lessons table for subtopics
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category);

-- Add comment
COMMENT ON COLUMN lessons.category IS 'Subtopic identifier (e.g., "1.1 Prioritise People", "3.1 Recognising Abuse") for hierarchical organization within Learning Module topics.';

This migration allows lessons to be organized by subtopics within the Learning Module.
```

---

## Step 1: Create Learning Structure Constants

### Prompt 2: Create Learning Module Constants File

```
Create a new file src/constants/learningStructure.ts with the complete Learning Module hierarchy:

export interface Subtopic {
  id: string;
  title: string;
  description: string;
}

export interface LearningTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  subtopics: Subtopic[];
}

export const LEARNING_MODULE_ID = '22222222-2222-2222-2222-222222222222';

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    id: '22222222-2222-0001-0000-000000000001',
    title: 'Numeracy',
    description: 'Essential numeracy skills for nursing practice',
    icon: 'calculate',
    subtopics: [] // Numeracy has direct lessons, no subtopics
  },
  {
    id: '22222222-2222-0002-0000-000000000002',
    title: 'The NMC Code',
    description: 'Professional standards of practice and behaviour',
    icon: 'book',
    subtopics: [
      { id: '1.1', title: 'Prioritise People', description: 'Putting patients at the center of care' },
      { id: '1.2', title: 'Practice Effectively', description: 'Maintaining competence and communication' },
      { id: '1.3', title: 'Preserve Safety', description: 'Protecting patients from harm' },
      { id: '1.4', title: 'Promote Professionalism', description: 'Upholding professional standards' }
    ]
  },
  {
    id: '22222222-2222-0003-0000-000000000003',
    title: 'Mental Capacity Act',
    description: 'Understanding mental capacity and decision-making',
    icon: 'psychology',
    subtopics: [
      { id: '2.1', title: 'Presumption of Capacity', description: 'Assuming capacity unless proven otherwise' },
      { id: '2.2', title: 'Assessing Capacity', description: 'How to assess decision-making ability' },
      { id: '2.3', title: 'Best Interests Decisions', description: 'Making decisions for those who lack capacity' },
      { id: '2.4', title: 'Advanced Care Planning', description: 'Respecting advance decisions' }
    ]
  },
  {
    id: '22222222-2222-0004-0000-000000000004',
    title: 'Safeguarding',
    description: 'Protecting vulnerable individuals from harm',
    icon: 'shield',
    subtopics: [
      { id: '3.1', title: 'Recognising Abuse', description: 'Identifying signs of harm' },
      { id: '3.2', title: 'Reporting Protocols', description: 'How to report safeguarding concerns' },
      { id: '3.3', title: 'Child Protection', description: 'Specific considerations for children' }
    ]
  },
  {
    id: '22222222-2222-0005-0000-000000000005',
    title: 'Consent & Confidentiality',
    description: 'Patient rights and information governance',
    icon: 'lock',
    subtopics: [
      { id: '4.1', title: 'Valid Consent', description: 'Requirements for informed consent' },
      { id: '4.2', title: 'GDPR & Confidentiality', description: 'Data protection and privacy' },
      { id: '4.3', title: 'Confidentiality vs. Safeguarding', description: 'When to break confidentiality' }
    ]
  },
  {
    id: '22222222-2222-0006-0000-000000000006',
    title: 'Equality & Diversity',
    description: 'Promoting equality in healthcare',
    icon: 'diversity',
    subtopics: [
      { id: '5.1', title: 'Equality Act 2010', description: 'Protected characteristics and legal duties' },
      { id: '5.2', title: 'Cultural Competence', description: 'Understanding diverse backgrounds' },
      { id: '5.3', title: 'Reasonable Adjustments', description: 'Supporting patients with disabilities' }
    ]
  },
  {
    id: '22222222-2222-0007-0000-000000000007',
    title: 'Duty of Candour',
    description: 'Being open and honest when things go wrong',
    icon: 'announcement',
    subtopics: [
      { id: '6.1', title: 'Transparency After Errors', description: 'How to communicate mistakes' },
      { id: '6.2', title: 'NHS Incident Reporting', description: 'Proper incident documentation' }
    ]
  },
  {
    id: '22222222-2222-0008-0000-000000000008',
    title: 'Cultural Adaptation',
    description: 'Working effectively in a multicultural healthcare environment',
    icon: 'public',
    subtopics: [
      { id: '7.1', title: 'Autonomy vs. Family Decisions', description: 'Balancing individual and family involvement' },
      { id: '7.2', title: 'UK Communication Styles', description: 'Adapting to British healthcare culture' }
    ]
  }
];

This creates the complete 7-topic, 25-subtopic Learning Module structure that matches the admin portal.
```

---

## Step 2: Update TypeScript Types

### Prompt 3: Update Lesson and Flashcard Types

```
Update src/types/content.ts to add the category field to Lesson and Flashcard interfaces:

// Add to Lesson interface:
export interface Lesson {
  id: string;
  topic_id: string;
  title: string;
  content: string;
  video_url?: string;
  audio_url?: string;
  duration?: number;
  lesson_type?: 'video' | 'audio' | 'text' | 'quiz';
  passing_score_percentage?: number;
  category?: string; // NEW: Subtopic identifier (e.g., "1.1 Prioritise People")
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Add to Flashcard interface:
export interface Flashcard {
  id: string;
  lesson_id?: string; // Made optional - flashcards can be lesson-level OR topic-level
  category?: string; // NEW: Topic identifier for topic-level flashcards (e.g., "The NMC Code")
  front: string;
  back: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

Important: Flashcards now support TWO modes:
1. Lesson-level: Set lesson_id, leave category empty (old approach)
2. Topic-level: Set category to topic title, leave lesson_id empty (new approach for Learning Module)
```

---

## Step 3: Update Supabase API Functions

### Prompt 4: Add Lessons API Functions

```
Update src/api/lessons.ts to add category-based lesson fetching:

// Add this new function to fetch lessons by subtopic:
export async function getLessonsBySubtopic(
  topicId: string,
  subtopicId: string
): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('topic_id', topicId)
    .eq('category', subtopicId)
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data || [];
}

// Add this function to fetch all lessons for a topic (without subtopic filter):
export async function getLessonsByTopic(topicId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('topic_id', topicId)
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data || [];
}

These functions enable filtering lessons by subtopic category for the new structure.
```

### Prompt 5: Update Flashcards API Functions

```
Update src/api/flashcards.ts to support both lesson-based and topic-based flashcards:

// NEW: Fetch flashcards by topic (for Learning Module topics)
export async function getFlashcardsByTopic(topicTitle: string): Promise<Flashcard[]> {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('category', topicTitle)
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data || [];
}

// KEEP: Existing lesson-based function (for backward compatibility)
export async function getFlashcardsByLesson(lessonId: string): Promise<Flashcard[]> {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data || [];
}

Now flashcards can be organized by topic (e.g., all flashcards for "The NMC Code") 
OR by specific lesson (traditional approach).
```

---

## Step 4: Create React Query Hooks

### Prompt 6: Create Learning Module Hooks

```
Create src/hooks/useLearningModule.ts with React Query hooks for the Learning Module:

import { useQuery } from '@tanstack/react-query';
import { getLessonsBySubtopic, getLessonsByTopic } from '../api/lessons';
import { getFlashcardsByTopic } from '../api/flashcards';

// Fetch lessons for a specific subtopic
export function useLessonsBySubtopic(topicId: string, subtopicId: string) {
  return useQuery({
    queryKey: ['lessons', 'subtopic', topicId, subtopicId],
    queryFn: () => getLessonsBySubtopic(topicId, subtopicId),
    enabled: !!topicId && !!subtopicId
  });
}

// Fetch all lessons for a topic (no subtopic filter)
export function useLessonsByTopic(topicId: string) {
  return useQuery({
    queryKey: ['lessons', 'topic', topicId],
    queryFn: () => getLessonsByTopic(topicId),
    enabled: !!topicId
  });
}

// Fetch topic-level flashcards for a Learning Module topic
export function useFlashcardsByTopic(topicTitle: string) {
  return useQuery({
    queryKey: ['flashcards', 'topic', topicTitle],
    queryFn: () => getFlashcardsByTopic(topicTitle),
    enabled: !!topicTitle
  });
}

These hooks fetch lessons and flashcards based on the new category-based structure.
```

---

## Step 5: Create Learning Module Screens

### Prompt 7: Create Learning Topics List Screen

```
Create src/screens/learning/LearningTopicsScreen.tsx to display all 8 topics:

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LEARNING_TOPICS } from '../../constants/learningStructure';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function LearningTopicsScreen() {
  const navigation = useNavigation();

  const renderTopicCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TopicDetail', { topic: item })}
    >
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={32} color="#007aff" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.subtopicCount}>
          {item.subtopics.length > 0 
            ? `${item.subtopics.length} subtopics` 
            : 'Direct lessons'}
        </Text>
      </View>
      <Icon name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Learning Module</Text>
      <Text style={styles.subtitle}>
        Master the 8 core topics for NMC CBT success
      </Text>
      <FlatList
        data={LEARNING_TOPICS}
        renderItem={renderTopicCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { fontSize: 28, fontWeight: 'bold', padding: 20, paddingBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', paddingHorizontal: 20, paddingBottom: 16 },
  list: { padding: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  textContainer: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  description: { fontSize: 14, color: '#666', marginBottom: 4 },
  subtopicCount: { fontSize: 12, color: '#007aff', fontWeight: '500' }
});

This displays the 8 Learning Module topics with proper icons and navigation.
```

### Prompt 8: Create Topic Detail Screen with Subtopics

```
Create src/screens/learning/TopicDetailScreen.tsx to show subtopics or direct lessons:

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useLessonsByTopic, useFlashcardsByTopic } from '../../hooks/useLearningModule';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function TopicDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { topic } = route.params;

  const { data: lessons, isLoading } = useLessonsByTopic(topic.id);
  const { data: flashcards } = useFlashcardsByTopic(topic.title);

  // If topic has subtopics, show subtopic list
  if (topic.subtopics && topic.subtopics.length > 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>{topic.title}</Text>
        <Text style={styles.description}>{topic.description}</Text>
        
        <FlatList
          data={topic.subtopics}
          renderItem={({ item: subtopic }) => (
            <TouchableOpacity
              style={styles.subtopicCard}
              onPress={() => navigation.navigate('SubtopicLessons', { 
                topic, 
                subtopic 
              })}
            >
              <View style={styles.subtopicNumber}>
                <Text style={styles.subtopicNumberText}>{subtopic.id}</Text>
              </View>
              <View style={styles.subtopicContent}>
                <Text style={styles.subtopicTitle}>{subtopic.title}</Text>
                <Text style={styles.subtopicDesc}>{subtopic.description}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
        
        {/* Topic-level flashcards */}
        {flashcards && flashcards.length > 0 && (
          <View style={styles.flashcardsSection}>
            <TouchableOpacity
              style={styles.flashcardsButton}
              onPress={() => navigation.navigate('Flashcards', { 
                topicTitle: topic.title,
                flashcards 
              })}
            >
              <Icon name="style" size={24} color="white" />
              <Text style={styles.flashcardsButtonText}>
                Study Flashcards ({flashcards.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // If no subtopics (like Numeracy), show lessons directly
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{topic.title}</Text>
      <Text style={styles.description}>{topic.description}</Text>
      
      <FlatList
        data={lessons}
        renderItem={({ item: lesson }) => (
          <TouchableOpacity
            style={styles.lessonCard}
            onPress={() => navigation.navigate('LessonContent', { lesson })}
          >
            <Icon 
              name={lesson.lesson_type === 'video' ? 'play-circle' : 
                    lesson.lesson_type === 'audio' ? 'headphones' : 'description'} 
              size={24} 
              color="#007aff" 
            />
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      
      {/* Topic-level flashcards for topics without subtopics */}
      {flashcards && flashcards.length > 0 && (
        <View style={styles.flashcardsSection}>
          <TouchableOpacity
            style={styles.flashcardsButton}
            onPress={() => navigation.navigate('Flashcards', { 
              topicTitle: topic.title,
              flashcards 
            })}
          >
            <Icon name="style" size={24} color="white" />
            <Text style={styles.flashcardsButtonText}>
              Study Flashcards ({flashcards.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', padding: 20, paddingBottom: 8 },
  description: { fontSize: 16, color: '#666', paddingHorizontal: 20, paddingBottom: 16 },
  list: { padding: 16 },
  subtopicCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  subtopicNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  subtopicNumberText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  subtopicContent: { flex: 1 },
  subtopicTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  subtopicDesc: { fontSize: 14, color: '#666' },
  lessonCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  lessonTitle: { flex: 1, fontSize: 16, fontWeight: '500' },
  flashcardsSection: { padding: 16 },
  flashcardsButton: {
    flexDirection: 'row',
    backgroundColor: '#007aff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  flashcardsButtonText: { color: 'white', fontSize: 16, fontWeight: '600' }
});

This handles both subtopic-based topics (NMC Code, etc.) and direct lesson topics (Numeracy).
It also displays topic-level flashcards created from the admin portal.
```

### Prompt 9: Create Subtopic Lessons Screen

```
Create src/screens/learning/SubtopicLessonsScreen.tsx to show lessons within a subtopic:

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useLessonsBySubtopic, useFlashcardsByTopic } from '../../hooks/useLearningModule';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function SubtopicLessonsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { topic, subtopic } = route.params;

  const { data: lessons, isLoading: lessonsLoading } = useLessonsBySubtopic(
    topic.id, 
    subtopic.id
  );
  
  const { data: flashcards } = useFlashcardsByTopic(topic.title);

  if (lessonsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.topicName}>{topic.title}</Text>
        <Text style={styles.subtopicTitle}>{subtopic.id} {subtopic.title}</Text>
        <Text style={styles.description}>{subtopic.description}</Text>
      </View>

      {/* Lessons Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lessons</Text>
        {lessons && lessons.length > 0 ? (
          <FlatList
            data={lessons}
            renderItem={({ item: lesson }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('LessonContent', { lesson })}
              >
                <Icon 
                  name={
                    lesson.lesson_type === 'video' ? 'play-circle' : 
                    lesson.lesson_type === 'audio' ? 'headphones' : 
                    lesson.lesson_type === 'quiz' ? 'quiz' : 'description'
                  } 
                  size={24} 
                  color="#007aff" 
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{lesson.title}</Text>
                  {lesson.duration && (
                    <Text style={styles.duration}>{lesson.duration} min</Text>
                  )}
                </View>
                <Icon name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>No lessons available yet</Text>
        )}
      </View>

      {/* Topic-level Flashcards Section */}
      {flashcards && flashcards.length > 0 && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.flashcardsButton}
            onPress={() => navigation.navigate('Flashcards', { 
              topicTitle: topic.title,
              flashcards 
            })}
          >
            <Icon name="style" size={24} color="white" />
            <Text style={styles.flashcardsButtonText}>
              Study Flashcards ({flashcards.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSection: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  topicName: { fontSize: 14, color: '#007aff', fontWeight: '600', marginBottom: 4 },
  subtopicTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, color: '#666' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  duration: { fontSize: 14, color: '#666' },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 16, padding: 20 },
  flashcardsButton: {
    flexDirection: 'row',
    backgroundColor: '#007aff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  flashcardsButtonText: { color: 'white', fontSize: 16, fontWeight: '600' }
});

This shows lessons for a specific subtopic and includes topic-level flashcards.
```

---

## Step 6: Update Navigation

### Prompt 10: Add Learning Module Routes

```
Update your navigation file (e.g., src/navigation/AppNavigator.tsx) to add the new Learning Module screens:

import LearningTopicsScreen from '../screens/learning/LearningTopicsScreen';
import TopicDetailScreen from '../screens/learning/TopicDetailScreen';
import SubtopicLessonsScreen from '../screens/learning/SubtopicLessonsScreen';
import LessonContentScreen from '../screens/learning/LessonContentScreen';
import FlashcardsScreen from '../screens/learning/FlashcardsScreen';

// Inside your Stack.Navigator:
<Stack.Screen 
  name="LearningTopics" 
  component={LearningTopicsScreen}
  options={{ title: 'Learning Module' }}
/>
<Stack.Screen 
  name="TopicDetail" 
  component={TopicDetailScreen}
  options={{ title: 'Topic' }}
/>
<Stack.Screen 
  name="SubtopicLessons" 
  component={SubtopicLessonsScreen}
  options={{ title: 'Lessons' }}
/>
<Stack.Screen 
  name="LessonContent" 
  component={LessonContentScreen}
  options={{ title: 'Lesson' }}
/>
<Stack.Screen 
  name="Flashcards" 
  component={FlashcardsScreen}
  options={{ title: 'Flashcards' }}
/>

This sets up the complete navigation flow for the Learning Module.
```

---

## Step 7: Create Lesson Content Screen (Video/Audio/Text)

### Prompt 11: Create Lesson Content Player

```
Create src/screens/learning/LessonContentScreen.tsx to display lesson content with quiz at the end:

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function LessonContentScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { lesson } = route.params;
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    // If lesson_type is 'quiz', navigate to quiz screen
    if (lesson.lesson_type === 'quiz') {
      navigation.navigate('LessonQuiz', { 
        lesson,
        passingScore: lesson.passing_score_percentage || 80
      });
    } else {
      // Mark lesson as complete
      setCompleted(true);
      Alert.alert('Success', 'Lesson completed!', [
        { text: 'Continue', onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{lesson.title}</Text>
        {lesson.category && (
          <Text style={styles.category}>{lesson.category}</Text>
        )}
      </View>

      {/* Video Player */}
      {lesson.lesson_type === 'video' && lesson.video_url && (
        <Video
          source={{ uri: lesson.video_url }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
        />
      )}

      {/* Audio Player */}
      {lesson.lesson_type === 'audio' && lesson.audio_url && (
        <View style={styles.audioPlayer}>
          <Icon name="headphones" size={48} color="#007aff" />
          <Text style={styles.audioText}>Audio Lesson</Text>
          {/* TODO: Implement audio player controls */}
        </View>
      )}

      {/* Text Content */}
      <View style={styles.contentSection}>
        <Text style={styles.content}>{lesson.content}</Text>
      </View>

      {/* Complete Button */}
      <TouchableOpacity 
        style={[styles.completeButton, completed && styles.completedButton]}
        onPress={handleComplete}
        disabled={completed}
      >
        <Icon 
          name={completed ? 'check-circle' : 'check'} 
          size={24} 
          color="white" 
        />
        <Text style={styles.completeButtonText}>
          {lesson.lesson_type === 'quiz' 
            ? 'Take Quiz (80% to pass)' 
            : completed ? 'Completed' : 'Mark as Complete'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: 'white', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  category: { fontSize: 14, color: '#007aff', fontWeight: '600' },
  video: { width: '100%', height: 250, backgroundColor: '#000' },
  audioPlayer: { backgroundColor: 'white', padding: 40, alignItems: 'center', margin: 16, borderRadius: 12 },
  audioText: { fontSize: 18, marginTop: 16, color: '#666' },
  contentSection: { backgroundColor: 'white', padding: 20, margin: 16, borderRadius: 12 },
  content: { fontSize: 16, lineHeight: 24, color: '#333' },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: '#007aff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  completedButton: { backgroundColor: '#4caf50' },
  completeButtonText: { color: 'white', fontSize: 18, fontWeight: '600' }
});

This displays video/audio/text lessons with completion tracking and quiz integration.
```

---

## Summary

These 11 prompts will:

1. ✅ Add database support for subtopics (category column in lessons)
2. ✅ Create constants for the 7 Learning Module topics with 25 subtopics
3. ✅ Update TypeScript types for category support
4. ✅ Add Supabase API functions for category-based fetching
5. ✅ Create React Query hooks
6. ✅ Build complete UI for Topics → Subtopics → Lessons hierarchy
7. ✅ Support video/audio/text/quiz lesson types
8. ✅ Enable **topic-level flashcards** (created from admin portal)
9. ✅ Include 80% quiz passing requirement structure

## Key Features

- **Topic-Level Flashcards**: Flashcards can now be associated with entire topics (e.g., "The NMC Code") instead of just individual lessons
- **Hierarchical Navigation**: Topics → Subtopics → Lessons flow
- **Dual Flashcard Modes**: Supports both lesson-level and topic-level flashcards
- **Category-Based Filtering**: Lessons organized by subtopic categories (e.g., "1.1 Prioritise People")

## Admin Portal Integration

The admin portal has been updated to support:
- Creating lessons with subtopic categories (dropdown shows all 25 subtopics)
- Creating flashcards for either specific lessons OR entire topics
- Filtering content by topic and subtopic
- Visual indicators showing which lessons/flashcards belong to which categories

**Next Steps After Implementation:**
- Test the complete flow: Topics → Subtopics → Lessons → Flashcards
- Implement the quiz screen with 80% passing logic
- Add progress tracking for completed lessons
- Test with real content from the admin portal
