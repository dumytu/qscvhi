/*
  # Add Sample Data for SOSE Lajpat Nagar School Platform

  1. Sample Data
    - Add sample students with the specified login credentials
    - Add sample books for library
    - Add sample homework assignments
    - Add sample notices
    - Add sample results and attendance data
    - Add sample admin user

  2. Security
    - All tables already have RLS enabled
    - Sample data follows the existing schema
*/

-- Insert sample admin
INSERT INTO admins (email, password_hash, name, role) VALUES
('admin@soselajpatnagar.edu', 'admin123', 'School Administrator', 'admin');

-- Insert sample classes
INSERT INTO classes (name, class_number, section, class_teacher) VALUES
('10th A', 10, 'A', 'Preeti Vineet Ma''am'),
('10th B', 10, 'B', 'Rajesh Kumar Sir'),
('9th A', 9, 'A', 'Sunita Sharma Ma''am'),
('11th A', 11, 'A', 'Dr. Amit Verma'),
('12th A', 12, 'A', 'Priya Singh Ma''am');

-- Insert sample student (Aftab Alam)
INSERT INTO students (
  student_id, 
  name, 
  dob, 
  class_id, 
  roll_number, 
  fathers_name, 
  mothers_name, 
  address, 
  email, 
  phone, 
  bio
) VALUES (
  '20230254457',
  'Aftab Alam',
  '2010-01-01',
  (SELECT id FROM classes WHERE name = '10th A' LIMIT 1),
  22,
  'Jamshed Alam',
  'Kalima Khatun',
  'New Delhi',
  'aftab.alam@student.soselajpatnagar.edu',
  '+91-9876543210',
  'I am a dedicated student who loves mathematics and science. I enjoy reading books and playing cricket in my free time.'
);

-- Insert more sample students
INSERT INTO students (
  student_id, 
  name, 
  dob, 
  class_id, 
  roll_number, 
  fathers_name, 
  mothers_name, 
  address, 
  email, 
  phone, 
  bio
) VALUES 
(
  '20230254458',
  'Priya Sharma',
  '2009-05-15',
  (SELECT id FROM classes WHERE name = '10th A' LIMIT 1),
  23,
  'Rajesh Sharma',
  'Sunita Sharma',
  'Lajpat Nagar, New Delhi',
  'priya.sharma@student.soselajpatnagar.edu',
  '+91-9876543211',
  'I love literature and creative writing. My goal is to become a journalist.'
),
(
  '20230254459',
  'Rahul Kumar',
  '2009-08-22',
  (SELECT id FROM classes WHERE name = '10th A' LIMIT 1),
  24,
  'Suresh Kumar',
  'Meera Devi',
  'South Delhi',
  'rahul.kumar@student.soselajpatnagar.edu',
  '+91-9876543212',
  'I am passionate about computer science and want to become a software engineer.'
),
(
  '20230254460',
  'Anita Singh',
  '2009-12-10',
  (SELECT id FROM classes WHERE name = '10th B' LIMIT 1),
  15,
  'Vikram Singh',
  'Kavita Singh',
  'Central Delhi',
  'anita.singh@student.soselajpatnagar.edu',
  '+91-9876543213',
  'I enjoy painting and music. Art is my passion and I want to pursue fine arts.'
);

-- Insert sample books
INSERT INTO books (title, author, subject, isbn, total_copies, available_copies, description, cover_image) VALUES
('Mathematics Class 10', 'R.D. Sharma', 'Mathematics', '978-8193332456', 50, 45, 'Comprehensive mathematics textbook for class 10 students covering all CBSE syllabus topics.', ''),
('Science for Class 10', 'Lakhmir Singh', 'Science', '978-8193332457', 40, 38, 'Complete science textbook covering Physics, Chemistry, and Biology for class 10.', ''),
('English Literature', 'William Shakespeare', 'English', '978-8193332458', 30, 28, 'Collection of classic English literature including plays and poems.', ''),
('Social Studies Class 10', 'Arjun Dev', 'Social Studies', '978-8193332459', 35, 33, 'Comprehensive guide to Indian history, geography, and civics.', ''),
('Computer Science Fundamentals', 'Sumita Arora', 'Computer Science', '978-8193332460', 25, 23, 'Introduction to programming and computer science concepts.', ''),
('Hindi Vyakaran', 'Kamta Prasad Guru', 'Hindi', '978-8193332461', 30, 29, 'Complete Hindi grammar and literature guide.', ''),
('Advanced Mathematics', 'S.L. Loney', 'Mathematics', '978-8193332462', 20, 18, 'Advanced mathematical concepts for higher secondary students.', ''),
('Physics Concepts', 'H.C. Verma', 'Physics', '978-8193332463', 25, 22, 'Conceptual physics with practical examples and experiments.', ''),
('Chemistry Practical', 'O.P. Tandon', 'Chemistry', '978-8193332464', 20, 19, 'Laboratory manual for chemistry experiments and practicals.', ''),
('World History', 'Arjun Dev', 'History', '978-8193332465', 15, 14, 'Comprehensive world history from ancient to modern times.', '');

