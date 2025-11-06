import React from "react";
import { useProductSearch } from "../Hooks/useProductSearch";
import { SearchInput } from "../Components/SearchInput";
import { SuggestionsList } from "../Components/SuggestionsList";
import { ProductDetails } from "../Components/ProductDetails";
import { SearchHistory } from "../Components/SearchHistory";


const ProductSearchView: React.FC = () => {
const vm = useProductSearch();


return (
<div className="p-6 grid gap-6">
<div className="shadow-lg border rounded-lg p-4 relative">
<SearchInput value={vm.query} onChange={vm.setQuery} placeholder="Search for a product..." />
<SuggestionsList items={vm.suggestions} onSelect={vm.select} />
</div>


<ProductDetails product={vm.selected} />


<SearchHistory history={vm.history} onSelect={vm.selectFromHistory} onClear={vm.clearHistory} />
</div>
);
};


export default ProductSearchView;