import logging, re
from urllib.parse import urlencode
from typing import List, Dict, Optional
from playwright.sync_api import sync_playwright
from tbca_clean.domain.models import Nutrition100g
from tbca_clean.domain.utils import norm, number_in

BASE_URL = "https://www.tbca.net.br"
SEARCH_PATH = "/base-dados/composicao_alimentos.php"

GROUPS_MAP = {
    'frutas': 'FRUTAS E DERIVADOS', 'vegetais': 'VEGETAIS E DERIVADOS',
    'carnes': 'CARNES E DERIVADOS', 'cereais': 'CEREAIS E DERIVADOS',
    'leguminosas': 'LEGUMINOSAS E DERIVADOS', 'leite': 'LEITE E DERIVADOS',
    'acucares': 'AÇÚCARES E DOCES', 'gorduras': 'GORDURAS E ÓLEOS',
    'bebidas': 'BEBIDAS', 'pescados': 'PESCADOS E FRUTOS DO MAR'
}

class TBCAScraperPlaywright:
    def __init__(self, headless=True):
        self.headless = headless
        self.page_delay = 0.6
        self.detail_delay = 0.5
        logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
        self.logger = logging.getLogger(__name__)

    def _open_browser(self):
        p = sync_playwright().start()
        browser = p.chromium.launch(headless=self.headless)
        page = browser.new_page()
        return p, browser, page

    @staticmethod
    def _abs_href(href: Optional[str]) -> Optional[str]:
        if not href: return None
        href = href.strip()
        if href.startswith(("javascript:", "#")): return None
        if href.startswith(("http://", "https://")): return href
        if href.startswith("int_composicao_alimentos.php") or href.startswith("composicao_medidas_caseiras.php"):
            return f"{BASE_URL}/base-dados/{href}"
        if href.startswith("/"): return f"{BASE_URL}{href}"
        if href.startswith("base-dados/"): return f"{BASE_URL}/{href}"
        return f"{BASE_URL}/{href.lstrip('/')}"

    # === Métodos públicos usados pelo caso de uso ===
    def list_group_items(self, group_name: str, max_items: Optional[int]) -> List[Dict[str, str]]:
        p, browser, page = self._open_browser()
        try:
            group_param = GROUPS_MAP.get(group_name.lower(), group_name.upper())
            url = f"{BASE_URL}{SEARCH_PATH}?{urlencode({'grupo': group_param})}"
            self.logger.info("Abrindo listagem: %s", url)
            page.goto(url, wait_until="networkidle")

            rows = page.locator("table tr").all()
            out = []
            for r in rows:
                tds = r.locator("td,th").all()
                if len(tds) < 2: continue
                code = tds[0].inner_text().strip()
                name = tds[1].inner_text().strip()
                if not code.startswith("BRC") or not name: continue

                anchors = tds[0].locator("a").all()
                href = None
                if anchors:
                    raw = anchors[0].get_attribute("href")
                    href = self._abs_href(raw)
                    if not href:
                        oc = anchors[0].get_attribute("onclick") or ""
                        m = re.search(r"['\"](.*?composicao_.*?\.php[^'\"]*)['\"]", oc) \
                            or re.search(r"['\"](.*?int_composicao_alimentos\.php[^'\"]*)['\"]", oc)
                        href = self._abs_href(m.group(1)) if m else None

                out.append({"codigo": code, "nome": name, "href": href})
                if max_items and len(out) >= max_items:
                    break
            return out
        finally:
            browser.close(); p.stop()

    def extract_item_100g(self, item: Dict[str, str]) -> Nutrition100g:
        nome, href = item["nome"], item.get("href")
        data = Nutrition100g(nome=nome)
        if not href:
            self.logger.warning("Sem href real para %s", nome)
            return data

        p, browser, page = self._open_browser()
        try:
            self.logger.info("Abrindo detalhe: %s", href)
            page.goto(href, wait_until="networkidle")

            tbls = page.locator("table").all()
            target, vcol = None, 2
            for t in tbls:
                head_text = norm(t.inner_text()[:800])
                if "valor por 100 g" in head_text or "valor por 100g" in head_text:
                    target = t
                    hdr_cells = t.locator("tr >> nth=0").locator("th,td").all()
                    for i, c in enumerate(hdr_cells):
                        h = norm(c.inner_text())
                        if "valor por 100 g" in h or "valor por 100g" in h:
                            vcol = i; break
                    break
            if not target:
                self.logger.warning("Tabela 100g não encontrada para %s", nome)
                return data

            for r in target.locator("tr").all():
                cells = r.locator("td,th").all()
                if len(cells) < vcol+1: continue
                rotulo = norm(cells[0].inner_text())
                unidade = norm(cells[1].inner_text())
                valor = number_in(cells[vcol].inner_text())
                if valor is None: continue

                if "energia" in rotulo and unidade == "kcal":
                    data.energia_kcal = valor
                elif "carboidrato" in rotulo and "total" in rotulo and unidade == "g":
                    data.carboidrato_total_g = valor
                elif rotulo == "carboidrato" and unidade == "g" and data.carboidrato_total_g is None:
                    data.carboidrato_total_g = valor
                elif "proteina" in rotulo and unidade == "g":
                    data.proteina_g = valor
                elif ("lipidios" in rotulo or "lipideos" in rotulo) and unidade == "g":
                    data.lipidios_g = valor
                elif "fibra alimentar" in rotulo and unidade == "g":
                    data.fibra_alimentar_g = valor
        finally:
            browser.close(); p.stop()
        return data