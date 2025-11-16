from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Post

def update_existing_posts():
    db = SessionLocal()
    try:
        # Update all posts without category to have 'general' category
        posts_without_category = db.query(Post).filter(Post.category == None).all()
        for post in posts_without_category:
            post.category = 'general'
        
        db.commit()
        print(f"Updated {len(posts_without_category)} posts with default category 'general'")
    except Exception as e:
        print(f"Error updating posts: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_existing_posts()