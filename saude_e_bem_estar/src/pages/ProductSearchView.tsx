import React from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useProductSearch } from "../hooks/useProductSearch";
import { SearchInput } from "../components/SearchInput";
import { SuggestionsList } from "../components/SuggestionsList";
import { ProductDetails } from "../components/ProductDetails";
import { SearchHistory } from "../components/SearchHistory";
import "../styles/ProductSearch.css";

const ProductSearchView: React.FC = () => {
  const navigate = useNavigate();
  const vm = useProductSearch();

  return (
    <div className="product-search-container">
      <PageHeader 
        title="Busca de Produtos"
        subtitle="Digite o nome do produto para buscar informações nutricionais"
      />
      
      <div className="product-search-content">
        <div className="search-box-wrapper">
          <SearchInput 
            value={vm.query} 
            onChange={vm.setQuery} 
            placeholder="Digite o nome do produto (ex: farinha trigo)..." 
            loading={vm.loading}
            onEnter={vm.triggerSearch}
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
    </div>
  );
};


export default ProductSearchView;