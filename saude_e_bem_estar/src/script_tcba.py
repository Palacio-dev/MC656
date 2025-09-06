import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import re
import logging

class TBCAScraper:
    def __init__(self):
        self.base_url = "https://www.tbca.net.br"
        self.search_url = f"{self.base_url}/base-dados/composicao_alimentos.php"
        self.detail_url = f"{self.base_url}/base-dados/int_composicao_alimentos.php"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)
        
        self.alimentos = []
    
    def get_page(self, url, params=None):
        """Faz requisição com retry"""
        for attempt in range(3):
            try:
                response = self.session.get(url, params=params, timeout=10)
                response.raise_for_status()
                return response
            except Exception as e:
                if attempt == 2:
                    raise
                time.sleep(2)
    
    def get_food_codes(self, max_pages=None):
        """Coleta códigos de todos os alimentos"""
        codes = []
        page = 1
        
        while max_pages is None or page <= max_pages:
            self.logger.info(f"Coletando códigos - Página {page}")
            
            try:
                params = {'pagina': page} if page > 1 else {}
                response = self.get_page(self.search_url, params)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Encontrar códigos na tabela
                page_codes = []
                rows = soup.find_all('tr')
                
                for row in rows:
                    cols = row.find_all(['td', 'th'])
                    if len(cols) >= 2:
                        code = cols[0].get_text(strip=True)
                        name = cols[1].get_text(strip=True)
                        
                        # Verificar se é um código válido (formato BRC...)
                        if code.startswith('BRC') and name:
                            page_codes.append({'codigo': code, 'nome': name})
                
                if not page_codes:
                    break
                
                codes.extend(page_codes)
                self.logger.info(f"Encontrados {len(page_codes)} alimentos na página {page}")
                
                page += 1
                time.sleep(1)
                
            except Exception as e:
                self.logger.error(f"Erro na página {page}: {e}")
                break
        
        self.logger.info(f"Total de alimentos coletados: {len(codes)}")
        return codes
    
    def extract_nutrition_100g(self, food_code, food_name):
        """Extrai dados nutricionais para 100g"""
        try:
            params = {'cod_produto': food_code}
            response = self.get_page(self.detail_url, params=params)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Dados que queremos extrair
            nutrition_data = {
                'nome': food_name,
                'energia_kcal': None,
                'carboidrato_total_g': None,
                'proteina_g': None,
                'lipidios_g': None,
                'fibra_alimentar_g': None
            }
            
            # Procurar nas tabelas
            tables = soup.find_all('table')
            
            for table in tables:
                rows = table.find_all('tr')
                
                for row in rows:
                    cols = row.find_all(['td', 'th'])
                    
                    if len(cols) >= 3:  # Nutriente, Unidade, Valor
                        nutrient = cols[0].get_text(strip=True).lower()
                        unit = cols[1].get_text(strip=True).lower()
                        value = cols[2].get_text(strip=True)
                        
                        # Extrair apenas números (incluindo decimais)
                        value_clean = re.findall(r'\d+[,.]?\d*', value)
                        if value_clean:
                            value_num = value_clean[0].replace(',', '.')
                            
                            # Mapear nutrientes
                            if 'energia' in nutrient and 'kcal' in unit:
                                nutrition_data['energia_kcal'] = value_num
                            elif 'carboidrato total' in nutrient and 'g' in unit:
                                nutrition_data['carboidrato_total_g'] = value_num
                            elif 'proteína' in nutrient and 'g' in unit:
                                nutrition_data['proteina_g'] = value_num
                            elif 'lipídios' in nutrient and 'g' in unit:
                                nutrition_data['lipidios_g'] = value_num
                            elif 'fibra alimentar' in nutrient and 'g' in unit:
                                nutrition_data['fibra_alimentar_g'] = value_num
            
            return nutrition_data
            
        except Exception as e:
            self.logger.error(f"Erro ao extrair nutrição de {food_code}: {e}")
            return {
                'nome': food_name,
                'energia_kcal': None,
                'carboidrato_total_g': None,
                'proteina_g': None,
                'lipidios_g': None,
                'fibra_alimentar_g': None
            }
    
    def scrape_all_nutrition(self, max_foods=None, delay=2):
        """Extrai dados nutricionais de todos os alimentos"""
        self.logger.info("Iniciando coleta de dados nutricionais...")
        
        # Coletar códigos
        food_codes = self.get_food_codes()
        
        if max_foods:
            food_codes = food_codes[:max_foods]
        
        # Processar cada alimento
        for i, food in enumerate(food_codes, 1):
            self.logger.info(f"Processando {i}/{len(food_codes)}: {food['nome']}")
            
            nutrition = self.extract_nutrition_100g(food['codigo'], food['nome'])
            self.alimentos.append(nutrition)
            
            time.sleep(delay)
        
        return self.alimentos
    
    def scrape_group_nutrition(self, group_name, max_foods=None, delay=2):
        """Extrai dados de um grupo específico"""
        self.logger.info(f"Coletando dados do grupo: {group_name}")
        
        groups_map = {
            'frutas': 'FRUTAS E DERIVADOS',
            'vegetais': 'VEGETAIS E DERIVADOS',
            'carnes': 'CARNES E DERIVADOS',
            'cereais': 'CEREAIS E DERIVADOS',
            'leguminosas': 'LEGUMINOSAS E DERIVADOS',
            'leite': 'LEITE E DERIVADOS',
            'acucares': 'AÇÚCARES E DOCES',
            'gorduras': 'GORDURAS E ÓLEOS',
            'bebidas': 'BEBIDAS',
            'pescados': 'PESCADOS E FRUTOS DO MAR'
        }
        
        group_param = groups_map.get(group_name.lower(), group_name.upper())
        
        try:
            params = {'grupo': group_param}
            response = self.get_page(self.search_url, params=params)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Coletar códigos do grupo
            food_codes = []
            rows = soup.find_all('tr')
            
            for row in rows:
                cols = row.find_all(['td', 'th'])
                if len(cols) >= 2:
                    code = cols[0].get_text(strip=True)
                    name = cols[1].get_text(strip=True)
                    
                    if code.startswith('BRC') and name:
                        food_codes.append({'codigo': code, 'nome': name})
            
            if max_foods:
                food_codes = food_codes[:max_foods]
            
            self.logger.info(f"Encontrados {len(food_codes)} alimentos do grupo {group_name}")
            
            # Processar cada alimento
            for i, food in enumerate(food_codes, 1):
                self.logger.info(f"Processando {i}/{len(food_codes)}: {food['nome']}")
                
                nutrition = self.extract_nutrition_100g(food['codigo'], food['nome'])
                self.alimentos.append(nutrition)
                
                time.sleep(delay)
            
            return self.alimentos
            
        except Exception as e:
            self.logger.error(f"Erro ao buscar grupo {group_name}: {e}")
            return []
    
    def save_to_csv(self, filename='macronutrientes_tbca.csv'):
        """Salva dados em CSV"""
        if not self.alimentos:
            self.logger.warning("Nenhum dado para salvar!")
            return False
        
        try:
            df = pd.DataFrame(self.alimentos)
            
            # Converter valores para float onde possível
            numeric_cols = ['energia_kcal', 'carboidrato_total_g', 'proteina_g', 'lipidios_g', 'fibra_alimentar_g']
            for col in numeric_cols:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            
            # Salvar
            df.to_csv(filename, index=False, encoding='utf-8', sep=';')
            self.logger.info(f"Dados salvos em {filename}")
            
            # Estatísticas
            print(f"\n📊 Resumo dos dados:")
            print(f"Total de alimentos: {len(df)}")
            print(f"Alimentos com dados completos: {df.dropna().shape[0]}")
            print(f"\nPrimeiros 3 alimentos:")
            print(df.head(3).to_string(index=False))
            
            return True
            
        except Exception as e:
            self.logger.error(f"Erro ao salvar CSV: {e}")
            return False


