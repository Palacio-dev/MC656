import { useState } from "react";
import ListComponent from "../Components/ListComponent";
import { ShoppingItem } from "../Types/ShoppingTypes";

interface ShoppingListDetailProps {
    listId?: string;
    listName?: string;
    onBack?: () => void;
}

/**
 * ShoppingListDetail - Página de detalhes de uma lista específica
 */
export default function ShoppingListDetail({ 
    listName = "Lista de Compras",
    onBack 
}: ShoppingListDetailProps) {
    const [items, setItems] = useState<ShoppingItem[]>([]);

    const handleToggleItem = (id: string, checked: boolean) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, checked } : item
            )
        );
    };

    const handleDeleteItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleAddItem = (itemText: string) => {
        const newId = Date.now().toString();
        setItems(prev => [...prev, {
            id: newId,
            text: itemText,
            checked: false
        }]);
    };

    return (
        <div className="fundo">
            {/* Header com botão voltar */}
            <div className="header-top">
                {onBack && (
                    <button className="back-button" onClick={onBack}>
                        ← Voltar
                    </button>
                )}
                <h1 className="titulo">{listName}</h1>
            </div>

            {/* Lista de itens */}
            <ListComponent 
                items={items}
                onToggleItem={handleToggleItem}
                onDeleteItem={handleDeleteItem}
                onAddItem={handleAddItem}
                placeholder="Adicione um item à lista"
            />
        </div>
    );
}