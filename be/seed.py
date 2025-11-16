import bcrypt
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import SessionLocal, engine
from models import Base, User, Post, Message, Connection, UserProfile, Tag, UserTag, UserCourse, PostLike, Comment

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def seed_database():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        print("Clearing existing data...")
        db.query(UserCourse).delete()
        db.query(UserTag).delete()
        db.query(Tag).delete()
        db.query(UserProfile).delete()
        db.query(Connection).delete()
        db.query(Message).delete()
        db.query(PostLike).delete()
        db.query(Comment).delete()
        db.query(Post).delete()
        db.query(User).delete()
        db.commit()
        
        # Reset auto-increment IDs
        print("Resetting auto-increment IDs...")
        db.execute(text("ALTER TABLE users AUTO_INCREMENT = 1"))
        db.execute(text("ALTER TABLE posts AUTO_INCREMENT = 1"))
        db.execute(text("ALTER TABLE messages AUTO_INCREMENT = 1"))
        db.execute(text("ALTER TABLE connections AUTO_INCREMENT = 1"))
        db.execute(text("ALTER TABLE user_profiles AUTO_INCREMENT = 1"))
        db.execute(text("ALTER TABLE tags AUTO_INCREMENT = 1"))
        db.execute(text("ALTER TABLE user_tags AUTO_INCREMENT = 1"))
        db.execute(text("ALTER TABLE user_courses AUTO_INCREMENT = 1"))
        db.execute(text("ALTER TABLE post_likes AUTO_INCREMENT = 1"))
        db.execute(text("ALTER TABLE comments AUTO_INCREMENT = 1"))
        db.commit()
        print("Auto-increment IDs reset.")
        
        # Create 16 users
        users_data = [
            ("kedar@sdsu.edu", "kedar", "kedar"),
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
        
        # Create posts with categories
        posts_data = [
            (users[0].id, "Just finished my midterms! Time to relax 🎉", "general"),
            (users[1].id, "Looking for study partners for CS 310. Anyone interested?", "academic"),
            (users[2].id, "The new library hours are amazing! Open till midnight now 📚", "general"),
            (users[3].id, "Does anyone know when registration opens for Spring semester?", "academic"),
            (users[4].id, "Great game last night! Go Aztecs! 🏈", "social"),
            (users[5].id, "Coffee study session at Starbucks tomorrow at 3pm. Join us!", "social"),
            (users[6].id, "Need help with calculus homework. Anyone free?", "academic"),
            (users[7].id, "The campus food trucks are back! 🌮", "general"),
            (users[8].id, "Looking for a roommate for next semester. DM me!", "housing"),
            (users[9].id, "Just got accepted into the honors program! 🎓", "general"),
            (users[10].id, "Anyone going to the career fair next week?", "jobs"),
            (users[11].id, "Best study spots on campus? Need recommendations", "general"),
            (users[12].id, "Selling textbooks for ECON 101. Like new condition!", "general"),
            (users[13].id, "Who else is excited for spring break? ☀️", "social"),
            (users[14].id, "Free tutoring sessions at the library every Tuesday!", "academic"),
            (users[15].id, "Lost my student ID near the gym. Please help!", "general"),
            (users[0].id, "Software Engineering internship at Meta - Apply now!", "jobs"),
            (users[2].id, "Study abroad info session this Friday at 3pm", "events"),
            (users[5].id, "2BR apartment available near campus. $1200/month", "housing"),
            (users[7].id, "Aztec basketball game tonight! Who's going?", "events")
        ]
        
        posts = []
        for user_id, content, category in posts_data:
            post = Post(user_id=user_id, content=content, category=category)
            db.add(post)
            posts.append(post)
        
        db.commit()
        
        for post in posts:
            db.refresh(post)
        
        # Create comments
        comments_data = [
            (posts[0].id, users[1].id, "Congrats! You deserve it!"),
            (posts[0].id, users[2].id, "Same here! Finally done with exams 🎉"),
            (posts[1].id, users[0].id, "I'm in! Let's meet at the library tomorrow."),
            (posts[1].id, users[3].id, "Count me in too!"),
            (posts[2].id, users[4].id, "This is awesome! No more rushing to leave."),
            (posts[4].id, users[5].id, "What a game! The energy was incredible!"),
            (posts[4].id, users[6].id, "Best game of the season!"),
            (posts[4].id, users[7].id, "Go Aztecs! 🏈"),
            (posts[9].id, users[8].id, "Congratulations! That's amazing!"),
            (posts[10].id, users[9].id, "Yes! I'll be there. Great networking opportunity."),
            (posts[13].id, users[10].id, "Can't wait! Beach time! 🏖️"),
            (posts[13].id, users[11].id, "Already booked my flight home!"),
        ]
        
        for post_id, user_id, content in comments_data:
            comment = Comment(post_id=post_id, user_id=user_id, content=content)
            db.add(comment)
        
        db.commit()
        
        # Create votes (upvotes and downvotes)
        votes_data = [
            (posts[0].id, users[1].id, 1), (posts[0].id, users[2].id, 1), (posts[0].id, users[3].id, 1),
            (posts[1].id, users[0].id, 1), (posts[1].id, users[2].id, 1),
            (posts[2].id, users[0].id, 1), (posts[2].id, users[1].id, 1), (posts[2].id, users[4].id, 1), (posts[2].id, users[5].id, 1),
            (posts[3].id, users[1].id, 1), (posts[3].id, users[2].id, -1),
            (posts[4].id, users[0].id, 1), (posts[4].id, users[1].id, 1), (posts[4].id, users[5].id, 1), (posts[4].id, users[6].id, 1), (posts[4].id, users[7].id, 1),
            (posts[5].id, users[0].id, 1), (posts[5].id, users[3].id, 1),
            (posts[6].id, users[1].id, 1), (posts[6].id, users[2].id, -1),
            (posts[7].id, users[0].id, 1), (posts[7].id, users[3].id, 1), (posts[7].id, users[4].id, 1),
            (posts[8].id, users[1].id, 1), (posts[8].id, users[2].id, 1),
            (posts[9].id, users[0].id, 1), (posts[9].id, users[1].id, 1), (posts[9].id, users[8].id, 1), (posts[9].id, users[9].id, 1),
            (posts[10].id, users[0].id, 1), (posts[10].id, users[9].id, 1), (posts[10].id, users[10].id, 1),
            (posts[11].id, users[0].id, 1), (posts[11].id, users[2].id, 1),
            (posts[12].id, users[1].id, 1), (posts[12].id, users[3].id, -1),
            (posts[13].id, users[0].id, 1), (posts[13].id, users[10].id, 1), (posts[13].id, users[11].id, 1), (posts[13].id, users[12].id, 1),
            (posts[14].id, users[0].id, 1), (posts[14].id, users[1].id, 1), (posts[14].id, users[2].id, 1),
            (posts[15].id, users[1].id, 1), (posts[15].id, users[2].id, -1),
        ]
        
        for post_id, user_id, value in votes_data:
            vote = PostLike(post_id=post_id, user_id=user_id, value=value)
            db.add(vote)
        
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
        
        # Create user profiles
        genders = ["Male", "Female", "Non-binary", "Male", "Female", "Male", "Female", "Male", "Female", "Male", "Female", "Male", "Female", "Male", "Female", "Male"]
        years = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate", "Sophomore", "Junior", "Senior", "Freshman", "Junior", "Senior", "Sophomore", "Junior", "Senior", "Graduate", "Freshman"]
        majors = ["Computer Science", "Business", "Engineering", "Psychology", "Biology", "Mathematics", "English", "Economics", "Chemistry", "Physics", "History", "Art", "Music", "Nursing", "Political Science", "Sociology"]
        
        for i, user in enumerate(users):
            profile = UserProfile(
                user_id=user.id,
                gender=genders[i],
                year=years[i],
                major=majors[i],
                bio=f"SDSU {years[i]} majoring in {majors[i]}"
            )
            db.add(profile)
        
        db.commit()
        
        # Create tags (year levels, majors, companies, skills, interests)
        tags_data = [
            "Freshman", "Sophomore", "Junior", "Senior", "Graduate", "PhD", "Alumni",
            "CS Major", "Business Major", "Engineering Major",
            "Meta", "Google", "Amazon", "Apple", "Microsoft", "Netflix",
            "Python", "Java", "JavaScript", "React", "Machine Learning", "Data Science",
            "Web Dev", "Mobile Dev", "Cloud Computing", "Cybersecurity",
            "Leadership", "Teamwork", "Public Speaking", "Research",
            "Hackathons", "Open Source", "Startups", "Internship"
        ]
        tags = []
        for tag_name in tags_data:
            tag = Tag(name=tag_name)
            db.add(tag)
            tags.append(tag)
        
        db.commit()
        
        for tag in tags:
            db.refresh(tag)
        
        # Assign tags to users (students get year+major+skills, alumni get Alumni+company+skills)
        user_tags_data = [
            (users[0].id, tags[1].id), (users[0].id, tags[7].id), (users[0].id, tags[16].id), (users[0].id, tags[20].id), (users[0].id, tags[30].id),
            (users[1].id, tags[1].id), (users[1].id, tags[8].id), (users[1].id, tags[26].id), (users[1].id, tags[28].id),
            (users[2].id, tags[2].id), (users[2].id, tags[9].id), (users[2].id, tags[17].id), (users[2].id, tags[24].id),
            (users[3].id, tags[3].id), (users[3].id, tags[7].id), (users[3].id, tags[18].id), (users[3].id, tags[22].id), (users[3].id, tags[30].id),
            (users[4].id, tags[1].id), (users[4].id, tags[7].id), (users[4].id, tags[19].id), (users[4].id, tags[31].id),
            (users[5].id, tags[6].id), (users[5].id, tags[12].id), (users[5].id, tags[16].id), (users[5].id, tags[20].id), (users[5].id, tags[33].id),
            (users[6].id, tags[6].id), (users[6].id, tags[13].id), (users[6].id, tags[17].id), (users[6].id, tags[25].id),
            (users[7].id, tags[3].id), (users[7].id, tags[8].id), (users[7].id, tags[26].id), (users[7].id, tags[32].id),
            (users[8].id, tags[0].id), (users[8].id, tags[9].id), (users[8].id, tags[23].id),
            (users[9].id, tags[6].id), (users[9].id, tags[14].id), (users[9].id, tags[21].id), (users[9].id, tags[29].id),
            (users[10].id, tags[6].id), (users[10].id, tags[15].id), (users[10].id, tags[18].id), (users[10].id, tags[22].id),
            (users[11].id, tags[6].id), (users[11].id, tags[11].id), (users[11].id, tags[16].id), (users[11].id, tags[24].id),
            (users[12].id, tags[6].id), (users[12].id, tags[10].id), (users[12].id, tags[20].id), (users[12].id, tags[27].id),
            (users[13].id, tags[3].id), (users[13].id, tags[8].id), (users[13].id, tags[26].id),
            (users[14].id, tags[4].id), (users[14].id, tags[7].id), (users[14].id, tags[21].id), (users[14].id, tags[29].id),
            (users[15].id, tags[0].id), (users[15].id, tags[8].id), (users[15].id, tags[27].id)
        ]
        
        for user_id, tag_id in user_tags_data:
            user_tag = UserTag(user_id=user_id, tag_id=tag_id)
            db.add(user_tag)
        
        db.commit()
        
        # Create user courses (kedar gets more courses)
        courses_data = [
            (users[0].id, "CS 310", "Data Structures", "Fall 2023"),
            (users[0].id, "CS 576", "Machine Learning", "Spring 2024"),
            (users[0].id, "CS 535", "Object-Oriented Programming", "Fall 2023"),
            (users[1].id, "CS 310", "Data Structures", "Fall 2023"),
            (users[2].id, "CS 576", "Machine Learning", "Spring 2024"),
            (users[2].id, "CS 535", "Object-Oriented Programming", "Fall 2023"),
            (users[3].id, "MATH 254", "Calculus III", "Fall 2023"),
            (users[4].id, "CS 310", "Data Structures", "Spring 2024"),
            (users[5].id, "CS 576", "Machine Learning", "Spring 2024"),
            (users[6].id, "CS 535", "Object-Oriented Programming", "Spring 2024"),
        ]
        
        for user_id, code, name, semester in courses_data:
            course = UserCourse(user_id=user_id, course_code=code, course_name=name, semester=semester)
            db.add(course)
        
        db.commit()
        print("✅ Database seeded successfully!")
        print(f"Created {len(users)} users, {len(posts_data)} posts, {len(comments_data)} comments, {len(votes_data)} votes, {len(messages_data)} messages, {len(connections_data)} connections, {len(tags)} tags, and {len(courses_data)} courses")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
