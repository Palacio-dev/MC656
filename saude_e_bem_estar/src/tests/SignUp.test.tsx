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


  test("preenche os campos no modo Sign Up", () => {
    render(<LoginSignUp />);

    // Alterna para Sign Up
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
    
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    
    // Preenche com nome vazio
    fireEvent.change(screen.getByPlaceholderText("Name"), {
        target: { value: "" },
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "teste@email.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "12345678" },
        });
    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));
    
    await waitFor(() => {
        expect(screen.getByText("O nome é obrigatório.")).toBeInTheDocument();
    });
  });


  test("mostra erro quando email está vazio no cadastro", async () => {
    render(<LoginSignUp />);
    
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    
    // Preenche com e-mail vazio
    fireEvent.change(screen.getByPlaceholderText("Name"), {
        target: { value: "João" },
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "12345678" },
        });
    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));
    
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
    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));
    
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
    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));
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

    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));

    await waitFor(() => {
      expect(screen.getByText("E-mail inválido.")).toBeInTheDocument();
    });
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
    fireEvent.change(screen.getByPlaceholderText("Name"), {target: { value: "João" },});
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(emailInput, { target: { value: "teste@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "Invalid*" } });
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

  test("mostra erro de nome de usuário invalido no cadastro", async () => {
    render(<LoginSignUp />);
    
    // Alterna para Sign Up
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    // Preenche com nome inválido
    fireEvent.change(screen.getByPlaceholderText("Name"), {
        target: { value: "João123" },
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "joao@email.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "12345678" },
        });
    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));
    
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

    // Clica em criar conta
    fireEvent.click(screen.getByText("Criar conta"));

    await waitFor(() => {
      expect(screen.getByText("Erro ao verificar e-mail.")).toBeInTheDocument();
    });
  });
});