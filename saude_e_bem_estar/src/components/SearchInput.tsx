import React from "react";


type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  loading?: boolean;
  onEnter?: () => void;
};

export const SearchInput: React.FC<Props> = ({ value, onChange, placeholder, loading, onEnter }) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };

  return (
    <div className="search-input-container">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder || "Search for a product..."}
        className="search-input"
        disabled={loading}
      />
      {loading && (
        <div className="search-loading-spinner">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};