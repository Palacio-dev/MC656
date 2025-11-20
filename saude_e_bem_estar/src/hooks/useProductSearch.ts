import { useEffect, useState, useCallback } from "react";
import { Product } from "../types/product";
import * as productService from "../services/ProductService";
import { productHistoryService } from "../services/ProductHistoryService";
import { auth } from "../config/firebase";


const STORAGE_KEY = "product-search-history";


export function useProductSearch() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [selected, setSelected] = useState<Product | null>(null);
    const [history, setHistory] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
    * Carrega a lista do Firebase
    */
    const loadHistory = useCallback(async () => {
         try {
            setError(null);
            const userId = auth.currentUser?.uid || 'anonymous';
            
            // Busca histórico único (sem duplicatas) do Firebase
            const userHistory = await productHistoryService.getUserHistory(userId);
            setHistory(userHistory);
        } catch (err) {
            console.error("Erro ao carregar histórico:", err);
            setError("Não foi possível carregar o histórico");
            setHistory([]);
        }
    }, []);

   // Carrega histórico na inicialização
    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

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

  const select = async (product: Product) => {
    const userId = auth.currentUser?.uid || 'anonymous';
    setSelected(product);
    setQuery("");
    setSuggestions([]);
    if (!history.find((h) => h.name === product.name)) {
      await productHistoryService.saveToHistory(userId, product);
    }
    loadHistory();
  };

    const selectFromHistory = useCallback((product: Product) => {
        setSelected(product);
        setSuggestions([]);
        setQuery("");
        // Não salva novamente no histórico quando vem do histórico
    }, []);

    // ===== LIMPAR HISTÓRICO =====
    const clearHistory = useCallback(async () => {
        try {
            setError(null);
            const userId = auth.currentUser?.uid || 'anonymous';
            
            // Limpa histórico no Firebase
            await productHistoryService.clearUserHistory(userId);
            
            // Atualiza estado local
            setHistory([]);
        } catch (err) {
            console.error("Erro ao limpar histórico:", err);
            setError("Não foi possível limpar o histórico");
        }
    }, []);

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