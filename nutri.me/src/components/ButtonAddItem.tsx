import { useState } from "react";
import '../styles/buttonadditem.css';

interface AddItemProps {
    onAddItem: (itemText: string, quantity?: string) => void;
    placeholder?: string;
    showQuantityInput?: boolean;
}

/**
 * AddItem - Componente para adicionar novos itens à lista
 * 
 * @param onAddItem - Função callback chamada quando um novo item é adicionado
 * @param placeholder - Texto placeholder para o input (opcional)
 * @param showQuantityInput - Se true, mostra o input de quantidade (padrão: false)
 * @returns {JSX.Element} - O componente AddItem renderizado
 */
export default function ButtonAddItem({ onAddItem, placeholder = "Adicione um item", showQuantityInput = false }: AddItemProps) {
    const [newItem, setNewItem] = useState('');
    const [quantity, setQuantity] = useState('');

    const handleAddItem = () => {
        if (newItem.trim()) {
            onAddItem(newItem.trim(), quantity.trim() || undefined);
            setNewItem('');
            setQuantity('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddItem();
        }
    };

    return (
        <div className="add-item-container">
            <input
                type="text"
                className="input-item-name"
                placeholder={placeholder}
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            {showQuantityInput && (
                <input
                    type="text"
                    className="input-item-quantity"
                    placeholder="Quantidade (ex: 2kg)"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
            )}
            <button
                className="button-add-item"
                onClick={handleAddItem}
                disabled={!newItem.trim()}
            >
                + Adicionar
            </button>
        </div>
    );
}