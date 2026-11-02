
def build_recommendations(profile: dict) -> list[dict]:
    skin_type = (profile.get("skin_type") or "your skin type").lower()
    hair_type = (profile.get("hair_type") or "your hair type").lower()
    style_preferences = (profile.get("style_preferences") or "").strip()
    budget = profile.get("budget")
    unknown_types = {"not sure", "unsure", "unknown", "your skin type", "your hair type"}
    skin_title = (
        "Simple skin-care basics"
        if skin_type in unknown_types
        else f"Simple routine for {skin_type} skin"
    )
    hair_title = (
        "Simple hair-care basics"
        if hair_type in unknown_types
        else f"Care routine for {hair_type} hair"
    )

    face_shape = (
        profile.get("face_shape") or "unknown"
    ).strip().lower()

    results = [
        {
            "category": "skin_care",
            "title": skin_title,
            "description": (
                "Consider a gentle cleanser, moisturizer, and "
                "daytime broad-spectrum sunscreen. Introduce new "
                "products gradually."
            ),
        },
        {
            "category": "hair_care",
            "title": hair_title,
            "description": (
                "Choose a wash and conditioning routine based on "
                "scalp comfort, hair texture, and styling habits."
            ),
        },
        {
            "category": "style",
            "title": (
                f"Ideas for {style_preferences.lower()} style"
                if style_preferences
                else "Personal style starter"
            ),
            "description": (
                "Start with versatile pieces in colors and fits you enjoy, "
                "then adapt by occasion and budget."
                if not style_preferences
                else (
                    f"Build on your {style_preferences.lower()} preference "
                    "with comfortable pieces that suit your occasions and budget."
                )
            ),
        },
    ]

    hairstyle_suggestions = {
        "oval": (
            "Try a textured crop, side part, or quiff. "
            "Many styles can work well, depending on your hair."
        ),
        "round": (
            "Consider a textured top with shorter sides or a "
            "side-swept style to add visual length."
        ),
        "round or square": (
            "Try a textured top or side part. Experiment with "
            "volume and proportions to find your preferred look."
        ),
        "square": (
            "Consider a textured crop, side part, or slightly "
            "longer layered style."
        ),
        "oblong": (
            "Try a side part, textured fringe, or a style with "
            "some width. Avoid adding too much height if you "
            "want to balance facial proportions."
        ),
        "heart": (
            "Consider a side-swept fringe or a medium-length "
            "layered style to balance the forehead and chin."
        ),
        "diamond": (
            "Try a textured fringe or a layered style with "
            "some fullness around the forehead."
        ),
        "round or oval": (
    "Try a textured crop, side part, or soft quiff. "
    "Experiment with volume to find a style you like."
),
    }

    beard_suggestions = {
        "oval": (
            "Experiment with light stubble, a short boxed beard, "
            "or a fuller beard that suits your growth pattern."
        ),
        "round": (
            "If you prefer a longer-looking profile, try a "
            "neatly shaped beard with slightly more length at "
            "the chin."
        ),
        "round or square": (
            "Try neat stubble or a short, shaped beard and adjust "
            "the cheek and neckline to your preference."
        ),
        "square": (
            "Try even stubble or a short beard with softly "
            "rounded edges if you want a less angular look."
        ),
        "oblong": (
            "Consider even stubble or a fuller beard at the "
            "sides rather than extra length at the chin."
        ),
        "heart": (
            "A short boxed beard or carefully maintained "
            "stubble may help create a balanced look."
        ),
        "diamond": (
            "Try even stubble or a short beard with balanced "
            "fullness along the jaw."
        ),
        "round or oval": (
    "Try neat stubble or a short, shaped beard. "
    "Adjust the cheek and neckline to suit your preference."
),
    }

    if face_shape in hairstyle_suggestions:
        results.append({
            "category": "hairstyle",
            "title": f"Hairstyle ideas for a {face_shape} face",
            "description": hairstyle_suggestions[face_shape],
        })

        results.append({
            "category": "beard",
            "title": f"Beard ideas for a {face_shape} face",
            "description": beard_suggestions[face_shape],
        })
    else:
        results.append({
            "category": "hairstyle",
            "title": "Find your hairstyle",
            "description": (
                "Complete face-shape analysis to get more "
                "personalized hairstyle suggestions."
            ),
        })

    if budget is not None:
        results.append({
            "category": "budget",
            "title": "Budget-aware planning",
            "description": (
                f"Use your stated budget of {budget:g} to "
                "prioritize essentials before optional products."
            ),
        })

    return results


