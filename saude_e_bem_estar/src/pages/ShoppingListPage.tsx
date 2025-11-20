// pages/ShoppingListPage.tsx
import { useNavigate } from "react-router-dom";
import ShoppingListCard from "../components/ShoppingListCard";
import ButtonAddItem from "../components/ButtonAddItem";
import { useShoppingListsViewModel } from "../hooks/useShoppingListHook";
import '../styles/shoppinglistspage.css';

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
            <div className="fundo">
                <div className="header-top">
                    <h1 className="titulo">Listas de Compras</h1>
                </div>
                <p className="empty-message">Carregando listas do Firebase...</p>
            </div>
        );
    }

    return (
        <div className="fundo">
            {/* Header */}
            <div className="header-top">
                <button className="back-button" onClick={() => navigate(-1)}>
                    ← Voltar
                </button>

                <h1 className="titulo">Listas de Compras</h1>
            </div>

            {/* Mensagem de erro */}
            {error && (
                <div className="error-message" style={{
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    padding: '10px',
                    borderRadius: '4px',
                    margin: '10px 0',
                    color: '#c00'
                }}>
                    {error}
                </div>
            )}

            {/* Criar nova lista */}
            <div className="new-list-section">
                <ButtonAddItem 
                    onAddItem={createList}
                    placeholder="Nome da nova lista"
                />
            </div>

            {/* Lista de listas */}
            <div className="lists-container">
                {isEmpty ? (
                    <p className="empty-message">
                        Nenhuma lista criada ainda. Crie sua primeira lista!
                    </p>
                ) : (
                    lists.map(list => (
                        <ShoppingListCard
                            key={list.id}
                            id={list.id}
                            name={list.name}
                            itemCount={list.items.length}
                            onClick={selectList}
                            onDelete={deleteList}
                        />
                    ))
                )}
            </div>
        </div>
    );
}