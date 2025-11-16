import bcrypt
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User, Post, Message, Connection

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
        print("✅ Database seeded successfully!")
        print(f"Created {len(users)} users, {len(posts_data)} posts, {len(messages_data)} messages, and {len(connections_data)} connections")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
