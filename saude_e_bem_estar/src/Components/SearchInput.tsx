import React from "react";


type Props = {
value: string;
onChange: (v: string) => void;
placeholder?: string;
};


export const SearchInput: React.FC<Props> = ({ value, onChange, placeholder }) => {
return (
<input
type="text"
value={value}
onChange={(e) => onChange(e.target.value)}
placeholder={placeholder || "Search for a product..."}
className="border rounded-lg p-2 text-lg w-full"
/>
);
};