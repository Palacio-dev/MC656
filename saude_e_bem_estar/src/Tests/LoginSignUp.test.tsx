import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginSignUp from "../Pages/LoginSignUp";

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

  test("renderiza a tela de login por padrão", () => {
    render(<LoginSignUp />);

    expect(screen.getAllByText("Login")).toHaveLength(2);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Entrar")).toBeInTheDocument();
    expect(screen.getByText("Esqueceu a senha?")).toBeInTheDocument();
    expect(screen.getByText("Clique Aqui")).toBeInTheDocument();
  });

  test("alterna para tela de cadastro quando clica em Sign Up", () => {
    render(<LoginSignUp />);

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(screen.getAllByText("Sign Up")).toHaveLength(2);
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Criar conta")).toBeInTheDocument();
    expect(screen.queryByText("Esqueceu a senha? Clique Aqui")).not.toBeInTheDocument();
  });

  test("atualiza os campos do formulário quando digitado", () => {
    render(<LoginSignUp />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(emailInput, { target: { value: "teste@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });

    expect(emailInput).toHaveValue("teste@email.com");
    expect(passwordInput).toHaveValue("123456");
  });

  test("preenche campo name no modo Sign Up", () => {
    render(<LoginSignUp />);

    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    const nameInput = screen.getByPlaceholderText("Name");
    fireEvent.change(nameInput, { target: { value: "João Silva" } });

    expect(nameInput).toHaveValue("João Silva");
  });

  test("mostra erro para e-mail inválido no cadastro", async () => {
    render(<LoginSignUp />);

    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    // Preenche com e-mail inválido
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "João" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "email-invalido" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "123456" },
    });

    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));

    await waitFor(() => {
      expect(screen.getByText("E-mail inválido.")).toBeInTheDocument();
    });
  });

  test("realiza login com sucesso", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "fake-token" }),
    });

    render(<LoginSignUp />);

    // Preenche os campos
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "teste@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "123456" },
    });

    // Clica em entrar
    fireEvent.click(screen.getByText("Entrar"));

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith("token", "fake-token");
      expect(mockNavigate).toHaveBeenCalledWith("/Welcome");
      expect(screen.getByText("Login OK")).toBeInTheDocument();
    });
  });

  test("mostra erro quando login falha", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Credenciais inválidas" }),
    });

    render(<LoginSignUp />);

    // Preenche os campos
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "teste@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "senha-errada" },
    });

    // Clica em entrar
    fireEvent.click(screen.getByText("Entrar"));

    await waitFor(() => {
      expect(screen.getByText("Credenciais inválidas")).toBeInTheDocument();
    });
  });

  test("mostra erro quando fetch falha no login", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Erro de rede"));

    render(<LoginSignUp />);

    // Preenche os campos
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "teste@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "123456" },
    });

    // Clica em entrar
    fireEvent.click(screen.getByText("Entrar"));

    await waitFor(() => {
      expect(screen.getByText("Erro de rede")).toBeInTheDocument();
    });
  });

  test("mostra erro quando e-mail já existe no cadastro", async () => {
    // Mock para verificação de e-mail já existente
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ exists: true }),
    });

    render(<LoginSignUp />);

    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "João" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "email@existente.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "123456" },
    });

    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));

    await waitFor(() => {
      expect(screen.getByText("Este e-mail já está registrado.")).toBeInTheDocument();
    });
  });

  test("mostra erro quando verificação de e-mail falha", async () => {
    // Mock para falha na verificação de e-mail
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Erro de rede"));

    render(<LoginSignUp />);

    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "João" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "joao@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "123456" },
    });

    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));

    await waitFor(() => {
      expect(screen.getByText("Erro ao verificar e-mail.")).toBeInTheDocument();
    });
  });

  test("mostra estado de carregamento durante operações", async () => {
    (fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ token: "fake-token" }),
              }),
            100
          )
        )
    );

    render(<LoginSignUp />);

    // Preenche os campos
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "teste@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "123456" },
    });

    // Clica em entrar
    fireEvent.click(screen.getByText("Entrar"));

    // Verifica estado de carregamento
    expect(screen.getByText("Entrando...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Login OK")).toBeInTheDocument();
    });
  });

  test("não permite múltiplas submissões durante carregamento", async () => {
    (fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ token: "fake-token" }),
              }),
            100
          )
        )
    );

    render(<LoginSignUp />);

    // Preenche os campos
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "teste@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "123456" },
    });

    // Clica em entrar múltiplas vezes
    fireEvent.click(screen.getByText("Entrar"));
    
    // Verifica que o botão está em estado de carregamento
    const loadingButton = screen.getByText("Entrando...");
    expect(loadingButton).toBeDisabled();
    
    // Tenta clicar novamente no botão desabilitado
    fireEvent.click(loadingButton);

    // Fetch deve ser chamado apenas uma vez
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

});