import '../styles/shoppinglistcard.css';

interface ShoppingListCardProps {
    id: string;
    name: string;
    itemCount: number;
    onClick: (id: string) => void;
    onDelete?: (id: string) => void;
}

/**
 * ShoppingListCard - Card representando uma lista de compras
 */
export default function ShoppingListCard({ 
    id, 
    name, 
    itemCount, 
    onClick,
    onDelete 
}: ShoppingListCardProps) {
    return (
        <div className="list-card" onClick={() => onClick(id)}>
            <div className="list-card-content">
                <span className="list-icon">📝</span>
                <div className="list-info">
                    <span className="list-name">{name}</span>
                    <span className="list-count">{itemCount} itens</span>
                </div>
            </div>
            {onDelete && (
                <button 
                    className="list-delete-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(id);
                    }}
                >
                    🗑️
                </button>
            )}
        </div>
    );
}