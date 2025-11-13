import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingList } from "../types/ShoppingTypes";

/**
 * ViewModel para ShoppingListsPage
 * Gerencia toda a lógica de negócio e estado da página de listas
 */
export const useShoppingListsViewModel = () => {
    const navigate = useNavigate();
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Carrega as listas do localStorage na inicialização
     */
    useEffect(() => {
        loadLists();
        // Reseta o item selecionado
        localStorage.setItem("itemSelecionado", '0');
    }, []);

    /**
     * Carrega as listas do localStorage
     */
    const loadLists = () => {
        try {
            const storedLists = localStorage.getItem("listas");
            const parsedLists = storedLists ? JSON.parse(storedLists) : [];
            setLists(parsedLists);
        } catch (error) {
            console.error("Erro ao carregar listas:", error);
            setLists([]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Cria uma nova lista de compras
     */
    const createList = (listName: string) => {
        if (!listName.trim()) {
            console.warn("Nome da lista não pode ser vazio");
            return;
        }

        const newList: ShoppingList = {
            id: Date.now().toString(),
            name: listName.trim(),
            items: []
        };

        // Salva a lista individual
        localStorage.setItem(newList.id, JSON.stringify(newList));

        // Atualiza o estado e o localStorage de listas
        setLists(prevLists => {
            const updatedLists = [...prevLists, newList];
            localStorage.setItem('listas', JSON.stringify(updatedLists));
            return updatedLists;
        });
    };

    /**
     * Deleta uma lista de compras
     */
    const deleteList = (id: string) => {
        setLists(prevLists => {
            const updatedLists = prevLists.filter(list => list.id !== id);
            localStorage.setItem('listas', JSON.stringify(updatedLists));
            localStorage.removeItem(id);
            return updatedLists;
        });
    };

    /**
     * Seleciona uma lista e navega para a página de detalhes
     */
    const selectList = (id: string) => {
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

        // Ações
        createList,
        deleteList,
        selectList,
        reloadLists: loadLists
    };
};