from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Club

router = APIRouter()

@router.get("/clubs/")
def get_clubs(db: Session = Depends(get_db)):
    clubs = db.query(Club).all()
    return clubs

@router.post("/clubs/")
def create_club(name: str, members: int, location: str, category: str, description: str, url: str, db: Session = Depends(get_db)):
    club = Club(name=name, members=members, location=location, category=category, description=description, url=url)
    db.add(club)
    db.commit()
    db.refresh(club)
    return club