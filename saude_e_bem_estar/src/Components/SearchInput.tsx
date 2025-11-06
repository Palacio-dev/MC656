import React from "react";


type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  loading?: boolean;
};

export const SearchInput: React.FC<Props> = ({ value, onChange, placeholder, loading }) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search for a product..."}
        className="border rounded-lg p-2 text-lg w-full"
        disabled={loading}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
};