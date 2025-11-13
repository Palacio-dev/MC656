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
      <h1 className="text-2xl font-bold mb-2">Busca de Produtos</h1>
      <div className="shadow-lg border rounded-lg p-4 relative">
        <SearchInput 
          value={vm.query} 
          onChange={vm.setQuery} 
          placeholder="Search for a product..." 
          loading={vm.loading}
        />
        {vm.suggestions.length > 0 && (
          <SuggestionsList 
            items={vm.suggestions} 
            onSelect={vm.select} 
          />
        )}
      </div>

      {vm.selected && (
        <ProductDetails product={vm.selected} />
      )}

      <SearchHistory 
        history={vm.history} 
        onSelect={vm.selectFromHistory} 
        onClear={vm.clearHistory} 
      />
    </div>
  );
};


export default ProductSearchView;