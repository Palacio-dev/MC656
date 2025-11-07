import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import ShoppingListDetail from "../Pages/ShoppingListDetail";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("ShoppingList", () => {
  // Setup antes de cada teste
  beforeEach(() => {
    // Limpa o localStorage antes de cada teste
    localStorage.clear();
    jest.clearAllMocks();

    // Cria uma lista mock no localStorage
    const mockList = {
      id: "lista-teste-123",
      name: "Supermercado",
      items: [],
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("lista-teste-123", JSON.stringify(mockList));
    localStorage.setItem("itemSelecionado", "lista-teste-123");
    localStorage.setItem("listas", JSON.stringify([mockList]));
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Helper para renderizar o componente
  const renderComponent = (props = {}) => {
    return render(
      <BrowserRouter>
        <ShoppingListDetail {...props} />
      </BrowserRouter>
    );
  };

  test("mostra o título da lista corretamente", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Supermercado")).toBeInTheDocument();
    });
  });

  test("adiciona um item na lista", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Supermercado")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Adicione um item à lista");
    const addButton = screen.getByRole("button", { name: "+" });

    fireEvent.change(input, { target: { value: "Arroz" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Arroz")).toBeInTheDocument();
    });

    // Verifica se foi salvo no localStorage
    const savedList = JSON.parse(localStorage.getItem("lista-teste-123") || "{}");
    expect(savedList.items).toHaveLength(1);
    expect(savedList.items[0].text).toBe("Arroz");
  });

  test("remove um item da lista", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Supermercado")).toBeInTheDocument();
    });

    // Adiciona item
    const input = screen.getByPlaceholderText("Adicione um item à lista");
    const addButton = screen.getByRole("button", { name: "+" });

    fireEvent.change(input, { target: { value: "Pirulito" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Pirulito")).toBeInTheDocument();
    });

    // Remove o item
    const deleteButton = screen.getByRole("button", { name: "🗑️" });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText("Pirulito")).not.toBeInTheDocument();
    });
  });

  test("persiste dados após adicionar e remover item", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Supermercado")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Adicione um item à lista");
    const addButton = screen.getByRole("button", { name: "+" });

    // Adiciona item
    fireEvent.change(input, { target: { value: "Chocolate" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Chocolate")).toBeInTheDocument();
    });

    // Verifica persistência
    let savedList = JSON.parse(localStorage.getItem("lista-teste-123") || "{}");
    expect(savedList.items).toHaveLength(1);

    // Remove item
    const deleteButton = screen.getByRole("button", { name: "🗑️" });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText("Chocolate")).not.toBeInTheDocument();
    });

    // Verifica persistência após remoção
    savedList = JSON.parse(localStorage.getItem("lista-teste-123") || "{}");
    expect(savedList.items).toHaveLength(0);
  });
});
