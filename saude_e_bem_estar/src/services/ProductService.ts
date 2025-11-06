import Papa from "papaparse";
import { Product } from "../types/product";


let allProducts: Product[] = [];


export async function loadCSV(): Promise<Product[]> {
if (allProducts.length > 0) return allProducts;


return new Promise((resolve, reject) => {
Papa.parse("/Assets/alimentos.csv", {
download: true,
header: true,
delimiter: ";",
dynamicTyping: true,
complete: (results) => {
allProducts = (results.data as any[])
.filter((row) => row && row.nome)
.map((row) => ({
name: String(row.nome),
calories: Number(row.energia_kcal) || 0,
carbs: Number(row.carboidrato_total_g) || 0,
protein: Number(row.proteina_g) || 0,
fat: Number(row.lipidios_g) || 0,
fiber: Number(row.fibra_alimentar_g) || 0,
}));
resolve(allProducts);
},
error: (err) => reject(err),
});
});
}


export async function fetchProducts(query: string): Promise<Product[]> {
  const products = await loadCSV();
  if (!query) return [];
  
  const q = query.toLowerCase();
  const matchingProducts = products.filter((p) => p.name.toLowerCase().includes(q));
  
  // Ordenar os produtos baseado em diferentes critérios
  const sortedProducts = matchingProducts.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    
    // 1. Priorizar produtos que começam exatamente com a query
    const aStartsWithQuery = aName.startsWith(q);
    const bStartsWithQuery = bName.startsWith(q);
    
    if (aStartsWithQuery && !bStartsWithQuery) return -1;
    if (!aStartsWithQuery && bStartsWithQuery) return 1;
    
    // 2. Priorizar produtos que têm a query como uma palavra completa
    const aHasWordMatch = new RegExp(`\\b${q}\\b`).test(aName);
    const bHasWordMatch = new RegExp(`\\b${q}\\b`).test(bName);
    
    if (aHasWordMatch && !bHasWordMatch) return -1;
    if (!aHasWordMatch && bHasWordMatch) return 1;
    
    // 3. Por fim, ordenar alfabeticamente
    return aName.localeCompare(bName);
  });
  
  // Limitar a 10 resultados
  return sortedProducts.slice(0, 10);
}