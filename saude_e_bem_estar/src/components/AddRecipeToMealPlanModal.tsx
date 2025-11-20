import React, { useState } from 'react';
import '../styles/AddRecipeToMealPlanModal.css';

interface AddRecipeToMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeTitle: string;
  onAddToMealPlan: (config: MealPlanConfig) => void;
}

export interface MealPlanConfig {
  mode: 'single' | 'recurring';
  mealType: string; // Can be standard or custom meal type
  // Para modo 'single'
  date?: Date;
  // Para modo 'recurring'
  weekdays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  month?: number; // 0-11
  year?: number;
}

const WEEKDAY_NAMES = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Café da manhã' },
  { value: 'lunch', label: 'Almoço' },
  { value: 'dinner', label: 'Jantar' },
  { value: 'snack', label: 'Lanche' },
  { value: 'custom', label: '➕ Horário customizado' }
];

/**
 * Modal para adicionar receita ao planejamento de refeições
 * Suporta dois modos:
 * 1. Adicionar a um dia específico
 * 2. Adicionar recorrente (ex: toda segunda no almoço do mês)
 */
export const AddRecipeToMealPlanModal: React.FC<AddRecipeToMealPlanModalProps> = ({
  isOpen,
  onClose,
  recipeTitle,
  onAddToMealPlan
}) => {
  const [mode, setMode] = useState<'single' | 'recurring'>('single');
  const [mealType, setMealType] = useState<string>('lunch');
  const [customMealName, setCustomMealName] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const handleWeekdayToggle = (weekday: number) => {
    if (selectedWeekdays.includes(weekday)) {
      setSelectedWeekdays(selectedWeekdays.filter(w => w !== weekday));
    } else {
      setSelectedWeekdays([...selectedWeekdays, weekday]);
    }
  };

  const handleSubmit = () => {
    let finalMealType = mealType;
    
    // If custom meal type selected, use the custom name
    if (mealType === 'custom') {
      if (!customMealName.trim()) {
        alert('Digite o nome do horário customizado');
        return;
      }
      finalMealType = customMealName.trim().toLowerCase().replace(/\s+/g, '_');
    }
    
    if (mode === 'single') {
      onAddToMealPlan({
        mode: 'single',
        mealType: finalMealType,
        date: new Date(selectedDate)
      });
    } else {
      if (selectedWeekdays.length === 0) {
        alert('Selecione pelo menos um dia da semana');
        return;
      }
      onAddToMealPlan({
        mode: 'recurring',
        mealType: finalMealType,
        weekdays: selectedWeekdays,
        month: selectedMonth,
        year: selectedYear
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="meal-plan-modal-overlay" onClick={onClose}>
      <div className="meal-plan-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="meal-plan-modal-header">
          <h2>Adicionar ao Planejamento</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Recipe name */}
        <div className="recipe-name-display">
          <strong>Receita:</strong> {recipeTitle}
        </div>

        {/* Mode selection */}
        <div className="mode-selection">
          <label>
            <input
              type="radio"
              value="single"
              checked={mode === 'single'}
              onChange={(e) => setMode(e.target.value as 'single')}
            />
            <span>Adicionar a um dia específico</span>
          </label>
          <label>
            <input
              type="radio"
              value="recurring"
              checked={mode === 'recurring'}
              onChange={(e) => setMode(e.target.value as 'recurring')}
            />
            <span>Adicionar recorrente (ex: toda segunda no almoço)</span>
          </label>
        </div>

        {/* Meal type selection */}
        <div className="meal-type-selection">
          <label htmlFor="meal-type">Refeição:</label>
          <select
            id="meal-type"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
          >
            {MEAL_TYPES.map(meal => (
              <option key={meal.value} value={meal.value}>
                {meal.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom meal name input */}
        {mealType === 'custom' && (
          <div className="custom-meal-name-input">
            <label htmlFor="custom-meal-name">Nome do horário:</label>
            <input
              id="custom-meal-name"
              type="text"
              placeholder="Ex: Lanche da tarde"
              value={customMealName}
              onChange={(e) => setCustomMealName(e.target.value)}
            />
          </div>
        )}

        {/* Single day mode */}
        {mode === 'single' && (
          <div className="single-day-selection">
            <label htmlFor="date-picker">Data:</label>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        )}

        {/* Recurring mode */}
        {mode === 'recurring' && (
          <div className="recurring-selection">
            <div className="weekday-selection">
              <label>Dias da semana:</label>
              <div className="weekday-buttons">
                {WEEKDAY_NAMES.map((name, index) => (
                  <button
                    key={index}
                    className={`weekday-btn ${selectedWeekdays.includes(index) ? 'selected' : ''}`}
                    onClick={() => handleWeekdayToggle(index)}
                    type="button"
                  >
                    {name.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="month-year-selection">
              <div>
                <label htmlFor="month-select">Mês:</label>
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(2000, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="year-select">Ano:</label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {Array.from({ length: 3 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="confirm-btn" onClick={handleSubmit}>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};
