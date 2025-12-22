from __future__ import annotations

import re


def extract_location_from_subreddit(subreddit_name: str | None, location: str | None = None) -> str | None:
    """
    Extract city/location from subreddit name.

    Compatible signature for `post_generator.py`, which may call this as:
      `extract_location_from_subreddit(template.sub, location=None)`

    If `location` is provided and non-empty, it takes precedence and is returned as-is.
    """
    if location:
        loc = str(location).strip()
        return loc or None

    if not subreddit_name:
        return None

    # Remove r/ prefix if present
    sub = str(subreddit_name).replace("r/", "").replace("R/", "").strip()

    # Strip common suffixes (r4r/personals/meetup/etc)
    sub = re.sub(r"(r4r|personals|meetup|dating|hookup)$", "", sub, flags=re.IGNORECASE).strip()
    if not sub:
        return None

    known_cities = {
        "newhaven": "New Haven",
        "newyork": "New York",
        "losangeles": "Los Angeles",
        "sanfrancisco": "San Francisco",
        "newjersey": "New Jersey",
        "northcarolina": "North Carolina",
        "southcarolina": "South Carolina",
    }

    sub_lower = sub.lower()
    if sub_lower in known_cities:
        return known_cities[sub_lower]

    # Split camelCase / PascalCase into words
    words = re.findall(r"[A-Z]?[a-z]+|[A-Z]+(?=[A-Z]|$)", sub)
    if words and len(words) > 1:
        return " ".join(word.capitalize() for word in words)

    # Attempt to split a long lowercase token into 2 parts
    if sub.islower() and len(sub) > 4:
        if len(sub) <= 6:
            return sub.capitalize()

        mid_point = len(sub) // 2
        for i in range(max(3, mid_point - 2), min(len(sub) - 2, mid_point + 3)):
            part1 = sub[:i].capitalize()
            part2 = sub[i:].capitalize()
            if len(part1) >= 3 and len(part2) >= 3:
                return f"{part1} {part2}"

    return sub.capitalize()


