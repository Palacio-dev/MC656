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
return products.filter((p) => p.name.toLowerCase().includes(q));
}