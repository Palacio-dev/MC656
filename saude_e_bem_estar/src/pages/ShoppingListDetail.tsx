import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import ListComponent from "../components/ListComponent";
import { useShoppingListDetailViewModel } from "../hooks/useShoppingListDetailHook";
import '../styles/ShoppingList.css';

interface ShoppingListDetailProps {
    listId?: string;
    onBack?: () => void;
}

/**
 * ShoppingListDetail - View (Componente de apresentação)
 * Responsável apenas pela renderização, delegando toda lógica para o ViewModel
 * Agora com suporte a Firebase através da arquitetura MVVM
 */
export default function ShoppingListDetail({ 
    listId,
    onBack 
}: ShoppingListDetailProps) {
    
    const navigate = useNavigate();

    const {
        items,
        isLoading,
        error,
        listName,
        stats,
        addItem,
        toggleItem,
        editItem,
        deleteItem,
        updateListName,
        clearCheckedItems,
        uncheckAllItems
    } = useShoppingListDetailViewModel({ listId });

    // Estado para edição do nome da lista (must be before any early returns)
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(listName);

    const handleBack = () => {
        if (onBack) onBack();
        else navigate(-1);
    };

    const handleSaveListName = async () => {
        if (editedName.trim()) {
            await updateListName(editedName);
            setIsEditingName(false);
        }
    };

    const handleCancelEditName = () => {
        setEditedName(listName);
        setIsEditingName(false);
    };

    const handleKeyPressName = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSaveListName();
        } else if (e.key === 'Escape') {
            handleCancelEditName();
        }
    };

    // Estado de carregamento
    if (isLoading) {
        return (
            <div className="shopping-list-container">
                <div className="header-top">
                    <h1 className="titulo">Carregando...</h1>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Carregando do Firebase...</p>
                </div>
            </div>
        );
    }

    // Estado de erro
    if (error) {
        return (
            <div className="shopping-list-container">
                <PageHeader 
                    title="Erro"
                    showBackButton={true}
                    showHomeButton={true}
                />
                <div className="shopping-list-content">
                    <div className="error-message">
                        <strong>⚠️ {error}</strong>
                        <p style={{ marginTop: '10px', fontSize: '14px' }}>
                            Verifique sua conexão com o Firebase.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="shopping-list-container">
            <PageHeader 
                title={listName}
                showBackButton={true}
                showHomeButton={true}
            />

            <div className="shopping-list-content">
                {/* Edição do nome da lista */}
                <div className="list-name-section">
                    {isEditingName ? (
                        <div className="list-name-edit">
                            <input 
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={handleKeyPressName}
                                className="list-name-input"
                                autoFocus
                            />
                            <button onClick={handleSaveListName} className="button-save">💾</button>
                            <button onClick={handleCancelEditName} className="button-cancel">✖️</button>
                        </div>
                    ) : (
                        <div className="list-name-display">
                            <h2 className="list-name-title">{listName}</h2>
                            <button onClick={() => setIsEditingName(true)} className="button-edit-name">✏️ Editar</button>
                        </div>
                    )}
                </div>
                {/* Estatísticas da lista */}
                {stats.total > 0 && (
                    <div className="stats-section">
                        <div className="stats-info">
                            <p className="stats-text">
                                <strong>{stats.checked}</strong> de <strong>{stats.total}</strong> itens completos
                            </p>
                            <div className="progress-bar-container">
                                <div 
                                    className="progress-bar" 
                                    style={{ width: `${stats.progress}%` }}
                                />
                            </div>
                        </div>
                        
                        {stats.checked > 0 && (
                            <div className="stats-buttons">
                                <button 
                                    className="uncheck-button"
                                    onClick={uncheckAllItems}
                                    title="Desmarcar todos os itens"
                                >
                                    ↩️ Desmarcar todos
                                </button>
                                <button 
                                    className="clear-button"
                                    onClick={clearCheckedItems}
                                    title="Deletar itens marcados da lista"
                                >
                                    🗑️ Deletar marcados
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Lista de itens */}
                <div className="list-items-section">
                    <ListComponent 
                        items={items}
                        onToggleItem={toggleItem}
                        onDeleteItem={deleteItem}
                        onEditItem={editItem}
                        onAddItem={addItem}
                        placeholder="Adicione um item à lista"
                    />
                </div>

                {/* Mensagem quando lista está vazia */}
                {stats.total === 0 && (
                    <div className="empty-list-state">
                        <div className="empty-list-icon">🛒</div>
                        <p className="empty-list-text">
                            Sua lista está vazia. Adicione o primeiro item!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}