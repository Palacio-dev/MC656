import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { MealPlannerViewModel } from "../hooks/MealPlannerHook";
import React from "react";
import "../styles/mealplaner.css";

export const MealPlannerView = observer(({ vm }: { vm: MealPlannerViewModel }) => {
  const grid = vm.strategy.getGrid();
  const title = vm.strategy.getTitle();
  const navigate = useNavigate();
  const [showCustomInput, setShowCustomInput] = React.useState<{date: Date, mealKey: string} | null>(null);
  const [customMealText, setCustomMealText] = React.useState("");
  const [showShareMenu, setShowShareMenu] = React.useState(false);

  const getMealKey = (label: string) => {
    if (label === "Café da manhã") return "breakfast" as const;
    if (label === "Almoço") return "lunch" as const;
    if (label === "Jantar") return "dinner" as const;
    return "snack" as const;
  };

  const handleAddFromRecipeSearch = () => {
    navigate("/Welcome/RecipeSearch");
  };

  const handleOpenCustomInput = (date: Date, mealKey: string) => {
    setShowCustomInput({ date, mealKey });
    setCustomMealText("");
  };

  const handleSaveCustomMeal = () => {
    if (showCustomInput && customMealText.trim()) {
      vm.updateMeal(showCustomInput.date, showCustomInput.mealKey as any, customMealText.trim());
      setShowCustomInput(null);
      setCustomMealText("");
    }
  };

  const handleCancelCustomInput = () => {
    setShowCustomInput(null);
    setCustomMealText("");
  };

  const handleDeleteMeal = (date: Date, mealKey: string) => {
    if (window.confirm("Tem certeza que deseja remover esta refeição?")) {
      vm.updateMeal(date, mealKey as any, "");
    }
  };

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
      
      row.forEach((cell) => {
        const mealKey = getMealKey(cell.label);
        const value = (mealForDate as any)[mealKey] || "";
        if (value) {
          text += `  ${cell.label}: ${value}\n`;
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
      <div className="header-top">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <h1 className="titulo">Planejamento de Refeições</h1>
      </div>

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

      <div className="meal-planner-buttons">
        <button onClick={() => vm.setDailyView(new Date())}>Diária</button>
        <button onClick={() => vm.setWeeklyView()}>Semanal</button>
        <button
          onClick={() =>
            vm.setMonthlyView(new Date().getMonth(), new Date().getFullYear())
          }
        >
          Mensal
        </button>
      </div>

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

          return (
            <div key={rowIndex} className="meal-planner-day">
              <div className="meal-date">
                <strong>{date.toLocaleDateString()}</strong>
              </div>

              {row.map((cell, cellIndex) => {
                const mealKey = getMealKey(cell.label);
                const value = (mealForDate as any)[mealKey] || "";

                return (
                  <div key={cellIndex} className="meal-planner-cell">
                    <strong>{cell.label}</strong>
                    
                    {value ? (
                      // Meal exists - show it with delete button
                      <div className="meal-display">
                        <div className="meal-text">{value}</div>
                        <button
                          className="delete-meal-btn"
                          onClick={() => handleDeleteMeal(date, mealKey)}
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
            </div>
          );
        })}
      </div>

      {/* Custom Input Modal */}
      {showCustomInput && (
        <div className="custom-input-modal-overlay" onClick={handleCancelCustomInput}>
          <div className="custom-input-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Adicionar Refeição Personalizada</h3>
            <p className="modal-date-info">
              {showCustomInput.date.toLocaleDateString()} - {
                showCustomInput.mealKey === 'breakfast' ? 'Café da manhã' :
                showCustomInput.mealKey === 'lunch' ? 'Almoço' :
                showCustomInput.mealKey === 'dinner' ? 'Jantar' : 'Lanche'
              }
            </p>
            <textarea
              className="custom-meal-textarea"
              placeholder="Digite o nome da refeição..."
              value={customMealText}
              onChange={(e) => setCustomMealText(e.target.value)}
              autoFocus
            />
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
    </div>
  );
});