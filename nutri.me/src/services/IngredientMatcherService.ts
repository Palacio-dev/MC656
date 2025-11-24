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
  
  // Remove preposições e artigos (apenas quando isolados, não parte de palavras)
  cleaned = cleaned.replace(/\s+(de|da|do|das|dos)\s+/gi, ' ');
  cleaned = cleaned.replace(/\s+(em|no|na|nos|nas)\s+/gi, ' ');
  cleaned = cleaned.replace(/\s+(à|ao|aos|às)\s+/gi, ' ');
  cleaned = cleaned.replace(/\s+(para|por|com|sem)\s+/gi, ' ');
  cleaned = cleaned.replace(/\s+(o|os|um|uma|uns|umas)\s+/gi, ' ');
  
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
  cleaned = cleaned.replace(/\bcenouras\b/g, 'cenoura');
  cleaned = cleaned.replace(/\bbatatas\b/g, 'batata');
  cleaned = cleaned.replace(/\bbananas\b/g, 'banana');
  cleaned = cleaned.replace(/\bmaçãs\b/g, 'maçã');
  cleaned = cleaned.replace(/\blaranjas\b/g, 'laranja');
  
  // Regra geral para plurais terminados em 'as' ou 'es' (mais agressiva)
  // Apenas para palavras que não são artigos/preposições
  cleaned = cleaned.split(' ').map(word => {
    if (word.length > 4) {
      // Remove 's' final de palavras no plural
      if (word.endsWith('ras')) return word.slice(0, -1); // cenouras -> cenoura
      if (word.endsWith('tas')) return word.slice(0, -1); // batatas -> batata
      if (word.endsWith('nas')) return word.slice(0, -1); // bananas -> banana
      if (word.endsWith('ões')) return word.slice(0, -3) + 'ão'; // limões -> limão
      if (word.endsWith('ães')) return word.slice(0, -3) + 'ão'; // pães -> pão
      if (word.endsWith('es') && !word.endsWith('res')) return word.slice(0, -2); // tomates -> tomat
    }
    return word;
  }).join(' ');
  
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
    
    // Score cada match baseado em simplicidade e relevância
    const scoredMatches = allMatches.map(product => {
      const nameLower = product.name.toLowerCase();
      let score = 0;
      
      // PENALIDADES - pratos complexos/preparados
      const complexKeywords = [
        'refogado', 'frito', 'assado', 'cozido', 'grelhado',
        'empanado', 'à milanesa', 'gratinado', 'ao molho', 'com molho',
        'à moda', 'recheado', 'ensopado', 'guisado', 'benedict',
        'e', ' c/ ', ' com ', ' ao ', ' à ', ' de ', 'mistura'
      ];
      
      for (const keyword of complexKeywords) {
        if (nameLower.includes(keyword)) {
          score -= 100; // Penalidade pesada para pratos complexos
        }
      }
      
      // Penalidade para marcas específicas (queremos ingredientes genéricos)
      if (/toblerone|nestlé|cacau show|garoto|lacta/i.test(nameLower)) {
        score -= 50;
      }
      
      // BONIFICAÇÕES - ingredientes simples
      const simpleKeywords = [
        'cru', 'crua', 'in natura', 'fresco', 'fresca',
        'natural', 'puro', 'integral', 'em pó'
      ];
      
      for (const keyword of simpleKeywords) {
        if (nameLower.includes(keyword)) {
          score += 50; // Bonificação para ingredientes simples
        }
      }
      
      // Bonificação se o nome é curto (geralmente mais simples)
      const wordCount = nameLower.split(/\s+/).length;
      if (wordCount <= 2) {
        score += 30;
      } else if (wordCount <= 3) {
        score += 10;
      } else {
        score -= wordCount * 5; // Penalidade por complexidade
      }
      
      // Bonificação se começa exatamente com o termo buscado
      if (nameLower.startsWith(searchTerm)) {
        score += 100;
      } else if (nameLower.includes(`, ${searchTerm}`)) {
        // Ex: "Trigo, farinha" quando busca "farinha"
        score += 80;
      }
      
      // Bonificação extra para matches exatos simples
      const firstWord = nameLower.split(/[,\s]+/)[0];
      if (firstWord === searchTerm) {
        score += 150;
      }
      
      return { product, score };
    });
    
    // Ordena por score (maior primeiro)
    scoredMatches.sort((a, b) => b.score - a.score);
    
    // Filtra apenas scores positivos
    const goodMatches = scoredMatches
      .filter(m => m.score > -50) // Permite alguns com score baixo se não houver alternativas
      .map(m => {
        console.log(`  ${m.score > 0 ? '✅' : '⚠️'} ${m.product.name} (score: ${m.score})`);
        return m.product;
      });
    
    console.log(`✅ Encontrados ${goodMatches.length} ingredientes de ${allMatches.length} resultados`);
    
    // Se não encontrou nada bom, pega pelo menos o primeiro resultado original
    const finalMatches = goodMatches.length > 0 ? goodMatches : allMatches.slice(0, 1);
    
    return {
      originalText: ingredientText,
      searchTerm,
      matches: finalMatches.slice(0, 3) // Limita a 3 melhores resultados
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
