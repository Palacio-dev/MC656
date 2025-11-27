import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { MealPlannerViewModel } from "../hooks/MealPlannerHook";
import { MealRecipeDetailsModal } from "../components/MealRecipeDetailsModal";
import { NutritionSummary } from "../components/NutritionSummary";
import { PageHeader } from "../components/PageHeader";
import { calculatePeriodNutrition, PeriodNutritionSummary } from "../services/MealPlanNutritionService";
import { WeeklyStrategy } from "../components/strategies/WeeklyStrategy";
import React from "react";
import "../styles/mealplaner.css";

export const MealPlannerView = observer(({ vm }: { vm: MealPlannerViewModel }) => {
  const grid = vm.strategy.getGrid();
  const title = vm.strategy.getTitle();
  const navigate = useNavigate();
  const [showCustomInput, setShowCustomInput] = React.useState<{date: Date, mealKey: string} | null>(null);
  const [customMealText, setCustomMealText] = React.useState("");
  const [customNutrition, setCustomNutrition] = React.useState({
    calories: "",
    carbs: "",
    protein: "",
    fat: "",
    fiber: ""
  });
  const [showNutritionFields, setShowNutritionFields] = React.useState(false);
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = React.useState<Date | null>(null);
  const [newSlotName, setNewSlotName] = React.useState("");
  const [selectedRecipeId, setSelectedRecipeId] = React.useState<string | null>(null);
  const [showRecipeModal, setShowRecipeModal] = React.useState(false);
  const [nutritionSummary, setNutritionSummary] = React.useState<PeriodNutritionSummary | null>(null);
  const [loadingNutrition, setLoadingNutrition] = React.useState(false);
  const [currentView, setCurrentView] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [nutritionUpdateTrigger, setNutritionUpdateTrigger] = React.useState(0);

  const getMealKey = (label: string) => {
    if (label === "Café da manhã") return "breakfast";
    if (label === "Almoço") return "lunch";
    if (label === "Jantar") return "dinner";
    if (label === "Lanche") return "snack";
    // Custom slots use their own label as key
    return label.toLowerCase().replace(/\s+/g, '_');
  };

  const getMealLabel = (key: string) => {
    if (key === "breakfast") return "Café da manhã";
    if (key === "lunch") return "Almoço";
    if (key === "dinner") return "Jantar";
    if (key === "snack") return "Lanche";
    // Custom slots: capitalize first letter
    return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getCustomMealSlots = (date: Date) => {
    const mealForDate = vm.getMealForDate(date) || {};
    const standardKeys = ['breakfast', 'lunch', 'dinner', 'snack'];
    // Include all custom slots, even if empty (they should still show with add buttons)
    return Object.keys(mealForDate).filter(key => !standardKeys.includes(key));
  };

  const handleAddFromRecipeSearch = () => {
    navigate("/Welcome/RecipeSearch");
  };

  const handleOpenCustomInput = (date: Date, mealKey: string) => {
    setShowCustomInput({ date, mealKey });
    setCustomMealText("");
    setCustomNutrition({
      calories: "",
      carbs: "",
      protein: "",
      fat: "",
      fiber: ""
    });
    setShowNutritionFields(false);
  };

  const handleSaveCustomMeal = async () => {
    if (showCustomInput && customMealText.trim()) {
      const mealData: any = {
        title: customMealText.trim()
      };

      // If nutrition values were provided, save them
      if (showNutritionFields && customNutrition.calories) {
        const customMealId = `custom_${Date.now()}`;
        mealData.recipeId = customMealId;
        
        // Save custom nutrition to Firebase
        const { FirebaseRecipeService } = await import('../services/FirebaseRecipeService');
        const nutrition = {
          recipeId: customMealId,
          calories: parseFloat(customNutrition.calories) || 0,
          carbs: parseFloat(customNutrition.carbs) || 0,
          protein: parseFloat(customNutrition.protein) || 0,
          fat: parseFloat(customNutrition.fat) || 0,
          fiber: parseFloat(customNutrition.fiber) || 0,
          portionOutput: 1,
          perServing: {
            calories: parseFloat(customNutrition.calories) || 0,
            carbs: parseFloat(customNutrition.carbs) || 0,
            protein: parseFloat(customNutrition.protein) || 0,
            fat: parseFloat(customNutrition.fat) || 0,
            fiber: parseFloat(customNutrition.fiber) || 0,
          },
          calculationMethod: 'stored' as const,
          lastCalculated: new Date(),
          ingredients: []
        };
        
        await FirebaseRecipeService.saveRecipeNutrition(customMealId, nutrition);
        
        // Save the custom recipe to recipes collection so it can be displayed later
        const customRecipe = {
          id: customMealId,
          title: customMealText.trim(),
          ingredients: [],
          instructions: [],
          stats: {
            prepare_time_minutes: 0,
            portion_output: 1,
            favorites: 0
          },
          isCustom: true
        };
        
        await FirebaseRecipeService.saveRecipe(customRecipe);
      }

      await vm.updateMeal(showCustomInput.date, showCustomInput.mealKey as any, mealData);
      setShowCustomInput(null);
      setCustomMealText("");
      setCustomNutrition({
        calories: "",
        carbs: "",
        protein: "",
        fat: "",
        fiber: ""
      });
      setShowNutritionFields(false);
      
      // Trigger nutrition recalculation
      setNutritionUpdateTrigger(prev => prev + 1);
    }
  };

  const handleCancelCustomInput = () => {
    setShowCustomInput(null);
    setCustomMealText("");
    setCustomNutrition({
      calories: "",
      carbs: "",
      protein: "",
      fat: "",
      fiber: ""
    });
    setShowNutritionFields(false);
  };

  const handleDeleteMeal = async (date: Date, mealKey: string) => {
    if (window.confirm("Tem certeza que deseja remover esta refeição?")) {
      await vm.updateMeal(date, mealKey as any, "");
      // Trigger nutrition recalculation
      setNutritionUpdateTrigger(prev => prev + 1);
    }
  };

  const handleMealClick = (meal: any) => {
    const recipeId = vm.getMealRecipeId(meal);
    if (recipeId) {
      setSelectedRecipeId(recipeId);
      setShowRecipeModal(true);
    }
  };

  const handleCloseRecipeModal = () => {
    setShowRecipeModal(false);
    setSelectedRecipeId(null);
  };

  /**
   * Calculate nutrition for current view
   */
  const calculateNutritionForView = React.useCallback(async () => {
    setLoadingNutrition(true);
    
    try {
      const grid = vm.strategy.getGrid();
      if (grid.length === 0) {
        setNutritionSummary(null);
        return;
      }
      
      // Get date range from grid
      const dates = grid.map(row => row[0].date).filter((d): d is Date => d !== null);
      if (dates.length === 0) {
        setNutritionSummary(null);
        return;
      }
      
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];
      
      // Get meal plan data
      const mealPlan = vm.mealsByDate;
      
      // Calculate nutrition
      const summary = await calculatePeriodNutrition(mealPlan, startDate, endDate);
      setNutritionSummary(summary);
    } catch (error) {
      console.error('Error calculating nutrition:', error);
      setNutritionSummary(null);
    } finally {
      setLoadingNutrition(false);
    }
  }, [vm]);

  /**
   * Recalculate nutrition when view changes or meals are updated
   */
  React.useEffect(() => {
    calculateNutritionForView();
  }, [calculateNutritionForView, vm.mealsByDate, currentView, nutritionUpdateTrigger]);

  /**
   * Toggle share menu
   */
  const toggleShareMenu = () => {
    setShowShareMenu(!showShareMenu);
  };

  /**
   * Generate share text based on current view
   */
  const getShareData = () => {
    const shareText = generateMealPlanText();
    return { text: shareText };
  };

  /**
   * Generate formatted text of meal plan
   */
  const generateMealPlanText = () => {
    let text = `${title}\n\n`;
    
    grid.forEach((row) => {
      const date = row[0].date;
      if (!date) return;
      
      const mealForDate = vm.getMealForDate(date) || {};
      const dateStr = date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      text += `📅 ${dateStr}\n`;
      
      // Standard meal slots
      row.forEach((cell) => {
        const mealKey = getMealKey(cell.label);
        const value = (mealForDate as any)[mealKey] || "";
        if (value) {
          text += `  ${cell.label}: ${value}\n`;
        }
      });
      
      // Custom meal slots
      const customSlots = getCustomMealSlots(date);
      customSlots.forEach((slotKey) => {
        const value = (mealForDate as any)[slotKey] || "";
        const label = getMealLabel(slotKey);
        if (value) {
          text += `  ${label}: ${value}\n`;
        }
      });
      
      text += '\n';
    });
    
    return text;
  };

  /**
   * Share to WhatsApp
   */
  const shareToWhatsApp = () => {
    const { text } = getShareData();
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareMenu(false);
  };

  /**
   * Share to Facebook
   */
  const shareToFacebook = () => {
    const { text } = getShareData();
    // Facebook doesn't support pre-filled text, but we can copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      alert('Planejamento copiado! Cole no Facebook.');
      window.open('https://www.facebook.com/', '_blank');
      setShowShareMenu(false);
    });
  };

  /**
   * Share to Twitter
   */
  const shareToTwitter = () => {
    const { text } = getShareData();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
    setShowShareMenu(false);
  };

  /**
   * Copy to clipboard
   */
  const copyToClipboard = () => {
    const { text } = getShareData();
    navigator.clipboard.writeText(text).then(
      () => {
        alert('Planejamento copiado para a área de transferência!');
        setShowShareMenu(false);
      },
      (err) => {
        console.error('Failed to copy:', err);
        alert('Não foi possível copiar o planejamento');
      }
    );
  };

  /**
   * Open add custom slot modal
   */
  const handleOpenAddSlotModal = (date: Date) => {
    setShowAddSlotModal(date);
    setNewSlotName("");
  };

  /**
   * Add custom meal slot
   */
  const handleAddCustomSlot = async () => {
    if (showAddSlotModal && newSlotName.trim()) {
      const slotKey = newSlotName.trim().toLowerCase().replace(/\s+/g, '_');
      // Create empty slot so it appears in the grid with add buttons
      await vm.updateMeal(showAddSlotModal, slotKey as any, "");
      setShowAddSlotModal(null);
      setNewSlotName("");
    }
  };

  /**
   * Close share menu when clicking outside
   */
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showShareMenu && !target.closest('.share-menu-container')) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  return (
    <div className="p-4 space-y-4">
      <PageHeader 
        title="Planejamento de Refeições"
        subtitle="Organize suas refeições semanais e mensais"
      />

      <div className="meal-planner-title-row">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        <div className="share-menu-container">
          <button onClick={toggleShareMenu} className="share-btn" aria-label="Compartilhar">
            🔗 Compartilhar
          </button>
          {showShareMenu && (
            <div className="share-menu">
              <button onClick={shareToWhatsApp} className="share-option whatsapp">
                <span className="share-icon">💬</span>
                <span>WhatsApp</span>
              </button>
              <button onClick={shareToFacebook} className="share-option facebook">
                <span className="share-icon">📘</span>
                <span>Facebook</span>
              </button>
              <button onClick={shareToTwitter} className="share-option twitter">
                <span className="share-icon">🐦</span>
                <span>Twitter</span>
              </button>
              <button onClick={copyToClipboard} className="share-option copy-link">
                <span className="share-icon">📋</span>
                <span>Copiar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="meal-planner-view-controls">
        <div className="meal-planner-buttons">
          <button 
            className={currentView === 'daily' ? 'active' : ''}
            onClick={() => {
              vm.setDailyView(new Date());
              setCurrentView('daily');
            }}
          >
            Diária
          </button>
          <button 
            className={currentView === 'weekly' ? 'active' : ''}
            onClick={() => {
              vm.setWeeklyView();
              setCurrentView('weekly');
            }}
          >
            Semanal
          </button>
          <button
            className={currentView === 'monthly' ? 'active' : ''}
            onClick={() => {
              vm.setMonthlyView(new Date().getMonth(), new Date().getFullYear());
              setCurrentView('monthly');
            }}
          >
            Mensal
          </button>
        </div>

        <div className="meal-planner-navigation">
          <button 
            className="nav-arrow"
            onClick={() => {
              const currentRange = vm.strategy.getDateRange();
              const currentStart = currentRange.start;
              
              if (currentView === 'daily') {
                const prevDay = new Date(currentStart);
                prevDay.setDate(prevDay.getDate() - 1);
                vm.setDailyView(prevDay);
              } else if (currentView === 'weekly') {
                const prevWeek = new Date(currentStart);
                prevWeek.setDate(prevWeek.getDate() - 7);
                vm.strategy = new WeeklyStrategy(prevWeek);
                vm.loadMealsForCurrentView();
              } else if (currentView === 'monthly') {
                const prevMonth = new Date(currentStart);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                vm.setMonthlyView(prevMonth.getMonth(), prevMonth.getFullYear());
              }
            }}
            title="Anterior"
          >
            ←
          </button>
          <button 
            className="nav-arrow nav-today"
            onClick={() => {
              const today = new Date();
              if (currentView === 'daily') {
                vm.setDailyView(today);
              } else if (currentView === 'weekly') {
                vm.setWeeklyView();
              } else if (currentView === 'monthly') {
                vm.setMonthlyView(today.getMonth(), today.getFullYear());
              }
            }}
            title={currentView === 'daily' ? 'Hoje' : currentView === 'weekly' ? 'Esta Semana' : 'Este Mês'}
          >
            {currentView === 'daily' ? 'Hoje' : currentView === 'weekly' ? 'Esta Semana' : 'Este Mês'}
          </button>
          <button 
            className="nav-arrow"
            onClick={() => {
              const currentRange = vm.strategy.getDateRange();
              const currentStart = currentRange.start;
              
              if (currentView === 'daily') {
                const nextDay = new Date(currentStart);
                nextDay.setDate(nextDay.getDate() + 1);
                vm.setDailyView(nextDay);
              } else if (currentView === 'weekly') {
                const nextWeek = new Date(currentStart);
                nextWeek.setDate(nextWeek.getDate() + 7);
                vm.strategy = new WeeklyStrategy(nextWeek);
                vm.loadMealsForCurrentView();
              } else if (currentView === 'monthly') {
                const nextMonth = new Date(currentStart);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                vm.setMonthlyView(nextMonth.getMonth(), nextMonth.getFullYear());
              }
            }}
            title="Próximo"
          >
            →
          </button>
        </div>
      </div>

      {/* Nutrition Summary */}
      <NutritionSummary
        summary={nutritionSummary}
        loading={loadingNutrition}
        periodType={currentView}
      />

      <div
        className="grid gap-1 sm:gap-2 md:gap-6 place-items-center"
        style={{
          display: "grid",
          gridTemplateColumns: `auto repeat(${7}, 1fr)`,
          gap: "10px",
          alignItems: "center",
        }}
      >
        {grid.map((row, rowIndex) => {
          const date = row[0].date;
          if (!date) return null;

          const mealForDate = vm.getMealForDate(date) || {};

          const customSlots = getCustomMealSlots(date);

          return (
            <div key={rowIndex} className="meal-planner-day">
              <div className="meal-date">
                <strong>{date.toLocaleDateString('pt-BR')}</strong>
              </div>

              {row.map((cell, cellIndex) => {
                const mealKey = getMealKey(cell.label);
                const meal = (mealForDate as any)[mealKey];
                const mealTitle = vm.getMealTitle(meal);
                const hasRecipeId = vm.getMealRecipeId(meal);

                return (
                  <div key={cellIndex} className="meal-planner-cell">
                    <strong>{cell.label}</strong>
                    
                    {mealTitle ? (
                      // Meal exists - show it with delete button
                      <div className="meal-display">
                        <div 
                          className={`meal-text ${hasRecipeId ? 'meal-clickable' : ''}`}
                          onClick={() => hasRecipeId && handleMealClick(meal)}
                          title={hasRecipeId ? 'Clique para ver detalhes da receita' : ''}
                        >
                          {mealTitle}
                          {hasRecipeId && <span className="meal-recipe-indicator"> 📖</span>}
                        </div>
                        <button
                          className="delete-meal-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeal(date, mealKey);
                          }}
                          title="Remover refeição"
                        >
                          🗑️
                        </button>
                      </div>
                    ) : (
                      // No meal - show add buttons
                      <div className="meal-add-buttons">
                        <button
                          className="add-meal-btn recipe-btn"
                          onClick={handleAddFromRecipeSearch}
                          title="Buscar receita"
                        >
                          🔍 Receita
                        </button>
                        <button
                          className="add-meal-btn custom-btn"
                          onClick={() => handleOpenCustomInput(date, mealKey)}
                          title="Adicionar texto personalizado"
                        >
                          ✏️ Customizar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Custom meal slots */}
              {customSlots.map((slotKey) => {
                const meal = (mealForDate as any)[slotKey];
                const mealTitle = vm.getMealTitle(meal);
                const hasRecipeId = vm.getMealRecipeId(meal);
                const label = getMealLabel(slotKey);

                return (
                  <div key={slotKey} className="meal-planner-cell custom-slot">
                    <strong>{label}</strong>
                    
                    {mealTitle ? (
                      // Meal exists - show it with delete button
                      <div className="meal-display">
                        <div 
                          className={`meal-text ${hasRecipeId ? 'meal-clickable' : ''}`}
                          onClick={() => hasRecipeId && handleMealClick(meal)}
                          title={hasRecipeId ? 'Clique para ver detalhes da receita' : ''}
                        >
                          {mealTitle}
                          {hasRecipeId && <span className="meal-recipe-indicator"> 📖</span>}
                        </div>
                        <button
                          className="delete-meal-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeal(date, slotKey);
                          }}
                          title="Remover refeição"
                        >
                          🗑️
                        </button>
                      </div>
                    ) : (
                      // No meal - show add buttons
                      <div className="meal-add-buttons">
                        <button
                          className="add-meal-btn recipe-btn"
                          onClick={handleAddFromRecipeSearch}
                          title="Buscar receita"
                        >
                          🔍 Receita
                        </button>
                        <button
                          className="add-meal-btn custom-btn"
                          onClick={() => handleOpenCustomInput(date, slotKey)}
                          title="Adicionar texto personalizado"
                        >
                          ✏️ Customizar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add custom slot button */}
              <div className="add-custom-slot-container">
                <button
                  className="add-custom-slot-btn"
                  onClick={() => handleOpenAddSlotModal(date)}
                  title="Adicionar horário customizado"
                >
                  ➕ Adicionar horário
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Input Modal */}
      {showCustomInput && (
        <div className="custom-input-modal-overlay" onClick={handleCancelCustomInput}>
          <div className="custom-input-modal custom-meal-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Adicionar Refeição Personalizada</h3>
            <p className="modal-date-info">
              {showCustomInput.date.toLocaleDateString('pt-BR')} - {getMealLabel(showCustomInput.mealKey)}
            </p>
            <textarea
              className="custom-meal-textarea"
              placeholder="Digite o nome da refeição..."
              value={customMealText}
              onChange={(e) => setCustomMealText(e.target.value)}
              autoFocus
            />

            {/* Toggle nutrition fields */}
            <div className="nutrition-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={showNutritionFields}
                  onChange={(e) => setShowNutritionFields(e.target.checked)}
                />
                <span>Adicionar informação nutricional (opcional)</span>
              </label>
            </div>

            {/* Nutrition fields */}
            {showNutritionFields && (
              <div className="custom-nutrition-fields">
                <p className="nutrition-fields-label">📊 Valores por porção:</p>
                <div className="nutrition-input-grid">
                  <div className="nutrition-input-item">
                    <label>Calorias (kcal)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={customNutrition.calories}
                      onChange={(e) => setCustomNutrition({...customNutrition, calories: e.target.value})}
                    />
                  </div>
                  <div className="nutrition-input-item">
                    <label>Carboidratos (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={customNutrition.carbs}
                      onChange={(e) => setCustomNutrition({...customNutrition, carbs: e.target.value})}
                    />
                  </div>
                  <div className="nutrition-input-item">
                    <label>Proteínas (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={customNutrition.protein}
                      onChange={(e) => setCustomNutrition({...customNutrition, protein: e.target.value})}
                    />
                  </div>
                  <div className="nutrition-input-item">
                    <label>Gorduras (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={customNutrition.fat}
                      onChange={(e) => setCustomNutrition({...customNutrition, fat: e.target.value})}
                    />
                  </div>
                  <div className="nutrition-input-item">
                    <label>Fibras (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={customNutrition.fiber}
                      onChange={(e) => setCustomNutrition({...customNutrition, fiber: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCancelCustomInput}>
                Cancelar
              </button>
              <button 
                className="save-btn" 
                onClick={handleSaveCustomMeal}
                disabled={!customMealText.trim()}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Slot Modal */}
      {showAddSlotModal && (
        <div className="custom-input-modal-overlay" onClick={() => setShowAddSlotModal(null)}>
          <div className="custom-input-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Adicionar Novo Horário</h3>
            <p className="modal-date-info">
              {showAddSlotModal.toLocaleDateString('pt-BR')}
            </p>
            <input
              type="text"
              className="custom-slot-input"
              placeholder="Nome do horário (ex: Lanche da tarde)"
              value={newSlotName}
              onChange={(e) => setNewSlotName(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddSlotModal(null)}>
                Cancelar
              </button>
              <button 
                className="save-btn" 
                onClick={handleAddCustomSlot}
                disabled={!newSlotName.trim()}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Details Modal */}
      <MealRecipeDetailsModal
        isOpen={showRecipeModal}
        recipeId={selectedRecipeId}
        onClose={handleCloseRecipeModal}
      />
    </div>
  );
});