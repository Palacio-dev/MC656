from tbca_clean.application.services import NutritionScraperService
from tbca_clean.infrastructure.tbca_scraper_playwright import TBCAScraperPlaywright
from tbca_clean.infrastructure.persistence import CsvRepository

def main():
    scraper = TBCAScraperPlaywright(headless=True)
    repo = CsvRepository()
    service = NutritionScraperService(scraper, repo)

    print("1) Teste rápido (5 frutas)\n2) Grupo específico\n3) Sair")
    ch = input("Escolha: ").strip()
    if ch == "1":
        alimentos = service.scrape_group("frutas", max_foods=5)
        service.save(alimentos, "teste_macros_frutas.csv")
    elif ch == "2":
        print("Grupos: frutas, vegetais, carnes, cereais, leguminosas, leite, acucares, gorduras, bebidas, pescados")
        g = input("Grupo: ").strip()
        raw = input("Máximo (vazio=todos): ").strip()
        n = int(raw) if raw.isdigit() else None
        alimentos = service.scrape_group(g, max_foods=n)
        service.save(alimentos, f"macros_{g.lower()}_tbca.csv")
    else:
        print("Saindo...")

if __name__ == "__main__":
    main()