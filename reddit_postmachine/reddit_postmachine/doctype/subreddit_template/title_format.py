from __future__ import annotations

import re
from dataclasses import dataclass
  

def strip_outer_wrappers(text: str) -> str:
    """Strip ONE pair of outer [] or () if present."""
    if not isinstance(text, str):
        text = str(text or "")
    s = text.strip()
    if len(s) >= 2 and ((s[0] == "[" and s[-1] == "]") or (s[0] == "(" and s[-1] == ")")):
        return s[1:-1].strip()
    return s


def sanitize_hashtag_token(text: str) -> str:
    """
    Convert a location like 'Lake Nona' or 'New Haven' into 'LakeNona' / 'NewHaven'.
    Keeps only alphanumerics per token, CamelCases tokens, then joins.
    """
    if not text:
        return ""
    if not isinstance(text, str):
        text = str(text)
    parts = re.split(r"\s+", text.strip())
    cleaned: list[str] = []
    for p in parts:
        p2 = re.sub(r"[^0-9A-Za-z]+", "", p)
        if not p2:
            continue
        cleaned.append(p2[:1].upper() + p2[1:])
    return "".join(cleaned)


@dataclass(frozen=True)
class TitleFormatRequirements:
    has_format: bool
    wants_age: bool
    wants_gender_tag: bool
    wants_title_text: bool
    wants_city_hashtag: bool
    wants_location_hashtag: bool
    wants_city_plain: bool
    wants_location_plain: bool
    uses_square_brackets_for_gender: bool
    uses_parentheses_for_gender: bool
    allows_square_brackets: bool
    allows_parentheses: bool
    wants_any_location: bool

    @classmethod
    def from_template(cls, title_format_template: str) -> "TitleFormatRequirements":
        """
        Derive requirements from Subreddit Template `title_format`.

        Supported placeholders (per DocType description):
          {age}, {gender_tag}, {city}, {city_full}, {location}, {location_full}, {title_text}
        """
        fmt = (title_format_template or "").strip()
        base = {
            "has_format": bool(fmt),
            "wants_age": "{age}" in fmt,
            "wants_gender_tag": "{gender_tag}" in fmt,
            "wants_title_text": "{title_text}" in fmt,
            "wants_city_hashtag": ("#{city}" in fmt) or ("# {city}" in fmt),
            "wants_location_hashtag": ("#{location}" in fmt) or ("# {location}" in fmt),
            "wants_city_plain": ("{city_full}" in fmt) or ("{city}" in fmt and "#" not in fmt),
            "wants_location_plain": ("{location_full}" in fmt) or ("{location}" in fmt and "#" not in fmt),
            "uses_square_brackets_for_gender": "[{gender_tag}]" in fmt,
            "uses_parentheses_for_gender": "({gender_tag})" in fmt,
            "allows_square_brackets": ("[" in fmt and "]" in fmt),
            "allows_parentheses": ("(" in fmt and ")" in fmt),
        }
        wants_any_location = any(
            [
                base["wants_city_hashtag"],
                base["wants_location_hashtag"],
                base["wants_city_plain"],
                base["wants_location_plain"],
                "{city}" in fmt,
                "{location}" in fmt,
            ]
        )
        return cls(**base, wants_any_location=wants_any_location)


