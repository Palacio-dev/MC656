import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RecipeSearch from "../pages/RecipeSearch";
import { searchRecipes } from "../services/RecipeService";
import { FavoritesViewModel } from "../hooks/useFavorites";
import { MealPlannerViewModel } from "../hooks/MealPlannerHook";

// === 1. Mocks de Componentes Visuais ===
jest.mock("../components/PageHeader", () => ({
  PageHeader: () => <div data-testid="page-header">Header Mock</div>
}));

jest.mock("../components/AddRecipeToMealPlanModal", () => ({
  AddRecipeToMealPlanModal: () => <div>Modal Mock</div>
}));

jest.mock("../services/RecipeService");
jest.mock("../hooks/useFavorites");
jest.mock("../hooks/MealPlannerHook");
jest.mock("../models/firebaseMealPlannerModel");
jest.mock("../models/firebaseFavoritesModel");

// Mock do React Router
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock do useAuth
jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ currentUser: { uid: "user-123" } }),
}));

describe("RecipeSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Definimos a implementação da classe FavoritesViewModel ANTES de renderizar
    (FavoritesViewModel as jest.Mock).mockImplementation(() => ({
      // O componente chama isFavorite durante o render. Se não existir, quebra.
      isFavorite: jest.fn().mockReturnValue(false), 
      toggleFavorite: jest.fn().mockResolvedValue(true)
    }));
    // Mock do MealPlannerViewModel (necessário pois é instanciado no componente)
    (MealPlannerViewModel as jest.Mock).mockImplementation(() => ({
    }));
  });
  const getInput = () =>
    screen.getByPlaceholderText("Digite o nome da receita (ex: bolo de cenoura)");

  test("Busca com texto válido retorna receitas (Cenário das Imagens)", async () => {
    // Configura o serviço para retornar os 5 bolos da imagem
    (searchRecipes as jest.Mock).mockResolvedValue([
      { id: '1', title: 'Bolo de cenoura' },
      { id: '2', title: 'Bolo de fubá da vó Maria' },
      { id: '3', title: 'Bolo gelado' },
      { id: '4', title: 'Bolo prestígio' },
      { id: '5', title: 'Bolo simples' }
    ]);
    render(<RecipeSearch />);
    // 1. Simula a digitação "Bolo"
    fireEvent.change(getInput(), { target: { value: "Bolo" } });
    // 2. Clica em Buscar
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    // 3. Verifica o resultado
    await waitFor(() => {
      expect(screen.getByText("Encontramos 5 receitas")).toBeInTheDocument();
      expect(screen.getByText("Bolo de cenoura")).toBeInTheDocument();
      expect(screen.getByText("Bolo de fubá da vó Maria")).toBeInTheDocument();
      expect(screen.getByText("Bolo gelado")).toBeInTheDocument();
    });
  });

  test("Busca com texto vazio mostra erro", async () => {
    render(<RecipeSearch />);
    fireEvent.change(getInput(), { target: { value: "" } });
    fireEvent.keyPress(getInput(), { key: 'Enter', code: 'Enter', charCode: 13 });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    await waitFor(() => {
      expect(screen.getByText("Por favor, digite o nome de uma receita")).toBeInTheDocument();
    });
  });

  test("Busca com letras, números e acentos retorna receitas", async () => {
    (searchRecipes as jest.Mock).mockResolvedValue([
      { id: '10', title: 'Bolacha de trigo' },
      { id: '11', title: 'Bolo de Natal' },
      { id: '12', title: 'Milkshake de maracujá cremoso' },
      { id: '13', title: 'Bolo de caneca sabor chocolate diet, light, sem glútem e lactose' }, // Título longo da imagem
      { id: '14', title: 'Boloarte da Titina- Bolo com Dripping' }
    ]);
    render(<RecipeSearch />);
    fireEvent.change(getInput(), { target: { value: "Bolo 70%" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    await waitFor(() => {
      expect(screen.getByText("Encontramos 5 receitas")).toBeInTheDocument();
      expect(screen.getByText("Bolacha de trigo")).toBeInTheDocument();
      expect(screen.getByText("Bolo de Natal")).toBeInTheDocument();
      expect(screen.getByText(/Milkshake de maracujá/i)).toBeInTheDocument();
    });
  });

  test("Busca com caracteres especiais mostra erro", async () => {
    render(<RecipeSearch />);
    fireEvent.change(getInput(), { target: { value: "@#!@#$@" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    await waitFor(() => {
      expect(screen.getByText("Por favor, digite apenas letras e números")).toBeInTheDocument();
    });
  });
});