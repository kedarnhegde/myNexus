from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, Club

Base.metadata.create_all(bind=engine)

def seed_clubs():
    db = SessionLocal()
    
    # Check if clubs already exist
    if db.query(Club).first():
        print("Clubs already exist in database")
        db.close()
        return
    
    clubs_data = [
        {"name": "Computer Science Club", "members": 245, "location": "Engineering Building", "category": "Academic", "description": "Join fellow CS students for coding competitions, tech talks, and networking events.", "url": "https://www.instagram.com/sdsu_cs_club/"},
        {"name": "Aztec Gaming Society", "members": 189, "location": "Student Union", "category": "Recreation", "description": "Gaming tournaments, LAN parties, and esports competitions for all skill levels.", "url": "https://www.instagram.com/aztecgamingsociety/"},
        {"name": "Business Student Association", "members": 312, "location": "Business Administration Building", "category": "Academic", "description": "Professional development, networking events, and career workshops for business students.", "url": "https://business.sdsu.edu/student-life/student-organizations"},
        {"name": "Associated Students", "members": 850, "location": "Student Union", "category": "Government", "description": "Student government representing the voice of SDSU students in university decisions.", "url": "https://as.sdsu.edu/"},
        {"name": "Alpha Phi Omega", "members": 156, "location": "Greek Life Office", "category": "Service", "description": "National co-ed service fraternity focused on leadership, friendship, and service.", "url": "https://www.instagram.com/apo_sdsu/"},
        {"name": "Aztec Robotics", "members": 78, "location": "Engineering Building", "category": "Academic", "description": "Design and build robots for competitions while learning engineering principles.", "url": "https://www.instagram.com/aztecrobotics/"},
        {"name": "Black Student Union", "members": 234, "location": "Conrad Prebys Student Union", "category": "Cultural", "description": "Promoting unity, academic excellence, and cultural awareness among Black students.", "url": "https://www.instagram.com/bsu_sdsu/"},
        {"name": "Chemistry Club", "members": 92, "location": "Chemistry Building", "category": "Academic", "description": "Explore chemistry beyond the classroom through experiments and industry connections.", "url": "https://chemistry.sdsu.edu/student-life"},
        {"name": "Dance Marathon", "members": 445, "location": "Recreation Center", "category": "Service", "description": "Annual fundraising event supporting local children hospitals through dance.", "url": "https://www.instagram.com/sdsudm/"},
        {"name": "Engineering Student Council", "members": 198, "location": "Engineering Building", "category": "Academic", "description": "Representing engineering students and organizing professional development events.", "url": "https://engineering.sdsu.edu/student-life"},
        {"name": "Film Society", "members": 167, "location": "Arts & Letters Building", "category": "Arts", "description": "Create, screen, and discuss films while building connections in the entertainment industry.", "url": "https://www.instagram.com/sdsufilmsociety/"},
        {"name": "Hiking Club", "members": 203, "location": "Recreation Center", "category": "Recreation", "description": "Explore San Diego beautiful trails and outdoor adventures with fellow students.", "url": "https://www.instagram.com/sdsuhikingclub/"},
        {"name": "International Student Association", "members": 278, "location": "International Student Center", "category": "Cultural", "description": "Supporting international students and promoting cultural exchange on campus.", "url": "https://www.instagram.com/sdsu_isa/"},
        {"name": "Marketing Club", "members": 189, "location": "Business Administration Building", "category": "Academic", "description": "Connect with marketing professionals and gain real-world experience in the field.", "url": "https://www.instagram.com/sdsumarketingclub/"},
        {"name": "Nursing Student Association", "members": 156, "location": "Nursing Building", "category": "Academic", "description": "Supporting nursing students through mentorship and professional development.", "url": "https://nursing.sdsu.edu/student-life"},
        {"name": "Outdoor Adventures", "members": 234, "location": "Recreation Center", "category": "Recreation", "description": "Rock climbing, surfing, camping, and other outdoor activities around San Diego.", "url": "https://www.instagram.com/sdsuoutdooradventures/"},
        {"name": "Pre-Med Society", "members": 298, "location": "Life Sciences Building", "category": "Academic", "description": "Preparing students for medical school through mentorship and volunteer opportunities.", "url": "https://www.instagram.com/sdsupremed/"},
        {"name": "Surf Club", "members": 123, "location": "Recreation Center", "category": "Recreation", "description": "Learn to surf or improve your skills at San Diego world-class beaches.", "url": "https://www.instagram.com/sdsusurfclub/"},
        {"name": "Theatre Arts Society", "members": 89, "location": "Don Powell Theatre", "category": "Arts", "description": "Participate in theatrical productions and develop performance skills.", "url": "https://www.instagram.com/sdsu_theatre/"},
        {"name": "Volunteer Center", "members": 456, "location": "Student Life Pavilion", "category": "Service", "description": "Coordinating volunteer opportunities to serve the San Diego community.", "url": "https://studentlife.sdsu.edu/volunteer-center"}
    ]
    
    for club_data in clubs_data:
        club = Club(**club_data)
        db.add(club)
    
    db.commit()
    print(f"Successfully seeded {len(clubs_data)} clubs")
    db.close()

if __name__ == "__main__":
    seed_clubs()