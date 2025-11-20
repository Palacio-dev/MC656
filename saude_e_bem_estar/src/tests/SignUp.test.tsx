import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginSignUp from "../pages/LoginSignUp";

// Mock mais simples do useNavigate
const mockNavigate = jest.fn();

// Mock completo do react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock do fetch
global.fetch = jest.fn();

// Mock do localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("LoginSignUp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    mockNavigate.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });
  

  // Senhas válidas
  test("Senha válida: 6 caracteres(testando limite inferior), 1 maiúscula, 1 dígito, só letras e números", async () => {
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(emailInput, { target: { value: "teste@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "asBnm1" } });
    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));
    await waitFor(() => {
      // Espera que não apareça mensagem de erro de senha
      expect(screen.queryByText(/senha ou email inválidos/i)).not.toBeInTheDocument();
    });
  });

  test("Senha válida: 20 caracteres(testando limite superior), 1 maiúscula, 1 dígito, só letras e números", async () => {
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(emailInput, { target: { value: "teste@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "ExemploDeSenhaValid1" } });
    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));
    await waitFor(() => {
      expect(screen.queryByText(/senha ou email inválidos/i)).not.toBeInTheDocument();
    });
  });

  // Senhas inválidas
  test("Senha inválida: não contém nenhuma letra maiúscula", async () => {
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(emailInput, { target: { value: "teste@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "invalid1" } });
    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));
    await waitFor(() => {
      expect(screen.getByText(/senha ou email inválidos/i)).toBeInTheDocument();
    });
  });

  test("Senha inválida: não contém nenhum número", async () => {
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "João" },
    });
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(emailInput, { target: { value: "teste@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "Invalid" } });
    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));
    await waitFor(() => {
      expect(screen.getByText(/senha ou email inválidos/i)).toBeInTheDocument();
    });
  });

  test("Senha inválida: contém caractere especial", async () => {
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(emailInput, { target: { value: "teste@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "Invalid1*" } });
    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));
    await waitFor(() => {
      expect(screen.getByText(/senha ou email inválidos/i)).toBeInTheDocument();
    });
  });

  test("Senha inválida: 5 caracteres (abaixo do limite inferior)", async () => {
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(emailInput, { target: { value: "teste@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "A1bcd" } });
    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));
    await waitFor(() => {
      expect(screen.getByText(/senha ou email inválidos/i)).toBeInTheDocument();
    });
  });

  test("Senha inválida: 21 caracteres (acima do limite superior)", async () => {
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(emailInput, { target: { value: "teste@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "InvalidPassword123abcdefghijkl" } });
    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));
    await waitFor(() => {
      expect(screen.getByText(/senha ou inválidos/i)).toBeInTheDocument();
    });
  });
});