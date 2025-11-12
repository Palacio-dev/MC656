import { useState } from "react";
import '../Styles/buttonadditem.css';

interface AddItemProps {
    onAddItem: (itemText: string) => void;
    placeholder?: string;
}

/**
 * AddItem - Componente para adicionar novos itens à lista
 * 
 * @param onAddItem - Função callback chamada quando um novo item é adicionado
 * @param placeholder - Texto placeholder para o input (opcional)
 * @returns {JSX.Element} - O componente AddItem renderizado
 */
export default function ButtonAddItem({ onAddItem, placeholder = "Adicione um item" }: AddItemProps) {
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (newItem.trim()) {
            onAddItem(newItem.trim());
            setNewItem('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddItem();
        }
    };

    return (
        <div >
            <button
                className="button-item"
                onClick={handleAddItem}
            >
                +
            </button>
            <input
                type="text"
                placeholder={placeholder}
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={handleKeyPress}
            />
        </div>
    );
}