-- Insert sample homework
INSERT INTO homework (
  title, 
  description, 
  subject, 
  class_id, 
  deadline, 
  created_by
) VALUES
(
  'Quadratic Equations Practice',
  'Solve the given quadratic equations using different methods: factorization, completing the square, and quadratic formula. Submit solutions with step-by-step working.',
  'Mathematics',
  (SELECT id FROM classes WHERE name = '10th A' LIMIT 1),
  '2024-12-15 23:59:59',
  (SELECT id FROM admins LIMIT 1)
),
(
  'Photosynthesis Lab Report',
  'Write a detailed lab report on the photosynthesis experiment conducted in class. Include observations, results, and conclusions.',
  'Science',
  (SELECT id FROM classes WHERE name = '10th A' LIMIT 1),
  '2024-12-20 23:59:59',
  (SELECT id FROM admins LIMIT 1)
),
(
  'Essay on Climate Change',
  'Write a 500-word essay on the impact of climate change on our environment. Include causes, effects, and possible solutions.',
  'English',
  (SELECT id FROM classes WHERE name = '10th A' LIMIT 1),
  '2024-12-18 23:59:59',
  (SELECT id FROM admins LIMIT 1)
),
(
  'Indian Freedom Movement',
  'Prepare a presentation on any one leader from the Indian Freedom Movement. Include their contribution and impact on independence.',
  'Social Studies',
  (SELECT id FROM classes WHERE name = '10th A' LIMIT 1),
  '2024-12-25 23:59:59',
  (SELECT id FROM admins LIMIT 1)
);

-- Insert sample notices
INSERT INTO notices (
  title, 
  content, 
  priority, 
  target_class, 
  publish_date, 
  expiry_date, 
  created_by
) VALUES
(
  'Annual Sports Day 2024',
  'Dear Students and Parents,

We are excited to announce our Annual Sports Day 2024 scheduled for December 20th, 2024. All students are required to participate in at least one sporting event.

Events include:
- Track and Field
- Basketball
- Football
- Cricket
- Badminton
- Table Tennis

Registration forms are available at the sports department. Last date for registration is December 15th, 2024.

For any queries, please contact the sports coordinator.

Best regards,
School Administration',
  'high',
  'all',
  '2024-11-01 09:00:00',
  '2024-12-20 18:00:00',
  (SELECT id FROM admins LIMIT 1)
),
(
  'Parent-Teacher Meeting',
  'Parent-Teacher Meeting is scheduled for December 10th, 2024, from 10:00 AM to 4:00 PM. Parents are requested to meet their ward''s class teacher to discuss academic progress and any concerns.

Please bring your ward''s progress report and previous test papers for discussion.

Timing: 10:00 AM - 4:00 PM
Venue: Respective Classrooms

Thank you for your cooperation.',
  'medium',
  'all',
  '2024-11-05 10:00:00',
  '2024-12-10 16:00:00',
  (SELECT id FROM admins LIMIT 1)
),
(
  'Library Books Return Reminder',
  'This is a reminder for all students who have borrowed books from the school library. Please return all overdue books by December 8th, 2024.

Late return fee: Rs. 2 per day per book

Students with overdue books will not be allowed to borrow new books until all previous books are returned.

Library Timings:
Monday to Friday: 9:00 AM - 4:00 PM
Saturday: 9:00 AM - 1:00 PM

Thank you,
Library Department',
  'medium',
  'all',
  '2024-11-10 11:00:00',
  '2024-12-08 17:00:00',
  (SELECT id FROM admins LIMIT 1)
),
(
  'Class 10th Pre-Board Exam Schedule',
  'Pre-Board Examinations for Class 10th will commence from January 15th, 2025.

Exam Schedule:
- Mathematics: January 15th, 2025
- Science: January 17th, 2025  
- English: January 19th, 2025
- Hindi: January 22nd, 2025
- Social Studies: January 24th, 2025

All exams will be conducted from 10:00 AM to 1:00 PM.

Students must bring their admit cards and required stationery.

Best of luck!',
  'high',
  '10th A',
  '2024-11-15 12:00:00',
  '2025-01-24 15:00:00',
  (SELECT id FROM admins LIMIT 1)
);

-- Insert sample results
INSERT INTO results (
  student_id, 
  subject, 
  term, 
  marks, 
  max_marks, 
  grade, 
  exam_date, 
  created_by
) VALUES
-- Results for Aftab Alam
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  'Mathematics',
  'Mid-Term 2024',
  85,
  100,
  'A',
  '2024-09-15',
  (SELECT id FROM admins LIMIT 1)
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  'Science',
  'Mid-Term 2024',
  78,
  100,
  'B+',
  '2024-09-17',
  (SELECT id FROM admins LIMIT 1)
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  'English',
  'Mid-Term 2024',
  82,
  100,
  'A-',
  '2024-09-19',
  (SELECT id FROM admins LIMIT 1)
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  'Hindi',
  'Mid-Term 2024',
  75,
  100,
  'B+',
  '2024-09-21',
  (SELECT id FROM admins LIMIT 1)
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  'Social Studies',
  'Mid-Term 2024',
  88,
  100,
  'A',
  '2024-09-23',
  (SELECT id FROM admins LIMIT 1)
),
-- Unit Test Results
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  'Mathematics',
  'Unit Test 1',
  92,
  100,
  'A+',
  '2024-10-05',
  (SELECT id FROM admins LIMIT 1)
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  'Science',
  'Unit Test 1',
  86,
  100,
  'A',
  '2024-10-07',
  (SELECT id FROM admins LIMIT 1)
);

