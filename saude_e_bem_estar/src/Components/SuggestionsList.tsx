import React from "react";
import { Product } from "../types/product";


type Props = {
items: Product[];
onSelect: (p: Product) => void;
};


export const SuggestionsList: React.FC<Props> = ({ items, onSelect }) => {
    if (!items.length) return null;
    return (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg overflow-hidden z-10">
            {items.map((s, idx) => (
            <div
            key={s.name + idx}
            onClick={() => onSelect(s)}
            className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
            >
            {s.name}
        </div>
        ))}
        </div>
    );
};