import React from "react";
import { Product } from "../types/product";


type Props = {
product: Product | null;
};


export const ProductDetails: React.FC<Props> = ({ product }) => {
    if (!product) return null;
    return (
        <div className="shadow-lg border rounded-lg p-4 bg-white">
            <h2 className="text-lg font-bold mb-2">{product.name}</h2>
                <ul className="space-y-1">
                    <li>Energia em kcal: {product.calories}</li>
                    <li>Carboidratos: {product.carbs}g</li>
                    <li>Proteina: {product.protein}g</li>
                    <li>Lipidios: {product.fat}g</li>
                    <li>Fibras: {product.fiber}g</li>
                </ul>
        </div>
    );
};