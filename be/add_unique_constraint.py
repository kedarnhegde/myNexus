from sqlalchemy import text
from database import engine

def add_unique_constraint():
    try:
        with engine.connect() as connection:
            # Add unique constraint to prevent duplicate votes
            connection.execute(text("ALTER TABLE post_likes ADD CONSTRAINT unique_user_post_vote UNIQUE (post_id, user_id)"))
            connection.commit()
            print("Successfully added unique constraint to post_likes table")
    except Exception as e:
        print(f"Error adding unique constraint: {e}")

if __name__ == "__main__":
    add_unique_constraint()