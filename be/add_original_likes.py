from sqlalchemy import text
from database import engine

def add_original_likes_column():
    with engine.connect() as connection:
        # Add the column
        connection.execute(text("ALTER TABLE posts ADD COLUMN original_likes INTEGER DEFAULT 0"))
        
        # Set original_likes to current likes_count for existing posts
        connection.execute(text("UPDATE posts SET original_likes = likes_count"))
        
        connection.commit()
        print("✅ Added original_likes column and migrated existing data")

if __name__ == "__main__":
    add_original_likes_column()