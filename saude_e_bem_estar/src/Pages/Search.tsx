import React from "react";
import ProductSearch from "../Components/ProductSearch";

export default function Search() {
    return (
        <div className="max-w-md mx-auto bg-gradient-to-b from-purple-600 to-purple-700 min-h-screen">
            <div className="bg-purple-600 text-white p-4">
                <h1 className="text-xl font-semibold">Busca de Produtos</h1>
            </div>

            <div className="p-4">
                <ProductSearch />
            </div>
        </div>
    );
}