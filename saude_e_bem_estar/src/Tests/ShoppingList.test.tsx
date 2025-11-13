import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import ShoppingListDetail from "../pages/ShoppingListDetail";
import { useShoppingListDetailViewModel } from "../hooks/useShoppingListDetailHook";

// Mock do hook customizado
jest.mock("../Hooks/useShoppingListDetailHook");

// Mock do useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Helper para criar o mock padrão do hook
const createMockViewModel = (overrides = {}) => ({
  items: [],
  isLoading: false,
  error: null,
  listName: "Lista de Compras",
  stats: { total: 0, checked: 0, unchecked: 0, progress: 0 },
  addItem: jest.fn(),
  toggleItem: jest.fn(),
  deleteItem: jest.fn(),
  clearCheckedItems: jest.fn(),
  reloadList: jest.fn(),
  ...overrides,
});

// Wrapper com Router para testes
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("ShoppingListDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("mostra o título corretamente", () => {
    (useShoppingListDetailViewModel as jest.Mock).mockReturnValue(
      createMockViewModel()
    );

    renderWithRouter(<ShoppingListDetail />);
    expect(screen.getByText("Lista de Compras")).toBeInTheDocument();
  });

  test("mostra estado de carregamento", () => {
    (useShoppingListDetailViewModel as jest.Mock).mockReturnValue(
      createMockViewModel({ isLoading: true })
    );

    renderWithRouter(<ShoppingListDetail />);
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  test("mostra mensagem de erro quando há erro", () => {
    (useShoppingListDetailViewModel as jest.Mock).mockReturnValue(
      createMockViewModel({ 
        error: "Lista não encontrada",
        isLoading: false 
      })
    );

    renderWithRouter(<ShoppingListDetail />);
    expect(screen.getByText("Erro")).toBeInTheDocument();
    expect(screen.getByText("Lista não encontrada")).toBeInTheDocument();
  });

  test("adiciona um item na lista", () => {
    const mockAddItem = jest.fn();
    (useShoppingListDetailViewModel as jest.Mock).mockReturnValue(
      createMockViewModel({ addItem: mockAddItem })
    );

    renderWithRouter(<ShoppingListDetail />);

    // digita no input
    const input = screen.getByPlaceholderText("Adicione um item à lista");
    fireEvent.change(input, { target: { value: "Arroz" } });

    // clica no botão de adicionar
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    // verifica se a função foi chamada
    expect(mockAddItem).toHaveBeenCalledWith("Arroz");
  });

  test("renderiza a lista com itens existentes", () => {
    const mockItems = [
      { id: "1", text: "Arroz", checked: false },
      { id: "2", text: "Feijão", checked: false },
    ];

    (useShoppingListDetailViewModel as jest.Mock).mockReturnValue(
      createMockViewModel({ 
        items: mockItems,
        stats: { total: 2, checked: 0, unchecked: 2, progress: 0 }
      })
    );

    renderWithRouter(<ShoppingListDetail />);

    expect(screen.getByText("Arroz")).toBeInTheDocument();
    expect(screen.getByText("Feijão")).toBeInTheDocument();
  });

  test("remove um item da lista quando clicado no botão de deletar", () => {
    const mockDeleteItem = jest.fn();
    const mockItems = [
      { id: "1", text: "Pirulito", checked: false }
    ];

    (useShoppingListDetailViewModel as jest.Mock).mockReturnValue(
      createMockViewModel({ 
        items: mockItems,
        deleteItem: mockDeleteItem,
        stats: { total: 1, checked: 0, unchecked: 1, progress: 0 }
      })
    );

    renderWithRouter(<ShoppingListDetail />);

    // garante que está na tela
    expect(screen.getByText("Pirulito")).toBeInTheDocument();

    // clica no botão de deletar
    fireEvent.click(screen.getByRole("button", { name: "🗑️" }));

    // verifica se a função foi chamada com o ID correto
    expect(mockDeleteItem).toHaveBeenCalledWith("1");
  });

  test("marca/desmarca um item quando clicado no checkbox", () => {
    const mockToggleItem = jest.fn();
    const mockItems = [
      { id: "1", text: "Manteiga", checked: false }
    ];

    (useShoppingListDetailViewModel as jest.Mock).mockReturnValue(
      createMockViewModel({ 
        items: mockItems,
        toggleItem: mockToggleItem,
        stats: { total: 1, checked: 0, unchecked: 1, progress: 0 }
      })
    );

    renderWithRouter(<ShoppingListDetail />);

    // garante que está na tela
    expect(screen.getByText("Manteiga")).toBeInTheDocument();

    // clica no checkbox
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    // verifica se a função foi chamada
    expect(mockToggleItem).toHaveBeenCalledWith("1", true);
  });

  test("exibe item com texto riscado quando marcado", () => {
    const mockItems = [
      { id: "1", text: "Manteiga", checked: true }
    ];

    (useShoppingListDetailViewModel as jest.Mock).mockReturnValue(
      createMockViewModel({ 
        items: mockItems,
        stats: { total: 1, checked: 1, unchecked: 0, progress: 100 }
      })
    );

    renderWithRouter(<ShoppingListDetail />);

    const itemText = screen.getByText("Manteiga");
    expect(itemText).toHaveStyle("text-decoration: line-through");
  });

  test("mostra estatísticas quando há itens", () => {
    const mockItems = [
      { id: "1", text: "Arroz", checked: true },
      { id: "2", text: "Feijão", checked: false },
      { id: "3", text: "Açúcar", checked: true },
    ];

    (useShoppingListDetailViewModel as jest.Mock).mockReturnValue(
      createMockViewModel({ 
        items: mockItems,
        stats: { total: 3, checked: 2, unchecked: 1, progress: 66.67 }
      })
    );

    renderWithRouter(<ShoppingListDetail />);

    expect(screen.getByText(/2 de 3 itens completos/i)).toBeInTheDocument();
  });

  test("exibe botão de limpar marcados quando há itens marcados", () => {
    const mockClearCheckedItems = jest.fn();
    const mockItems = [
      { id: "1", text: "Arroz", checked: true },
      { id: "2", text: "Feijão", checked: false },
    ];

    (useShoppingListDetailViewModel as jest.Mock).mockReturnValue(
      createMockViewModel({ 
        items: mockItems,
        stats: { total: 2, checked: 1, unchecked: 1, progress: 50 },
        clearCheckedItems: mockClearCheckedItems
      })
    );

    renderWithRouter(<ShoppingListDetail />);

    const clearButton = screen.getByText("Limpar marcados");
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(mockClearCheckedItems).toHaveBeenCalled();
  });

  test("não mostra seção de estatísticas quando não há itens", () => {
    (useShoppingListDetailViewModel as jest.Mock).mockReturnValue(
      createMockViewModel({ 
        items: [],
        stats: { total: 0, checked: 0, unchecked: 0, progress: 0 }
      })
    );

    renderWithRouter(<ShoppingListDetail />);

    expect(screen.queryByText(/itens completos/i)).not.toBeInTheDocument();
  });

  test("chama onBack quando fornecido", () => {
    const mockOnBack = jest.fn();
    (useShoppingListDetailViewModel as jest.Mock).mockReturnValue(
      createMockViewModel()
    );

    renderWithRouter(<ShoppingListDetail onBack={mockOnBack} />);

    const backButton = screen.getByText("← Voltar");
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("usa navigate quando onBack não é fornecido", () => {
    (useShoppingListDetailViewModel as jest.Mock).mockReturnValue(
      createMockViewModel()
    );

    renderWithRouter(<ShoppingListDetail />);

    const backButton = screen.getByText("← Voltar");
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("passa listId para o hook quando fornecido", () => {
    const mockUseViewModel = useShoppingListDetailViewModel as jest.Mock;
    mockUseViewModel.mockReturnValue(createMockViewModel());

    renderWithRouter(<ShoppingListDetail listId="lista-123" />);

    expect(mockUseViewModel).toHaveBeenCalledWith({ listId: "lista-123" });
  });
});