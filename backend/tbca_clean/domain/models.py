from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any

@dataclass
class Nutrition100g:
    nome: str
    energia_kcal: Optional[float] = None
    carboidrato_total_g: Optional[float] = None
    proteina_g: Optional[float] = None
    lipidios_g: Optional[float] = None
    fibra_alimentar_g: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

NUTRI_FIELDS = [
    "energia_kcal",
    "carboidrato_total_g",
    "proteina_g",
    "lipidios_g",
    "fibra_alimentar_g",
]