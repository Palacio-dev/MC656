import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { MealPlannerViewModel } from "../hooks/MealPlannerHook";
import "../styles/mealplaner.css";

export const MealPlannerView = observer(({ vm }: { vm: MealPlannerViewModel }) => {
  const grid = vm.strategy.getGrid();
  const title = vm.strategy.getTitle();
  const navigate = useNavigate();

  const getMealKey = (label: string) => {
    if (label === "Café da manhã") return "breakfast" as const;
    if (label === "Almoço") return "lunch" as const;
    if (label === "Jantar") return "dinner" as const;
    return "snack" as const;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="header-top">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <h1 className="titulo">Planejamento de Refeições</h1>
      </div>

      <h2 className="text-2xl font-bold">{title}</h2>

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
                    <textarea
                      className="meal-planner-textarea"
                      placeholder={`Adicionar ${cell.label.toLowerCase()}...`}
                      value={value}
                      onChange={(e) =>
                        vm.updateMeal(date, mealKey, e.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
});