import { useState } from "react";
import CheckItem from "../Components/CheckItem";
import ButtonAddItem from "../Components/ButtonAddItem";

/**
 * ShoppingList - Uma pagina para adicionar itens de compra
 * 
 * @returns {JSX.Element} - O componente ShoppingList renderizado
 */
export default function ShoppingList() {
    // Componente de exemplo mostrando uma lista completa
    const [items, setItems] = useState<Array<{ id: string; text: string; checked: boolean }>>([]);

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
        const newId = (items.length + 1).toString();
        setItems(prev => [...prev, {
            id: newId,
            text: itemText,
            checked: false
        }]);
    };

    return (
        <div className="fundo">
            {/* Header */}
            <div className="header-top">
                <h1 className="titulo">Lista de Compras</h1>
            </div>

            {/* Lista de itens */}
            <div className="body-list">
                {items.map(item => (
                    <CheckItem
                        key={item.id}
                        id={item.id}
                        text={item.text}
                        isChecked={item.checked}
                        onToggle={handleToggleItem}
                        onDelete={handleDeleteItem}
                    />
                ))}

                {/* Componente para adicionar novo item */}
                <ButtonAddItem 
                    onAddItem={handleAddItem}
                    placeholder="Adicione genérico"
                />
            </div>
        </div>
    );
};