class TitleFormatter:
    """Title-format utilities extracted from `subreddit_template.py`."""

    @staticmethod
    def render(
        title_format_template: str,
        *,
        age: str,
        gender_tag: str,
        city: str,
        city_full: str,
        location: str,
        location_full: str,
        title_text: str,
    ) -> str:
        """Simple, safe placeholder replacement (no `.format()` to avoid brace surprises)."""
        out = (title_format_template or "").strip()
        out = out.replace("{age}", age or "")
        out = out.replace("{gender_tag}", gender_tag or "")
        out = out.replace("{city}", city or "")
        out = out.replace("{city_full}", city_full or "")
        out = out.replace("{location}", location or "")
        out = out.replace("{location_full}", location_full or "")
        out = out.replace("{title_text}", title_text or "")
        out = re.sub(r"\s{2,}", " ", out).strip()
        return out

    @staticmethod
    def extract_title_text_from_ai_title(
        ai_title: str,
        *,
        final_age: str,
        rendered_gender_tag: str,
        location_hashtag: str,
        final_location: str,
        wants_age: bool,
        wants_location: bool,
    ) -> str:
        """
        Heuristic: strip known prefix components and separators, return the remaining "title_text".
        """
        s = str(ai_title or "").strip()

        # Always strip common leading "format parts" so {title_text} doesn't duplicate them when we rebuild.
        if final_age:
            s = re.sub(rf"^\s*{re.escape(final_age)}\s*", "", s)
        if rendered_gender_tag:
            s = re.sub(rf"^\s*{re.escape(rendered_gender_tag)}\s*", "", s)
            # Also handle bracket/parenthesis variants if we passed a bare tag
            s = re.sub(rf"^\s*\[{re.escape(rendered_gender_tag)}\]\s*", "", s)
            s = re.sub(rf"^\s*\({re.escape(rendered_gender_tag)}\)\s*", "", s)
        if location_hashtag:
            s = re.sub(rf"^\s*#\s*{re.escape(location_hashtag)}\b\s*", "", s)
        if final_location:
            s = re.sub(rf"^\s*{re.escape(final_location)}\b\s*", "", s, flags=re.IGNORECASE)

        # If template does NOT want age/location, also remove them anywhere they appear.
        if not wants_age and final_age:
            s = re.sub(rf"\b{re.escape(final_age)}\b", " ", s)
        if not wants_location:
            if location_hashtag:
                s = re.sub(rf"\s*#\s*{re.escape(location_hashtag)}\b", " ", s)
            if final_location:
                s = re.sub(rf"\b{re.escape(final_location)}\b", " ", s, flags=re.IGNORECASE)

        # Strip common separators at the start after removals
        s = s.strip()
        s = re.sub(r"^[-–—:|]+\s*", "", s).strip()
        s = re.sub(r"\s{2,}", " ", s).strip()

        # Prevent "double formatting" inside {title_text}:
        # If the AI starts its own title with something like "25 #Baltimore - ...", strip that leading pattern.
        # We keep this conservative: only strip the number if it's followed by a formatting token (#, brackets, dash, etc.).
        for _ in range(5):
            before = s
            s = s.strip()
            s = re.sub(r"^[-–—:|]+\s*", "", s)

            # Strip a leading age number ONLY if it looks like a format prefix (e.g. "25 #City -", "25 -", "25 [F4M]")
            s = re.sub(r"^\s*\d{1,2}\s+(?=(#|\[|\(|[-–—:|]))", "", s)

            # Strip compact age+gender prefixes inside title_text, e.g. "25F Flirt..." / "30M Hey..." / "22F4M ..."
            # We only strip if followed by whitespace to reduce accidental removals.
            s = re.sub(r"^\s*\d{1,2}\s*[FfMmTt]\b\s+", "", s)
            s = re.sub(r"^\s*\d{1,2}\s*[FfMm][0-9]?[A-Za-z]{0,3}\b\s+", "", s)
            # Strip spaced age+gender prefixes, e.g. "25 F4M ..." / "25 r4r ..." / "25 [F4M] ..."
            s = re.sub(r"^\s*\d{1,2}\s+\[?(?:[Rr]4[Rr]|[FfMm][0-9]?[A-Za-z]{0,3})\]?\b\s*", "", s)

            # Strip a leading hashtag ONLY if it looks like a format prefix (e.g. "#Baltimore - ...")
            s = re.sub(r"^\s*#\s*[A-Za-z0-9_]+\s*(?=([-–—:|]))", "", s)

            # Strip gender token again if it drifted to the front after the above removals
            if rendered_gender_tag:
                s = re.sub(rf"^\s*{re.escape(rendered_gender_tag)}\s*", "", s)
                s = re.sub(rf"^\s*\[{re.escape(rendered_gender_tag)}\]\s*", "", s)
                s = re.sub(rf"^\s*\({re.escape(rendered_gender_tag)}\)\s*", "", s)

            # Clean separators again
            s = s.strip()
            s = re.sub(r"^[-–—:|]+\s*", "", s).strip()
            s = re.sub(r"\s{2,}", " ", s).strip()

            if s == before:
                break

        # If location is forbidden, remove dangling prepositions left after stripping the location token
        if not wants_location:
            s = re.sub(r"\b(in|from|at|near|around)\s*$", "", s, flags=re.IGNORECASE).strip()

        return s


