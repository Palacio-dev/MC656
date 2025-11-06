import { useNavigate } from "react-router-dom";
import React from "react";
import ProductSearch from "../Components/ProductSearch";

export default function Search() {
    const navigate = useNavigate();

    return (
        <div className="fundo">
            <div className="header-top">

                <button className="back-button" onClick={() => navigate(-1)}>
                    ← Voltar
                </button>

                <h1 className="titulo">Busca de Produtos</h1>
            </div>

            <div className="p-4">
                <ProductSearch />
            </div>
        </div>
    );
}