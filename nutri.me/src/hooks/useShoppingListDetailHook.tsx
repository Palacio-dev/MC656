import { useState, useEffect, useCallback } from "react";
import { ShoppingItem, ShoppingList } from "../types/ShoppingTypes";
import { shoppingListDetailService } from "../services/ShoppingListDetailService";
import { useAuth } from "./useAuth";

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
    const { currentUser, loading: authLoading } = useAuth();
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

            if (!currentUser) {
                setError("Você precisa estar logado para visualizar esta lista.");
                setIsLoading(false);
                return;
            }

            // Busca a lista no Firebase através do Model
            const fetchedList = await shoppingListDetailService.getListById(currentListId, currentUser.uid);
            
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
    }, [getListId, currentUser]);

    /**
     * Carrega a lista na inicialização
     * Aguarda a autenticação do Firebase ser inicializada
     */
    useEffect(() => {
        if (!authLoading) {
            loadList();
        }
    }, [authLoading, loadList]);

    /**
     * Adiciona um novo item à lista
     */
    const addItem = useCallback(async (itemText: string, quantity?: string) => {
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
            
            if (!currentUser) {
                setError("Você precisa estar logado para adicionar itens.");
                return;
            }
            
            // Adiciona o item através do Model
            const newItem = await shoppingListDetailService.addItem(list.id, currentUser.uid, itemText, quantity);

            // Atualiza o estado local
            const updatedItems = [...items, newItem];
            setItems(updatedItems);
            setList({ ...list, items: updatedItems });
        } catch (err) {
            console.error("Erro ao adicionar item:", err);
            setError("Não foi possível adicionar o item");
        }
    }, [list, items, currentUser]);

    /**
     * Alterna o estado de marcado/desmarcado de um item
     */
    const toggleItem = useCallback(async (id: string, checked: boolean) => {
        if (!list) return;

        try {
            setError(null);

            if (!currentUser) {
                setError("Você precisa estar logado para atualizar itens.");
                return;
            }

            // Atualiza otimisticamente o estado local (UX mais responsiva)
            const updatedItems = items.map(item =>
                item.id === id ? { ...item, checked } : item
            );
            setItems(updatedItems);
            setList({ ...list, items: updatedItems });

            // Atualiza no Firebase através do Model
            await shoppingListDetailService.toggleItem(list.id, currentUser.uid, id, checked);
        } catch (err) {
            console.error("Erro ao atualizar item:", err);
            setError("Não foi possível atualizar o item");
            
            // Reverte o estado em caso de erro
            loadList();
        }
    }, [list, items, currentUser, loadList]);

    /**
     * Edita um item da lista (texto e/ou quantidade)
     */
    const editItem = useCallback(async (id: string, text: string, quantity?: string) => {
        if (!list) return;

        try {
            setError(null);

            if (!currentUser) {
                setError("Você precisa estar logado para editar itens.");
                return;
            }

            // Atualiza otimisticamente o estado local
            const updatedItems = items.map(item =>
                item.id === id ? { ...item, text, quantity } : item
            );
            setItems(updatedItems);
            setList({ ...list, items: updatedItems });

            // Atualiza no Firebase através do Model
            await shoppingListDetailService.updateList(list.id, currentUser.uid, { items: updatedItems });
        } catch (err) {
            console.error("Erro ao editar item:", err);
            setError("Não foi possível editar o item");
            
            // Reverte o estado em caso de erro
            loadList();
        }
    }, [list, items, currentUser, loadList]);

    /**
     * Atualiza o nome da lista
     */
    const updateListName = useCallback(async (newName: string) => {
        if (!list) return;

        if (!newName.trim()) {
            setError("O nome da lista não pode estar vazio");
            return;
        }

        try {
            setError(null);

            if (!currentUser) {
                setError("Você precisa estar logado para editar o nome da lista.");
                return;
            }

            // Atualiza otimisticamente o estado local
            setList({ ...list, name: newName });

            // Atualiza no Firebase através do Model
            await shoppingListDetailService.updateList(list.id, currentUser.uid, { name: newName });
        } catch (err) {
            console.error("Erro ao atualizar nome da lista:", err);
            setError("Não foi possível atualizar o nome da lista");
            
            // Reverte o estado em caso de erro
            loadList();
        }
    }, [list, currentUser, loadList]);

    /**
     * Deleta um item da lista
     */
    const deleteItem = useCallback(async (id: string) => {
        if (!list) return;

        try {
            setError(null);

            if (!currentUser) {
                setError("Você precisa estar logado para deletar itens.");
                return;
            }

            // Atualiza otimisticamente o estado local
            const updatedItems = items.filter(item => item.id !== id);
            setItems(updatedItems);
            setList({ ...list, items: updatedItems });

            // Deleta no Firebase através do Model
            await shoppingListDetailService.deleteItem(list.id, currentUser.uid, id);
        } catch (err) {
            console.error("Erro ao deletar item:", err);
            setError("Não foi possível deletar o item");
            
            // Reverte o estado em caso de erro
            loadList();
        }
    }, [list, items, currentUser, loadList]);

    /**
     * Limpa todos os itens marcados (deleta da lista)
     */
    const clearCheckedItems = useCallback(async () => {
        if (!list) return;

        try {
            setError(null);

            if (!currentUser) {
                setError("Você precisa estar logado para limpar itens.");
                return;
            }

            // Atualiza otimisticamente o estado local
            const updatedItems = items.filter(item => !item.checked);
            setItems(updatedItems);
            setList({ ...list, items: updatedItems });

            // Limpa no Firebase através do Model
            await shoppingListDetailService.clearCheckedItems(list.id, currentUser.uid);
        } catch (err) {
            console.error("Erro ao limpar itens marcados:", err);
            setError("Não foi possível limpar os itens marcados");
            
            // Reverte o estado em caso de erro
            loadList();
        }
    }, [list, items, currentUser, loadList]);

    /**
     * Desmarca todos os itens marcados (remove o check)
     */
    const uncheckAllItems = useCallback(async () => {
        if (!list) return;

        try {
            setError(null);

            if (!currentUser) {
                setError("Você precisa estar logado para desmarcar itens.");
                return;
            }

            // Atualiza otimisticamente o estado local
            const updatedItems = items.map(item => ({ ...item, checked: false }));
            setItems(updatedItems);
            setList({ ...list, items: updatedItems });

            // Atualiza no Firebase através do Model
            await shoppingListDetailService.updateList(list.id, currentUser.uid, { items: updatedItems });
        } catch (err) {
            console.error("Erro ao desmarcar itens:", err);
            setError("Não foi possível desmarcar os itens");
            
            // Reverte o estado em caso de erro
            loadList();
        }
    }, [list, items, currentUser, loadList]);

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
        editItem,
        deleteItem,
        updateListName,
        clearCheckedItems,
        uncheckAllItems,
        reloadList: loadList
    };
};