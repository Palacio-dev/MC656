import React, { useState, useEffect } from "react";

// Example async function to fetch products by name (replace with your backend API)
async function fetchProducts(query: string): Promise<string[]> {
  if (!query) return [];
  // Simulated DB results
  const allProducts = [
    "Apple Juice",
    "Orange Juice",
    "Banana Smoothie",
    "Chocolate Bar",
    "Chips",
    "Pasta",
    "Rice",
    "Tomato Sauce",
  ];
  return allProducts.filter((p) =>
    p.toLowerCase().includes(query.toLowerCase())
  );
}

const STORAGE_KEY = "product-search-history";

const ProductSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  // Save history to localStorage whenever it changes
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

  const handleSelect = (item: string) => {
    setQuery("");
    setSuggestions([]);
    if (!history.includes(item)) {
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
          <div className="absolute top-full mt-1 w-full border bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(s)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

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
                  onClick={() => setQuery(item)}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 cursor-pointer transition"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          {history.length > 0 && (
            <button
              className="mt-3 px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
              onClick={() => setHistory([])}
            >
              Clear History
            </button>
          )}
        </div>
    </div>
  );
};

export default ProductSearch;
