# myNexus - SDSU Student Platform

**Team Hackstreet Boys**

## Overview

myNexus is a comprehensive student platform for San Diego State University (SDSU) that connects students, provides course information, facilitates peer networking, and keeps students informed about campus events and clubs.

## DEMO



https://github.com/user-attachments/assets/bf93a99c-f7ba-4f99-9a86-e81537c00761



## Contributors 

@kedarnhegde @sahil-katle @vinaysurtani @kevin7hacky

## MVP Features -

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

## Other Features - 

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

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MySQL
- **ORM**: SQLAlchemy
- **Authentication**: bcrypt

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
git clone git@github.com:kedarnhegde/myNexus.git
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
# Backend
make setup-venv
make install-be
# Frontend
make install-fe
```

4. **Seed Database**
```bash
make seed
```

5. **Run the Application**
```bash
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

### Sample Users
After seeding, you can login with:
- Username: `kedar` / Password: `kedar`

## Contributing

Team Hackstreet Boys - ACM Hackathon Project

## License

MIT License
