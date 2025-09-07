import React, { useState, useEffect } from "react";
import Papa from "papaparse";

// Product type
type Product = {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
};

let allProducts: Product[] = [];

async function loadCSV(): Promise<Product[]> {
  if (allProducts.length > 0) return allProducts;

  return new Promise((resolve, reject) => {
    Papa.parse("/Assets/alimentos.csv", {
      download: true,
      header: true,
      delimiter: ";", // 👈 important for your CSV
      dynamicTyping: true,
      complete: (results) => {
        allProducts = (results.data as any[])
          .filter((row) => row.nome) // ignore empty rows
          .map((row) => ({
            name: row.nome,
            calories: row.energia_kcal,
            carbs: row.carboidrato_total_g,
            protein: row.proteina_g,
            fat: row.lipidios_g,
            fiber: row.fibra_alimentar_g,
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
  return products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
}

const STORAGE_KEY = "product-search-history";

const ProductSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [history, setHistory] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (query.length > 1) {
        const results = await fetchProducts(query);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    };
    loadSuggestions();
  }, [query]);

  const handleSelect = (item: Product) => {
    setQuery("");
    setSuggestions([]);
    setSelected(item);
    if (!history.find((h) => h.name === item.name)) {
      setHistory([item, ...history]);
    }
  };

  return (
    <div className="p-6 grid gap-6">
      {/* Search Bar */}
      <div className="shadow-lg border rounded-lg p-4 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a product..."
          className="border rounded-lg p-2 text-lg w-full"
        />

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg overflow-hidden z-10">
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(s)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
              >
                {s.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected product details */}
      {selected && (
        <div className="shadow-lg border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-bold mb-2">{selected.name}</h2>
          <ul className="space-y-1">
            <li>Energia em kcal: {selected.calories}</li>
            <li>Carboidratos: {selected.carbs}g</li>
            <li>Proteina: {selected.protein}g</li>
            <li>Lipidios: {selected.fat}g</li>
            <li>Fibras: {selected.fiber}g</li>
          </ul>
        </div>
      )}

      {/* Search History */}
      <div className="shadow-lg border rounded-lg p-4">
        <h2 className="text-lg font-bold mb-2">Buscados Anteriormente</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No products searched yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {history.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(item)}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 cursor-pointer transition"
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
        {history.length > 0 && (
          <button
            className="mt-3 px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
            onClick={() => {
              setHistory([]);
              setSelected(null);
            }}
          >
            Clear History
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;
