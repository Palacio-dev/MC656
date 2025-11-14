import { useEffect, useState } from "react";
import { Product } from "../types/product";
import * as productService from "../services/ProductService";


const STORAGE_KEY = "product-search-history";


export function useProductSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [history, setHistory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // load history once
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setHistory(JSON.parse(raw));
      } catch (e) {
        console.warn("Failed to parse history", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // persist history
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  // fetch suggestions when query changes
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (query.length <= 1) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const res = await productService.fetchProducts(query);
        if (!cancelled) setSuggestions(res);
      } catch (err) {
        console.error("Error fetching suggestions", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const select = (product: Product) => {
    setSelected(product);
    setQuery("");
    setSuggestions([]);
    if (!history.find((h) => h.name === product.name)) {
      setHistory((prev) => [product, ...prev]);
    }
  };

  const selectFromHistory = (product: Product) => {
    setSelected(product);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    query,
    setQuery,
    suggestions,
    selected,
    history,
    loading,
    select,
    selectFromHistory,
    clearHistory
  };
}