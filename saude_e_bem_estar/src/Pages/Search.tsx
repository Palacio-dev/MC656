import React from "react";
import ProductSearch from "../Components/ProductSearch";

export default function Search() {
    return (
        <div className="fundo">
            <div className="header-top">
                <h1 className="titulo">Busca de Produtos</h1>
            </div>

            <div className="p-4">
                <ProductSearch />
            </div>
        </div>
    );
}