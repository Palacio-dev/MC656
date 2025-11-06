import time
from typing import List, Dict, Optional
from tbca_clean.domain.models import Nutrition100g

class NutritionScraperService:
    """Caso de uso: coleta e armazenamento de dados nutricionais."""

    def __init__(self, scraper, repo):
        """
        scraper: Adapter (infra) que implementa métodos:
            - list_group_items(group, max_items)
            - extract_item_100g(item)
        repo: Adapter para salvar (CSV, banco etc.)
        """
        self.scraper = scraper
        self.repo = repo

    def scrape_group(self, group: str, max_foods: Optional[int] = None) -> List[Dict]:
        items = self.scraper.list_group_items(group, max_foods)
        alimentos = []
        for i, item in enumerate(items, 1):
            n = self.scraper.extract_item_100g(item)
            alimentos.append(n.to_dict())
            time.sleep(self.scraper.detail_delay)
        return alimentos

    def save(self, alimentos: List[Dict], filename: str):
        self.repo.save(alimentos, filename)

#