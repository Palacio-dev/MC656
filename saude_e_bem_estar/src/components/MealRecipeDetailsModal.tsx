import React from 'react';
import { RecipeDetailsResponse } from '../models/RecipeModel';
import { FirebaseRecipeService } from '../services/FirebaseRecipeService';
import { getRecipeNutrition, RecipeNutrition, calculateRecipeNutrition } from '../services/RecipeNutritionService';
import { Product } from '../types/product';
import { IngredientSubstitutionModal } from './IngredientSubstitutionModal';
import { getUserSubstitutions, saveUserSubstitutions, IngredientSubstitution } from '../services/IngredientSubstitutionService';
import { getAuth } from 'firebase/auth';
import '../styles/MealRecipeDetailsModal.css';

interface MealRecipeDetailsModalProps {
  isOpen: boolean;
  recipeId: string | null;
  onClose: () => void;
}

export const MealRecipeDetailsModal: React.FC<MealRecipeDetailsModalProps> = ({
  isOpen,
  recipeId,
  onClose
}) => {
  const [recipe, setRecipe] = React.useState<RecipeDetailsResponse | null>(null);
  const [nutrition, setNutrition] = React.useState<RecipeNutrition | null>(null);
  const [loadingRecipe, setLoadingRecipe] = React.useState(false);
  const [loadingNutrition, setLoadingNutrition] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [substitutions, setSubstitutions] = React.useState<{ [key: number]: IngredientSubstitution }>({});
  const [showSubstitutionModal, setShowSubstitutionModal] = React.useState(false);
  const [selectedIngredient, setSelectedIngredient] = React.useState<{
    text: string;
    index: number;
    currentProduct: Product | null;
  } | null>(null);
  const [recalculating, setRecalculating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && recipeId) {
      loadRecipe();
      loadUserSubstitutions();
    }
  }, [isOpen, recipeId]);

  const loadRecipe = async () => {
    if (!recipeId) return;

    setLoadingRecipe(true);
    setError(null);

    try {
      const recipeData = await FirebaseRecipeService.getRecipe(recipeId);
      if (recipeData) {
        setRecipe(recipeData);
        
        // Load nutrition data in parallel
        loadNutrition(recipeData);
      } else {
        setError('Receita não encontrada');
      }
    } catch (err) {
      console.error('Erro ao carregar receita:', err);
      setError('Erro ao carregar detalhes da receita');
    } finally {
      setLoadingRecipe(false);
    }
  };

  const loadUserSubstitutions = async () => {
    if (!recipeId) return;
    
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const userSubs = await getUserSubstitutions(userId, recipeId);
      if (userSubs && userSubs.substitutions) {
        setSubstitutions(userSubs.substitutions);
        
        // If user has custom nutrition from substitutions, use it
        if (userSubs.customNutrition) {
          setNutrition(userSubs.customNutrition);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar substituições:', err);
    }
  };

  const loadNutrition = async (recipeData: RecipeDetailsResponse) => {
    setLoadingNutrition(true);
    
    try {
      const nutritionData = await getRecipeNutrition(recipeData, true);
      setNutrition(nutritionData);
    } catch (err) {
      console.error('Erro ao calcular nutrição:', err);
      // Don't show error, just log it - nutrition is optional
    } finally {
      setLoadingNutrition(false);
    }
  };

  const handleOpenSubstitution = (ingredientIndex: number) => {
    if (!nutrition || !nutrition.ingredients[ingredientIndex]) return;

    const ingredient = nutrition.ingredients[ingredientIndex];
    setSelectedIngredient({
      text: ingredient.originalText,
      index: ingredientIndex,
      currentProduct: ingredient.matchedProduct
    });
    setShowSubstitutionModal(true);
  };

  const handleSubstitute = async (ingredientIndex: number, newProduct: Product) => {
    if (!recipe || !recipeId || !nutrition) return;

    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert('Você precisa estar logado para fazer substituições');
      return;
    }

    setRecalculating(true);

    try {
      // Create substitution record
      const substitution: IngredientSubstitution = {
        recipeId,
        originalIngredient: nutrition.ingredients[ingredientIndex].originalText,
        substitutedProductName: newProduct.name,
        createdAt: new Date()
      };

      // Update substitutions
      const updatedSubstitutions = {
        ...substitutions,
        [ingredientIndex]: substitution
      };
      setSubstitutions(updatedSubstitutions);

      // Recalculate nutrition with new product
      const updatedNutrition = { ...nutrition };
      updatedNutrition.ingredients[ingredientIndex] = {
        ...updatedNutrition.ingredients[ingredientIndex],
        matchedProduct: newProduct,
        nutritionContribution: {
          calories: (newProduct.calories * updatedNutrition.ingredients[ingredientIndex].estimatedQuantity) / 100,
          carbs: (newProduct.carbs * updatedNutrition.ingredients[ingredientIndex].estimatedQuantity) / 100,
          protein: (newProduct.protein * updatedNutrition.ingredients[ingredientIndex].estimatedQuantity) / 100,
          fat: (newProduct.fat * updatedNutrition.ingredients[ingredientIndex].estimatedQuantity) / 100,
          fiber: (newProduct.fiber * updatedNutrition.ingredients[ingredientIndex].estimatedQuantity) / 100,
        }
      };

      // Recalculate totals
      const totals = updatedNutrition.ingredients.reduce(
        (sum, ing) => ({
          calories: sum.calories + ing.nutritionContribution.calories,
          carbs: sum.carbs + ing.nutritionContribution.carbs,
          protein: sum.protein + ing.nutritionContribution.protein,
          fat: sum.fat + ing.nutritionContribution.fat,
          fiber: sum.fiber + ing.nutritionContribution.fiber,
        }),
        { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 }
      );

      updatedNutrition.calories = totals.calories;
      updatedNutrition.carbs = totals.carbs;
      updatedNutrition.protein = totals.protein;
      updatedNutrition.fat = totals.fat;
      updatedNutrition.fiber = totals.fiber;

      updatedNutrition.perServing = {
        calories: totals.calories / updatedNutrition.portionOutput,
        carbs: totals.carbs / updatedNutrition.portionOutput,
        protein: totals.protein / updatedNutrition.portionOutput,
        fat: totals.fat / updatedNutrition.portionOutput,
        fiber: totals.fiber / updatedNutrition.portionOutput,
      };

      updatedNutrition.calculationMethod = 'calculated';
      updatedNutrition.lastCalculated = new Date();

      setNutrition(updatedNutrition);

      // Save to Firebase
      await saveUserSubstitutions(userId, recipeId, updatedSubstitutions, updatedNutrition);

      console.log('✅ Substituição salva com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar substituição:', err);
      alert('Erro ao salvar substituição');
    } finally {
      setRecalculating(false);
    }
  };

  if (!isOpen) return null;

  const isLoading = loadingRecipe || loadingNutrition;

  return (
    <div className="meal-recipe-modal-overlay" onClick={onClose}>
      <div className="meal-recipe-modal" onClick={(e) => e.stopPropagation()}>
        <button className="meal-recipe-modal-close" onClick={onClose}>
          ✕
        </button>

        {loadingRecipe && (
          <div className="meal-recipe-loading">
            <div className="meal-recipe-spinner"></div>
            <p>Carregando receita...</p>
          </div>
        )}

        {error && (
          <div className="meal-recipe-error">
            <p>⚠️ {error}</p>
          </div>
        )}

        {recipe && !loadingRecipe && (
          <div className="meal-recipe-content">
            <h2 className="meal-recipe-title">{recipe.title}</h2>

            <div className="meal-recipe-meta">
              {recipe.stats.prepare_time_minutes > 0 && (
                <div className="meal-recipe-meta-item">
                  <span className="meal-recipe-meta-icon">⏱️</span>
                  <span>{recipe.stats.prepare_time_minutes} minutos</span>
                </div>
              )}
              {recipe.stats.portion_output > 0 && (
                <div className="meal-recipe-meta-item">
                  <span className="meal-recipe-meta-icon">👥</span>
                  <span>{recipe.stats.portion_output} porções</span>
                </div>
              )}
              {recipe.stats.favorites > 0 && (
                <div className="meal-recipe-meta-item">
                  <span className="meal-recipe-meta-icon">⭐</span>
                  <span>{recipe.stats.favorites} favoritos</span>
                </div>
              )}
            </div>

            {/* Nutrition Information */}
            {loadingNutrition && (
              <div className="meal-recipe-nutrition">
                <h3 className="meal-recipe-section-title">📊 Informação Nutricional (Aproximada)</h3>
                <p className="meal-recipe-nutrition-loading">Calculando nutrição...</p>
              </div>
            )}
            
            {nutrition && !loadingNutrition && (
              <div className="meal-recipe-nutrition">
                <h3 className="meal-recipe-section-title">📊 Informação Nutricional (Aproximada)</h3>
                <p className="meal-recipe-nutrition-disclaimer">
                  ⚠️ Valores aproximados baseados nos ingredientes da receita
                </p>
                <div className="meal-recipe-nutrition-grid">
                  <div className="meal-recipe-nutrition-item">
                    <span className="meal-recipe-nutrition-label">Calorias</span>
                    <span className="meal-recipe-nutrition-value">
                      {nutrition.perServing.calories.toFixed(0)} kcal
                    </span>
                    <span className="meal-recipe-nutrition-sublabel">por porção</span>
                  </div>
                  <div className="meal-recipe-nutrition-item">
                    <span className="meal-recipe-nutrition-label">Carboidratos</span>
                    <span className="meal-recipe-nutrition-value">
                      {nutrition.perServing.carbs.toFixed(1)}g
                    </span>
                    <span className="meal-recipe-nutrition-sublabel">por porção</span>
                  </div>
                  <div className="meal-recipe-nutrition-item">
                    <span className="meal-recipe-nutrition-label">Proteínas</span>
                    <span className="meal-recipe-nutrition-value">
                      {nutrition.perServing.protein.toFixed(1)}g
                    </span>
                    <span className="meal-recipe-nutrition-sublabel">por porção</span>
                  </div>
                  <div className="meal-recipe-nutrition-item">
                    <span className="meal-recipe-nutrition-label">Gorduras</span>
                    <span className="meal-recipe-nutrition-value">
                      {nutrition.perServing.fat.toFixed(1)}g
                    </span>
                    <span className="meal-recipe-nutrition-sublabel">por porção</span>
                  </div>
                  <div className="meal-recipe-nutrition-item">
                    <span className="meal-recipe-nutrition-label">Fibras</span>
                    <span className="meal-recipe-nutrition-value">
                      {nutrition.perServing.fiber.toFixed(1)}g
                    </span>
                    <span className="meal-recipe-nutrition-sublabel">por porção</span>
                  </div>
                </div>
                <div className="meal-recipe-nutrition-total">
                  <p>
                    <strong>Total da receita:</strong> {nutrition.calories.toFixed(0)} kcal 
                    ({nutrition.portionOutput} {nutrition.portionOutput === 1 ? 'porção' : 'porções'})
                  </p>
                  {nutrition.calculationMethod === 'stored' && (
                    <p className="meal-recipe-nutrition-cached">✅ Dados em cache</p>
                  )}
                  {nutrition.calculationMethod === 'calculated' && (
                    <p className="meal-recipe-nutrition-calculated">🔄 Calculado agora</p>
                  )}
                </div>

                {/* Ingredients breakdown */}
                <details className="meal-recipe-nutrition-breakdown" open>
                  <summary className="meal-recipe-nutrition-breakdown-title">
                    📋 Ingredientes usados no cálculo ({nutrition.ingredients.length})
                    {Object.keys(substitutions).length > 0 && (
                      <span className="substitutions-badge">
                        {Object.keys(substitutions).length} substituição(ões)
                      </span>
                    )}
                  </summary>
                  {recalculating && (
                    <div className="meal-recipe-nutrition-recalculating">
                      ♻️ Recalculando nutrição...
                    </div>
                  )}
                  <div className="meal-recipe-nutrition-breakdown-list">
                    {nutrition.ingredients.map((ing, idx) => (
                      <div 
                        key={idx} 
                        className={`meal-recipe-nutrition-breakdown-item ${substitutions[idx] ? 'substituted' : ''}`}
                      >
                        <div className="meal-recipe-nutrition-breakdown-original">
                          {ing.originalText}
                          {substitutions[idx] && (
                            <span className="substitution-indicator"> (substituído)</span>
                          )}
                        </div>
                        {ing.matchedProduct ? (
                          <div className="meal-recipe-nutrition-breakdown-matched-row">
                            <div className="meal-recipe-nutrition-breakdown-matched">
                              ✅ {ing.matchedProduct.name}
                              <span className="meal-recipe-nutrition-breakdown-quantity">
                                {ing.estimatedQuantity}g = {ing.nutritionContribution.calories.toFixed(0)} kcal
                              </span>
                            </div>
                            <button
                              className="substitute-ingredient-btn"
                              onClick={() => handleOpenSubstitution(idx)}
                              title="Substituir ingrediente"
                            >
                              🔄
                            </button>
                          </div>
                        ) : (
                          <div className="meal-recipe-nutrition-breakdown-not-found">
                            ⚠️ Ingrediente não encontrado na base de dados
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {/* Substitution Modal */}
            {selectedIngredient && (
              <IngredientSubstitutionModal
                isOpen={showSubstitutionModal}
                ingredientText={selectedIngredient.text}
                ingredientIndex={selectedIngredient.index}
                currentProduct={selectedIngredient.currentProduct}
                onSubstitute={handleSubstitute}
                onClose={() => {
                  setShowSubstitutionModal(false);
                  setSelectedIngredient(null);
                }}
              />
            )}

            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="meal-recipe-section">
                {recipe.ingredients.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="meal-recipe-subsection">
                    {section.title && section.title !== 'default' && (
                      <h3 className="meal-recipe-section-title">📝 {section.title}</h3>
                    )}
                    {(!section.title || section.title === 'default') && (
                      <h3 className="meal-recipe-section-title">📝 Ingredientes</h3>
                    )}
                    <ul className="meal-recipe-ingredients">
                      {section.items.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {recipe.instructions && recipe.instructions.length > 0 && (
              <div className="meal-recipe-section">
                {recipe.instructions.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="meal-recipe-subsection">
                    {section.title && section.title !== 'default' && (
                      <h3 className="meal-recipe-section-title">👨‍🍳 {section.title}</h3>
                    )}
                    {(!section.title || section.title === 'default') && (
                      <h3 className="meal-recipe-section-title">👨‍🍳 Modo de Preparo</h3>
                    )}
                    <ol className="meal-recipe-instructions">
                      {section.items.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
