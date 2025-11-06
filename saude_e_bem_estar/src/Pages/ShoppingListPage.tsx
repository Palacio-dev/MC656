import ShoppingListCard from "../Components/ShoppingListCard";
import ButtonAddItem from "../Components/ButtonAddItem";
import { useShoppingListsViewModel } from "../Hooks/useShoppingListHook";
import '../Styles/shoppinglistspage.css';

/**
 * ShoppingListsPage - View (Componente de apresentação)
 * Responsável apenas pela renderização, delegando toda lógica para o ViewModel
 */
export default function ShoppingListsPage() {
    const {
        lists,
        isLoading,
        isEmpty,
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
                <p className="empty-message">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="fundo">
            {/* Header */}
            <div className="header-top">
                <h1 className="titulo">Listas de Compras</h1>
            </div>

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