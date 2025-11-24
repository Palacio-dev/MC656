import React from "react";
import { Product } from "../types/product";


type Props = {
product: Product | null;
};


export const ProductDetails: React.FC<Props> = ({ product }) => {
    if (!product) return null;
    return (
        <div className="product-details-card">
            <h2 className="product-name">{product.name}</h2>
            <div className="nutrition-grid">
                <div className="nutrition-item">
                    <div className="nutrition-label">Energia</div>
                    <div className="nutrition-value">{product.calories}<span className="nutrition-unit">kcal</span></div>
                </div>
                <div className="nutrition-item">
                    <div className="nutrition-label">Carboidratos</div>
                    <div className="nutrition-value">{product.carbs}<span className="nutrition-unit">g</span></div>
                </div>
                <div className="nutrition-item">
                    <div className="nutrition-label">Proteína</div>
                    <div className="nutrition-value">{product.protein}<span className="nutrition-unit">g</span></div>
                </div>
                <div className="nutrition-item">
                    <div className="nutrition-label">Lipídios</div>
                    <div className="nutrition-value">{product.fat}<span className="nutrition-unit">g</span></div>
                </div>
                <div className="nutrition-item">
                    <div className="nutrition-label">Fibras</div>
                    <div className="nutrition-value">{product.fiber}<span className="nutrition-unit">g</span></div>
                </div>
            </div>
        </div>
    );
};