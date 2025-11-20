import { db } from "../config/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Product } from "../types/product";

function normalizeQuery(text: string) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Função que busca produtos no Firestore
export async function fetchProducts(text: string): Promise<Product[]> {
  if (!text || text.length < 2) return [];
  const q = normalizeQuery(text);

  const col = collection(db, "alimentos");

  // Firestore só permite consultas por prefixo usando >= e <  
  // Ex: "aba" => busca entre "aba" e "aba\uf8ff"
  const firestoreQuery = query(
    col,
    where("nome_lowercase", ">=", q),
    where("nome_lowercase", "<=", q + "\uf8ff"),
    limit(20)
  );

  const snapshot = await getDocs(firestoreQuery);

  const results: Product[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();

    results.push({
      name: data.nome,
      calories: data.energia_kcal,
      carbs: data.carboidrato_total_g,
      protein: data.proteina_g,
      fat: data.lipidios_g,
      fiber: data.fibra_alimentar_g,
    });
  });

  // aplicar ordenação igual ao CSV
  const sorted = results.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    const aStarts = aName.startsWith(q);
    const bStarts = bName.startsWith(q);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    const aWord = new RegExp(`\\b${q}\\b`).test(aName);
    const bWord = new RegExp(`\\b${q}\\b`).test(bName);

    if (aWord && !bWord) return -1;
    if (!aWord && bWord) return 1;

    return aName.localeCompare(bName);
  });

  return sorted.slice(0, 10);
}