def main():
    scraper = TBCAScraper()
    
    print("=== TBCA Macronutrientes (100g) ===\n")
    print("Nutrientes coletados:")
    print("• Energia (kcal)")
    print("• Carboidrato Total (g)")  
    print("• Proteína (g)")
    print("• Lipídios (g)")
    print("• Fibra Alimentar (g)")
    print("\n" + "="*50)
    
    print("\nOpções:")
    print("1. Teste rápido (5 frutas)")
    print("2. Grupo específico")
    print("3. Todos os alimentos (DEMORADO!)")
    print("4. Sair")
    
    choice = input("\nEscolha (1-4): ").strip()
    
    if choice == '1':
        print("\n🧪 Teste com 5 frutas...")
        alimentos = scraper.scrape_group_nutrition('frutas', max_foods=5, delay=1)
        
        if alimentos:
            scraper.save_to_csv('teste_macros_frutas.csv')
            print("✅ Teste salvo em 'teste_macros_frutas.csv'")
        
    elif choice == '2':
        print("\nGrupos: frutas, vegetais, carnes, cereais, leguminosas, leite, acucares, gorduras, bebidas, pescados")
        
        group = input("Grupo desejado: ").strip()
        max_foods = input("Máximo de alimentos (deixe vazio para todos): ").strip()
        max_foods = int(max_foods) if max_foods.isdigit() else None
        
        print(f"\n🚀 Processando grupo '{group}'...")
        alimentos = scraper.scrape_group_nutrition(group, max_foods=max_foods)
        
        if alimentos:
            filename = f'macros_{group.lower()}_tbca.csv'
            scraper.save_to_csv(filename)
            print(f"✅ Dados salvos em '{filename}'")
        
    elif choice == '3':
        max_foods = input("Máximo de alimentos (recomendado 50-100): ").strip()
        max_foods = int(max_foods) if max_foods.isdigit() else None
        
        print(f"\n⚠️  ATENÇÃO: Isso pode demorar muito!")
        confirm = input("Continuar? (s/n): ").strip().lower()
        
        if confirm == 's':
            print("\n🚀 Processando todos os alimentos...")
            alimentos = scraper.scrape_all_nutrition(max_foods=max_foods)
            
            if alimentos:
                scraper.save_to_csv('macros_todos_tbca.csv')
                print("✅ Dados salvos em 'macros_todos_tbca.csv'")
        
    elif choice == '4':
        print("Saindo...")
    
    else:
        print("Opção inválida!")


if __name__ == "__main__":
    main()