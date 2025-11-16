# CourseCompass - SDSU Course & Professor Reviews

## Features Implemented

### Core Features
✅ **Per-Professor Syllabus & Section Info**
- Each course shows multiple sections with different professors
- Section-specific details: schedule, location, exam format, grading style
- Downloadable syllabi for each section

✅ **Section-Specific Reviews**
- Reviews tied to specific professor/section combinations
- Not generic course reviews - each section has its own reviews

✅ **RMP-Style Filters & Layout**
- Rating (1-5 scale)
- Difficulty (1-5 scale)
- Workload (hours per week)
- Would Take Again percentage
- Grading style (Curved, Absolute, Hybrid)
- Exam format (Midterm+Final, Project-Based, etc.)

✅ **SDSU-Unique Features**
- Department-based filtering
- Course code search (CS-160, MATH-150, etc.)
- Attendance mandatory indicator
- Textbook required indicator
- Grade received tracking
- Custom tags (exam-heavy, project-based, coding-intensive, etc.)

✅ **Q&A Forum**
- Section-specific questions
- Same interface as reviews but for Q&A
- Upvoting system
- Answer tracking

✅ **Powerful Search & Filters**
- Search by course code, title, or professor name
- Filter by department
- Separate tabs for courses and professors

✅ **Trending & Popular**
- Popular professors sidebar (sorted by review count)
- Quick access to highly-rated professors

✅ **Clean, Modern UI**
- Minimal design with Tailwind CSS
- Intuitive navigation
- Responsive layout
- Color-coded metrics (green for ratings, orange for difficulty, blue for would-take-again)

## Database Schema

### Tables Created
- `professors` - Professor information and aggregate stats
- `courses` - Course catalog
- `course_sections` - Specific sections with professor, schedule, syllabus
- `reviews` - Section-specific reviews with detailed metrics
- `questions` - Q&A forum questions
- `answers` - Answers to questions

## API Endpoints

### Courses
- `GET /courses/search` - Search courses with filters
- `GET /courses/{id}` - Get course details with all sections

### Professors
- `GET /professors/search` - Search professors with filters
- `GET /professors/{id}` - Get professor details with courses taught
- `GET /professors/popular` - Get top professors by review count

### Reviews & Q&A
- `GET /sections/{id}/reviews` - Get reviews for a section
- `POST /sections/{id}/reviews` - Create a review
- `GET /sections/{id}/questions` - Get Q&A for a section
- `POST /sections/{id}/questions` - Ask a question
- `GET /questions/{id}/answers` - Get answers
- `POST /questions/{id}/answers` - Post an answer

### Utilities
- `GET /departments` - Get all departments

## Frontend Pages

1. **`/courses`** - Main search page with course/professor tabs
2. **`/courses/[id]`** - Course detail with sections, reviews, and Q&A
3. **`/professors/[id]`** - Professor profile with courses taught and stats

## Sample Data

- 10 professors across 6 departments
- 10 courses (CS, Math, Business, Engineering, Psychology, Biology)
- 10 course sections with different professors
- Multiple reviews per section
- Sample questions for Q&A
- 4 sample syllabi files

## How to Use

1. **Seed the data:**
   ```bash
   make seed-courses
   ```

2. **Access CourseCompass:**
   - Login to myNexus
   - Click "CourseCompass" on dashboard
   - Search for courses or professors
   - View detailed reviews and Q&A

3. **Sample syllabi available at:**
   - `/syllabi/cs160_fall2024.txt`
   - `/syllabi/cs210_spring2024.txt`
   - `/syllabi/cs310_fall2024.txt`
   - `/syllabi/math150_spring2024.txt`

## Key Differentiators from Handshake

- **Section-specific reviews** (not just course-level)
- **Professor comparison** within same course
- **Integrated Q&A forum** for each section
- **Detailed metrics** (workload, attendance, textbook requirements)
- **SDSU-exclusive** content and features
- **Syllabus access** for informed decision-making
