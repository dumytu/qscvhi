# sose-digital-from-lajpat-nagar

## SOSE Lajpat Nagar - School Management System

A comprehensive school management system built with React, TypeScript, and Supabase.

### Features

#### Student Portal
- Dashboard with overview of homework, attendance, and notices
- Library management with book browsing and borrowing
- Homework submission and tracking
- Results and performance tracking
- Attendance monitoring
- Class group chat
- VoiceLink counselling system
- AI-powered doubt solver using GPT-4
- School notices and announcements

#### Admin Panel
- Complete student management (CRUD operations)
- Library management with book catalog
- Homework creation and submission tracking
- Results management with grade calculation
- Attendance tracking and reporting
- Notice creation and management
- VoiceLink counselling request management
- Messaging system
- AI query monitoring and teacher responses
- System settings and configuration

### Setup Instructions

1. **Database Setup**
   - Create a Supabase project
   - Run the migration file `supabase/migrations/create_complete_schema.sql`
   - Update `.env` with your Supabase credentials

2. **Environment Variables**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openrouter_api_key
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

### Login Credentials

#### Student Login
- Student ID: `20230254457`
- Date of Birth: `2010-01-01`

#### Admin Login
- Email: `admin@soselajpatnagar.edu`
- Password: Any password (demo mode)

### Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI GPT-4 via OpenRouter
- **Icons**: Lucide React
- **Build Tool**: Vite

### Database Schema

The system includes the following main tables:
- `students` - Student records and authentication
- `admins` - Admin users and authentication
- `classes` - Class information
- `books` - Library book catalog
- `borrow_requests` - Book borrowing system
- `homework` - Assignment management
- `submissions` - Student homework submissions
- `results` - Student exam results
- `attendance` - Daily attendance tracking
- `notices` - School announcements
- `voicelink_requests` - Counselling requests
- `messages` - Communication system
- `ai_queries` - AI doubt solver queries

### Key Features

1. **Real-time Data Synchronization**: All admin changes reflect immediately in student portal
2. **AI-Powered Doubt Solver**: Students can ask questions and get instant AI responses
3. **Comprehensive Attendance System**: Track attendance by subject and date
4. **Library Management**: Complete book catalog with borrowing system
5. **Homework Tracking**: Assignment creation, submission, and grading
6. **Results Management**: Grade tracking with automatic percentage calculation
7. **Communication System**: Class chat and messaging
8. **Counselling Support**: VoiceLink system for student support
9. **Notice Board**: School-wide announcements and notifications
10. **Role-based Access**: Separate interfaces for students and administrators

### API Integration

The system uses OpenRouter.ai for AI functionality with GPT-4 model integration for the doubt solver feature.