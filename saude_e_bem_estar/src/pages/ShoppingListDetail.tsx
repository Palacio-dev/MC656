import { useNavigate } from "react-router-dom";
import ListComponent from "../components/ListComponent";
import { useShoppingListDetailViewModel } from "../hooks/useShoppingListDetailHook";
import '../styles/shoppinglistspage.css';

interface ShoppingListDetailProps {
    listId?: string;
    onBack?: () => void;
}

/**
 * ShoppingListDetail - View (Componente de apresentação)
 * Responsável apenas pela renderização, delegando toda lógica para o ViewModel
 */
export default function ShoppingListDetail({ 
    listId,
    onBack 
}: ShoppingListDetailProps) {
    
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) onBack();
        else navigate(-1);
    };

    const {
        items,
        isLoading,
        error,
        listName,
        stats,
        addItem,
        toggleItem,
        deleteItem,
        clearCheckedItems
    } = useShoppingListDetailViewModel({ listId });

    // Estado de carregamento
    if (isLoading) {
        return (
            <div className="fundo">
                <div className="header-top">
                    <h1 className="titulo">Carregando...</h1>
                </div>
            </div>
        );
    }

    // Estado de erro
    if (error) {
        return (
            <div className="fundo">
                <div className="header-top">
                    <button className="back-button" onClick={handleBack}>
                        ← Voltar
                    </button>
                    <h1 className="titulo">Erro</h1>
                </div>
                <p className="empty-message">{error}</p>
            </div>
        );
    }

    return (
        <div className="fundo">
            {/* Header com botão voltar */}
            <div className="header-top">
                <button className="back-button" onClick={handleBack}>
                    ← Voltar
                </button>
                <h1 className="titulo">{listName}</h1>
            </div>

            {/* Estatísticas da lista (opcional) */}
            {stats.total > 0 && (
                <div className="stats-section">
                    <p className="stats-text">
                        {stats.checked} de {stats.total} itens completos
                        {stats.checked > 0 && (
                            <button 
                                className="clear-button"
                                onClick={clearCheckedItems}
                                style={{ marginLeft: '10px' }}
                            >
                                Limpar marcados
                            </button>
                        )}
                    </p>
                </div>
            )}

            {/* Lista de itens */}
            <ListComponent 
                items={items}
                onToggleItem={toggleItem}
                onDeleteItem={deleteItem}
                onAddItem={addItem}
                placeholder="Adicione um item à lista"
            />
        </div>
    );
}