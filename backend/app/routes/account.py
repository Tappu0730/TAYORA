import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models import AccountProfile, SavedLook, User, WardrobeItem
from app.schemas_account import AccountProfileInput, SavedLookInput, WardrobeItemInput
from app.security import get_current_user, get_db

router = APIRouter(prefix="/api", tags=["Account data"])


def profile_payload(profile: AccountProfile | None) -> dict:
    if profile is None:
        return {}
    return {
        "age": profile.age,
        "gender": profile.gender,
        "skin_type": profile.skin_type,
        "hair_type": profile.hair_type,
        "face_shape": profile.face_shape,
        "concerns": profile.concerns,
        "style_preferences": profile.style_preferences,
        "budget": profile.budget,
    }


@router.get("/profile/me")
def get_my_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(AccountProfile).filter(AccountProfile.user_id == user.id).first()
    return {"profile": profile_payload(profile)}


@router.put("/profile/me")
def save_my_profile(
    profile_input: AccountProfileInput,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(AccountProfile).filter(AccountProfile.user_id == user.id).first()
    if profile is None:
        profile = AccountProfile(user_id=user.id)
        db.add(profile)
    for field, value in profile_input.model_dump().items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return {"profile": profile_payload(profile)}


def wardrobe_payload(item: WardrobeItem) -> dict:
    return {
        "id": item.id,
        "name": item.name,
        "category": item.category,
        "colour": item.colour,
        "occasion": item.occasion,
    }


@router.get("/wardrobe")
def get_wardrobe(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(WardrobeItem).filter(WardrobeItem.user_id == user.id).order_by(WardrobeItem.id.desc()).all()
    return {"items": [wardrobe_payload(item) for item in items]}


@router.post("/wardrobe")
def add_wardrobe_item(
    item_input: WardrobeItemInput,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = WardrobeItem(user_id=user.id, **item_input.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"item": wardrobe_payload(item)}


@router.delete("/wardrobe/{item_id}")
def delete_wardrobe_item(
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(WardrobeItem).filter(WardrobeItem.id == item_id, WardrobeItem.user_id == user.id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Wardrobe item not found.")
    db.delete(item)
    db.commit()
    return {"deleted": True}


def saved_look_payload(look: SavedLook) -> dict:
    try:
        preferences = json.loads(look.preferences_json or "null")
    except json.JSONDecodeError:
        preferences = None
    return {
        "id": look.id,
        "title": look.title,
        "description": look.description,
        "details": look.details,
        "preferences": preferences,
    }


@router.get("/looks")
def get_saved_looks(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    looks = db.query(SavedLook).filter(SavedLook.user_id == user.id).order_by(SavedLook.id.desc()).all()
    return {"looks": [saved_look_payload(look) for look in looks]}


@router.post("/looks")
def save_look(
    look_input: SavedLookInput,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    duplicate = db.query(SavedLook).filter(
        SavedLook.user_id == user.id,
        SavedLook.title == look_input.title,
        SavedLook.details == look_input.details,
    ).first()
    if duplicate:
        return {"look": saved_look_payload(duplicate), "already_saved": True}
    look = SavedLook(
        user_id=user.id,
        title=look_input.title,
        description=look_input.description,
        details=look_input.details,
        preferences_json=json.dumps(look_input.preferences) if look_input.preferences is not None else None,
    )
    db.add(look)
    db.commit()
    db.refresh(look)
    return {"look": saved_look_payload(look), "already_saved": False}


@router.delete("/looks/{look_id}")
def delete_saved_look(
    look_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    look = db.query(SavedLook).filter(SavedLook.id == look_id, SavedLook.user_id == user.id).first()
    if look is None:
        raise HTTPException(status_code=404, detail="Saved look not found.")
    db.delete(look)
    db.commit()
    return {"deleted": True}
