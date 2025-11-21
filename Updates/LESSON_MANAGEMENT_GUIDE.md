# Lesson Management Guide - Admin Portal

## How to Access Lesson Management

1. **Login to Admin Portal**
   - Navigate to the admin portal at `/content`
   - Login with your admin credentials (Superadmin or Editor role required)

2. **Navigate to Content Management**
   - From the sidebar, click on **"Content"** or navigate to `/content`

## Step-by-Step: Adding a Lesson

### 1. Select Learning Module
- On the Content Management page, you'll see 3 module cards:
  - Practice Module
  - **Learning Module** (green) ← Click this one
  - Mock Exams

### 2. Select a Topic
- After selecting Learning Module, a dropdown appears labeled **"Topic"**
- Choose one of the 7 topics:
  - Numeracy
  - The NMC Code
  - Mental Capacity Act
  - Safeguarding
  - Consent & Confidentiality
  - Equality & Diversity
  - Duty of Candour
  - Cultural Adaptation

### 3. Navigate to Lessons Tab
- Once a topic is selected, you'll see tabs:
  - Questions
  - Flashcards
  - **Lessons** ← Click this tab
  - Bulk Upload

### 4. Create a New Lesson
Click the **"Add Lesson"** button in the top right

## Lesson Form Fields

### Required Fields

#### **Subtopic** (for topics with subdivisions)
- Appears automatically when you're adding a lesson to topics like "The NMC Code"
- Select which subtopic this lesson belongs to:
  - Example: "1.1 Prioritise People", "1.2 Practice Effectively", etc.
- For **Numeracy**, this field won't appear (no subtopics)

#### **Title**
- Enter a descriptive title for your lesson
- Example: "Introduction to Patient Priority"

#### **Lesson Content**
- **Rich Text Editor** with full formatting toolbar:
  - **Bold** and *Italic* text
  - Bulleted and numbered lists
  - Blockquotes
  - Code formatting
  - **Add Links**: Click the link icon to insert hyperlinks
  - **Embed YouTube**: Click the YouTube icon to embed videos
  - Headings and paragraphs
  - Undo/Redo

### Optional Fields

#### **Video URL**
- Paste a YouTube URL or any video link
- Example: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- This appears separate from content and can be played in the mobile app

#### **Audio URL**
- Paste a direct link to an audio file (MP3, WAV)
- Example: `https://example.com/lesson-audio.mp3`
- Perfect for podcast-style lessons or audio explanations

#### **Lesson Type**
- Dropdown with 4 options:
  - **Text** (default) - Reading-based lesson
  - **Video** - Video-based lesson
  - **Audio** - Audio/podcast lesson
  - **Quiz** - Assessment lesson

#### **Passing Score %** (appears only when Quiz is selected)
- Set the minimum score required to pass (0-100%)
- Default: 80%
- Example: If you set 70%, students need 7/10 correct answers to pass

#### **Duration (minutes)**
- Estimated time to complete the lesson
- Example: 15 (for a 15-minute lesson)

#### **Display Order**
- Controls the order lessons appear in the app
- Lower numbers appear first
- Example: Use 1, 2, 3, etc.

#### **Active**
- Toggle switch to publish/unpublish
- **ON (green)** = Visible to students in mobile app
- **OFF (gray)** = Hidden, only visible to admins

## Example: Creating a Complete Lesson

### Scenario: Adding a lesson about "Prioritising People" in The NMC Code

1. **Module**: Learning Module (green card)
2. **Topic**: The NMC Code
3. **Tab**: Lessons
4. **Click**: Add Lesson

**Fill in the form:**
- **Subtopic**: 1.1 Prioritise People
- **Title**: "Understanding Patient-Centered Care"
- **Lesson Content** (using rich text editor):
  ```
  # Patient-Centered Care

  Patient-centered care is the foundation of nursing practice. It means:
  
  - Treating patients with dignity and respect
  - Listening to patient concerns
  - Involving patients in care decisions
  - **Respecting cultural differences**
  
  [Insert video using YouTube button in toolbar]
  ```

- **Video URL**: `https://www.youtube.com/watch?v=example123`
- **Audio URL**: (leave blank if not needed)
- **Lesson Type**: Video
- **Passing Score %**: (not applicable for video type)
- **Duration**: 20 minutes
- **Display Order**: 1
- **Active**: ✓ (turned ON)

5. **Click**: Create

## Managing Existing Lessons

### View Lessons
- All lessons for the selected topic appear in a table
- Columns show:
  - Title
  - Type (icon: video/audio/text/quiz)
  - Subtopic (if applicable)
  - Duration
  - Media (icons for video/audio if present)
  - Status (Active/Inactive)
  - Actions

### Edit a Lesson
1. Click the **pencil icon** (Edit) next to any lesson
2. Modify any fields
3. Click **Update**

### Delete a Lesson
1. Click the **trash icon** (Delete) next to any lesson
2. Confirm deletion in the popup

## Tips & Best Practices

### Content Creation
1. **Use the rich text editor** to format content nicely
   - Add headings for structure
   - Use lists for key points
   - Bold important concepts

2. **Combine media types** for better learning:
   - Add text content for reading
   - Include a video URL for visual learners
   - Add an audio URL for listening on-the-go

3. **Set appropriate lesson types**:
   - Video → When video is the primary medium
   - Audio → For podcast-style content
   - Text → For reading-focused lessons
   - Quiz → For assessments

4. **Organize with subtopics**:
   - Use subtopics to group related lessons
   - Example: All lessons about "Prioritise People" (1.1) together

5. **Set realistic durations**:
   - Helps students plan their study time
   - Consider video/audio length + reading time

### Display Order
- Lessons appear in the app in order from lowest to highest display_order
- **Example order**:
  - Lesson 1: display_order = 1
  - Lesson 2: display_order = 2
  - Lesson 3: display_order = 3
- Tip: Leave gaps (10, 20, 30) so you can insert lessons later

## Mobile App Dependencies

All dependencies needed for the mobile app to display lessons are documented in `MOBILE_APP_DEPENDENCIES.md`. Key packages include:

- **react-native-render-html** - To display rich text content from TipTap editor
- **expo-av** - For video and audio playback
- **react-native-reanimated** - For smooth animations

## Troubleshooting

### Issue: Subtopic dropdown not appearing
**Solution**: Make sure you've:
1. Selected "Learning Module"
2. Selected a topic from the dropdown
3. Clicked on the "Lessons" tab

### Issue: Can't save lesson
**Solution**: Check that you've filled:
- Title (required)
- Content (required)
Both must have some text

### Issue: Rich text editor toolbar not working
**Solution**: 
- Make sure you click inside the editor first
- Try refreshing the page
- Check browser console for errors

### Issue: Video/Audio not showing in mobile app
**Solution**:
- Verify the URL is publicly accessible
- Use direct links to media files (not download pages)
- For YouTube, use the standard watch URL format

## Database Fields Reference

When lessons are saved, these fields go to the database:

- `topic_id` - UUID of the parent topic
- `title` - Lesson title
- `content` - HTML content from rich text editor
- `video_url` - Optional video link
- `audio_url` - Optional audio link
- `lesson_type` - text, video, audio, or quiz
- `passing_score_percentage` - For quiz type (0-100)
- `category` - Subtopic identifier (e.g., "1.1", "3.2")
- `duration` - Minutes
- `is_active` - Boolean (true/false)
- `display_order` - Integer for sorting
