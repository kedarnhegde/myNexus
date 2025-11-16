from sqlalchemy import text
from database import engine

def add_vote_value_column():
    try:
        with engine.connect() as connection:
            # Add value column to post_likes table
            connection.execute(text("ALTER TABLE post_likes ADD COLUMN value INT DEFAULT 1"))
            connection.commit()
            print("Successfully added value column to post_likes table")
    except Exception as e:
        print(f"Error adding value column: {e}")

if __name__ == "__main__":
    add_vote_value_column()