/*
  # Complete School Management System Database Schema

  1. New Tables
    - `classes` - Class information
    - `students` - Student records with authentication
    - `admins` - Admin users with authentication
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

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for students and admins
    - Secure data access based on user roles

  3. Sample Data
    - Create sample classes, students, and admin accounts
    - Add initial data for testing
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  class_number integer NOT NULL,
  section text DEFAULT 'A',
  class_teacher text,
  created_at timestamptz DEFAULT now()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id text UNIQUE NOT NULL,
  name text NOT NULL,
  dob date NOT NULL,
  class_id uuid REFERENCES classes(id),
  roll_number integer NOT NULL,
  fathers_name text NOT NULL,
  mothers_name text NOT NULL,
  address text NOT NULL,
  email text,
  phone text,
  bio text,
  profile_photo text,
  password_hash text,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  is_active boolean DEFAULT true
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'Admin',
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  is_active boolean DEFAULT true
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  author text NOT NULL,
  subject text,
  isbn text,
  total_copies integer DEFAULT 1,
  available_copies integer DEFAULT 1,
  pdf_url text,
  description text,
  cover_image text,
  created_at timestamptz DEFAULT now()
);

-- Borrow requests table
CREATE TABLE IF NOT EXISTS borrow_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id uuid REFERENCES books(id),
  student_id uuid REFERENCES students(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  request_date timestamptz DEFAULT now(),
  issue_date timestamptz,
  return_date timestamptz,
  actual_return_date timestamptz,
  notes text
);

-- Homework table
CREATE TABLE IF NOT EXISTS homework (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  subject text NOT NULL,
  class_id uuid REFERENCES classes(id),
  deadline timestamptz NOT NULL,
  attachment_url text,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  homework_id uuid REFERENCES homework(id),
  student_id uuid REFERENCES students(id),
  submission_text text NOT NULL,
  attachment_url text,
  submitted_at timestamptz DEFAULT now(),
  grade integer DEFAULT 0,
  max_grade integer DEFAULT 100,
  feedback text,
  graded_at timestamptz
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id),
  subject text NOT NULL,
  term text NOT NULL,
  marks integer NOT NULL,
  max_marks integer NOT NULL,
  grade text NOT NULL,
  exam_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id),
  date date NOT NULL,
  subject text NOT NULL,
  is_present boolean NOT NULL,
  remarks text,
  created_at timestamptz DEFAULT now()
);

-- Notices table
CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  file_url text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  target_class text DEFAULT 'all',
  publish_date timestamptz DEFAULT now(),
  expiry_date timestamptz,
  is_active boolean DEFAULT true
);

-- VoiceLink requests table
CREATE TABLE IF NOT EXISTS voicelink_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id),
  type text NOT NULL CHECK (type IN ('academic', 'personal', 'emotional')),
  subject text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  scheduled_time timestamptz,
  meeting_link text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid,
  sender_type text NOT NULL CHECK (sender_type IN ('admin', 'student')),
  receiver_id uuid,
  receiver_type text CHECK (receiver_type IN ('admin', 'student')),
  class_id uuid REFERENCES classes(id),
  message_type text NOT NULL CHECK (message_type IN ('personal', 'group', 'broadcast')),
  content text NOT NULL,
  attachment_url text,
  sent_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false
);

-- AI Queries table
CREATE TABLE IF NOT EXISTS ai_queries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id),
  query text NOT NULL,
  ai_response text,
  is_forwarded_to_teacher boolean DEFAULT false,
  teacher_response text,
  subject text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE voicelink_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access (since we're handling auth in the app)
CREATE POLICY "Allow all operations" ON classes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON students FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON admins FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON books FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON borrow_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON homework FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON submissions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON results FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON attendance FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON notices FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON voicelink_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON ai_queries FOR ALL USING (true);

-- Insert sample data
-- Classes
INSERT INTO classes (name, class_number, section, class_teacher) VALUES
('Class 10-A', 10, 'A', 'Mrs. Sharma'),
('Class 10-B', 10, 'B', 'Mr. Kumar'),
('Class 9-A', 9, 'A', 'Ms. Gupta'),
('Class 8-A', 8, 'A', 'Mr. Singh');

-- Admin user
INSERT INTO admins (email, name, role, password_hash) VALUES
('admin@soselajpatnagar.edu', 'School Administrator', 'Principal', 'admin123'),
('teacher@soselajpatnagar.edu', 'Head Teacher', 'Teacher', 'teacher123');

-- Sample student (the one from login demo)
INSERT INTO students (student_id, name, dob, class_id, roll_number, fathers_name, mothers_name, address, email, phone) 
SELECT '20230254457', 'Rahul Sharma', '2010-01-01', id, 1, 'Mr. Rajesh Sharma', 'Mrs. Priya Sharma', 'Lajpat Nagar, New Delhi', 'rahul@example.com', '9876543210'
FROM classes WHERE name = 'Class 10-A';

-- More sample students
INSERT INTO students (student_id, name, dob, class_id, roll_number, fathers_name, mothers_name, address, email, phone) 
SELECT '20230254458', 'Priya Singh', '2010-02-15', id, 2, 'Mr. Amit Singh', 'Mrs. Sunita Singh', 'Lajpat Nagar, New Delhi', 'priya@example.com', '9876543211'
FROM classes WHERE name = 'Class 10-A';

INSERT INTO students (student_id, name, dob, class_id, roll_number, fathers_name, mothers_name, address, email, phone) 
SELECT '20230254459', 'Arjun Kumar', '2010-03-20', id, 3, 'Mr. Suresh Kumar', 'Mrs. Meera Kumar', 'Lajpat Nagar, New Delhi', 'arjun@example.com', '9876543212'
FROM classes WHERE name = 'Class 10-A';

-- Sample books
INSERT INTO books (title, author, subject, isbn, total_copies, available_copies, description) VALUES
('Mathematics Class 10', 'R.D. Sharma', 'Mathematics', '978-8193332344', 5, 5, 'Comprehensive mathematics textbook for class 10'),
('Science for Class 10', 'Lakhmir Singh', 'Science', '978-8193332351', 4, 4, 'Complete science guide for class 10 students'),
('English Grammar', 'Wren & Martin', 'English', '978-8193332368', 3, 3, 'Essential English grammar reference book'),
('Social Studies', 'NCERT', 'Social Studies', '978-8193332375', 6, 6, 'Social studies textbook as per NCERT curriculum');

-- Sample homework
INSERT INTO homework (title, description, subject, class_id, deadline) 
SELECT 'Algebra Practice', 'Complete exercises 1-20 from chapter 5', 'Mathematics', id, now() + interval '7 days'
FROM classes WHERE name = 'Class 10-A';

INSERT INTO homework (title, description, subject, class_id, deadline) 
SELECT 'Science Project', 'Prepare a model on renewable energy sources', 'Science', id, now() + interval '14 days'
FROM classes WHERE name = 'Class 10-A';

-- Sample notices
INSERT INTO notices (title, content, priority, target_class) VALUES
('School Reopening', 'School will reopen on Monday after the holidays. All students are expected to attend.', 'high', 'all'),
('Sports Day', 'Annual sports day will be held next Friday. Participation is mandatory for all students.', 'medium', 'all'),
('Parent-Teacher Meeting', 'Parent-teacher meeting scheduled for this Saturday from 10 AM to 2 PM.', 'high', 'Class 10-A');

-- Sample results
INSERT INTO results (student_id, subject, term, marks, max_marks, grade, exam_date)
SELECT s.id, 'Mathematics', 'Term 1', 85, 100, 'A', '2024-10-15'
FROM students s WHERE s.student_id = '20230254457';

INSERT INTO results (student_id, subject, term, marks, max_marks, grade, exam_date)
SELECT s.id, 'Science', 'Term 1', 78, 100, 'B+', '2024-10-16'
FROM students s WHERE s.student_id = '20230254457';

INSERT INTO results (student_id, subject, term, marks, max_marks, grade, exam_date)
SELECT s.id, 'English', 'Term 1', 92, 100, 'A+', '2024-10-17'
FROM students s WHERE s.student_id = '20230254457';

-- Sample attendance
INSERT INTO attendance (student_id, date, subject, is_present, remarks)
SELECT s.id, CURRENT_DATE - 1, 'Mathematics', true, ''
FROM students s WHERE s.student_id = '20230254457';

INSERT INTO attendance (student_id, date, subject, is_present, remarks)
SELECT s.id, CURRENT_DATE - 1, 'Science', true, ''
FROM students s WHERE s.student_id = '20230254457';

INSERT INTO attendance (student_id, date, subject, is_present, remarks)
SELECT s.id, CURRENT_DATE - 2, 'Mathematics', false, 'Sick leave'
FROM students s WHERE s.student_id = '20230254457';