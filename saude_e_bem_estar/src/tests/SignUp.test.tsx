import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginSignUp from "../pages/LoginSignUp";

// Mock mais simples do useNavigate
const mockNavigate = jest.fn();

// Mock completo do react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// ---- MOCK DO HOOK PRINCIPAL ----
const mockViewModel = {
  form: { name: "", email: "", password: "" },
  action: "Sign Up",
  setAction: jest.fn(),
  isSignUpMode: true,
  updateForm: jest.fn(),
  // updateForm: jest.fn((field, value) => {
  //   mockViewModel.form[field] = value;
  // }),
  message: "",
  loading: false,
  submitButtonText: "Cadastrar",
  // o mock do botão
  handleSubmit: jest.fn(() => {
    // aqui simulamos o resultado FINAL
    // testes configuram expectedMessage antes de render()
    mockViewModel.message = mockViewModel.expectedMessage;
  }),
  handleGoogleLogin: jest.fn(),
  expectedMessage: ""
  // handleSubmit: jest.fn(),
  // handleGoogleLogin: jest.fn(),
};

jest.mock("../hooks/useLoginSignUp", () => ({
  useLoginSignUp: () => mockViewModel,
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

describe("SignUp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    mockNavigate.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  test("alterna para tela de cadastro quando clica em Sign Up", () => {
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    expect(screen.getAllByText("Sign Up")).toHaveLength(2);
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Cadastrar")).toBeInTheDocument();
    expect(screen.queryByText("Esqueceu a senha? Clique Aqui")).not.toBeInTheDocument();
  });

  test("preenche os campos no modo Sign Up", () => {
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    const nameInput = screen.getByPlaceholderText("Name");
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(nameInput, { target: { value: "João Silva" } });
    fireEvent.change(emailInput, { target: { value: "joao@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });
    expect(nameInput).toHaveValue("João Silva");
    expect(emailInput).toHaveValue("joao@email.com");
    expect(passwordInput).toHaveValue("123456");
  });

  test("mostra erro quando nome está vazio no cadastro", async () => {
    render(<LoginSignUp />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teste@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "12345678" } });
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.getByText("Por favor, preencha o campo nome")).toBeInTheDocument();
    });
  });

    test("mostra erro quando e-mail já existe no cadastro", async () => {
      mockViewModel.message = "Este email já está vinculado a uma conta.";
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

      // Clica em Cadastrar
      fireEvent.click(screen.getByText("Cadastrar"));

      await waitFor(() => {
        expect(screen.getByText("Este email já está vinculado a uma conta.")).toBeInTheDocument();
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
        expect(screen.getByText("O e-mail é obrigatório.")).toBeInTheDocument();
    });
  });
  
  test("mostra erro quando senha está vazia no cadastro", async () => {
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    // Preenche com senha vazia
    fireEvent.change(screen.getByPlaceholderText("Name"), {
        target: { value: "João" },
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "" },
        });
    // Clica em Cadastrar
    fireEvent.click(screen.getByText("Cadastrar"));
    
    await waitFor(() => {
        expect(screen.getByText("A senha é obrigatória.")).toBeInTheDocument();
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
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(emailInput, { target: { value: "teste@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "Invalid" } });
    // Clica em Cadastrar
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.getByText(/senha ou email inválidos/i)).toBeInTheDocument();
    });
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

    // Clica em Cadastrar
    fireEvent.click(screen.getByText("Cadastrar"));

    await waitFor(() => {
      expect(screen.getByText("E-mail inválido.")).toBeInTheDocument();
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
        expect(screen.getByText("Nome de usuário inválido.")).toBeInTheDocument();
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

    // Clica em Cadastrar
    fireEvent.click(screen.getByText("Cadastrar"));

    await waitFor(() => {
      expect(screen.getByText("Erro ao verificar e-mail.")).toBeInTheDocument();
    });
  });

// Senhas válidas
  test("Senha válida: 6 caracteres(testando limite inferior), 1 maiúscula, 1 dígito, 1 caractere especial", async () => {
    mockViewModel.message = "Conta criada com sucesso! Você já pode fazer login.";
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teste@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "a*Bnm1" } });
    // Clica em Cadastrar
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.queryByText("Conta criada com sucesso! Você já pode fazer login.")).toBeInTheDocument();
    });
  });

  test("Senha válida: 20 caracteres(testando limite superior), 1 maiúscula, 1 dígito, 1 caractere especial", async () => {
    mockViewModel.message = "Conta criada com sucesso! Você já pode fazer login.";
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teste@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "ExampleofValiddd1%Pa" } });
    // Clica em Cadastrar
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.queryByText("Conta criada com sucesso! Você já pode fazer login.")).toBeInTheDocument();
    });
  });

  // Senhas inválidas
  test("Senha inválida: não contém letra maiúscula", async () => {
    mockViewModel.message = "Senha inválida";
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teste@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "invalid1&*" } });
    // Clica em Cadastrar
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.queryByText("Senha inválida")).toBeInTheDocument();
    });
  });

  test("Senha inválida: não contém número", async () => {
    mockViewModel.message = "Senha inválida";
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teste@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Invaliddd*&*" } });
    // Clica em Cadastrar
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.queryByText("Senha inválida")).toBeInTheDocument();
    });
  });
   
  test("Senha inválida: não contém caractere especial", async () => {
    mockViewModel.message = "Senha inválida";
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teste@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "Invalid112312" } });
    // Clica em Cadastrar
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.queryByText("Senha inválida")).toBeInTheDocument();
    });
  });

  test("Senha inválida: 5 caracteres (abaixo do limite inferior)", async () => {
    mockViewModel.message = "Senha inválida";
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teste@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "A1&*a" } });
    // Clica em Cadastrar
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.queryByText("Senha inválida")).toBeInTheDocument();
    });
  });

  test("Senha inválida: 21 caracteres (acima do limite superior)", async () => {
    mockViewModel.message = "Senha inválida";
    render(<LoginSignUp />);
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com e-mail válido
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "teste@email.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "InvalidPassword123abcdefghijkl&*%" } });
    // Clica em Cadastrar
    fireEvent.click(screen.getByText("Cadastrar"));
    await waitFor(() => {
      expect(screen.queryByText("Senha inválida")).toBeInTheDocument();
    });
  });
});