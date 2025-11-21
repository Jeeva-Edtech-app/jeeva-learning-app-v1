JeevaBot AI Chatbot - Simplified Specification
Version: 2.0 - ChatGPT-Style with Voice Input
Design Style: ChatGPT-inspired conversation interface with Jeeva theme

📦 REQUIRED PACKAGES
bash
npm install @react-native-voice/voice
npm install expo-speech
Permissions Needed:

Microphone access (iOS & Android)

Internet connection

1. FLOATING WIDGET - "Ask AI" Button
Design
Icon + Text: 🤖 "Ask AI"

Shape: Rounded pill button

Color: Blue (#3B82F6) with white text

Size: 22px icon, 15pt text

Shadow: Blue glow effect

Position
Bottom-right corner

20px from edges

Floats above content

Action
Tap → Opens full-screen chat

Passes current lesson context automatically

2. CHAT SCREEN LAYOUT
A. Header (Minimal)
text
←  JeevaBot                    [⋮]
Back button (left)

Title: "JeevaBot"

Menu button (right) - Clear chat, Settings

White background, thin border bottom

B. Empty State Welcome
text
        [🤖 Bot Icon]

    👋 Hi! I'm JeevaBot

Your AI study assistant for NMC 
CBT exam preparation. Ask anything!

┌─────────────────────────┐
│ 📚 Explain a concept    │
└─────────────────────────┘
┌─────────────────────────┐
│ 💡 Practice tips        │
└─────────────────────────┘
┌─────────────────────────┐
│ 🎯 Study strategy       │
└─────────────────────────┘
Elements:

Bot avatar (64px circle with gradient)

Greeting text (24pt bold)

Subtitle (16pt)

4 tappable suggestion cards (auto-fill input)

C. Conversation Area
User Message (Right)
text
                 ┌────────────────┐
                 │ What is NMC?   │
                 └────────────────┘
                          2:45 PM
Blue bubble (#3B82F6)

White text

Right aligned

Max 75% width

Timestamp below

AI Message (Left, ChatGPT-style)
text
[🤖] ┌────────────────────────────┐
     │ The NMC Code is a set of   │
     │ professional standards...   │
     └────────────────────────────┘
                         2:45 PM
Bot avatar (32px circle) on left

Gray bubble (#F5F5F5)

Dark text

Left aligned

Max 75% width

Timestamp below avatar

Typing Indicator
text
[🤖] ┌──────────┐
     │  ●  ●  ●  │
     └──────────┘
Three animated dots

Bouncing animation

D. Input Bar (ChatGPT-style with Voice)
text
┌───────────────────────────────────────┐
│  [🎤]  [Message JeevaBot...]    [↑]  │
└───────────────────────────────────────┘
Components:
1. Microphone Button (Left)

Gray circle when idle

Blue + pulsing when recording

40px size

Tap to start/stop recording

2. Text Input (Center)

Pill-shaped background

"Message JeevaBot..." placeholder

Auto-expands for multiline (max 120px)

Light gray background

Blue border when focused

3. Send Button (Right)

Blue circle with ↑ arrow

Only shows when text present

36px size

Replaces mic when typing

E. Voice Recording States
Idle State
Gray mic button visible

Text input normal

Recording State
Blue pulsing mic button

Recording banner appears: "🎤 Recording... Tap to stop"

Input shows "Listening..."

Blue background tint

Processing State
Mic shows spinner

"Converting..." message

Transcribed State
Mic hides

Text appears in input (editable)

Send button appears

F. Error Banner
text
┌─────────────────────────────────┐
│ ⚠️  Network error. Retrying  [×] │
└─────────────────────────────────┘
Appears above input bar

Light coral background

Auto-dismisses in 5 seconds

3. KEY FEATURES
✅ Context-Aware AI
Knows current lesson user is studying

Aware of recent practice scores

Identifies weak topics

Personalizes responses

✅ Voice Input
Tap mic to speak

Converts speech to text

User can edit before sending

Supports English (US/UK/India)

✅ Streaming Responses
AI response appears word-by-word

More engaging than waiting

Real-time feedback

✅ Quick Suggestions
Tappable cards in empty state

Context-based suggestions

Auto-fills input when tapped

✅ Rate Limiting
Free users: 10 messages/day

Paid users: 100 messages/day

Usage tracked daily

✅ Message History
Conversations saved automatically

Resume where you left off

Clear chat option

4. USER FLOWS
Flow 1: Text Question
Tap "Ask AI" widget → Chat opens

Type question → Tap send

AI responds with streaming text

Flow 2: Voice Question
Tap "Ask AI" widget → Chat opens

Tap microphone button

Speak: "What is the NMC Code?"

Tap mic again to stop

Text appears (editable)

Tap send → AI responds

Flow 3: Quick Suggestion
Open chat (empty state)

Tap suggestion card: "📚 Explain a concept"

Input auto-fills

Tap send → AI responds

5. DESIGN SPECS SUMMARY
Colors (Jeeva Theme)
Primary Blue: #3B82F6

Background: #FFFFFF

Gray Bubble: #F5F5F5

Text Dark: #1A1A1A

Text Light: #9E9E9E

Border: #EEEEEE

Typography
Messages: 15pt Regular

Timestamps: 11pt Regular

Headers: 18pt Semibold

Spacing
Messages: 8px vertical gap

Input padding: 12px

Screen padding: 16px

Animations
Button press: Scale to 0.96

Mic recording: Pulsing (800ms loop)

Message appear: Fade in (200ms)

Streaming text: Word-by-word reveal

6. TECHNICAL NOTES
Voice Feature
Uses device native speech recognition

Requires microphone permission

Works offline for basic recognition

Accuracy: ~85-95% for clear speech

AI Backend
Google Gemini 1.5 Flash API

Context built from user data

Response time: 2-5 seconds

Streaming enabled

Database
No schema changes needed

Uses existing chat tables

Voice transcriptions saved as text

7. COMPARISON: OLD vs NEW
Aspect	Before	After (ChatGPT-style)
Messages	Simple bubbles	Avatar + ChatGPT-style bubbles
Input	Text only	Text + Voice (mic button)
Empty State	Basic text	Suggestion cards
Header	Blue background	Minimal white header
AI Avatar	None	Bot icon with gradient
8. FUTURE ENHANCEMENTS
Voice output (AI reads responses)

Search conversation history

Export chat transcripts

Multi-language support

Custom voice commands