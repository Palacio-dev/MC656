import { fetchProducts } from './ProductService';
import { Product } from '../types/product';

/**
 * Resultado de uma correspondência de ingrediente
 */
export interface IngredientMatch {
  originalText: string;      // Texto original do ingrediente da receita
  searchTerm: string;         // Termo usado na busca
  matches: Product[];         // Produtos encontrados no Firebase
}

/**
 * Extrai o ingrediente principal de um texto de ingrediente
 * Remove quantidades, medidas e adjetivos
 * 
 * Exemplo: "4 ovos" -> "ovo"
 * Exemplo: "200g de tomate picado" -> "tomate"
 * Exemplo: "1 xícara de farinha de trigo" -> "farinha trigo"
 */
function extractMainIngredient(ingredientText: string): string {
  let cleaned = ingredientText.toLowerCase();
  
  // Remove frações e números (incluindo decimais, frações, etc)
  cleaned = cleaned.replace(/\d+[.,]?\d*/g, '');
  cleaned = cleaned.replace(/½|¼|¾|⅓|⅔|⅛|⅜|⅝|⅞/g, '');
  
  // Remove unidades de medida comuns
  cleaned = cleaned.replace(/\b(g|gr|gramas?|kg|quilogramas?)\b/gi, '');
  cleaned = cleaned.replace(/\b(ml|mililitros?|l|litros?)\b/gi, '');
  cleaned = cleaned.replace(/\b(xícara|xícaras|xic|xics)\b/gi, '');
  cleaned = cleaned.replace(/\b(colheres?|colher|col|cols)\b/gi, '');
  cleaned = cleaned.replace(/\b(sopa|sobremesa|chá|café)\b/gi, '');
  cleaned = cleaned.replace(/\b(unidade|unidades|und|pc|pç|peça|peças)\b/gi, '');
  cleaned = cleaned.replace(/\b(dente|dentes)\b/gi, '');
  cleaned = cleaned.replace(/\b(fatia|fatias|rodela|rodelas)\b/gi, '');
  cleaned = cleaned.replace(/\b(pitada|pitadas|punhado|punhados)\b/gi, '');
  cleaned = cleaned.replace(/\b(lata|latas|pacote|pacotes|caixa|caixas)\b/gi, '');
  cleaned = cleaned.replace(/\b(maço|maços|molho|molhos|ramo|ramos)\b/gi, '');
  
  // Remove preposições e artigos
  cleaned = cleaned.replace(/\b(de|da|do|das|dos|em|no|na|nos|nas)\b/gi, '');
  cleaned = cleaned.replace(/\b(à|ao|aos|às|para|por|com|sem)\b/gi, '');
  cleaned = cleaned.replace(/\b(o|a|os|as|um|uma|uns|umas)\b/gi, '');
  
  // Remove adjetivos e estados comuns
  cleaned = cleaned.replace(/\b(picado|picada|picados|picadas)\b/gi, '');
  cleaned = cleaned.replace(/\b(ralado|ralada|ralados|raladas)\b/gi, '');
  cleaned = cleaned.replace(/\b(fatiado|fatiada|fatiados|fatiadas)\b/gi, '');
  cleaned = cleaned.replace(/\b(cortado|cortada|cortados|cortadas)\b/gi, '');
  cleaned = cleaned.replace(/\b(moído|moída|moídos|moídas)\b/gi, '');
  cleaned = cleaned.replace(/\b(batido|batida|batidos|batidas)\b/gi, '');
  cleaned = cleaned.replace(/\b(cozido|cozida|cozidos|cozidas)\b/gi, '');
  cleaned = cleaned.replace(/\b(cru|crua|crus|cruas)\b/gi, '');
  cleaned = cleaned.replace(/\b(fresco|fresca|frescos|frescas)\b/gi, '');
  cleaned = cleaned.replace(/\b(seco|seca|secos|secas)\b/gi, '');
  cleaned = cleaned.replace(/\b(maduro|madura|maduros|maduras)\b/gi, '');
  cleaned = cleaned.replace(/\b(verde|verdes|vermelho|vermelha|amarelo|amarela)\b/gi, '');
  cleaned = cleaned.replace(/\b(grande|grandes|pequeno|pequena|pequenos|pequenas)\b/gi, '');
  cleaned = cleaned.replace(/\b(médio|média|médios|médias)\b/gi, '');
  cleaned = cleaned.replace(/\b(inteiro|inteira|inteiros|inteiras)\b/gi, '');
  
  // Remove expressões opcionais
  cleaned = cleaned.replace(/\b(a gosto|opcional|se necessário|conforme necessário|ou mais)\b/gi, '');
  cleaned = cleaned.replace(/\(.*?\)/g, ''); // Remove conteúdo entre parênteses
  
  // Remove pontuação
  cleaned = cleaned.replace(/[,;:.!?()]/g, ' ');
  
  // Normaliza espaços
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Singulariza palavras comuns no plural (opcional, mas ajuda)
  cleaned = cleaned.replace(/\bovos\b/g, 'ovo');
  cleaned = cleaned.replace(/\btomates\b/g, 'tomate');
  cleaned = cleaned.replace(/\bcebolas\b/g, 'cebola');
  cleaned = cleaned.replace(/\balhos\b/g, 'alho');
  
  // Se ficou vazio, retorna o texto original
  if (!cleaned || cleaned.length < 2) {
    return ingredientText.toLowerCase().trim();
  }
  
  // Pega as primeiras 1-2 palavras mais significativas
  const words = cleaned.split(/\s+/).filter(w => w.length > 2);
  
  if (words.length === 0) {
    return ingredientText.toLowerCase().trim();
  }
  
  // Retorna no máximo 2 palavras para melhor correspondência
  return words.slice(0, 2).join(' ').trim();
}

