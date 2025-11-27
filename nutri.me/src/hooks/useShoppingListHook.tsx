// hooks/useShoppingListHook.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingList } from "../types/ShoppingTypes";
import { shoppingListService } from "../services/ShoppingListService";
import { useAuth } from "./useAuth";

/**
 * ViewModel para ShoppingListsPage
 * Gerencia toda a lógica de negócio e estado da página de listas
 * Agora utiliza Firebase Firestore através do Model (ShoppingListService)
 */
export const useShoppingListsViewModel = () => {
    const navigate = useNavigate();
    const { currentUser, loading: authLoading } = useAuth();
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Carrega as listas do Firebase na inicialização
     * Aguarda a autenticação do Firebase ser inicializada
     */
    useEffect(() => {
        // Limpa o item selecionado do localStorage (ainda usado para navegação)
        localStorage.removeItem("itemSelecionado");
        
        // Só carrega listas depois que a autenticação foi inicializada
        if (!authLoading) {
            loadLists();
        }
    }, [authLoading]);

    /**
     * Carrega as listas do Firebase Firestore
     */
    const loadLists = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            if (!currentUser) {
                console.warn("Usuário não autenticado ao carregar listas");
                setError("Você precisa estar logado para ver suas listas.");
                setLists([]);
                setIsLoading(false);
                return;
            }
            
            const fetchedLists = await shoppingListService.getAllLists(currentUser.uid);
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
            
            if (!currentUser) {
                console.error("Tentativa de criar lista sem autenticação");
                setError("Você precisa estar logado para criar listas.");
                return;
            }
            
            console.log("Criando lista para usuário:", currentUser.uid);
            const newList = await shoppingListService.createList(listName, currentUser.uid);
            
            // Atualiza o estado local adicionando a nova lista
            setLists(prevLists => [newList, ...prevLists]);
            
            return newList;
        } catch (error: any) {
            console.error("Erro ao criar lista:", error);
            const errorMessage = error?.message || "Não foi possível criar a lista. Tente novamente.";
            setError(errorMessage);
            
            // Mostra o erro no console para debug
            console.error("Detalhes do erro:", {
                message: error?.message,
                code: error?.code,
                stack: error?.stack
            });
        }
    };

    /**
     * Deleta uma lista de compras do Firebase
     */
    const deleteList = async (id: string) => {
        try {
            setError(null);
            
            if (!currentUser) {
                console.error("Tentativa de deletar lista sem autenticação");
                setError("Você precisa estar logado para deletar listas.");
                return;
            }
            
            await shoppingListService.deleteList(id, currentUser.uid);
            
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