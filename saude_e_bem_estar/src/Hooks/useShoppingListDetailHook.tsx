import { useState, useEffect, useCallback } from "react";
import { ShoppingItem, ShoppingList } from "../types/ShoppingTypes";

interface UseShoppingListDetailViewModelProps {
    listId?: string;
}

/**
 * ViewModel para ShoppingListDetail
 * Gerencia toda a lógica de negócio da página de detalhes da lista
 */
export const useShoppingListDetailViewModel = ({ 
    listId 
}: UseShoppingListDetailViewModelProps = {}) => {
    const [list, setList] = useState<ShoppingList | null>(null);
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Obtém o ID da lista selecionada
     */
    const getListId = useCallback((): string | null => {
        if (listId) return listId;
        
        const storedId = localStorage.getItem("itemSelecionado");
        return storedId && storedId !== '0' ? storedId : null;
    }, [listId]);

    /**
     * Carrega a lista do localStorage
     */
    const loadList = useCallback(() => {
        try {
            setIsLoading(true);
            setError(null);

            const currentListId = getListId();
            
            if (!currentListId) {
                setError("Nenhuma lista selecionada");
                setIsLoading(false);
                return;
            }

            const storedList = localStorage.getItem(currentListId);
            
            if (!storedList) {
                setError("Lista não encontrada");
                setIsLoading(false);
                return;
            }

            const parsedList: ShoppingList = JSON.parse(storedList);
            setList(parsedList);
            setItems(parsedList.items || []);
        } catch (err) {
            console.error("Erro ao carregar lista:", err);
            setError("Erro ao carregar lista");
        } finally {
            setIsLoading(false);
        }
    }, [getListId]);

    /**
     * Salva a lista atualizada no localStorage
     */
    const saveList = useCallback((updatedList: ShoppingList) => {
        try {
            localStorage.setItem(updatedList.id, JSON.stringify(updatedList));
            
            // Atualiza também a lista no array de listas
            const allLists = localStorage.getItem("listas");
            if (allLists) {
                const parsedLists: ShoppingList[] = JSON.parse(allLists);
                const updatedLists = parsedLists.map(l => 
                    l.id === updatedList.id ? updatedList : l
                );
                localStorage.setItem("listas", JSON.stringify(updatedLists));
            }
        } catch (err) {
            console.error("Erro ao salvar lista:", err);
            setError("Erro ao salvar alterações");
        }
    }, []);

    /**
     * Carrega a lista na inicialização
     */
    useEffect(() => {
        loadList();
    }, [loadList]);

    /**
     * Adiciona um novo item à lista
     */
    const addItem = useCallback((itemText: string) => {
        if (!list) {
            console.warn("Lista não carregada");
            return;
        }

        if (!itemText.trim()) {
            console.warn("Texto do item não pode ser vazio");
            return;
        }

        const newItem: ShoppingItem = {
            id: Date.now().toString(),
            text: itemText.trim(),
            checked: false
        };

        const updatedItems = [...items, newItem];
        const updatedList = { ...list, items: updatedItems };

        setItems(updatedItems);
        setList(updatedList);
        saveList(updatedList);
    }, [list, items, saveList]);

    /**
     * Alterna o estado de marcado/desmarcado de um item
     */
    const toggleItem = useCallback((id: string, checked: boolean) => {
        if (!list) return;

        const updatedItems = items.map(item =>
            item.id === id ? { ...item, checked } : item
        );
        const updatedList = { ...list, items: updatedItems };

        setItems(updatedItems);
        setList(updatedList);
        saveList(updatedList);
    }, [list, items, saveList]);

    /**
     * Deleta um item da lista
     */
    const deleteItem = useCallback((id: string) => {
        if (!list) return;

        const updatedItems = items.filter(item => item.id !== id);
        const updatedList = { ...list, items: updatedItems };

        setItems(updatedItems);
        setList(updatedList);
        saveList(updatedList);
    }, [list, items, saveList]);

    /**
     * Limpa todos os itens marcados
     */
    const clearCheckedItems = useCallback(() => {
        if (!list) return;

        const updatedItems = items.filter(item => !item.checked);
        const updatedList = { ...list, items: updatedItems };

        setItems(updatedItems);
        setList(updatedList);
        saveList(updatedList);
    }, [list, items, saveList]);

    /**
     * Obtém estatísticas da lista
     */
    const getStats = useCallback(() => {
        const total = items.length;
        const checked = items.filter(item => item.checked).length;
        const unchecked = total - checked;
        const progress = total > 0 ? (checked / total) * 100 : 0;

        return { total, checked, unchecked, progress };
    }, [items]);

    return {
        // Estado
        list,
        items,
        isLoading,
        error,
        listName: list?.name || "Lista de Compras",
        stats: getStats(),

        // Ações
        addItem,
        toggleItem,
        deleteItem,
        clearCheckedItems,
        reloadList: loadList
    };
};