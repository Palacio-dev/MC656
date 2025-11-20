import { useState, useEffect, useCallback } from "react";
import { ShoppingItem, ShoppingList } from "../types/ShoppingTypes";
import { shoppingListDetailService } from "../models/ShoppingListDetailService";

interface UseShoppingListDetailViewModelProps {
    listId?: string;
}

/**
 * ViewModel para ShoppingListDetail
 * Gerencia toda a lógica de negócio da página de detalhes da lista
 * Agora utiliza Firebase Firestore através do Model
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
     * Prioriza o listId passado via props, senão usa o localStorage
     */
    const getListId = useCallback((): string | null => {
        if (listId) return listId;
        
        const storedId = localStorage.getItem("itemSelecionado");
        return storedId && storedId !== '0' ? storedId : null;
    }, [listId]);

    /**
     * Carrega a lista do Firebase
     */
    const loadList = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const currentListId = getListId();
            
            if (!currentListId) {
                setError("Nenhuma lista selecionada");
                setIsLoading(false);
                return;
            }

            // Busca a lista no Firebase através do Model
            const fetchedList = await shoppingListDetailService.getListById(currentListId);
            
            if (!fetchedList) {
                setError("Lista não encontrada");
                setIsLoading(false);
                return;
            }

            setList(fetchedList);
            setItems(fetchedList.items || []);
        } catch (err) {
            console.error("Erro ao carregar lista:", err);
            setError("Erro ao carregar lista do Firebase");
        } finally {
            setIsLoading(false);
        }
    }, [getListId]);

    /**
     * Carrega a lista na inicialização
     */
    useEffect(() => {
        loadList();
    }, [loadList]);

    /**
     * Adiciona um novo item à lista
     */
    const addItem = useCallback(async (itemText: string) => {
        if (!list) {
            console.warn("Lista não carregada");
            return;
        }

        if (!itemText.trim()) {
            console.warn("Texto do item não pode ser vazio");
            return;
        }

        try {
            setError(null);
            
            // Adiciona o item através do Model
            const newItem = await shoppingListDetailService.addItem(list.id, itemText);

            // Atualiza o estado local
            const updatedItems = [...items, newItem];
            setItems(updatedItems);
            setList({ ...list, items: updatedItems });
        } catch (err) {
            console.error("Erro ao adicionar item:", err);
            setError("Não foi possível adicionar o item");
        }
    }, [list, items]);

    /**
     * Alterna o estado de marcado/desmarcado de um item
     */
    const toggleItem = useCallback(async (id: string, checked: boolean) => {
        if (!list) return;

        try {
            setError(null);

            // Atualiza otimisticamente o estado local (UX mais responsiva)
            const updatedItems = items.map(item =>
                item.id === id ? { ...item, checked } : item
            );
            setItems(updatedItems);
            setList({ ...list, items: updatedItems });

            // Atualiza no Firebase através do Model
            await shoppingListDetailService.toggleItem(list.id, id, checked);
        } catch (err) {
            console.error("Erro ao atualizar item:", err);
            setError("Não foi possível atualizar o item");
            
            // Reverte o estado em caso de erro
            loadList();
        }
    }, [list, items, loadList]);

    /**
     * Deleta um item da lista
     */
    const deleteItem = useCallback(async (id: string) => {
        if (!list) return;

        try {
            setError(null);

            // Atualiza otimisticamente o estado local
            const updatedItems = items.filter(item => item.id !== id);
            setItems(updatedItems);
            setList({ ...list, items: updatedItems });

            // Deleta no Firebase através do Model
            await shoppingListDetailService.deleteItem(list.id, id);
        } catch (err) {
            console.error("Erro ao deletar item:", err);
            setError("Não foi possível deletar o item");
            
            // Reverte o estado em caso de erro
            loadList();
        }
    }, [list, items, loadList]);

    /**
     * Limpa todos os itens marcados
     */
    const clearCheckedItems = useCallback(async () => {
        if (!list) return;

        try {
            setError(null);

            // Atualiza otimisticamente o estado local
            const updatedItems = items.filter(item => !item.checked);
            setItems(updatedItems);
            setList({ ...list, items: updatedItems });

            // Limpa no Firebase através do Model
            await shoppingListDetailService.clearCheckedItems(list.id);
        } catch (err) {
            console.error("Erro ao limpar itens marcados:", err);
            setError("Não foi possível limpar os itens marcados");
            
            // Reverte o estado em caso de erro
            loadList();
        }
    }, [list, items, loadList]);

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