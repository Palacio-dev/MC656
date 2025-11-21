// pages/ShoppingListPage.tsx
import { useNavigate } from "react-router-dom";
import ShoppingListCard from "../components/ShoppingListCard";
import ButtonAddItem from "../components/ButtonAddItem";
import { useShoppingListsViewModel } from "../hooks/useShoppingListHook";
import '../styles/ShoppingList.css';

/**
 * ShoppingListsPage - View (Componente de apresentação)
 * Responsável apenas pela renderização, delegando toda lógica para o ViewModel
 * Agora com suporte a Firebase através da arquitetura MVVM
 */
export default function ShoppingListsPage() {
    const navigate = useNavigate();

    const {
        lists,
        isLoading,
        isEmpty,
        error,
        createList,
        deleteList,
        selectList
    } = useShoppingListsViewModel();

    if (isLoading) {
        return (
            <div className="shopping-list-container">
                <div className="header-top">
                    <h1 className="titulo">Listas de Compras</h1>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Carregando listas do Firebase...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="shopping-list-container">
            {/* Header */}
            <div className="header-top">
                <button className="back-button" onClick={() => navigate(-1)}>
                    ← Voltar
                </button>
                <h1 className="titulo">Listas de Compras</h1>
            </div>

            <div className="shopping-list-content">
                {/* Mensagem de erro */}
                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}

                {/* Criar nova lista */}
                <div className="new-list-section">
                    <h3 className="new-list-title">➕ Criar Nova Lista</h3>
                    <ButtonAddItem 
                        onAddItem={createList}
                        placeholder="Nome da nova lista"
                    />
                </div>

                {/* Lista de listas */}
                {isEmpty ? (
                    <div className="empty-message">
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📝</div>
                        <p>Nenhuma lista criada ainda. Crie sua primeira lista!</p>
                    </div>
                ) : (
                    <div className="lists-grid">
                        {lists.map(list => (
                            <ShoppingListCard
                                key={list.id}
                                id={list.id}
                                name={list.name}
                                itemCount={list.items.length}
                                onClick={selectList}
                                onDelete={deleteList}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}