// hooks/useShoppingListHook.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingList } from "../types/ShoppingTypes";
import { shoppingListService } from "../models/ShoppingListService";

/**
 * ViewModel para ShoppingListsPage
 * Gerencia toda a lógica de negócio e estado da página de listas
 * Agora utiliza Firebase Firestore através do Model (ShoppingListService)
 */
export const useShoppingListsViewModel = () => {
    const navigate = useNavigate();
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Carrega as listas do Firebase na inicialização
     */
    useEffect(() => {
        loadLists();
        // Limpa o item selecionado do localStorage (ainda usado para navegação)
        localStorage.removeItem("itemSelecionado");
    }, []);

    /**
     * Carrega as listas do Firebase Firestore
     */
    const loadLists = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const fetchedLists = await shoppingListService.getAllLists();
            setLists(fetchedLists);
        } catch (error) {
            console.error("Erro ao carregar listas:", error);
            setError("Não foi possível carregar as listas. Tente novamente.");
            setLists([]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Cria uma nova lista de compras no Firebase
     */
    const createList = async (listName: string) => {
        if (!listName.trim()) {
            console.warn("Nome da lista não pode ser vazio");
            return;
        }

        try {
            setError(null);
            const newList = await shoppingListService.createList(listName);
            
            // Atualiza o estado local adicionando a nova lista
            setLists(prevLists => [newList, ...prevLists]);
            
            return newList;
        } catch (error) {
            console.error("Erro ao criar lista:", error);
            setError("Não foi possível criar a lista. Tente novamente.");
        }
    };

    /**
     * Deleta uma lista de compras do Firebase
     */
    const deleteList = async (id: string) => {
        try {
            setError(null);
            await shoppingListService.deleteList(id);
            
            // Atualiza o estado local removendo a lista deletada
            setLists(prevLists => prevLists.filter(list => list.id !== id));
        } catch (error) {
            console.error("Erro ao deletar lista:", error);
            setError("Não foi possível deletar a lista. Tente novamente.");
        }
    };

    /**
     * Seleciona uma lista e navega para a página de detalhes
     */
    const selectList = (id: string) => {
        // Salva o ID no localStorage para a página de detalhes
        localStorage.setItem("itemSelecionado", id);
        navigate("DetalList");
    };

    /**
     * Verifica se não há listas criadas
     */
    const isEmpty = lists.length === 0;

    return {
        // Estado
        lists,
        isLoading,
        isEmpty,
        error,

        // Ações
        createList,
        deleteList,
        selectList,
        reloadLists: loadLists
    };
};