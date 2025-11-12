import CheckItem from "../Components/CheckItem";
import ButtonAddItem from "../Components/ButtonAddItem";

interface ListComponentProps {
    items: Array<{ id: string; text: string; checked: boolean }>;
    onToggleItem: (id: string, checked: boolean) => void;
    onDeleteItem: (id: string) => void;
    onAddItem: (itemText: string) => void;
    placeholder?: string;
}

/**
 * ListComponent - Interface para adicionar itens de compra
 * 
 * @param items - Array de itens da lista
 * @param onToggleItem - Função para marcar/desmarcar item
 * @param onDeleteItem - Função para deletar item
 * @param onAddItem - Função para adicionar novo item
 * @param placeholder - Texto placeholder para o input
 * @returns {JSX.Element} - O componente ListComponent renderizado
 */
export default function ListComponent({
    items,
    onToggleItem,
    onDeleteItem,
    onAddItem,
    placeholder = "Adicione um item"
}: ListComponentProps) {
    return (
        <div className="body-list">
            {/* Lista de itens */}
            {items.map(item => (
                <CheckItem
                    key={item.id}
                    id={item.id}
                    text={item.text}
                    isChecked={item.checked}
                    onToggle={onToggleItem}
                    onDelete={onDeleteItem}
                />
            ))}

            {/* Componente para adicionar novo item */}
            <ButtonAddItem 
                onAddItem={onAddItem}
                placeholder={placeholder}
            />
        </div>
    );
}