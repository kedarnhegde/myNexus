# Create virtual environment
setup-venv:
	cd be && python -m venv .venv

# Install backend dependencies in virtual environment
install-be:
	cd be && source .venv/bin/activate && pip install -r requirements.txt

# Start FastAPI backend (with live reload)
run-be:
	cd be && source .venv/bin/activate && python -m uvicorn main:app --reload --port 8000

# Start Next.js dev server
run-fe:
	cd fe && npm run dev

# Install frontend dependencies
install-fe:
	cd fe && npm install

# Install all dependencies
install-all: setup-venv install-be install-fe

# Run both frontend and backend
dev:
	make run-be & make run-fe

# Setup MySQL database
setup-db:
	/opt/homebrew/bin/mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS nexus; CREATE USER IF NOT EXISTS 'nexus'@'localhost' IDENTIFIED BY 'NexusPass123!'; GRANT ALL PRIVILEGES ON nexus.* TO 'nexus'@'localhost'; FLUSH PRIVILEGES;"

# Migrate database to add category column
migrate-db:
	cd be && source .venv/bin/activate && python migrate_db.py

# Update existing posts with categories
update-posts:
	cd be && source .venv/bin/activate && python update_posts.py

# Seed database with sample data
seed:
	cd be && source .venv/bin/activate && python seed.py