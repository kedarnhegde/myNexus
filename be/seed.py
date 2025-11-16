import bcrypt
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, Post, Message, Connection, Professor, Course, CourseSection, Review, Question
import random

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Create 16 users
        users_data = [
            ("john.doe@sdsu.edu", "johndoe", "password123"),
            ("jane.smith@sdsu.edu", "janesmith", "password123"),
            ("mike.johnson@sdsu.edu", "mikej", "password123"),
            ("sarah.williams@sdsu.edu", "sarahw", "password123"),
            ("david.brown@sdsu.edu", "davidb", "password123"),
            ("emily.davis@sdsu.edu", "emilyd", "password123"),
            ("chris.miller@sdsu.edu", "chrism", "password123"),
            ("ashley.wilson@sdsu.edu", "ashleyw", "password123"),
            ("ryan.moore@sdsu.edu", "ryanm", "password123"),
            ("jessica.taylor@sdsu.edu", "jessicat", "password123"),
            ("kevin.anderson@sdsu.edu", "kevina", "password123"),
            ("lauren.thomas@sdsu.edu", "laurent", "password123"),
            ("brandon.jackson@sdsu.edu", "brandonj", "password123"),
            ("nicole.white@sdsu.edu", "nicolew", "password123"),
            ("tyler.harris@sdsu.edu", "tylerh", "password123"),
            ("amanda.martin@sdsu.edu", "amandam", "password123")
        ]
        
        users = []
        for email, username, password in users_data:
            user = User(
                email=email,
                username=username,
                password_hash=hash_password(password)
            )
            db.add(user)
            users.append(user)
        
        db.commit()
        
        # Refresh to get IDs
        for user in users:
            db.refresh(user)
        
        # Create posts
        posts_data = [
            (users[0].id, "Just finished my midterms! Time to relax 🎉", 15),
            (users[1].id, "Looking for study partners for CS 310. Anyone interested?", 8),
            (users[2].id, "The new library hours are amazing! Open till midnight now 📚", 23),
            (users[3].id, "Does anyone know when registration opens for Spring semester?", 5),
            (users[4].id, "Great game last night! Go Aztecs! 🏈", 42),
            (users[5].id, "Coffee study session at Starbucks tomorrow at 3pm. Join us!", 12),
            (users[6].id, "Need help with calculus homework. Anyone free?", 7),
            (users[7].id, "The campus food trucks are back! 🌮", 18),
            (users[8].id, "Looking for a roommate for next semester. DM me!", 9),
            (users[9].id, "Just got accepted into the honors program! 🎓", 31),
            (users[10].id, "Anyone going to the career fair next week?", 14),
            (users[11].id, "Best study spots on campus? Need recommendations", 11),
            (users[12].id, "Selling textbooks for ECON 101. Like new condition!", 6),
            (users[13].id, "Who else is excited for spring break? ☀️", 28),
            (users[14].id, "Free tutoring sessions at the library every Tuesday!", 19),
            (users[15].id, "Lost my student ID near the gym. Please help!", 4)
        ]
        
        for user_id, content, likes in posts_data:
            post = Post(user_id=user_id, content=content, likes_count=likes)
            db.add(post)
        
        db.commit()
        
        # Create messages (one per user to user[0])
        messages_data = [
            (users[1].id, users[0].id, "Hey! Are you free to study tomorrow?"),
            (users[2].id, users[0].id, "Thanks for the notes from last class!"),
            (users[3].id, users[0].id, "Want to grab lunch at the Union?"),
            (users[4].id, users[0].id, "Did you finish the assignment yet?"),
            (users[5].id, users[0].id, "See you at the game tonight!"),
            (users[6].id, users[0].id, "Can you send me the study guide?"),
            (users[7].id, users[0].id, "Great presentation today!"),
            (users[8].id, users[0].id, "Are you going to the party Friday?"),
            (users[9].id, users[0].id, "Need help with project. Available?"),
            (users[10].id, users[0].id, "Let's form a study group!"),
            (users[11].id, users[0].id, "Thanks for helping me yesterday!"),
            (users[12].id, users[0].id, "Want to join our club?"),
            (users[13].id, users[0].id, "Coffee after class?"),
            (users[14].id, users[0].id, "Did you hear about the event?"),
            (users[15].id, users[0].id, "Can I borrow your calculator?")
        ]
        
        for sender_id, receiver_id, content in messages_data:
            message = Message(
                sender_id=sender_id,
                receiver_id=receiver_id,
                content=content,
                is_read=False
            )
            db.add(message)
        
        db.commit()
        
        # Create connections (friend requests)
        connections_data = [
            (users[0].id, users[1].id, "accepted"),
            (users[0].id, users[2].id, "accepted"),
            (users[0].id, users[3].id, "pending"),
            (users[1].id, users[4].id, "accepted"),
            (users[2].id, users[5].id, "accepted"),
            (users[3].id, users[6].id, "pending"),
        ]
        
        for user_id, friend_id, status in connections_data:
            connection = Connection(user_id=user_id, friend_id=friend_id, status=status)
            db.add(connection)
        
        db.commit()
        
        # Seed CourseCompass data
        professors_data = [
            ("Dr. Sarah Johnson", "Computer Science", "sjohnson@sdsu.edu"),
            ("Dr. Michael Chen", "Computer Science", "mchen@sdsu.edu"),
            ("Dr. Emily Rodriguez", "Computer Science", "erodriguez@sdsu.edu"),
            ("Dr. James Wilson", "Mathematics", "jwilson@sdsu.edu"),
            ("Dr. Lisa Anderson", "Mathematics", "landerson@sdsu.edu"),
            ("Dr. Robert Taylor", "Business", "rtaylor@sdsu.edu"),
            ("Dr. Maria Garcia", "Engineering", "mgarcia@sdsu.edu"),
            ("Dr. David Kim", "Psychology", "dkim@sdsu.edu"),
            ("Dr. Jennifer Lee", "Biology", "jlee@sdsu.edu"),
            ("Dr. Thomas Brown", "Computer Science", "tbrown@sdsu.edu"),
        ]
        
        professors = []
        for name, dept, email in professors_data:
            prof = Professor(name=name, department=dept, email=email)
            db.add(prof)
            professors.append(prof)
        db.commit()
        for prof in professors:
            db.refresh(prof)
        
        courses_data = [
            ("CS-160", "Introduction to Programming", "Computer Science", "Fundamentals of programming using Python"),
            ("CS-210", "Data Structures", "Computer Science", "Study of data structures and algorithms"),
            ("CS-310", "Database Systems", "Computer Science", "Design and implementation of database systems"),
            ("CS-370", "Web Development", "Computer Science", "Full-stack web development with modern frameworks"),
            ("CS-480", "Machine Learning", "Computer Science", "Introduction to ML algorithms and applications"),
            ("MATH-150", "Calculus I", "Mathematics", "Differential calculus and applications"),
            ("MATH-151", "Calculus II", "Mathematics", "Integral calculus and series"),
            ("BUS-101", "Introduction to Business", "Business", "Overview of business principles"),
            ("ENGR-101", "Engineering Design", "Engineering", "Introduction to engineering design process"),
            ("PSY-101", "General Psychology", "Psychology", "Introduction to psychological concepts"),
        ]
        
        courses = []
        for code, title, dept, desc in courses_data:
            course = Course(code=code, title=title, department=dept, description=desc)
            db.add(course)
            courses.append(course)
        db.commit()
        for course in courses:
            db.refresh(course)
        
        syllabi = [
            "/syllabi/cs160_fall2024.txt",
            "/syllabi/cs210_spring2024.txt",
            "/syllabi/cs310_fall2024.txt",
            "/syllabi/cs370_fall2024.txt",
            "/syllabi/cs480_spring2024.txt",
            "/syllabi/math150_spring2024.txt"
        ]
        semesters = ["Fall 2024", "Spring 2024", "Fall 2023"]
        schedules = ["MWF 10:00-11:00", "TTh 14:00-15:30", "MWF 13:00-14:00", "TTh 10:00-11:30"]
        locations = ["GMCS 333", "GMCS 408", "Storm Hall 123", "Engineering 201", "Arts & Letters 301"]
        exam_formats = ["Midterm + Final", "Project-Based", "Weekly Quizzes + Final", "3 Exams"]
        grading_styles = ["Easy Grading", "Fair Grading", "Tough Grading"]
        
        sections = []
        for course in courses[:5]:
            for i in range(2):
                prof = random.choice([p for p in professors if p.department == course.department])
                section = CourseSection(
                    course_id=course.id, professor_id=prof.id, section_number=f"0{i+1}",
                    semester=random.choice(semesters), schedule=random.choice(schedules),
                    location=random.choice(locations), syllabus_url=random.choice(syllabi),
                    exam_format=random.choice(exam_formats), grading_style=random.choice(grading_styles)
                )
                db.add(section)
                sections.append(section)
        db.commit()
        for section in sections:
            db.refresh(section)
        
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
            "online-exam,lots-of-hw,lecture-heavy,participation-matters",
            "paper-based,less-hw,not-lecture-heavy,participation-optional",
            "online-exam,lots-of-hw,not-lecture-heavy,participation-matters",
            "paper-based,lots-of-hw,lecture-heavy,participation-optional",
            "online-exam,less-hw,lecture-heavy,participation-matters",
            "paper-based,less-hw,lecture-heavy,participation-optional",
            "online-exam,lots-of-hw,lecture-heavy,participation-optional",
            "paper-based,less-hw,not-lecture-heavy,participation-matters"
        ]
        
        for section in sections:
            for _ in range(random.randint(8, 15)):
                user = random.choice(users)
                review = Review(
                    user_id=user.id, section_id=section.id,
                    rating=round(random.uniform(3.0, 5.0), 1),
                    difficulty=round(random.uniform(2.0, 5.0), 1),
                    workload=round(random.uniform(2.0, 5.0), 1),
                    would_take_again=random.choice([True, True, False]),
                    grade_received=random.choice(["A", "A-", "B+", "B", "B-", "C+", "C"]),
                    attendance_mandatory=random.choice([True, False]),
                    textbook_required=random.choice([True, False]),
                    content=random.choice(review_contents),
                    tags=random.choice(tags_options),
                    helpful_count=random.randint(0, 25)
                )
                db.add(review)
        db.commit()
        
        for prof in professors:
            reviews = db.query(Review).join(CourseSection).filter(CourseSection.professor_id == prof.id).all()
            if reviews:
                prof.total_reviews = len(reviews)
                prof.avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 1)
                prof.avg_difficulty = round(sum(r.difficulty for r in reviews) / len(reviews), 1)
                prof.would_take_again_percent = round((sum(1 for r in reviews if r.would_take_again) / len(reviews)) * 100, 1)
        db.commit()
        
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
        
        for section in sections:
            for i in range(random.randint(5, 10)):
                user = random.choice(users)
                question = Question(
                    user_id=user.id, section_id=section.id,
                    title=question_titles[i % len(question_titles)],
                    content=question_contents[i % len(question_contents)],
                    upvotes=random.randint(0, 15),
                    answer_count=random.randint(0, 3)
                )
                db.add(question)
        db.commit()
        
        print("✅ Database seeded successfully!")
        print(f"Created {len(users)} users, {len(posts_data)} posts, {len(messages_data)} messages, {len(connections_data)} connections")
        print(f"Created {len(professors)} professors, {len(courses)} courses, {len(sections)} sections with reviews and Q&A")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
