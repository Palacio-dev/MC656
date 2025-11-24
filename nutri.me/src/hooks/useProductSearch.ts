import { useEffect, useState, useCallback } from "react";
import { Product } from "../types/product";
import * as productService from "../services/ProductService";
import { productHistoryService } from "../services/ProductHistoryService";
import { auth } from "../config/firebase";


const STORAGE_KEY = "product-search-history";
const DEBOUNCE_DELAY = 500; // Wait 500ms after user stops typing


export function useProductSearch() {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
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

  // Debounce the query - wait for user to stop typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  // fetch suggestions when debounced query changes
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (debouncedQuery.length <= 1) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const res = await productService.fetchProducts(debouncedQuery);
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
  }, [debouncedQuery]);

  const select = async (product: Product) => {
    const userId = auth.currentUser?.uid || 'anonymous';
    setSelected(product);
    setQuery("");
    setDebouncedQuery(""); // Clear debounced query too
    setSuggestions([]);
    if (!history.find((h) => h.name === product.name)) {
      await productHistoryService.saveToHistory(userId, product);
    }
    loadHistory();
  };

  // Manual search trigger for Enter key
  const triggerSearch = useCallback(() => {
    if (query.length > 1) {
      setDebouncedQuery(query);
    }
  }, [query]);

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
            
            console.log('🗑️ Limpando histórico para usuário:', userId);
            
            // Limpa histórico no Firebase
            await productHistoryService.clearUserHistory(userId);
            
            console.log('✅ Histórico limpo no Firebase');
            
            // Atualiza estado local imediatamente
            setHistory([]);
            
            console.log('✅ Estado local atualizado');
            
            // Recarrega do Firebase para garantir sincronização
            await loadHistory();
            
            console.log('✅ Histórico recarregado');
        } catch (err) {
            console.error("❌ Erro ao limpar histórico:", err);
            setError("Não foi possível limpar o histórico");
        }
    }, [loadHistory]);

  return {
    query,
    setQuery,
    suggestions,
    selected,
    history,
    loading,
    select,
    selectFromHistory,
    clearHistory,
    triggerSearch
  };
}