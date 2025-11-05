import { useState } from "react";
import ShoppingListCard from "../Components/ShoppingListCard";
import { ShoppingList } from "../Types/ShoppingTypes";
import { useNavigate } from "react-router-dom";
import '../Styles/shoppinglistspage.css';
import ButtonAddItem from "../Components/ButtonAddItem";

/**
 * ShoppingListsPage - Página principal que lista todas as listas de compras
 */
export default function ShoppingListsPage() {
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const navigate = useNavigate();

    const handleCreateList = (listName: string) => {
        const newList: ShoppingList = {
            id: Date.now().toString(),
            name: listName,
            items: []
        };
        setLists(prev => [...prev, newList]);
    };

    const handleDeleteList = (id: string) => {
        setLists(prev => prev.filter(list => list.id !== id));
    };

    const handleSelectList = (id: string) => {
        // Aqui você pode navegar para a página de detalhes da lista
        // Se estiver usando React Router:
        navigate(`/ShoppingList/${id}`);
        console.log('Lista selecionada:', id);
    };

    return (
        <div className="fundo">
            {/* Header */}
            <div className="header-top">
                <h1 className="titulo">Listas de Compras</h1>
            </div>

            {/* Criar nova lista */}
            <div className="new-list-section">
                <ButtonAddItem 
                    onAddItem={handleCreateList}
                    placeholder="Nome da nova lista"
                />
            </div>

            {/* Lista de listas */}
            <div className="lists-container">
                {lists.length === 0 ? (
                    <p className="empty-message">
                        Nenhuma lista criada ainda. Crie sua primeira lista!
                    </p>
                ) : (
                    lists.map(list => (
                        <ShoppingListCard
                            key={list.id}
                            id={list.id}
                            name={list.name}
                            itemCount={list.items.length}
                            onClick={handleSelectList}
                            onDelete={handleDeleteList}
                        />
                    ))
                )}
            </div>
        </div>
    );
}