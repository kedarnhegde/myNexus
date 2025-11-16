from sqlalchemy import text
from database import engine

def add_category_column():
    try:
        with engine.connect() as connection:
            # Add category column to posts table
            connection.execute(text("ALTER TABLE posts ADD COLUMN category VARCHAR(50) DEFAULT 'general'"))
            connection.commit()
            print("Successfully added category column to posts table")
    except Exception as e:
        print(f"Error adding category column: {e}")

if __name__ == "__main__":
    add_category_column()