/**
 * Busca correspondências de um ingrediente no banco de dados Firebase
 */
export async function searchIngredientMatches(
  ingredientText: string
): Promise<IngredientMatch> {
  const searchTerm = extractMainIngredient(ingredientText);
  
  console.log(`Buscando correspondências para: "${ingredientText}" -> "${searchTerm}"`);
  
  try {
    // Busca no Firebase usando o ProductService
    const allMatches = await fetchProducts(searchTerm);
    
    // Filtra resultados para evitar pratos/receitas
    // Procura por ingredientes simples, não pratos complexos
    const filteredMatches = allMatches.filter(product => {
      const nameLower = product.name.toLowerCase();
      
      // Remove se parecer ser um prato/receita (contém palavras como "à", "com", "ao", etc em contexto de prato)
      const dishKeywords = [
        'benedict', 'mexido', 'frito', 'cozido com', 'à moda',
        'ao molho', 'com molho', 'à milanesa', 'empanado',
        'gratinado', 'assado com', 'refogado com'
      ];
      
      for (const keyword of dishKeywords) {
        if (nameLower.includes(keyword)) {
          console.log(`❌ Removendo prato: "${product.name}"`);
          return false;
        }
      }
      
      // Prioriza ingredientes simples que contêm o termo de busca
      return nameLower.includes(searchTerm);
    });
    
    console.log(`✅ Encontrados ${filteredMatches.length} ingredientes válidos de ${allMatches.length} resultados`);
    
    // Se não encontrou nada após filtrar, usa os resultados originais
    const finalMatches = filteredMatches.length > 0 ? filteredMatches : allMatches;
    
    return {
      originalText: ingredientText,
      searchTerm,
      matches: finalMatches.slice(0, 3) // Limita a 3 resultados
    };
  } catch (error) {
    console.error('Erro ao buscar correspondências de ingrediente:', error);
    return {
      originalText: ingredientText,
      searchTerm,
      matches: []
    };
  }
}

/**
 * Busca correspondências para múltiplos ingredientes
 */
export async function searchMultipleIngredients(
  ingredients: string[]
): Promise<IngredientMatch[]> {
  const promises = ingredients.map(ing => searchIngredientMatches(ing));
  return Promise.all(promises);
}
