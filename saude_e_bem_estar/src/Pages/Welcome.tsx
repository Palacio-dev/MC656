import { useNavigate } from "react-router-dom";

export default function Welcome() {
    const navigate = useNavigate();

    return (
        <div className="fundo">
            <div className="header-top">
                <h1 className="titulo">Bem-vinde!</h1>
            </div>

            <h3>Escolha uma das interações</h3>

            <div className="button-container">
                <button onClick={() => navigate("Search")} className="button-navegate"> Pesquise um produto </button>
                <button onClick={() => navigate("ShoppingList")} className="button-navegate"> Monte sua lista de compras </button>
            </div>
        </div>
    );
}