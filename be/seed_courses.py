from database import SessionLocal, engine
from models import Base, Professor, Course, CourseSection, Review, Question, Answer, User
import random

def seed_courses():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # SDSU Departments
    departments = [
        "Computer Science", "Mathematics", "Business", "Engineering", 
        "Psychology", "Biology", "Economics", "Mechanical Engineering",
        "Electrical Engineering", "Civil Engineering", "Nursing",
        "Marketing", "Finance", "Accounting", "Chemistry", "Physics"
    ]
    
    # Sample professors
    professors_data = [
        {"name": "Dr. Sarah Johnson", "dept": "Computer Science", "email": "sjohnson@sdsu.edu"},
        {"name": "Dr. Michael Chen", "dept": "Computer Science", "email": "mchen@sdsu.edu"},
        {"name": "Dr. Emily Rodriguez", "dept": "Computer Science", "email": "erodriguez@sdsu.edu"},
        {"name": "Dr. James Wilson", "dept": "Mathematics", "email": "jwilson@sdsu.edu"},
        {"name": "Dr. Lisa Anderson", "dept": "Mathematics", "email": "landerson@sdsu.edu"},
        {"name": "Dr. Robert Taylor", "dept": "Business", "email": "rtaylor@sdsu.edu"},
        {"name": "Dr. Maria Garcia", "dept": "Engineering", "email": "mgarcia@sdsu.edu"},
        {"name": "Dr. David Kim", "dept": "Psychology", "email": "dkim@sdsu.edu"},
        {"name": "Dr. Jennifer Lee", "dept": "Biology", "email": "jlee@sdsu.edu"},
        {"name": "Dr. Thomas Brown", "dept": "Computer Science", "email": "tbrown@sdsu.edu"},
    ]
    
    professors = []
    for p in professors_data:
        prof = Professor(name=p["name"], department=p["dept"], email=p["email"])
        db.add(prof)
        professors.append(prof)
    
    db.commit()
    
    # Sample courses
    courses_data = [
        {"code": "CS-160", "title": "Introduction to Programming", "dept": "Computer Science", "desc": "Fundamentals of programming using Python"},
        {"code": "CS-210", "title": "Data Structures", "dept": "Computer Science", "desc": "Study of data structures and algorithms"},
        {"code": "CS-310", "title": "Database Systems", "dept": "Computer Science", "desc": "Design and implementation of database systems"},
        {"code": "CS-370", "title": "Web Development", "dept": "Computer Science", "desc": "Full-stack web development with modern frameworks"},
        {"code": "CS-480", "title": "Machine Learning", "dept": "Computer Science", "desc": "Introduction to ML algorithms and applications"},
        {"code": "MATH-150", "title": "Calculus I", "dept": "Mathematics", "desc": "Differential calculus and applications"},
        {"code": "MATH-151", "title": "Calculus II", "dept": "Mathematics", "desc": "Integral calculus and series"},
        {"code": "BUS-101", "title": "Introduction to Business", "dept": "Business", "desc": "Overview of business principles"},
        {"code": "ENGR-101", "title": "Engineering Design", "dept": "Engineering", "desc": "Introduction to engineering design process"},
        {"code": "PSY-101", "title": "General Psychology", "dept": "Psychology", "desc": "Introduction to psychological concepts"},
    ]
    
    courses = []
    for c in courses_data:
        course = Course(code=c["code"], title=c["title"], department=c["dept"], description=c["desc"])
        db.add(course)
        courses.append(course)
    
    db.commit()
    
    # Sample syllabi URLs
    syllabi = [
        "/syllabi/cs160_fall2024.txt",
        "/syllabi/cs210_spring2024.txt",
        "/syllabi/cs310_fall2024.txt",
        "/syllabi/math150_spring2024.txt",
    ]
    
    # Create sections
    semesters = ["Fall 2024", "Spring 2024", "Fall 2023"]
    schedules = ["MWF 10:00-11:00", "TTh 14:00-15:30", "MWF 13:00-14:00", "TTh 10:00-11:30"]
    locations = ["GMCS 333", "GMCS 408", "Storm Hall 123", "Engineering 201", "Arts & Letters 301"]
    exam_formats = ["Midterm + Final", "Project-Based", "Weekly Quizzes + Final", "3 Exams"]
    grading_styles = ["Curved", "Absolute", "Hybrid"]
    
    sections = []
    for course in courses[:5]:  # Create sections for first 5 courses
        for i in range(2):  # 2 sections per course
            prof = random.choice([p for p in professors if p.department == course.department])
            section = CourseSection(
                course_id=course.id,
                professor_id=prof.id,
                section_number=f"0{i+1}",
                semester=random.choice(semesters),
                schedule=random.choice(schedules),
                location=random.choice(locations),
                syllabus_url=random.choice(syllabi),
                exam_format=random.choice(exam_formats),
                grading_style=random.choice(grading_styles)
            )
            db.add(section)
            sections.append(section)
    
    db.commit()
    
    # Get some users for reviews
    users = db.query(User).limit(10).all()
    
    if users:
        # Create sample reviews
        review_contents = [
            "Great professor! Very clear explanations and helpful during office hours.",
            "Challenging course but fair grading. Learned a lot.",
            "Lectures can be dry but material is well-organized.",
            "Tough grader but you'll learn the material thoroughly.",
            "Very engaging lectures. Highly recommend!",
            "Assignments are time-consuming but worthwhile.",
            "Clear expectations and fair exams.",
            "Professor is passionate about the subject.",
        ]
        
        tags_options = [
            "exam-heavy,lecture-based",
            "project-based,group-work",
            "coding-intensive,practical",
            "theory-heavy,math-focused",
            "hands-on,interactive"
        ]
        
        for section in sections:
            for _ in range(random.randint(3, 8)):
                user = random.choice(users)
                review = Review(
                    user_id=user.id,
                    section_id=section.id,
                    rating=round(random.uniform(3.0, 5.0), 1),
                    difficulty=round(random.uniform(2.0, 5.0), 1),
                    workload=round(random.uniform(2.0, 5.0), 1),
                    would_take_again=random.choice([True, True, False]),
                    grade_received=random.choice(["A", "A-", "B+", "B", "B-"]),
                    attendance_mandatory=random.choice([True, False]),
                    textbook_required=random.choice([True, False]),
                    content=random.choice(review_contents),
                    tags=random.choice(tags_options),
                    helpful_count=random.randint(0, 25)
                )
                db.add(review)
        
        db.commit()
        
        # Update professor stats
        for prof in professors:
            reviews = db.query(Review).join(CourseSection).filter(
                CourseSection.professor_id == prof.id
            ).all()
            
            if reviews:
                prof.total_reviews = len(reviews)
                prof.avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 1)
                prof.avg_difficulty = round(sum(r.difficulty for r in reviews) / len(reviews), 1)
                prof.would_take_again_percent = round((sum(1 for r in reviews if r.would_take_again) / len(reviews)) * 100, 1)
        
        db.commit()
        
        # Create sample questions
        question_titles = [
            "What's the best way to prepare for the midterm?",
            "Are the textbook readings necessary?",
            "How difficult are the programming assignments?",
            "Does attendance affect the grade?",
            "What topics are covered in the final?",
        ]
        
        question_contents = [
            "I'm wondering what the best study strategy is for this class.",
            "Trying to figure out if I need to buy the textbook or if lecture notes are enough.",
            "How much time should I allocate for the weekly assignments?",
            "Does the professor take attendance or is it optional?",
            "What should I focus on when studying for the final exam?",
        ]
        
        for section in sections[:5]:
            for i in range(random.randint(2, 5)):
                user = random.choice(users)
                question = Question(
                    user_id=user.id,
                    section_id=section.id,
                    title=question_titles[i % len(question_titles)],
                    content=question_contents[i % len(question_contents)],
                    upvotes=random.randint(0, 15),
                    answer_count=random.randint(0, 3)
                )
                db.add(question)
        
        db.commit()
    
    print("✅ CourseCompass data seeded successfully!")
    print(f"Created {len(professors)} professors, {len(courses)} courses, {len(sections)} sections")
    
    db.close()

if __name__ == "__main__":
    seed_courses()