def build_scan_recommendations(scan: dict) -> list[dict]:
    """Build cautious, non-diagnostic suggestions from user-confirmed scan labels."""
    preferences = scan.get("preferences") or {}
    face_shape = (scan.get("face_shape") or "").strip()
    hair_type = (scan.get("hair_type") or "").strip()
    skin_observations = [str(item).strip().lower() for item in scan.get("skin_observations", [])]
    hair_observations = [str(item).strip().lower() for item in scan.get("hair_observations", [])]
    posture_observations = [str(item).strip().lower() for item in scan.get("posture_observations", [])]
    body_profile = (scan.get("body_profile") or "").strip()

    profile = {
        "face_shape": face_shape or None,
        "hair_type": hair_type or None,
        "style_preferences": preferences.get("style"),
        "budget": preferences.get("budget"),
    }
    results = build_recommendations(profile)

    if any("acne" in item or "pimple" in item or "blemish" in item for item in skin_observations):
        results.insert(0, {
            "category": "skin_care",
            "title": "Possible blemish-prone areas",
            "ingredients": ["salicylic acid"],
            "description": (
                "If this matches your skin, consider a gentle salicylic-acid product "
                "according to its label. Introduce one new product at a time and stop "
                "if irritation occurs. Persistent, painful, or worsening breakouts "
                "deserve advice from a dermatologist."
            ),
        })
    elif any("oil" in item for item in skin_observations):
        results.insert(0, {
            "category": "skin_care",
            "title": "Possible excess-oil areas",
            "ingredients": ["niacinamide"],
            "description": (
                "Consider a gentle cleanser and a lightweight, non-comedogenic moisturizer. "
                "A niacinamide product may suit some people; introduce it gradually."
            ),
        })
    elif any("dry" in item or "flak" in item for item in skin_observations):
        results.insert(0, {
            "category": "skin_care",
            "title": "Possible dry or flaky areas",
            "ingredients": ["glycerin", "ceramides"],
            "description": (
                "Consider a gentle cleanser and a fragrance-free moisturizer with "
                "hydrating or barrier-supporting ingredients."
            ),
        })
    elif any("texture" in item or "uneven" in item for item in skin_observations):
        results.insert(0, {
            "category": "skin_care",
            "title": "Possible uneven texture",
            "ingredients": ["broad-spectrum sunscreen"],
            "description": (
                "Keep the routine gentle and use broad-spectrum sunscreen. Avoid adding "
                "several exfoliating products at once."
            ),
        })

    if hair_type and hair_type.lower() not in {"not sure", "unsure"}:
        results.append({
            "category": "hair_care",
            "title": f"Care ideas for {hair_type.lower()} hair",
            "description": (
                f"Choose products that work with your {hair_type.lower()} texture and "
                "adjust based on scalp comfort and how your hair responds."
            ),
        })

    if any("frizz" in item or "dry" in item for item in hair_observations):
        results.append({
            "category": "hair_care",
            "title": "Manageability and moisture",
            "description": "A conditioner or suitable leave-in product may help with dryness or frizz. Apply mainly to lengths and ends.",
        })

    if body_profile and body_profile.lower() not in {"not sure", "unsure"}:
        results.append({
            "category": "style",
            "title": "Fit ideas based on your selected proportions",
            "description": (
                f"Use your selected '{body_profile}' description as a styling reference. "
                "Try balanced fits, comfortable layers, and proportions you enjoy; "
                "the scan is not a judgment about your body."
            ),
        })

    if posture_observations and not all(item in {"neutral", "not sure", "unsure"} for item in posture_observations):
        results.append({
            "category": "posture",
            "title": "Posture awareness",
            "description": (
                "Try gentle posture awareness: relax your shoulders, keep the screen at eye level, "
                "and take movement breaks. Pain, numbness, weakness, or persistent discomfort "
                "should be discussed with a qualified healthcare professional."
            ),
        })

    return results
