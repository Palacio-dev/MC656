import React from "react";
import { Product } from "../types/product";


type Props = {
history: Product[];
onSelect: (p: Product) => void;
onClear: () => void;
};


export const SearchHistory: React.FC<Props> = ({ history, onSelect, onClear }) => {
    return (
        <div className="search-history-card">
            <div className="history-header">
                <h2 className="history-title">Buscados Anteriormente</h2>
                {history.length > 0 && (
                    <button className="clear-history-btn" onClick={onClear}>
                        🗑️ Limpar Histórico
                    </button>
                )}
            </div>
            {history.length === 0 ? (
                <p className="history-empty">Nenhum produto buscado ainda</p>
            ) : (
                <div className="history-tags">
                    {history.map((item, idx) => (
                        <button
                            key={item.name + idx}
                            onClick={() => onSelect(item)}
                            className="history-tag"
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};