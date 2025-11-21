# 🎓 Jeeva Admin Portal

A comprehensive admin portal for managing the Jeeva Learning ecosystem. Built with React, TypeScript, and Material-UI, this portal provides administrators with powerful tools to manage users, educational content, subscriptions, and analytics.

## 📋 Overview

The Jeeva Admin Portal is a full-featured web application designed to manage all aspects of the Jeeva Learning platform. It supports role-based access control, content management (modules, topics, lessons, questions, flashcards), user management, subscription handling, and detailed analytics - all in a modern, intuitive interface.

## ✨ Key Features

### 🔐 Authentication & Authorization
- Secure login with Supabase authentication
- Role-based access control (Superadmin, Editor, Moderator)
- Protected routes with permission validation
- Admin user management

### 📚 Content Management
- **Hierarchical Content Structure**: Modules → Topics → Lessons → Questions/Flashcards
- **CRUD Operations**: Create, read, update, and delete all content types
- **CSV Bulk Upload**: Mass import lessons, questions, and flashcards with validation
- **Media Support**: Image and audio upload for lessons (podcast-style content)
- **Content Approvals**: Workflow system for reviewing and approving content

### 👥 User Management
- User profile management
- User activity tracking
- Search and pagination
- Status management (active/inactive)
- Admin user role assignment

### 💳 Subscription Management
- Subscription plans CRUD
- User subscription tracking
- Payment analytics
- Status monitoring and alerts
- Expiring subscription reminders

### 📊 Analytics & Dashboard
- Real-time metrics and KPIs
- Data visualizations with charts
- Date-range filtering
- Top content performance
- CSV export functionality
- System status monitoring

### 📧 Email System
- Resend integration for transactional emails
- Welcome emails with confirmation links
- Subscription confirmations
- Payment receipts
- Subscription expiring reminders (7/3/1 day)
- Email testing interface

### ⚙️ Settings & Configuration
- Platform settings management
- Email template configuration
- Security settings
- Notification preferences

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **UI Library**: Material-UI (MUI) v7
- **Routing**: React Router DOM v7
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query v5
- **Styling**: Emotion (CSS-in-JS)
- **Notifications**: Notistack
- **Charts**: Recharts
- **Utilities**: date-fns, clsx

### Backend
- **BaaS**: Supabase (PostgreSQL, Auth, Storage)
- **Email API**: Express.js server with Resend
- **Authentication**: Supabase Auth with RLS policies

### Development Tools
- **Language**: TypeScript
- **Testing**: Vitest, React Testing Library
- **Code Quality**: ESLint, TypeScript strict mode

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Resend API key (for email functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jeeva-Edtech-app/jeeva-admin-portal.git
   cd jeeva-admin-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Set up Supabase database**
   - Run the migration files in `database/migrations/` in your Supabase SQL editor
   - Follow instructions in `database/migrations/SETUP_INSTRUCTIONS.md`

5. **Run the development servers**
   ```bash
   npm run dev
   ```
   
   This starts:
   - Vite dev server on port 5000 (frontend)
   - Express API server on port 3001 (email service)

6. **Access the application**
   - Open your browser to `http://localhost:5000`
   - Login with your admin credentials

## 📦 Available Scripts

```bash
npm run dev          # Start both Vite and Express servers concurrently
npm run dev:vite     # Start only Vite dev server (port 5000)
npm run dev:server   # Start only Express API server (port 3001)
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests with Vitest
npm run test:ui      # Run tests with UI
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
jeeva-admin-portal/
├── src/
│   ├── api/              # API clients (Supabase, Email)
│   ├── components/       # React components
│   │   ├── auth/         # Authentication components
│   │   ├── common/       # Shared components
│   │   ├── content/      # Content management components
│   │   └── layout/       # Layout components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   │   ├── content/      # Content pages
│   │   └── EmailTestPage.tsx
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── server/               # Express API server
│   ├── routes/           # API routes
│   └── index.ts          # Server entry point
├── database/
│   └── migrations/       # Database migration files
├── public/               # Static assets
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `RESEND_API_KEY` | Your Resend API key for emails | Yes |

## 🎨 Features in Detail

### Content Management System
- **Modules**: Top-level course modules with descriptions and icons
- **Topics**: Organized topics within modules
- **Lessons**: Rich content lessons with text, audio, and media
- **Questions**: Multiple choice questions with options and explanations
- **Flashcards**: Study flashcards with front/back content

### Email Integration
- Backend API server securely handles email sending
- Vite proxy configuration for seamless frontend-backend communication
- Template-based email system stored in Supabase
- Test interface at `/email-test` (Superadmin only)

### Role-Based Access
- **Superadmin**: Full system access
- **Editor**: Content and user management
- **Moderator**: Content approval and review

## 🔒 Security

- Row Level Security (RLS) policies in Supabase
- Protected API routes with authentication
- Secure secret management (never committed to repo)
- Role-based access control throughout the app

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

## 📝 Documentation

- Full documentation available in `documentation.md`
- Database setup guide in `database/migrations/SETUP_INSTRUCTIONS.md`
- Audio setup guide in `database/migrations/AUDIO_SETUP_INSTRUCTIONS.md`

## 🚢 Deployment


## 👨‍💻 Developer

**Developed by:** Jeeva EdTech Team  
**Contact:** vollstek@gmail.com  
**GitHub:** [Jeeva-Edtech-app](https://github.com/Jeeva-Edtech-app)

## 📄 License

This project is proprietary software developed for Jeeva Learning.

---
