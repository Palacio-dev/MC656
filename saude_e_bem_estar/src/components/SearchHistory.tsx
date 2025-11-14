import React from "react";
import { Product } from "../types/product";


type Props = {
history: Product[];
onSelect: (p: Product) => void;
onClear: () => void;
};


export const SearchHistory: React.FC<Props> = ({ history, onSelect, onClear }) => {
    return (
        <div className="shadow-lg border rounded-lg p-4">
            <h2 className="text-lg font-bold mb-2">Buscados Anteriormente</h2>
                {history.length === 0 ? (
                    <p className="text-gray-500">No products searched yet</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {history.map((item, idx) => (
                                <button
                                    key={item.name + idx}
                                    onClick={() => onSelect(item)}
                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 cursor-pointer transition"
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    )}
                    {history.length > 0 && (
                        <button
                            className="mt-3 px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
                            onClick={onClear}
                            >
                            Clear History
                        </button>
                )}
        </div>
        );
};