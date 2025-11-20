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
 * Agora com suporte a Firebase através da arquitetura MVVM
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
                    <h1 className="titulo">Carregando do Firebase...</h1>
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
                <div className="error-message" style={{
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    padding: '15px',
                    borderRadius: '8px',
                    margin: '20px',
                    color: '#c00'
                }}>
                    <strong>⚠️ {error}</strong>
                    <p style={{ marginTop: '10px', fontSize: '14px' }}>
                        Verifique sua conexão com o Firebase.
                    </p>
                </div>
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

            {/* Estatísticas da lista */}
            {stats.total > 0 && (
                <div className="stats-section" style={{
                    padding: '15px 20px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    margin: '10px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <p className="stats-text" style={{ 
                            margin: 0, 
                            fontSize: '14px',
                            color: '#1e40af'
                        }}>
                            <strong>{stats.checked}</strong> de <strong>{stats.total}</strong> itens completos
                        </p>
                        <div style={{
                            width: '200px',
                            height: '6px',
                            backgroundColor: '#dbeafe',
                            borderRadius: '3px',
                            marginTop: '8px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${stats.progress}%`,
                                height: '100%',
                                backgroundColor: '#3b82f6',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>
                    
                    {stats.checked > 0 && (
                        <button 
                            className="clear-button"
                            onClick={clearCheckedItems}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                        >
                            🗑️ Limpar marcados
                        </button>
                    )}
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

            {/* Mensagem quando lista está vazia */}
            {stats.total === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#64748b'
                }}>
                    <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>🛒</p>
                    <p style={{ fontSize: '16px', margin: 0 }}>
                        Sua lista está vazia. Adicione o primeiro item!
                    </p>
                </div>
            )}
        </div>
    );
}