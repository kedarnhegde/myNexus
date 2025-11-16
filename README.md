# myNexus - SDSU Student Platform

**Team Hackstreet Boys**

## Overview

myNexus is a comprehensive student platform for San Diego State University (SDSU) that connects students, provides course information, facilitates peer networking, and keeps students informed about campus events and clubs.

## Features

### 🏠 AskSDSU
- Reddit-style forum for student discussions
- Post categorization (General, Academic, Social, Jobs/Internships, Housing, Events)
- Upvote/downvote system
- Nested comments
- Real-time post filtering

### 📚 Course Compass
- Search courses by code, title, or department
- Browse professors with ratings and reviews
- View course sections with professor information
- Section-specific reviews and Q&A
- Course syllabus viewer
- Professor difficulty ratings and "would take again" percentages
- Course tags (beginner-friendly, coding-intensive, etc.)

### 👥 Peer Connect
- AI-powered student matching based on courses, interests, and tags
- Filter by year, major, and company
- User profiles with bio, courses, clubs, and tags
- Connection requests and friend management
- Availability calendar
- Peer reviews system

### 📅 Events
- Campus events calendar
- Event registration and ticket booking
- Event categories (Competition, Exhibition, Concert, etc.)
- Track registered events in profile

### 🎯 Clubs
- Browse 25+ SDSU clubs and organizations
- Filter by category (Academic, Arts, Recreation, Social, Cultural, etc.)
- Direct links to club Instagram pages
- Club information (members, location, description)

### 💬 Messages
- Direct messaging between connected students
- Message history

### 👤 Profile
- Edit username, email, and password
- Manage personal tags (year, major, skills, interests)
- View upcoming registered events
- Profile customization

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Theme**: Apple-inspired light mode design

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MySQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT-based

## Project Structure

```
myNexus/
├── fe/                    # Frontend (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Main application
│   │   │   ├── auth/             # Authentication pages
│   │   │   └── globals.css       # Global styles
│   │   └── components/
│   │       └── Modal.tsx         # Reusable modal component
│   └── package.json
├── be/                    # Backend (FastAPI)
│   ├── main.py                   # API routes
│   ├── models.py                 # Database models
│   ├── seed.py                   # Database seeding
│   ├── seed_courses.py           # Course data seeding
│   ├── requirements.txt          # Python dependencies
│   └── .venv/                    # Virtual environment
├── Makefile                      # Build and run commands
└── README.md
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- MySQL 8.0+
- Make (optional, for using Makefile commands)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd myNexus
```

2. **Setup MySQL Database**
```bash
make setup-db
# Or manually:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS nexus;"
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'nexus'@'localhost' IDENTIFIED BY 'NexusPass123!';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON nexus.* TO 'nexus'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

3. **Install Dependencies**
```bash
make install-all
# Or manually:
# Backend
cd be && python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Frontend
cd ../fe && npm install
```

4. **Seed Database**
```bash
make seed
make seed-courses
# Or manually:
cd be && source .venv/bin/activate
python seed.py
python seed_courses.py
```

5. **Run the Application**
```bash
# Run both frontend and backend
make dev

# Or run separately:
# Terminal 1 - Backend
make run-be
# Terminal 2 - Frontend
make run-fe
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Database Schema

### Core Tables
- **users**: User accounts and authentication
- **user_profiles**: Extended user information (bio, gender, year, major, clubs)
- **tags**: Skill and interest tags
- **user_tags**: User-tag associations
- **user_courses**: Courses taken by users
- **posts**: Forum posts
- **comments**: Post comments
- **votes**: Post upvotes/downvotes
- **connections**: Friend connections and requests
- **messages**: Direct messages

### Course Compass Tables
- **professors**: Professor information
- **courses**: Course catalog
- **sections**: Course sections with professor assignments
- **reviews**: Section reviews with ratings
- **questions**: Section Q&A

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login

### Users
- `GET /users/{user_id}` - Get user profile
- `PUT /users/{user_id}` - Update user profile
- `GET /users/search` - Search users
- `GET /users/recommended/{user_id}` - Get recommended connections
- `GET /users/{user_id}/tags` - Get user tags
- `POST /users/{user_id}/tags/{tag_id}` - Add tag to user
- `DELETE /users/{user_id}/tags/{tag_id}` - Remove tag from user

### Posts
- `GET /posts/` - Get all posts (with filters)
- `POST /posts/` - Create post
- `POST /posts/{post_id}/vote` - Vote on post
- `GET /posts/{post_id}/comments` - Get post comments
- `POST /posts/{post_id}/comments` - Add comment

### Connections
- `GET /connections/{user_id}` - Get user connections
- `POST /connections/` - Send connection request
- `PUT /connections/{connection_id}` - Accept/reject request

### Messages
- `GET /messages/{user_id}` - Get user messages
- `POST /messages/` - Send message

### Courses
- `GET /courses/search` - Search courses
- `GET /courses/{course_id}` - Get course details
- `GET /departments` - Get all departments

### Professors
- `GET /professors/search` - Search professors
- `GET /professors/{professor_id}` - Get professor details
- `GET /professors/popular` - Get popular professors

### Sections
- `GET /sections/{section_id}/reviews` - Get section reviews
- `GET /sections/{section_id}/questions` - Get section Q&A
- `GET /syllabus/{section_id}` - Get section syllabus

### Tags
- `GET /tags/` - Get all tags

## Design System

### Colors
- **Primary**: #A6192E (SDSU Red)
- **Background**: White (#FFFFFF)
- **Text**: Gray-900 (#111827)
- **Borders**: Gray-200 (#E5E7EB)
- **Hover**: Gray-50 (#F9FAFB)

### Tag Colors (Matte)
- Year levels: Slate, Emerald, Amber, Orange, Violet, Rose, Red (500 shades)
- Majors: Indigo, Teal, Cyan (500 shades)
- Companies: Blue, Red, Orange, Gray, Sky (500 shades)
- Skills: Various 500-level shades for consistent, non-bright appearance

## Development

### Makefile Commands
```bash
make setup-venv        # Create Python virtual environment
make install-be        # Install backend dependencies
make install-fe        # Install frontend dependencies
make install-all       # Install all dependencies
make run-be            # Run backend server
make run-fe            # Run frontend server
make dev               # Run both servers
make setup-db          # Setup MySQL database
make seed              # Seed database with sample data
make seed-courses      # Seed course data
```

### Sample Users
After seeding, you can login with:
- Username: `alice` / Password: `password123`
- Username: `bob` / Password: `password123`
- Username: `charlie` / Password: `password123`

## Features in Detail

### Smart Matching Algorithm
Peer Connect uses a recommendation system that matches students based on:
- Shared courses
- Similar tags (year, major, skills)
- Common interests
- Complementary skills

### Course Reviews
- 5-star rating system
- Difficulty ratings
- "Would take again" percentage
- Tagged reviews (engaging, challenging, etc.)
- Section-specific feedback

### Event Management
- Register, Join, or Get Tickets for events
- Track registered events in profile
- Event categories and tags
- Date and location information

## Contributing

Team Hackstreet Boys - ACM Hackathon Project

## License

MIT License
