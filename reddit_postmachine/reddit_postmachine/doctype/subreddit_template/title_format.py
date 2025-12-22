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
    """Title-format utilities extracted from subreddit_template.py."""

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
        
        ФІКС: Правильне виділення title_text з AI-заголовка без дублювання.
        
        Підхід:
        1. Якщо в заголовку є дефіси (" - "), беремо останній сегмент
        2. Інакше видаляємо тільки префікси (вік, тег, локація) з початку
        3. Ніколи не видаляємо з середини чи кінця заголовка
        """
        original = str(ai_title or "").strip()
        
        # Якщо в заголовку є дефіси (" - "), беремо останній сегмент
        # Це найнадійніший спосіб для формату з дефісами
        if re.search(r"\s[-–—]\s", original):
            # Розділити по дефісу і взяти останню частину
            parts = [part.strip() for part in re.split(r"\s[-–—]\s", original)]
            
            # Почати з останньої частини
            title_text_candidate = parts[-1] if parts else ""
            
            # Перевірити, чи остання частина не містить вік/тег/локацію на початку
            # Якщо містить - видалити тільки з початку
            if final_age and title_text_candidate.startswith(final_age):
                title_text_candidate = title_text_candidate[len(final_age):].strip()
            
            # Перевірити тег статі
            gender_prefixes = []
            if rendered_gender_tag:
                gender_prefixes = [
                    rendered_gender_tag,
                    f"[{rendered_gender_tag}]",
                    f"({rendered_gender_tag})",
                ]
            
            for prefix in gender_prefixes:
                if title_text_candidate.startswith(prefix):
                    title_text_candidate = title_text_candidate[len(prefix):].strip()
                    break
            
            # Перевірити локацію (з хештегом або без)
            if location_hashtag and title_text_candidate.startswith(f"#{location_hashtag}"):
                title_text_candidate = title_text_candidate[len(f"#{location_hashtag}"):].strip()
            elif final_location and title_text_candidate.lower().startswith(final_location.lower()):
                title_text_candidate = title_text_candidate[len(final_location):].strip()
            
            # Видалити зайві роздільники на початку
            title_text_candidate = re.sub(r"^[-–—:|]+\s*", "", title_text_candidate).strip()
            
            # Якщо результат виглядає осмисленим (не коротше 3 символів), повертаємо
            if title_text_candidate and len(title_text_candidate) >= 3:
                return title_text_candidate
        
        # Якщо не спрацював метод з дефісами або немає дефісів,
        # видаляємо відомі префікси тільки з початку рядка
        
        s = original
        
        # 1. Видалити вік з початку (тільки якщо він там є)
        if final_age and s.startswith(final_age):
            s = s[len(final_age):].strip()
        
        # 2. Видалити тег статі з початку (всі можливі варіанти)
        gender_prefixes_to_remove = []
        if rendered_gender_tag:
            # Варіанти тегу: [F4M], (F4M), F4M
            gender_prefixes_to_remove = [
                f"[{rendered_gender_tag}]",
                f"({rendered_gender_tag})",
                rendered_gender_tag,
            ]
        
        for prefix in gender_prefixes_to_remove:
            if s.startswith(prefix):
                s = s[len(prefix):].strip()
                break
        
        # 3. Видалити локацію з початку (якщо є)
        if location_hashtag and s.startswith(f"#{location_hashtag}"):
            s = s[len(f"#{location_hashtag}"):].strip()
        elif final_location and s.lower().startswith(final_location.lower()):
            s = s[len(final_location):].strip()
        
        # 4. Видалити зайві роздільники з початку
        s = re.sub(r"^[-–—:|]+\s*", "", s).strip()
        
        # 5. Якщо після видалення префіксів залишився заголовок,
        # який починається з віку (помилка AI), видаляємо його
        if re.match(r"^\d{1,2}\b", s):
            s = re.sub(r"^\d{1,2}\b\s*", "", s).strip()
        
        # 6. Запобігання поширеній помилці AI: "26 F4M 25 F4M текст"
        # Шукаємо патерн "вік F4M" двічі поспіль і видаляємо перший
        pattern = rf"^\d{{1,2}}\s+{re.escape(rendered_gender_tag) if rendered_gender_tag else '[A-Za-z0-9]{1,4}'}\s+\d{{1,2}}\s+"
        s = re.sub(pattern, "", s)
        
        return s