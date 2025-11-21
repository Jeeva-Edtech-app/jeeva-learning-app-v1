# 🎨 Jeeva Learning - UI Design Specifications

## 📋 Document Overview

This document provides comprehensive UI/UX design specifications for the Jeeva Learning mobile app, **extracted from the actual Figma design**. Use this as the single source of truth for all visual design implementations.

**Figma Design:** [Jeeva App Prototype](https://www.figma.com/proto/dOT7f0j582Wo6hdqNn4x8D/Jeeva-app)  
**Version:** 2.0 (Updated with actual Figma values)  
**Last Updated:** October 11, 2025  
**Platform:** iOS & Android (React Native/Expo)

**✅ Status:** All design values extracted from Figma screenshots and specifications

---

## 🎨 Design System Foundation

### Design Principles

**1. Clarity**
- Clean, minimal interfaces with focus on content
- Clear visual hierarchy
- Consistent spacing and alignment
- Readable typography at all sizes

**2. Efficiency**
- Quick access to key features
- Minimal steps to complete tasks
- Smart defaults and suggestions
- Progressive disclosure of complexity

**3. Delight**
- Smooth animations and transitions
- Micro-interactions for feedback
- Gamification elements (achievements, streaks)
- Celebratory moments for milestones

**4. Accessibility**
- High contrast for readability
- Touch targets minimum 44x44pt
- Screen reader support
- Font scaling support

---

## 🎨 Color Palette

### Primary Colors

**Primary Blue** (Jeeva Brand Color)
```
Primary/500 (Main):     #3B82F6
Primary/400 (Light):    #60A5FA
Primary/600 (Dark):     #2563EB
Primary/700 (Darker):   #1D4ED8
```

**Usage:**
- Primary CTAs (Sign in, Register, Continue buttons)
- Active navigation states
- Progress indicators
- App branding (logo, hero cards)
- Links ("sign in now", "forgot password")

---

### Module/Category Colors

**Green (Practice/Numeracy)**
```
Green/500:              #4ADE80
Green/400:              #6EE7B7
Green/100:              #D1FAE5
Green/50 (Background):  #ECFDF5
```

**Coral/Salmon (Retake/Clinical)**
```
Coral/500:              #FF8A80
Coral/400:              #FFAB91
Coral/100:              #FFCCBC
```

**Orange/Peach (Badges/Highlights)**
```
Orange/500:             #FFB74D
Orange/400:             #FFCC80
Orange/100:             #FFE0B2
```

**Blue Gradient (Hero Cards)**
```
Gradient Start:         #2F80ED
Gradient End:           #5B9FED
Angle:                  135deg
```

---

### Neutral Colors

**Grays**
```
Gray/900 (Text):        #1A1A1A
Gray/800:               #2D2D2D
Gray/700:               #404040
Gray/600:               #757575
Gray/500:               #9E9E9E
Gray/400:               #BDBDBD
Gray/300:               #E0E0E0
Gray/200:               #EEEEEE
Gray/100 (Background):  #F5F5F5
Gray/50:                #FAFAFA
```

**Usage:**
- Text Primary: Gray/900 (#1A1A1A)
- Text Secondary: Gray/500 (#9E9E9E)
- Borders: Gray/300 (#E0E0E0)
- Card Backgrounds: White (#FFFFFF)
- Page Background: Gray/100 (#F5F5F5)
- Disabled states: Gray/400

---

### Semantic Colors

**Success (Green)**
```
Success/500:            #4ADE80
Success/100:            #D1FAE5
```

**Error (Red/Coral)**
```
Error/500:              #FF8A80
Error/100:              #FFCCBC
```

**Warning (Orange)**
```
Warning/500:            #FFB74D
Warning/100:            #FFE0B2
```

**Info (Blue)**
```
Info/500:               #3B82F6
Info/100:               #DBEAFE
```

**Score Display:**
```
Correct (Blue):         #3B82F6
Incorrect (Red):        #FF8A80
Skipped (Gray):         #9E9E9E
```

**Usage:**
- Success: Correct answers (7), completions, achievements
- Error: Wrong answers (3), retake actions
- Warning: Discount badges, subscription alerts
- Info: Lesson count badges, interactive elements

---

### Gradient Colors

**Primary Gradient**
```
Linear Gradient:
  Start: #007AFF
  End:   #3395FF
  Angle: 135deg
```

**Usage:**
- Premium badges
- Achievement cards
- Special buttons
- Background overlays

---

## 📝 Typography

### Font Family

**Primary Font:** SF Pro Display / SF Pro Text (iOS) | Roboto (Android) | Inter (Web fallback)

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**System Fonts** (Recommended for native feel):
- iOS: -apple-system, SF Pro Display
- Android: Roboto
- Web: Inter, system-ui, sans-serif

---

### Text Styles (From Figma)

**Hero/Display Text** (Onboarding, Welcome)
```
Font Size: 28pt
Line Height: 1.2 (34pt)
Weight: Bold (700)
Color: #1A1A1A (Black)
Example: "welcome to Jeeva learning app"
```

**Page Titles**
```
Font Size: 24pt
Line Height: 1.3 (32pt)
Weight: Bold (700)
Color: #1A1A1A (Black)
Example: "Hi, welcome back", "Choose Your Practice Module"
```

**Section Headers**
```
Font Size: 20pt
Line Height: 1.4 (28pt)
Weight: Semibold (600)
Color: #1A1A1A (Black)
Example: "Topics", "Practice topics"
```

**Card Titles**
```
Font Size: 18pt
Line Height: 1.4 (25pt)
Weight: Semibold (600)
Color: #1A1A1A (Black)
Example: "NMC CBT", "The NMC Code", "Numeracy"
```

**Body Text / Descriptions**
```
Font Size: 16pt
Line Height: 1.5 (24pt)
Weight: Regular (400)
Color: #1A1A1A (Primary) or #9E9E9E (Secondary)
Example: "Exam preparatory course", "Patient dignity, consent, advocacy."
```

**Small Text / Captions**
```
Font Size: 14pt
Line Height: 1.5 (21pt)
Weight: Regular (400)
Color: #9E9E9E (Gray)
Example: "interactive learning", "mix password with uppercase..."
```

**Label Text (Buttons, Tabs)**
```
Font Size: 16pt
Line Height: 1.2 (19pt)
Weight: Medium (500)
Color: White (on buttons) or #3B82F6 (links)
Example: "Sign in", "Register", "Continue"
```

**Badge/Chip Text**
```
Font Size: 12pt
Line Height: 1.3 (16pt)
Weight: Medium (500)
Color: #3B82F6
Example: "Lessons: 4", "Get 5% off", "Topics: 4"
```

**Version/Small Labels**
```
Font Size: 11pt
Line Height: 1.4 (15pt)
Weight: Regular (400)
Color: #9E9E9E
Example: "Jeeva Learning app V: 1.01"
```

---

### Text Colors

**Light Mode:**
- Primary Text: Gray/900 (#1A1A1A)
- Secondary Text: Gray/600 (#525252)
- Tertiary Text: Gray/500 (#737373)
- Disabled Text: Gray/400 (#A3A3A3)

**Dark Mode:**
- Primary Text: Gray/50 (#FAFAFA)
- Secondary Text: Gray/300 (#D4D4D4)
- Tertiary Text: Gray/400 (#A3A3A3)
- Disabled Text: Gray/600 (#525252)

---

## 📏 Spacing & Layout

### Spacing Scale

**Base Unit:** 4pt

```
XXS:  4pt   (1 unit)
XS:   8pt   (2 units)
SM:   12pt  (3 units)
MD:   16pt  (4 units)
LG:   24pt  (6 units)
XL:   32pt  (8 units)
2XL:  40pt  (10 units)
3XL:  48pt  (12 units)
4XL:  64pt  (16 units)
```

**Usage Guide:**
- XS (8pt): Icon padding, badge padding
- SM (12pt): Button padding, chip padding
- MD (16pt): Card padding, screen padding
- LG (24pt): Section spacing, modal padding
- XL (32pt): Screen margins, header spacing
- 2XL (40pt): Large section dividers
- 3XL (48pt): Bottom navigation height
- 4XL (64pt): Empty state spacing

---

### Grid System

**Screen Margins:**
- Mobile: 16pt (MD)
- Tablet: 24pt (LG)

**Column Gap:**
- Default: 16pt (MD)

**Card Spacing:**
- Between Cards: 12pt (SM)
- Card Internal Padding: 16pt (MD)

---

### Border Radius

```
None:       0pt
Small:      4pt   (Chips, badges)
Medium:     8pt   (Buttons, inputs, cards)
Large:      12pt  (Modals, dialogs)
XLarge:     16pt  (Bottom sheets)
Round:      999pt (Avatar, icon buttons)
```

---

## 🎛️ Components

### Buttons (From Figma)

#### Primary Button (Main CTAs)
```
Background: #3B82F6 (Primary Blue)
Text: White (#FFFFFF)
Font: 16pt, Medium (500)
Height: 48-52px
Padding: 14px 24px
Border Radius: 8-12px
Shadow: 0px 2px 8px rgba(59, 130, 246, 0.25)

Examples: "Sign in", "Register", "Continue", "Check your understanding"

States:
- Hover: Background #2563EB (darker)
- Active: Background #1D4ED8
- Disabled: Background #BDBDBD, Text #757575
```

#### Secondary Button (Destructive/Alternative)
```
Background: #FF8A80 (Coral)
Text: White (#FFFFFF)
Font: 16pt, Medium (500)
Height: 48px
Padding: 14px 24px
Border Radius: 8px

Examples: "Retake"

States:
- Hover: Background #FF7961
- Active: Background #FF5252
```

#### Tertiary Button (Small Actions)
```
Background: #FFFFFF (White)
Border: 1px solid #E0E0E0
Text: #3B82F6 (Primary)
Font: 14pt, Medium (500)
Height: 36px
Padding: 8px 16px
Border Radius: 8px

Examples: "Edit profile", "view notes"
```

#### Text Link Button
```
Background: Transparent
Text: #3B82F6 (Primary Blue)
Font: 16pt, Medium (500)
Underline: None (hover: underline)

Examples: "sign in now", "forgot password", "Sign in"

States:
- Hover: Underline
- Active: Color #2563EB
```

#### Icon Button (Navigation)
```
Size: 40x40px
Background: Transparent
Icon Size: 20-24px
Icon Color: #1A1A1A

Examples: Back arrow, Close (X)

States:
- Active: Background #F5F5F5
```

---

### Input Fields (From Figma)

#### Text Input (Email, Password, Name)
```
Height: 48-52px
Padding: 14px 16px
Border: 1px solid #E0E0E0
Border Radius: 8px
Font: 16pt, Regular (400)
Placeholder Color: #BDBDBD
Text Color: #1A1A1A

Label Above Input:
- Font: 14pt, Regular (400)
- Color: #1A1A1A
- Spacing: 8px from input

Examples: "Email Address", "Password", "Full name"

States:
- Default: Border #E0E0E0
- Focus: Border #3B82F6, Shadow 0px 0px 0px 3px rgba(59, 130, 246, 0.1)
- Error: Border #FF8A80
- Disabled: Background #F5F5F5, Text #BDBDBD
```

#### Password Input (with Helper Text)
```
Same as Text Input with:
- Show/Hide toggle icon (eye icon, right aligned)
- Helper text below: "mix password with uppercase, lowercase, numbers and special characters"
- Helper text: 12pt, Regular, #9E9E9E
- Spacing: 4px from input
```

#### Form Container (Card)
```
Background: White (#FFFFFF)
Border: None
Border Radius: 16px
Padding: 24px 20px
Shadow: 0px 2px 12px rgba(0, 0, 0, 0.08)
Max Width: 90% screen width

Examples: Login card, Registration card
```

---

### Cards (From Figma)

#### Hero Card (Featured Content)
```
Background: Linear Gradient (#2F80ED → #5B9FED, 135deg)
Border Radius: 16px
Padding: 20px
Text Color: White (#FFFFFF)
Shadow: 0px 4px 16px rgba(47, 128, 237, 0.25)

Components:
- Title: 20pt, Bold (700), White, Uppercase
- Subtitle: 14pt, Regular (400), White, Opacity 0.9
- CTA Button: White background, Blue text, 36px height
- Image: Illustration, right aligned

Examples: "CRACK NMC", "PRACTICE MODE", "LEARNING MODE"

Dimensions:
- Width: ~90% screen width
- Height: Auto (~180-200px)
```

#### Course/Module Card (White)
```
Background: White (#FFFFFF)
Border: 1px solid #E0E0E0
Border Radius: 12px
Padding: 16px
Shadow: 0px 2px 8px rgba(0, 0, 0, 0.06)

Components:
- Image: Full width, 160px height, Border Radius 8px (top)
- Category label: 12pt, Medium, #3B82F6, "course"
- Title: 18pt, Semibold (600), #1A1A1A
- Description: 14pt, Regular, #9E9E9E
- Action Icon: 40px circle, #3B82F6 background, white arrow

Example: "NMC CBT" card
```

#### Topic/Lesson Card (List Item)
```
Background: White (#FFFFFF)
Border: 1px solid #E0E0E0
Border Radius: 12px
Padding: 16px
Margin Bottom: 12px

Components:
- Title: 16pt, Semibold (600), #1A1A1A
- Description: 14pt, Regular, #9E9E9E
- Badge: "Lessons: 4", 12pt, Medium, #3B82F6 background, white text
- Icons: Flag and bookmark icons (16px)
- Arrow: Right chevron, 20px, #9E9E9E

Example: "The NMC Code", "Mental Capacity Act"

States:
- Press: Scale 0.98, Shadow increase
```

#### Module Card (Colored Background)
```
Background: Module color (#ECFDF5 green, #FFF4E6 orange, etc.)
Border Radius: 12px
Padding: 20px
Height: 140px

Components:
- Icon: 48px circle, solid color (#4ADE80, #FFB74D)
- Title: 18pt, Semibold (600), #1A1A1A
- Description: 14pt, Regular, #757575
- Arrow: Right chevron, white circle, 32px

Examples: "Numeracy", "Clinical" practice modules
```

#### Score/Result Card
```
Background: White (#FFFFFF) or Light Blue (#EFF6FF)
Border Radius: 16px
Padding: 24px
Center aligned

Components:
- Trophy/Icon: 80px, light blue/gray
- Score Label: 16pt, Semibold, #1A1A1A, with icon
- Score Value: 32pt, Bold, #FF8A80 (red)
- Stats Row: Blue background, 12px radius
  - Correct: #FFFFFF text, "7"
  - Incorrect: #FFFFFF text, "3"
  - Skipped: #FFFFFF text, "1"

Example: Quiz result "7/11"
```

#### Subscription Plan Card
```
Background: White (#FFFFFF)
Border: 1px solid #E0E0E0
Border Radius: 12px
Padding: 16px

Components:
- Plan Name: 16pt, Semibold (600), #1A1A1A
- Badge: "Get 5% off", 12pt, Medium, #FFB74D background
- Price: 24pt, Bold (700), #3B82F6
- Currency: "Rs" (right aligned)

Example: "1 Month plan - 1500 Rs"
```

---

### Bottom Navigation (From Figma)

```
Height: 64px (+ safe area ~34px iOS)
Background: White (#FFFFFF)
Border Top: 1px solid #E0E0E0
Padding: 8px 0px

Tab Item:
- Icon: 24x24px
- Label: 11pt, Medium (500)
- Active Color: #3B82F6 (Primary Blue)
- Inactive Color: #9E9E9E (Gray)
- Spacing: 4px between icon and label

Tabs (From Figma):
1. Home - House icon
2. AI assistant - Chat bubble icon  
3. Courses - Play circle icon
4. Profile - Person icon

States:
- Active: Icon and text #3B82F6, slight scale (1.05)
- Inactive: Icon and text #9E9E9E
- Press: Background #F5F5F5, 40px circle
```

---

### Progress Indicators

#### Progress Bar
```
Height: 6pt
Background: Gray/200
Fill: Primary/500
Border Radius: 3pt (round)

Animated:
- Determinate: Width transition 0.3s ease
- Indeterminate: Moving gradient
```

#### Circular Progress
```
Size: 40x40pt
Stroke Width: 4pt
Track Color: Gray/200
Fill Color: Primary/500

With Percentage:
- Center Text: Body/Semibold (16pt/600)
```

#### Streak Counter
```
Icon: 🔥 Fire emoji or custom icon
Count: Heading 2 (24pt/600)
Label: Caption (12pt/500)
Background: Gradient (Warning/500 to Error/500)
Border Radius: 12pt
Padding: 12pt 16pt
```

---

### Badges & Chips (From Figma)

#### Info Badge (Lessons Count)
```
Background: #3B82F6 (Primary Blue)
Text: White (#FFFFFF)
Font: 12pt, Medium (500)
Height: 24px
Padding: 4px 8px
Border Radius: 6px

Example: "Lessons: 4"
```

#### Discount Badge (Subscription)
```
Background: #FFB74D (Orange)
Text: White (#FFFFFF)
Font: 11pt, Medium (500)
Height: 20px
Padding: 3px 8px
Border Radius: 4px

Example: "Get 5% off", "Get 15% off", "Get 25% off"
```

#### Category Label
```
Background: Transparent
Text: #3B82F6 (Primary Blue)
Font: 12pt, Medium (500)
Transform: Lowercase

Example: "course"
```

#### Topics Badge (with Icon)
```
Background: #DBEAFE (Light Blue)
Icon: Info circle, 14px, #3B82F6
Text: #3B82F6, 12pt, Medium (500)
Height: 24px
Padding: 4px 10px
Border Radius: 12px

Example: "Topics: 4"
```

---

### Social Login Buttons (From Figma)

#### Social Sign-in Container
```
Divider with Text:
- Line: 1px solid #E0E0E0
- Text: "or sign in with" / "or signup with"
- Font: 14pt, Regular, #9E9E9E
- Spacing: 24px from buttons (above and below)

Social Buttons (Side by Side):
- Width: 56px each
- Height: 56px
- Border Radius: 12px
- Border: 1px solid #E0E0E0
- Background: White (#FFFFFF)
- Icon Size: 24x24px
- Spacing: 16px between buttons

Buttons:
1. Google - Colorful G icon
2. Apple - Black Apple icon

States:
- Press: Background #F5F5F5, Scale 0.95
```

---

### Video/Audio Player (From Figma)

#### Video Player (Lesson Content)
```
Container:
- Width: Full width (minus 16px padding)
- Height: Auto (16:9 aspect ratio)
- Background: #000000 (Black)
- Border Radius: 8px

Controls:
- Play/Pause: Center, 56px circle, white icon
- Seek -10s: Left, 40px circle, white icon
- Seek +10s: Right, 40px circle, white icon
- Speed: Top right, "1.0X" text, 14pt
- Progress Bar: Bottom, Red (#FF5252) fill, 4px height
- Time: Bottom right, "0:00 / 1:45", 12pt, white

States:
- Paused: Show play button overlay
- Playing: Auto-hide controls after 3s
```

#### View Notes Button (Below Video)
```
Background: #F5F5F5 (Light Gray)
Border: None
Border Radius: 8px
Height: 44px
Width: Full width
Padding: 12px 16px

Text: "view notes", 14pt, Regular, #757575
Icon: Plus (+) icon, right aligned, 20px, #757575

States:
- Press: Background #EEEEEE
```

---

### Profile Components (From Figma)

#### Profile Header
```
Avatar:
- Size: 80px circle
- Border: 2px solid #E0E0E0
- Image or placeholder

User Info:
- Name: "Hi, User", 20pt, Bold (700), #1A1A1A
- Email: "demo@mailid.com", 14pt, Regular, #9E9E9E
- Spacing: 4px between name and email

Edit Button:
- Background: #3B82F6
- Text: "Edit profile", 14pt, Medium, White
- Height: 32px
- Padding: 8px 16px
- Border Radius: 6px
- Position: Below email, 12px spacing
```

#### Profile Menu List
```
Menu Item:
- Height: 56px
- Padding: 12px 16px
- Border Bottom: 1px solid #F5F5F5
- Background: White

Components:
- Icon: 20x20px, colored (specific per item)
  - Dashboard: #3B82F6 (Blue)
  - Courses: #4ADE80 (Green)
  - Subscription: #FFB74D (Orange)
  - Favourites: #FF8A80 (Coral/Pink)
  - Downloads: #3B82F6 (Blue)
  - Support: #1A1A1A (Black)
  - Logout: #3B82F6 (Blue)
- Text: 16pt, Regular, #1A1A1A
- Arrow: Right chevron, 20px, #9E9E9E, right aligned
- Spacing: 12px between icon and text

Sections:
1. Main actions (Dashboard, Courses, Subscription)
2. Divider line (#F5F5F5, 8px height)
3. Secondary actions (Favourites, Downloads)
4. Divider line
5. Support & Logout

Logout Item:
- Text color: #3B82F6 (Blue)
- Icon: Logout arrow, #3B82F6
```

---

### Modals & Dialogs (From Figma)

#### Subscription Modal (Full Screen Overlay)
```
Background: White (#FFFFFF)
Close Button: Top left, X icon, 24px, #1A1A1A

Header:
- Title: "Unlock Full Access & Ace Your Exam!", 24pt, Bold
  - "Unlock" in #3B82F6
  - Rest in #9E9E9E
- Features List: Star icons (⭐), 14pt, Regular, #1A1A1A
- Spacing: 16px between features

Content:
- Plan cards (stacked vertically)
- Continue button at bottom
- Padding: 24px all sides
```

---

### Lists

#### List Item
```
Height: 64pt (min)
Padding: 12pt 16pt
Border Bottom: 1pt solid Gray/200

Components:
- Leading Icon/Avatar: 40x40pt
- Title: Body (16pt/500)
- Subtitle: Body Small (14pt/400), Gray/600
- Trailing: Icon/Badge/Toggle

States:
- Hover: Background Gray/50
- Active: Background Gray/100
```

#### Section Header
```
Height: 40pt
Padding: 8pt 16pt
Background: Gray/50
Font: Overline (10pt/700), Gray/700
Letter Spacing: 1.5px
Transform: Uppercase
```

---

### Empty States

```
Padding: 48pt 24pt
Text Align: Center

Components:
- Illustration: 120x120pt, Centered
- Title: Heading 2 (24pt/600), Gray/900
- Message: Body (16pt/400), Gray/600
- Action Button: Primary Button
- Spacing: 24pt between elements
```

---

### Loading States

#### Skeleton Loader
```
Background: Gray/200
Shimmer: Linear gradient moving left to right
  - Start: rgba(255, 255, 255, 0)
  - Middle: rgba(255, 255, 255, 0.4)
  - End: rgba(255, 255, 255, 0)
Border Radius: Match component (4-12pt)
Animation: 1.5s infinite
```

#### Spinner
```
Size: 24x24pt (small), 40x40pt (medium), 64x64pt (large)
Color: Primary/500
Stroke Width: 3pt
Animation: Rotate 1s infinite linear
```

---

## 🎬 Animations & Transitions

### Duration & Easing

**Duration:**
```
Fast:     150ms   (Micro-interactions)
Normal:   250ms   (Default transitions)
Slow:     400ms   (Complex animations)
XSlow:    600ms   (Page transitions)
```

**Easing Functions:**
```
Ease Out:     cubic-bezier(0.0, 0.0, 0.2, 1)    // Decelerating
Ease In:      cubic-bezier(0.4, 0.0, 1, 1)      // Accelerating  
Ease In Out:  cubic-bezier(0.4, 0.0, 0.2, 1)    // Standard
Spring:       cubic-bezier(0.68, -0.55, 0.27, 1.55)  // Bouncy
```

---

### Common Animations

**1. Button Press**
```
Scale: 0.95
Duration: 150ms
Easing: Ease In Out
```

**2. Card Tap**
```
Scale: 0.98
Shadow: Reduce by 50%
Duration: 200ms
Easing: Ease Out
```

**3. Page Transition**
```
Slide In: translateX(100%)
Fade In: opacity 0 → 1
Duration: 300ms
Easing: Ease Out
```

**4. Modal/Bottom Sheet**
```
Slide Up: translateY(100%)
Backdrop Fade: opacity 0 → 0.5
Duration: 400ms
Easing: Ease Out
```

**5. Success Animation**
```
Scale: 0 → 1 → 1.1 → 1
Rotate: 0 → 360deg
Duration: 600ms
Easing: Spring
```

**6. Loading Skeleton**
```
Shimmer: translateX(-100%) → translateX(100%)
Duration: 1500ms
Easing: Linear
Infinite: true
```

---

### Micro-interactions

**1. Checkbox Check**
```
Scale: 0 → 1.2 → 1
Duration: 250ms
Easing: Spring
```

**2. Toggle Switch**
```
Slide: translateX(0) → translateX(24pt)
Background: Gray/300 → Primary/500
Duration: 200ms
Easing: Ease In Out
```

**3. Progress Fill**
```
Width: Current → Target
Duration: 300ms
Easing: Ease Out
```

**4. Achievement Unlock**
```
- Bounce in: Scale 0 → 1.2 → 0.9 → 1
- Confetti: Particle system
- Duration: 800ms
- Sound: Optional celebratory sound
```

---

## 📱 Screen Layouts (From Figma)

### Onboarding/Welcome Screen

**Layout:**
```
Full Screen:
- Logo: Top center, 64px, ~80px from top
- Title: "welcome to Jeeva learning app", 28pt, Bold
- Subtitle: "real practice, mock tests, and AI-powered learning."
  - 16pt, Regular, #757575, Center aligned
- Illustration: Large centered image (~280px height)
- CTA Button: "Get started", bottom 40px from safe area
- Link: "Already have account? Sign in", 14pt, below button

Spacing:
- Screen padding: 24px horizontal
- Elements stack vertically with auto spacing
- Background: White (#FFFFFF)
```

---

### Login/Register Screen

**Layout:**
```
Header:
- Logo + "JEEVA LEARNING APP" text, top center
- Title: "Hi, welcome back" / "Hello, Register to get started"
- Subtitle: "sign in now" (blue link) - 24pt from title
- Close button (X): Top left (register only)

Form Card:
- White card with 16px border radius
- 24px padding
- Input fields stack vertically, 16px gap
- Helper text: 4px below password input
- Primary button: 24px below last input
- Social divider: "or sign in with", 24px below button
- Social buttons: Centered, 16px gap
- Bottom link: "forgot password" / "Sign in", centered

Spacing:
- Screen padding: 16px horizontal
- Background: #F5F5F5 (light gray)
```

---

### Home/Dashboard Screen

**Layout:**
```
Header (Fixed):
- Logo: Top left, 32px height
- Avatar: Top right, 40px circle
- Greeting: "Hi, User", 20pt, 16px below header
- Subtitle: "Find your lessons today!", 14pt, #9E9E9E

Hero Card:
- 24px from subtitle
- "Upgrade your career" card with CTA
- Full width (minus 32px total padding)

Quick Actions (4 icons):
- Row of 4 icon buttons
- Labels: "courses", "packages", "features", "queries"
- Icon: 24px, colored backgrounds
- 16px below hero card

Promotional Card:
- "Welcome Offer on paid plans"
- Subscribe button
- 24px below quick actions

Footer:
- App version text: "Jeeva Learning app V: 1.01"
- Center aligned, 11pt, #9E9E9E

Bottom Navigation:
- Fixed bottom, 64px height
```

---

### Courses/Module List Screen

**Layout:**
```
Header:
- Back arrow: Top left
- Title: "Courses", 20pt, Semibold
- 16px padding horizontal

Hero Card:
- "CRACK NMC" blue gradient card
- Full width, 16px margin

Course Card:
- Course image (full width, 160px height)
- Content padding: 16px
- Category label + title + description
- Action button: Bottom right

Module Cards Grid:
- 2x2 grid layout
- 12px gap between cards
- Labels: "Start Free trial", "Practice Module", etc.

Spacing:
- Screen padding: 16px horizontal
- Card spacing: 12px vertical
```

---

### Practice/Topic List Screen

**Layout:**
```
Header:
- Back arrow: Top left
- Title: "Practice Numeracy", 20pt
- 16px padding

Lesson Card (Hero):
- White card, 16px margin
- Section label: "Lesson"
- Title: "Numeracy section", 20pt, Bold
- Badge: "Topics: 4" with blue background
- Description: 14pt, Regular

Section Header:
- "Practice topics", 16pt, Semibold
- 24px spacing from above

Topic List:
- Stacked cards, 12px gap
- Each card: Title, subtitle, arrow
- "interactive learning" label

Bottom Navigation:
- Fixed bottom
```

---

### Video Lesson Screen

**Layout:**
```
Header:
- Back arrow: Top left
- Title: "The NMC Code", 20pt
- 16px padding

Lesson Header:
- Lesson number: "1.1 Prioritise People", 24pt, Bold
- Section: "The NMC Code", 14pt, #9E9E9E

Content:
- Description text: 16pt, Regular, #757575
- 16px padding

Video Player:
- Full width (minus 32px total padding)
- 16:9 aspect ratio
- Controls overlay
- 16px margin vertical

View Notes Button:
- Full width, gray background
- 16px margin horizontal
- 44px height

CTA Button:
- "Check your understanding"
- Full width, 16px margin
- Fixed or scrollable bottom
```

---

### Result/Score Screen

**Layout:**
```
Header:
- Back arrow: Top left
- Title: "Result", 20pt
- 16px padding

Result Card:
- Top section: Light blue background
- Trophy icon: 80px, centered
- Stars decoration (decorative)

Score Overview:
- White card, 16px radius
- Trophy icon + "Score Overview" + "7/11"
- Horizontal layout

Stats Card:
- Blue background (#3B82F6)
- 3 columns: correct (7), incorrect (3), skipped (1)
- White text, 16pt numbers

Action Link:
- "Review Answers" with eye icon
- 16pt, Regular, #9E9E9E

Action Buttons:
- "Retake" (Coral) + "Next lesson" (Blue)
- Side by side, 12px gap
- 48px height each
- 24px from bottom (above nav)
```

---

### Profile Screen

**Layout:**
```
Header:
- Back arrow: Top left
- Title: "Profile", 20pt
- 16px padding

Profile Card:
- White background
- Avatar: 80px circle, centered top
- Name: "Hi, User", 20pt, Bold
- Email: "demo@mailid.com", 14pt, Gray
- Edit button: 32px height, blue

Menu List (Grouped):
Group 1:
- Dashboard, Courses, Subscription

Divider (8px gray bar)

Group 2:
- Favourites, Downloads

Divider (8px gray bar)

Group 3:
- Get support
- Logout (blue text)

Bottom Navigation:
- Fixed bottom
```

---

### Lesson Viewer

**Layout:**
```
Header (Sticky):
  - Back Button: Left
  - Progress: Center (3/10)
  - Bookmark: Right

Content Area:
  - Padding: 16pt
  - Rich Text/Video/Audio
  - Scrollable

Footer (Sticky Bottom):
  - Mark Complete Button
  - Next Lesson Button
  - Spacing: 12pt between
```

---

### Practice Session

**Layout:**
```
Header:
  - Question Number: "3 of 10"
  - Score: "Score: 75%"
  - Timer (optional)

Question Card:
  - Question Text
  - Image (if any)
  - Options (vertical list)

Footer:
  - Submit/Next Button
  - Explanation Panel (conditional)
```

---

### Profile

**Layout:**
```
Header:
  - Cover Image (optional)
  - Avatar: 80x80pt, Centered
  - Name: Heading 2
  - Role/Plan: Caption

Stats Row:
  - 3 columns: Lessons, Streak, Score
  - Centered

Menu List:
  - Edit Profile
  - Settings
  - Subscription
  - Help & Support
  - Sign Out
```

---

## 🌗 Dark Mode

### Color Adjustments

**Backgrounds:**
- Surface: #1A1A1A
- Card: #2D2D2D
- Modal: #404040

**Text:**
- Primary: #FAFAFA
- Secondary: #D4D4D4
- Tertiary: #A3A3A3

**Borders:**
- Gray/700 (#404040)

**Shadows:**
- Use highlights instead:
  - 0px 1px 0px rgba(255, 255, 255, 0.1)

**Primary Colors:**
- Slightly lighter for better contrast
- Primary/400 (#3395FF) instead of Primary/500

---

## 📐 Responsive Design

### Breakpoints

```
Mobile:     < 768pt
Tablet:     768pt - 1024pt
Desktop:    > 1024pt (web only)
```

### Adaptations

**Tablet (Landscape):**
- 2-column layout for content lists
- Side panel for details
- Larger touch targets (48pt min)

**Large Screens:**
- Max width: 1200pt
- Center content
- Increase side margins

---

## ♿ Accessibility

### Touch Targets
- Minimum: 44x44pt
- Recommended: 48x48pt
- Spacing: 8pt minimum between targets

### Color Contrast
- WCAG AA Standard: 4.5:1 (normal text)
- WCAG AA Standard: 3:1 (large text)
- All text meets minimum contrast

### Focus States
```
Outline: 3pt solid Primary/500
Outline Offset: 2pt
```

### Text Scaling
- Support Dynamic Type (iOS)
- Support Font Scaling (Android)
- Maximum scale: 200%
- Minimum scale: 100%

---

## 🎯 Interactive States

### Hover (Tablets/Web)
- Background opacity: +10%
- Shadow elevation: +2pt
- Transition: 150ms ease out

### Active/Pressed
- Scale: 0.95-0.98
- Background opacity: +20%
- Transition: 100ms ease in

### Focus (Keyboard)
- Outline: 3pt Primary/500
- Outline offset: 2pt
- Background: +5% opacity

### Disabled
- Opacity: 0.4
- Cursor: not-allowed (web)
- Remove all interactions

---

## 🖼️ Iconography

### Icon Set
**Library:** Material Icons / SF Symbols / Custom

**Sizes:**
- Small: 16x16pt
- Medium: 20x20pt (default)
- Large: 24x24pt
- XLarge: 32x32pt

**Stroke Width:** 1.5pt (outline icons)

**Common Icons:**
- Home: house
- Learn: book
- Practice: pencil
- Profile: person
- Search: magnifyingglass
- Bookmark: bookmark
- Complete: checkmark.circle
- Lock: lock
- Settings: gear

---

## 📸 Imagery

### Aspect Ratios
- Module Thumbnail: 16:9
- Lesson Cover: 3:2
- Avatar: 1:1 (square)
- Banner: 21:9

### Image Specs
- Format: WebP (fallback: JPEG/PNG)
- Quality: 85%
- Max Width: 1200pt
- Compression: Enabled

---

## 🎨 Illustration Style

### Guidelines
- Flat design, minimal gradients
- Primary color palette
- Rounded, friendly shapes
- Simple, clean lines
- Consistent perspective
- Purposeful use of white space

### Usage
- Empty states
- Onboarding screens
- Error pages
- Achievement badges
- Feature highlights

---

## 📋 Design Checklist

### Before Development
- [ ] All screens designed in Figma
- [ ] Components documented
- [ ] Spacing verified (4pt grid)
- [ ] Colors use design tokens
- [ ] Typography follows scale
- [ ] Dark mode variants created
- [ ] Responsive layouts defined
- [ ] Animations specified
- [ ] Accessibility checked

### During Development
- [ ] Match Figma designs pixel-perfect
- [ ] Use design system components
- [ ] Implement animations
- [ ] Test dark mode
- [ ] Test on multiple devices
- [ ] Verify touch targets
- [ ] Test with screen readers
- [ ] Check color contrast

---

## 🔗 Design Resources

### Figma File
- **Main Design:** [Jeeva App Prototype](https://www.figma.com/proto/dOT7f0j582Wo6hdqNn4x8D/Jeeva-app)
- **Component Library:** [Export from Figma]
- **Icon Library:** Material Icons / SF Symbols

### Assets Export
- Export 1x, 2x, 3x for mobile
- SVG for icons
- WebP for images
- Use asset naming convention: `[component]_[variant]_[state]@[scale]`

### Design Tokens (JSON) - From Figma

```json
{
  "colors": {
    "primary": {
      "500": "#3B82F6",
      "400": "#60A5FA",
      "600": "#2563EB"
    },
    "green": {
      "500": "#4ADE80",
      "100": "#D1FAE5",
      "50": "#ECFDF5"
    },
    "coral": {
      "500": "#FF8A80",
      "100": "#FFCCBC"
    },
    "orange": {
      "500": "#FFB74D",
      "100": "#FFE0B2"
    },
    "gray": {
      "900": "#1A1A1A",
      "500": "#9E9E9E",
      "300": "#E0E0E0",
      "100": "#F5F5F5"
    }
  },
  "spacing": {
    "xs": 8,
    "sm": 12,
    "md": 16,
    "lg": 24,
    "xl": 32
  },
  "typography": {
    "hero": {
      "fontSize": 28,
      "fontWeight": "700",
      "lineHeight": 34
    },
    "pageTitle": {
      "fontSize": 24,
      "fontWeight": "700",
      "lineHeight": 32
    },
    "cardTitle": {
      "fontSize": 18,
      "fontWeight": "600",
      "lineHeight": 25
    },
    "body": {
      "fontSize": 16,
      "fontWeight": "400",
      "lineHeight": 24
    },
    "small": {
      "fontSize": 14,
      "fontWeight": "400",
      "lineHeight": 21
    },
    "badge": {
      "fontSize": 12,
      "fontWeight": "500",
      "lineHeight": 16
    }
  },
  "borderRadius": {
    "small": 6,
    "medium": 8,
    "large": 12,
    "xlarge": 16,
    "round": 999
  },
  "button": {
    "primary": {
      "height": 48,
      "borderRadius": 8,
      "paddingHorizontal": 24,
      "paddingVertical": 14,
      "backgroundColor": "#3B82F6",
      "textColor": "#FFFFFF"
    },
    "secondary": {
      "height": 48,
      "borderRadius": 8,
      "paddingHorizontal": 24,
      "paddingVertical": 14,
      "backgroundColor": "#FF8A80",
      "textColor": "#FFFFFF"
    }
  },
  "input": {
    "height": 48,
    "borderRadius": 8,
    "paddingHorizontal": 16,
    "paddingVertical": 14,
    "borderColor": "#E0E0E0",
    "borderWidth": 1
  }
}
```

---

## 🎨 Implementation Notes

### React Native / Expo

**1. Use StyleSheet:**
```typescript
const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.primary[500],
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 24,
  }
})
```

**2. Theme Provider:**
```typescript
const theme = {
  colors,
  spacing,
  typography,
  borderRadius
}

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

**3. Responsive Units:**
```typescript
import { Dimensions, PixelRatio } from 'react-native'

const { width, height } = Dimensions.get('window')
const scale = width / 375 // Base on iPhone X width

const normalize = (size: number) => {
  return Math.round(PixelRatio.roundToNearestPixel(size * scale))
}
```

---

## 🔗 Related Documentation

- [Mobile App Overview](./MOBILE_APP_OVERVIEW.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Authentication Flow](./AUTHENTICATION_FLOW.md)
- [Feature Specifications](./FEATURE_SPECIFICATIONS.md)

---

## 📝 Implementation Checklist

**For Developers:**

Before implementing each screen:
- [ ] Review the specific screen layout section
- [ ] Use the design tokens JSON for consistent styling
- [ ] Match exact colors, spacing, and typography
- [ ] Implement all interactive states (hover, active, disabled)
- [ ] Test on both iOS and Android
- [ ] Verify touch targets (minimum 44x44px)
- [ ] Test with dynamic text scaling
- [ ] Ensure accessibility compliance

**Key Implementation Points:**
1. **Colors:** Use the exact hex values from the color palette section
2. **Typography:** Match font sizes, weights, and line heights exactly
3. **Spacing:** Follow the 4px/8px/12px/16px/24px spacing scale
4. **Components:** Reference component specs for exact dimensions
5. **Animations:** Use the specified durations and easing functions

---

## 🎨 Design System Summary

**Colors:**
- Primary Blue: #3B82F6 (buttons, links, active states)
- Green: #4ADE80 (practice modules, success)
- Coral: #FF8A80 (destructive actions, errors)
- Orange: #FFB74D (badges, highlights)

**Typography:**
- Font: SF Pro (iOS) / Roboto (Android)
- Sizes: 11pt → 28pt
- Weights: Regular (400), Medium (500), Semibold (600), Bold (700)

**Spacing:**
- Base: 4px grid system
- Common: 8px, 12px, 16px, 24px, 32px

**Border Radius:**
- Small: 6-8px
- Medium: 12px
- Large: 16px

---

**Version:** 2.0 (✅ Updated with actual Figma values)  
**Last Updated:** October 11, 2025  
**Figma Source:** Analyzed from design screenshots  
**Design by:** Jeeva EdTech Design Team  
**Developer:** vollstek@gmail.com

---

**✅ Documentation Status:** Complete and ready for implementation!
