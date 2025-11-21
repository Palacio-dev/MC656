import { db } from "../config/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Product } from "../types/product";

function normalizeQuery(text: string) {
  if (!text) return "";
  
  let normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  
  // Singularize common plural forms to improve search matching
  // This helps "cenouras" match "cenoura"
  normalized = normalized.split(' ').map(word => {
    if (word.length > 4) {
      // Common plural patterns in Portuguese
      if (word.endsWith('ras')) return word.slice(0, -1); // cenouras -> cenoura
      if (word.endsWith('tas')) return word.slice(0, -1); // batatas -> batata  
      if (word.endsWith('nas')) return word.slice(0, -1); // bananas -> banana
      if (word.endsWith('oes')) return word.slice(0, -3) + 'ao'; // limões -> limão (normalized)
      if (word.endsWith('aes')) return word.slice(0, -3) + 'ao'; // pães -> pão (normalized)
      if (word.endsWith('res')) return word.slice(0, -2); // flores -> flor
      if (word.endsWith('is') && word.length > 5) return word.slice(0, -2) + 'l'; // animais -> animal
    }
    return word;
  }).join(' ');
  
  return normalized;
}

// Função que busca produtos no Firestore
export async function fetchProducts(text: string): Promise<Product[]> {
  if (!text || text.length < 2) return [];
  const q = normalizeQuery(text);
  
  // Split query into words for multi-word search
  const queryWords = q.split(/\s+/).filter(word => word.length > 1); // ignore single letters like "de", "a", "o"
  if (queryWords.length === 0) return [];

  const col = collection(db, "alimentos");
  const primaryWord = queryWords[0];
  
  const allResults = new Map<string, Product>();

  // Strategy 1: Search for products starting with the primary word (more precise)
  // This ensures we get "Cenoura" when searching for "cenoura"
  const prefixQuery = query(
    col,
    where("nome_lowercase", ">=", primaryWord),
    where("nome_lowercase", "<=", primaryWord + "\uf8ff"),
    limit(100)
  );

  const prefixSnapshot = await getDocs(prefixQuery);

  prefixSnapshot.forEach((doc) => {
    const data = doc.data();
    const nomeLower = data.nome_lowercase || "";
    
    // Filter: must contain ALL query words
    const containsAllWords = queryWords.every(word => nomeLower.includes(word));
    
    if (containsAllWords) {
      allResults.set(nomeLower, {
        name: data.nome,
        calories: data.energia_kcal,
        carbs: data.carboidrato_total_g,
        protein: data.proteina_g,
        fat: data.lipidios_g,
        fiber: data.fibra_alimentar_g,
      });
    }
  });

  // Strategy 2: If we have multiple words, also search by other word prefixes
  // E.g., "farinha trigo" should also find "Trigo, farinha"
  if (queryWords.length > 1) {
    const uniqueWords = Array.from(new Set(queryWords.slice(1))); // Skip first word, already searched
    
    for (const word of uniqueWords) {
      const secondaryQuery = query(
        col,
        where("nome_lowercase", ">=", word),
        where("nome_lowercase", "<=", word + "\uf8ff"),
        limit(100)
      );

      const snapshot = await getDocs(secondaryQuery);

      snapshot.forEach((doc) => {
        const data = doc.data();
        const nomeLower = data.nome_lowercase || "";
        
        const containsAllWords = queryWords.every(w => nomeLower.includes(w));
        
        if (containsAllWords) {
          allResults.set(nomeLower, {
            name: data.nome,
            calories: data.energia_kcal,
            carbs: data.carboidrato_total_g,
            protein: data.proteina_g,
            fat: data.lipidios_g,
            fiber: data.fibra_alimentar_g,
          });
        }
      });
    }
  }

  const results = Array.from(allResults.values());

  // aplicar ordenação: priorizar matches mais relevantes
  const sorted = results.sort((a, b) => {
    const aName = normalizeQuery(a.name);
    const bName = normalizeQuery(b.name);
    
    // Get the first word of each product name (before comma or space)
    const aFirstWord = aName.split(/[,\s]/)[0];
    const bFirstWord = bName.split(/[,\s]/)[0];
    
    // Get the first search word (most important)
    const primarySearchWord = queryWords[0];

    // 1. HIGHEST PRIORITY: First word of product matches first search word exactly
    const aFirstWordMatch = aFirstWord === primarySearchWord;
    const bFirstWordMatch = bFirstWord === primarySearchWord;
    if (aFirstWordMatch && !bFirstWordMatch) return -1;
    if (!aFirstWordMatch && bFirstWordMatch) return 1;

    // 2. Product name starts with the complete search query
    const aStarts = aName.startsWith(q);
    const bStarts = bName.startsWith(q);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    // 3. First word of product starts with first search word
    const aFirstWordStarts = aFirstWord.startsWith(primarySearchWord);
    const bFirstWordStarts = bFirstWord.startsWith(primarySearchWord);
    if (aFirstWordStarts && !bFirstWordStarts) return -1;
    if (!aFirstWordStarts && bFirstWordStarts) return 1;

    // 4. Product name starts with any search word
    const aStartsAnyWord = queryWords.some(word => aName.startsWith(word));
    const bStartsAnyWord = queryWords.some(word => bName.startsWith(word));
    if (aStartsAnyWord && !bStartsAnyWord) return -1;
    if (!aStartsAnyWord && bStartsAnyWord) return 1;

    // 5. All search words appear as complete words
    const aAllWords = queryWords.every(word => new RegExp(`\\b${word}\\b`).test(aName));
    const bAllWords = queryWords.every(word => new RegExp(`\\b${word}\\b`).test(bName));
    if (aAllWords && !bAllWords) return -1;
    if (!aAllWords && bAllWords) return 1;

    // 6. First search word appears earlier in the name
    const aIndex = aName.indexOf(primarySearchWord);
    const bIndex = bName.indexOf(primarySearchWord);
    if (aIndex !== bIndex) return aIndex - bIndex;

    // 7. Alfabética
    return aName.localeCompare(bName);
  });

  return sorted.slice(0, 10);
}
