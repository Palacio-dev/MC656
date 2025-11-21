import React from "react";
import { Product } from "../types/product";


type Props = {
items: Product[];
onSelect: (p: Product) => void;
};


export const SuggestionsList: React.FC<Props> = ({ items, onSelect }) => {
    if (!items.length) return null;
    return (
        <div className="suggestions-dropdown">
            {items.map((s, idx) => (
                <div
                    key={s.name + idx}
                    onClick={() => onSelect(s)}
                    className="suggestion-item"
                >
                    {s.name}
                </div>
            ))}
        </div>
    );
};