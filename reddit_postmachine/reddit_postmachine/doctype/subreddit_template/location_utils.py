from __future__ import annotations

import re


class SubredditLocationExtractor:
    """
    Extract a clean location name from a subreddit string.

    Logic:
    - First, try to match known states/cities by substring (priority list).
    - Otherwise, remove "ignore words" like r4r/dirty/etc and return a best-effort fallback.
    """
    # 1) Priority list of known places (US states + a few major cities)
    KNOWN_PLACES: dict[str, str] = {
        # US states
        "alabama": "Alabama",
        "alaska": "Alaska",
        "arizona": "Arizona",
        "arkansas": "Arkansas",
        "california": "California",
        "colorado": "Colorado",
        "connecticut": "Connecticut",
        "delaware": "Delaware",
        "florida": "Florida",
        "georgia": "Georgia",
        "hawaii": "Hawaii",
        "idaho": "Idaho",
        "illinois": "Illinois",
        "indiana": "Indiana",
        "iowa": "Iowa",
        "kansas": "Kansas",
        "kentucky": "Kentucky",
        "louisiana": "Louisiana",
        "maine": "Maine",
        "maryland": "Maryland",
        "massachusetts": "Massachusetts",
        "michigan": "Michigan",
        "minnesota": "Minnesota",
        "mississippi": "Mississippi",
        "missouri": "Missouri",
        "montana": "Montana",
        "nebraska": "Nebraska",
        "nevada": "Nevada",
        "newhampshire": "New Hampshire",
        "newjersey": "New Jersey",
        "newmexico": "New Mexico",
        "newyork": "New York",
        "northcarolina": "North Carolina",
        "northdakota": "North Dakota",
        "ohio": "Ohio",
        "oklahoma": "Oklahoma",
        "oregon": "Oregon",
        "pennsylvania": "Pennsylvania",
        "rhodeisland": "Rhode Island",
        "southcarolina": "South Carolina",
        "southdakota": "South Dakota",
        "tennessee": "Tennessee",
        "texas": "Texas",
        "utah": "Utah",
        "vermont": "Vermont",
        "virginia": "Virginia",
        "washington": "Washington",
        "westvirginia": "West Virginia",
        "wisconsin": "Wisconsin",
        "wyoming": "Wyoming",
        # Major cities (extend as needed)
        "nyc": "New York",
        "losangeles": "Los Angeles",
        "chicago": "Chicago",
        "houston": "Houston",
        "phoenix": "Phoenix",
        "philadelphia": "Philadelphia",
        "sanantonio": "San Antonio",
        "sandiego": "San Diego",
        "dallas": "Dallas",
        "sanjose": "San Jose",
        "austin": "Austin",
        "jacksonville": "Jacksonville",
        "pensacola": "Pensacola",
        "sf": "San Francisco",
        "sanfrancisco": "San Francisco",
        "seattle": "Seattle",
        "denver": "Denver",
        "boston": "Boston",
        "vegas": "Las Vegas",
        "lasvegas": "Las Vegas",
        "miami": "Miami",
        "atlanta": "Atlanta",
        "tampa": "Tampa",
        "london": "London",
        "toronto": "Toronto",
        "vancouver": "Vancouver",
        "sydney": "Sydney",
        "melbourne": "Melbourne",
    }

    # 2) Words to strip out when using fallback cleanup mode
    IGNORE_WORDS: tuple[str, ...] = (
        "r4r",
        "dirty",
        "singles",
        "personals",
        "hookup",
        "dating",
        "meetup",
        "gw",
        "gonewild",
        "nsfw",
        "only",
        "nude",
        "sex",
        "casual",
        "affair",
        "afterdark",
    )

    @classmethod
    def extract(cls, subreddit_name: str | None, location: str | None = None) -> str | None:
        # NOTE: `location` arg is kept for backwards compatibility with old signature.
        if not subreddit_name:
            return None

        raw_sub = str(subreddit_name).lower().replace("r/", "").strip()

        # Priority match: any known place substring
        for key, proper_name in cls.KNOWN_PLACES.items():
            if key in raw_sub:
                return proper_name

        # Fallback cleanup
        clean_name = raw_sub
        for word in cls.IGNORE_WORDS:
            clean_name = clean_name.replace(word, "")
        clean_name = clean_name.strip()

        if len(clean_name) < 3:
            return raw_sub.capitalize()

        # Keep the historical behavior: attempt to split CamelCase (unused output),
        # then return capitalized cleaned string.
        _ = re.findall(r"[A-Z]?[a-z]+|[A-Z]+(?=[A-Z]|$)", str(subreddit_name))

        return clean_name.capitalize()


def extract_location_from_subreddit(subreddit_name: str | None, location: str | None = None) -> str | None:
    """Backwards-compatible function wrapper."""
    return SubredditLocationExtractor.extract(subreddit_name, location=location)


