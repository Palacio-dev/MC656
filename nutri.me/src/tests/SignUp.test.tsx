import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginSignUp from "../pages/LoginSignUp";
import { FirebaseAuthModel } from "../models/firebaseAuthModel";

jest.mock("../components/PageHeader", () => ({
  PageHeader: () => <div data-testid="page-header">Header Mock</div>
}));

// Mockamos os modelos
jest.mock("../models/firebaseAuthModel");
jest.mock("../hooks/useAuth");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children }: any) => <a href="#">{children}</a> 
}));

// === 3. Mock do LocalStorage ===
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
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("SignUp", () => {
  let mockSignUp: jest.Mock;
  let mockLogin: jest.Mock;
  let mockLoginWithGoogle: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    
    mockSignUp = jest.fn();
    mockLogin = jest.fn();
    mockLoginWithGoogle = jest.fn();

    (FirebaseAuthModel as jest.Mock).mockImplementation(() => ({
      signUp: mockSignUp,
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle,
    }));

    const useAuthModule = require("../hooks/useAuth");
    useAuthModule.useAuth.mockReturnValue({
      currentUser: null,
      loading: false,
      isAuthenticated: false,
      userId: null,
    });
  });

  test("alterna para tela de cadastro quando clica em Sign Up", () => {
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    expect(screen.getAllByText(/Sign Up/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  test("preenche os campos no modo Sign Up", () => {
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    const nameInput = screen.getByPlaceholderText("Name");
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(nameInput, { target: { value: "JoaoSilva" } });
    fireEvent.change(emailInput, { target: { value: "joao@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });
    expect(nameInput).toHaveValue("JoaoSilva");
    expect(emailInput).toHaveValue("joao@email.com");
    expect(passwordInput).toHaveValue("123456");
  });

  test("mostra erro quando nome está vazio no cadastro", async () => {
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teste@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "12345678A@" } });
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.getByText("Por favor, preencha o campo nome")).toBeInTheDocument();
    });
  });

  test("mostra erro quando email está vazio no cadastro", async () => {
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Joao" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "12345678A@" } });
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
        expect(screen.getByText("Por favor, preencha o campo email")).toBeInTheDocument();
    });
  });
  
  test("mostra erro quando senha está vazia no cadastro", async () => {
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    fireEvent.change(screen.getByPlaceholderText("Email"), {target: { value: "joao@silva.com" },});
    fireEvent.change(screen.getByPlaceholderText("Password"), {target: { value: "" },});
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
        expect(screen.getByText("Por favor, preencha o campo senha")).toBeInTheDocument();
    });
  });

  test("mostra erro quando e-mail já existe no cadastro", async () => {
    mockSignUp.mockRejectedValueOnce(new Error("Este email já está vinculado a uma conta."));
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "Joao" },});
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "polas@mail.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Invalid123*" } });
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.getByText("Este email já está vinculado a uma conta.")).toBeInTheDocument();
    });
  });

  test("mostra erro para e-mail inválido no cadastro", async () => {
    mockSignUp.mockRejectedValueOnce(new Error("Este email não é válido."));
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "Joaoo" },});
    fireEvent.change(screen.getByPlaceholderText("Email"), {target: { value: "emailinvalido" },});
    fireEvent.change(screen.getByPlaceholderText("Password"), {target: { value: "1234Lucas&*" },});
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.getByText("Este email não é válido.")).toBeInTheDocument();
    });
  });

  test("mostra erro de nome de usuário invalido no cadastro", async () => {
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "João123" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "joao@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "12345678A@" } });
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
        expect(screen.getByText("Nome inválido, por favor, não coloque caracteres especiais nem espaços!")).toBeInTheDocument();
    });
  });

  test("Senha válida: 6 caracteres, 1 maiúscula, 1 dígito, 1 caractere especial", async () => {
    mockSignUp.mockResolvedValueOnce({});
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Joao" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "polas10@gmail.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "a*Bnm1" } });
    fireEvent.click(screen.getByText("Cadastrar"));
    await screen.findByText("Conta criada com sucesso! Você já pode fazer login.");
    expect(mockSignUp).toHaveBeenCalledWith("polas10@gmail.com", "a*Bnm1");
  });

  test("Senha válida: 20 caracteres, 1 maiúscula, 1 dígito, 1 caractere especial", async () => {
    mockSignUp.mockResolvedValueOnce({});
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Joao" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "pola11@gmail.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "ExampleofValiddd1%Pa" } });
    fireEvent.click(screen.getByText("Cadastrar"));
    await screen.findByText("Conta criada com sucesso! Você já pode fazer login.");
    expect(mockSignUp).toHaveBeenCalledWith("pola11@gmail.com", "ExampleofValiddd1%Pa");
  });

  test("Senha inválida: não contém letra maiúscula", async () => {
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Joao" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teste@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "invalid1&*" } });
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.getByText("Senha inválida")).toBeInTheDocument();
    });
  });

  test("Senha inválida: não contém número", async () => {
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Joao" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teste@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Invaliddd*&*" } });
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.getByText("Senha inválida")).toBeInTheDocument();
    });
  });
   
  test("Senha inválida: não contém caractere especial", async () => {
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Joao" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teste@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Invalid112312" } });
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.getByText("Senha inválida")).toBeInTheDocument();
    });
  });

  test("Senha inválida: 5 caracteres (abaixo do limite inferior)", async () => {
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Joao" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teste@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "A1&*a" } });
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.getByText("Senha inválida")).toBeInTheDocument();
    });
  });

  test("Senha inválida: 21 caracteres (acima do limite superior)", async () => {
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Joao" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teste@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "InvalidPassword123abcdefghijkl&*%" } });
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.getByText("Senha inválida")).toBeInTheDocument();
    });
  });
});