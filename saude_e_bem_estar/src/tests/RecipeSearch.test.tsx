import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RecipeSearch from "../pages/RecipeSearch";
import { get } from "http";

// Mock mais simples do useNavigate
const mockNavigate = jest.fn();

// Mock completo do react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock do fetch para simular resultados de busca
global.fetch = jest.fn();

describe("RecipeSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getInput = () =>
    screen.getByPlaceholderText("Digite o nome da receita (ex: bolo de cenoura)");

  test("Busca com texto válido retorna receitas", async () => {
    render(<RecipeSearch />);
    fireEvent.change(getInput(), { target: { value: "Bolo" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    await waitFor(() => {
      expect(screen.queryByText("Nenhuma receita encontrada. Tente outra busca.")).not.toBeInTheDocument();
    });
  });

  test("Busca com texto vazio mostra erro", async () => {
    render(<RecipeSearch />);
    fireEvent.change(getInput(), { target: { value: "" } });
    fireEvent.keyPress(getInput(), {Key: 'Enter', keyCode: 13, charCode:13})
    await waitFor(() => {
      expect(screen.queryByText("Por favor, digite o nome de uma receita")).toBeInTheDocument();
    });
  });

  test("Busca com letras, números e acentos retorna receitas", async () => {
    render(<RecipeSearch />);
    fireEvent.change(getInput(), { target: { value: "Pão francês123" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    await waitFor(() => {
      expect(screen.queryByText("Nenhuma receita encontrada. Tente outra busca.")).not.toBeInTheDocument();
      expect(screen.queryByText("caracteres especiais não são suportados")).not.toBeInTheDocument();
    });
  });

  test("Busca com caracteres especiais mostra erro", async () => {
    render(<RecipeSearch />);
    fireEvent.change(getInput(), { target: { value: "@#!@#$@" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    await waitFor(() => {
      expect(screen.queryByText("Por favor, digite apenas letras e números")).toBeInTheDocument();
    });
  });
});
