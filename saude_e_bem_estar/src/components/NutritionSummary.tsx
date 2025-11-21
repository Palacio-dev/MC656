import React from 'react';
import { PeriodNutritionSummary } from '../services/MealPlanNutritionService';
import '../styles/NutritionSummary.css';

interface NutritionSummaryProps {
  summary: PeriodNutritionSummary | null;
  loading: boolean;
  periodType: 'daily' | 'weekly' | 'monthly';
}

export const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  summary,
  loading,
  periodType,
}) => {
  if (loading) {
    return (
      <div className="nutrition-summary loading">
        <div className="nutrition-summary-spinner"></div>
        <p>Calculando nutrição...</p>
      </div>
    );
  }

  if (!summary || summary.mealsWithNutrition === 0) {
    return (
      <div className="nutrition-summary empty">
        <p>📊 Nenhuma refeição com informação nutricional</p>
        <p className="nutrition-summary-hint">
          Adicione receitas ao planejamento para ver os dados nutricionais
        </p>
      </div>
    );
  }

  const getPeriodLabel = () => {
    switch (periodType) {
      case 'daily':
        return 'do Dia';
      case 'weekly':
        return 'da Semana';
      case 'monthly':
        return 'do Mês';
      default:
        return '';
    }
  };

  const coveragePercentage = (summary.mealsWithNutrition / summary.totalMeals) * 100;

  return (
    <div className="nutrition-summary">
      <h3 className="nutrition-summary-title">
        📊 Resumo Nutricional {getPeriodLabel()}
      </h3>

      <div className="nutrition-summary-coverage">
        <span>
          {summary.mealsWithNutrition} de {summary.totalMeals} refeições com dados nutricionais
        </span>
        <div className="nutrition-summary-progress-bar">
          <div
            className="nutrition-summary-progress-fill"
            style={{ width: `${coveragePercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="nutrition-summary-grid">
        <div className="nutrition-summary-card total">
          <div className="nutrition-summary-card-header">Total {getPeriodLabel()}</div>
          <div className="nutrition-summary-card-value">
            {summary.totalCalories.toFixed(0)}
            <span className="nutrition-summary-card-unit">kcal</span>
          </div>
          <div className="nutrition-summary-card-macros">
            <span>C: {summary.totalCarbs.toFixed(0)}g</span>
            <span>P: {summary.totalProtein.toFixed(0)}g</span>
            <span>G: {summary.totalFat.toFixed(0)}g</span>
          </div>
        </div>

        {periodType !== 'daily' && (
          <div className="nutrition-summary-card average">
            <div className="nutrition-summary-card-header">Média Diária</div>
            <div className="nutrition-summary-card-value">
              {summary.dailyAverages.calories.toFixed(0)}
              <span className="nutrition-summary-card-unit">kcal</span>
            </div>
            <div className="nutrition-summary-card-macros">
              <span>C: {summary.dailyAverages.carbs.toFixed(0)}g</span>
              <span>P: {summary.dailyAverages.protein.toFixed(0)}g</span>
              <span>G: {summary.dailyAverages.fat.toFixed(0)}g</span>
            </div>
          </div>
        )}
      </div>

      <details className="nutrition-summary-details">
        <summary>Ver detalhes completos</summary>
        <div className="nutrition-summary-breakdown">
          <div className="nutrition-summary-breakdown-item">
            <span className="nutrition-summary-breakdown-label">Carboidratos</span>
            <span className="nutrition-summary-breakdown-value">
              Total: {summary.totalCarbs.toFixed(1)}g
              {periodType !== 'daily' && ` | Média: ${summary.dailyAverages.carbs.toFixed(1)}g/dia`}
            </span>
          </div>
          <div className="nutrition-summary-breakdown-item">
            <span className="nutrition-summary-breakdown-label">Proteínas</span>
            <span className="nutrition-summary-breakdown-value">
              Total: {summary.totalProtein.toFixed(1)}g
              {periodType !== 'daily' && ` | Média: ${summary.dailyAverages.protein.toFixed(1)}g/dia`}
            </span>
          </div>
          <div className="nutrition-summary-breakdown-item">
            <span className="nutrition-summary-breakdown-label">Gorduras</span>
            <span className="nutrition-summary-breakdown-value">
              Total: {summary.totalFat.toFixed(1)}g
              {periodType !== 'daily' && ` | Média: ${summary.dailyAverages.fat.toFixed(1)}g/dia`}
            </span>
          </div>
          <div className="nutrition-summary-breakdown-item">
            <span className="nutrition-summary-breakdown-label">Fibras</span>
            <span className="nutrition-summary-breakdown-value">
              Total: {summary.totalFiber.toFixed(1)}g
              {periodType !== 'daily' && ` | Média: ${summary.dailyAverages.fiber.toFixed(1)}g/dia`}
            </span>
          </div>
        </div>
      </details>

      <p className="nutrition-summary-disclaimer">
        ⚠️ Valores aproximados baseados nas receitas com dados nutricionais
      </p>
    </div>
  );
};
