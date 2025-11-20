import React, { useState, useEffect } from 'react';
import { IngredientMatch } from '../services/IngredientMatcherService';
import { shoppingListService } from '../models/ShoppingListService';
import { useAuth } from '../hooks/useAuth';
import '../styles/IngredientMatchModal.css';

interface IngredientMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredientMatch: IngredientMatch | null;
  onAddToList: (ingredientName: string) => void;
}

/**
 * Modal que mostra ingredientes correspondentes encontrados no banco de dados
 * e permite adicionar à lista de compras
 */
export const IngredientMatchModal: React.FC<IngredientMatchModalProps> = ({
  isOpen,
  onClose,
  ingredientMatch,
  onAddToList
}) => {
  const { currentUser } = useAuth();
  const [shoppingLists, setShoppingLists] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Carrega as listas de compras do usuário
  useEffect(() => {
    if (isOpen && currentUser) {
      loadShoppingLists();
    }
  }, [isOpen, currentUser]);

  const loadShoppingLists = async () => {
    if (!currentUser) return;
    
    try {
      const lists = await shoppingListService.getAllLists(currentUser.uid);
      setShoppingLists(lists);
      
      // Seleciona a primeira lista por padrão
      if (lists.length > 0 && !selectedListId) {
        setSelectedListId(lists[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar listas:', err);
      setError('Não foi possível carregar suas listas');
    }
  };

  const handleAddToList = async (ingredientName: string) => {
    if (!currentUser || !selectedListId) {
      setError('Selecione uma lista de compras');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Adiciona o ingrediente à lista selecionada
      await shoppingListService.getListById(selectedListId, currentUser.uid)
        .then(list => {
          if (list) {
            const updatedItems = [...list.items, {
              id: Date.now().toString(),
              text: ingredientName,
              checked: false
            }];
            return shoppingListService.updateList(selectedListId, currentUser.uid, {
              items: updatedItems
            });
          }
        });

      setSuccess(true);
      onAddToList(ingredientName);
      
      // Fecha o modal após 1.5 segundos
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao adicionar à lista:', err);
      setError(err.message || 'Erro ao adicionar ingrediente');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !ingredientMatch) return null;

  return (
    <div className="ingredient-modal-overlay" onClick={onClose}>
      <div className="ingredient-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ingredient-modal-header">
          <h2>Adicionar Ingrediente</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Original ingredient text */}
        <div className="ingredient-original">
          <p className="label">Ingrediente da receita:</p>
          <p className="text">{ingredientMatch.originalText}</p>
          {ingredientMatch.searchTerm !== ingredientMatch.originalText.toLowerCase() && (
            <p className="search-term">
              <small>Buscando por: <strong>{ingredientMatch.searchTerm}</strong></small>
            </p>
          )}
        </div>

        {/* Success message */}
        {success && (
          <div className="success-message">
            ✅ Adicionado à lista com sucesso!
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Shopping list selector */}
        {shoppingLists.length > 0 && (
          <div className="list-selector">
            <label htmlFor="shopping-list">Adicionar à lista:</label>
            <select
              id="shopping-list"
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              disabled={isLoading}
            >
              {shoppingLists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* No lists message */}
        {shoppingLists.length === 0 && (
          <div className="no-lists-message">
            <p>Você não tem listas de compras.</p>
            <p>Crie uma lista primeiro para adicionar ingredientes.</p>
          </div>
        )}

        {/* Matched ingredients */}
        <div className="ingredient-matches">
          <p className="matches-label">
            {ingredientMatch.matches.length > 0
              ? 'Ingredientes encontrados no banco de dados:'
              : 'Nenhum ingrediente correspondente encontrado'}
          </p>
          
          {ingredientMatch.matches.length > 0 ? (
            <div className="matches-list">
              {ingredientMatch.matches.map((match, index) => (
                <div key={index} className="match-item">
                  <div className="match-info">
                    <h4>{match.name}</h4>
                    <div className="match-nutrients">
                      <span>🔥 {match.calories} kcal</span>
                      <span>🥖 {match.carbs}g carb</span>
                      <span>🥩 {match.protein}g prot</span>
                    </div>
                  </div>
                  <button
                    className="add-btn"
                    onClick={() => handleAddToList(match.name)}
                    disabled={isLoading || shoppingLists.length === 0}
                  >
                    {isLoading ? '⏳' : '➕ Adicionar'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-matches">
              <p>Você pode adicionar o ingrediente mesmo assim:</p>
              <button
                className="add-original-btn"
                onClick={() => handleAddToList(ingredientMatch.searchTerm)}
                disabled={isLoading || shoppingLists.length === 0}
              >
                ➕ Adicionar "{ingredientMatch.searchTerm}"
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
