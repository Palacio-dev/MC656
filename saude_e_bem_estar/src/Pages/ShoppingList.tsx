import { useState } from "react";
import CheckItem from "../Components/CheckItem";

/**
 * ShoppingList - Uma pagina para adicionar itens de compra
 * 
 * @returns {JSX.Element} - O componente ShoppingList renderizado
 */
export default function ShoppingList() {
    // Componente de exemplo mostrando uma lista completa
    const [items, setItems] = useState<Array<{ id: string; text: string; checked: boolean }>>([]);

    const [newItem, setNewItem] = useState('');

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

    const handleAddItem = () => {
        if (newItem.trim()) {
            const newId = (items.length + 1).toString();
            setItems(prev => [...prev, {
                id: newId,
                text: newItem.trim(),
                checked: false
            }]);
            setNewItem('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddItem();
        }
    };
    return (
        <div className="fundo">
            {/* Header */}
            <div className="header-top">
                <h1 className="titulo">Lista de Compras</h1>
            </div>

            {/* Lista de itens */}
            <div className="bg-purple-100 min-h-screen p-4 space-y-3">
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

                {/* Adicionar novo item */}
                <div className="flex items-center gap-2 mt-4">
                    <button
                        className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold hover:bg-purple-700 transition-colors"
                        onClick={handleAddItem}
                    >
                        +
                    </button>
                    <input
                        type="text"
                        placeholder="Adicione genérico"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>
        </div>
    );
};