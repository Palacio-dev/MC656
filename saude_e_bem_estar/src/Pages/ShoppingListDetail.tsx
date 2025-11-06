import { useState } from "react";
import ListComponent from "../Components/ListComponent";
import { ShoppingItem, ShoppingList } from "../Types/ShoppingTypes";

interface ShoppingListDetailProps {
    listId?: string;
    listName?: string;
    onBack?: () => void;
}

/**
 * ShoppingListDetail - Página de detalhes de uma lista específica
 */
export default function ShoppingListDetail({ 
    listId,
    listName = "Lista de Compras",
    onBack 
}: ShoppingListDetailProps) {
    let idList : string = '0'
    const itemSelecionado = localStorage.getItem("itemSelecionado");
    if(itemSelecionado){
        idList = itemSelecionado;
    }
    const list = localStorage.getItem(idList);
    let listshopping: ShoppingList = {
        id: '0', name: 'blabla', items: []
    };
    if(list){
        listshopping = JSON.parse(list);
    }
    const [items, setItems] = useState<ShoppingItem[]>(listshopping.items || []);

    const handleToggleItem = (id: string, checked: boolean) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, checked } : item
            )
        );
    };

    const handleDeleteItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
        localStorage.setItem(listshopping.id, JSON.stringify(listshopping));
    };

    const handleAddItem = (itemText: string) => {
        const newItem: ShoppingItem = {
            id: Date.now().toString(),
            text: itemText,
            checked: false
        };
        setItems(prev => [...prev, newItem]);
        listshopping.items.push(newItem);
        localStorage.setItem(listshopping.id, JSON.stringify(listshopping));
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
                <h1 className="titulo">{listshopping.name}</h1>
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