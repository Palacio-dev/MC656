import re, unicodedata, string
from typing import Optional

_PUNCT = str.maketrans("", "", string.punctuation)

def norm(s: str) -> str:
    s = (s or "").lower().strip()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = s.translate(_PUNCT)
    return re.sub(r"\s+", " ", s)

def number_in(text: str) -> Optional[float]:
    m = re.findall(r"\d+[,.]?\d*", text or "")
    return float(m[0].replace(",", ".")) if m else None