-- Insert sample attendance
INSERT INTO attendance (
  student_id, 
  date, 
  subject, 
  is_present, 
  remarks, 
  marked_by
) VALUES
-- November 2024 attendance for Aftab Alam
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  '2024-11-01',
  'Mathematics',
  true,
  '',
  (SELECT id FROM admins LIMIT 1)
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  '2024-11-01',
  'Science',
  true,
  '',
  (SELECT id FROM admins LIMIT 1)
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  '2024-11-01',
  'English',
  true,
  '',
  (SELECT id FROM admins LIMIT 1)
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  '2024-11-02',
  'Mathematics',
  false,
  'Sick leave',
  (SELECT id FROM admins LIMIT 1)
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  '2024-11-02',
  'Hindi',
  false,
  'Sick leave',
  (SELECT id FROM admins LIMIT 1)
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  '2024-11-04',
  'Mathematics',
  true,
  '',
  (SELECT id FROM admins LIMIT 1)
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  '2024-11-04',
  'Science',
  true,
  '',
  (SELECT id FROM admins LIMIT 1)
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  '2024-11-04',
  'Social Studies',
  true,
  '',
  (SELECT id FROM admins LIMIT 1)
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  '2024-11-05',
  'English',
  true,
  '',
  (SELECT id FROM admins LIMIT 1)
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  '2024-11-05',
  'Hindi',
  true,
  '',
  (SELECT id FROM admins LIMIT 1)
);

-- Insert sample messages for class chat
INSERT INTO messages (
  sender_id, 
  sender_type, 
  class_id, 
  message_type, 
  content
) VALUES
(
  (SELECT id FROM admins LIMIT 1),
  'admin',
  (SELECT id FROM classes WHERE name = '10th A' LIMIT 1),
  'group',
  'Good morning everyone! Don''t forget about the upcoming sports day registration. Last date is December 15th.'
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  'student',
  (SELECT id FROM classes WHERE name = '10th A' LIMIT 1),
  'group',
  'Thank you for the reminder! I''m planning to participate in cricket and badminton.'
),
(
  (SELECT id FROM students WHERE student_id = '20230254458'),
  'student',
  (SELECT id FROM classes WHERE name = '10th A' LIMIT 1),
  'group',
  'Can someone share the math homework solutions? I''m having trouble with question 5.'
),
(
  (SELECT id FROM admins LIMIT 1),
  'admin',
  (SELECT id FROM classes WHERE name = '10th A' LIMIT 1),
  'group',
  'Please remember that sharing homework solutions is not allowed. You can ask for help understanding the concepts instead.'
);

-- Insert sample AI queries
INSERT INTO ai_queries (
  student_id, 
  query, 
  ai_response, 
  subject
) VALUES
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  'Can you explain the quadratic formula and when to use it?',
  'The quadratic formula is x = (-b ± √(b²-4ac)) / 2a, used to solve quadratic equations of the form ax² + bx + c = 0. 

Here''s when to use it:
1. When factoring is difficult or impossible
2. When completing the square seems complex
3. As a reliable method for any quadratic equation

Steps to use:
1. Identify coefficients a, b, and c
2. Calculate the discriminant (b²-4ac)
3. Apply the formula
4. Simplify to get your solutions

Would you like me to work through a specific example?',
  'Mathematics'
),
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  'What is photosynthesis and why is it important?',
  'Photosynthesis is the process by which plants convert light energy (usually from the sun) into chemical energy (glucose) using carbon dioxide and water.

The equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

Why it''s important:
1. Produces oxygen that we breathe
2. Forms the base of most food chains
3. Removes CO₂ from the atmosphere
4. Converts solar energy into usable chemical energy

The process occurs in chloroplasts and involves two main stages: light reactions and the Calvin cycle.

Would you like me to explain either stage in more detail?',
  'Science'
);

-- Insert sample VoiceLink requests
INSERT INTO voicelink_requests (
  student_id, 
  type, 
  subject, 
  description, 
  status, 
  notes
) VALUES
(
  (SELECT id FROM students WHERE student_id = '20230254457'),
  'academic',
  'Study Stress Management',
  'I''ve been feeling overwhelmed with the upcoming board exams. I''m having trouble managing my study schedule and feeling anxious about my performance. I would like guidance on effective study techniques and stress management.',
  'approved',
  'Scheduled counselling session to discuss study planning and anxiety management techniques. Will provide resources for stress reduction.'
),
(
  (SELECT id FROM students WHERE student_id = '20230254458'),
  'personal',
  'Career Guidance',
  'I''m confused about choosing my stream for 11th grade. I like both science and humanities subjects. I need help understanding different career options and making the right choice for my future.',
  'pending',
  ''
);