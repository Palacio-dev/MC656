import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock do Papa.parse para simular carregamento do CSV
import Search from "../Pages/Search";

// Import Papa to get its type and then mock it
import Papa from "papaparse";

// Mock papaparse module
jest.mock("papaparse");

// Mock do localStorage

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe("ProductSearch", () => {
  beforeEach(() => {
    // Limpa os mocks antes de cada teste
    // jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    // Set up the mock implementation for Papa.parse
    (Papa.parse as jest.Mock).mockImplementation((file: any, options: any) => {
      // Simula dados do CSV de alimentos
      const mockData = [
        {
          nome: "Abacaxi, cozido, caramelado",
          energia_kcal: 136,
          carboidrato_total_g: 33.3,
          proteina_g: 0.60,
          lipidios_g: 0.26,
          fibra_alimentar_g: 0.84
        },
        {
          nome: "Abacate, polpa, in natura, Brasil",
          energia_kcal: 76,
          carboidrato_total_g: 5.84,
          proteina_g: 1.15,
          lipidios_g: 6.21,
          fibra_alimentar_g: 4.03
        },
        {
          nome: "Abóbora, moranga, refogada (c/ óleo, cebola e alho), s/ sal",
          energia_kcal: 30,
          carboidrato_total_g: 5.98,
          proteina_g: 0.39,
          lipidios_g: 0.80,
          fibra_alimentar_g: 1.55
        },
      ];
      // Simula o comportamento assíncrono do Papa.parse
      setTimeout(() => {
        options.complete({ data: mockData });
      }, 0);
    });
  });

  test("mostra o título corretamente", () => {
    render(<Search />);
    expect(screen.getByText("Busca de Produtos")).toBeInTheDocument();
  });

  test("pesquisa por um item específico", async () => {
    render(<Search />);
    
    const searchInput = screen.getByPlaceholderText("Search for a product...");
    
    // Digita "Abacaxi" no campo de busca
    fireEvent.change(searchInput, { target: { value: "Aba" } });
    
    // Aguarda as sugestões aparecerem
    await waitFor(() => {
      return expect(screen.getByText("Abacaxi, cozido, caramelado")).toBeInTheDocument();
    });
  });

  test("limpa o histórico corretamente", async () => {
    // Mock do localStorage com histórico existente
    const mockHistory = JSON.stringify([
      {
        name: "Arroz branco",
        calories: 130,
        carbs: 28.1,
        protein: 2.5,
        fat: 0.3,
        fiber: 0.4
      }
    ]);
    localStorageMock.getItem.mockReturnValue(mockHistory);
    
    render(<Search />);
    
    // Verifica que o histórico está sendo exibido
    await waitFor(() => {
      expect(screen.getByText("Arroz branco")).toBeInTheDocument();
    });
    
    // Clica no botão "Clear History"
    const clearButton = screen.getByText("Clear History");
    fireEvent.click(clearButton);
    
    // Verifica que o histórico foi limpo
    expect(screen.getByText("No products searched yet")).toBeInTheDocument();
    expect(screen.queryByText("Arroz branco")).not.toBeInTheDocument();
  });

  test("apresenta macronutrientes corretamente", async () => {
    render(<Search />);
    
    const searchInput = screen.getByPlaceholderText("Search for a product...");
    
    // Busca por "Banana"
    fireEvent.change(searchInput, { target: { value: "Abacate, polpa, in natura, Brasil" } });
    
    // Aguarda e clica na sugestão
    await waitFor(() => {
      const abacateOption = screen.getByText("Abacate, polpa, in natura, Brasil");
      fireEvent.click(abacateOption);
    });
    
    // Verifica se os macronutrientes estão sendo exibidos corretamente
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: "Abacate, polpa, in natura, Brasil" })).toBeInTheDocument();
      expect(screen.getByText("Energia em kcal: 76")).toBeInTheDocument();
      expect(screen.getByText("Carboidratos: 5.84g")).toBeInTheDocument();
      expect(screen.getByText("Proteina: 1.15g")).toBeInTheDocument();
      expect(screen.getByText("Lipidios: 6.21g")).toBeInTheDocument();
      expect(screen.getByText("Fibras: 4.03g")).toBeInTheDocument();
    });
  });

  test("aparece opções quando digita uma letra", async () => {
    render(<Search />);
    
    const searchInput = screen.getByPlaceholderText("Search for a product...");
    
    // Digita apenas "A"
    fireEvent.change(searchInput, { target: { value: "Aba" } });
    
    // Aguarda as sugestões que começam com "A"
    await waitFor(() => {
      expect(screen.getByText("Abacate, polpa, in natura, Brasil")).toBeInTheDocument();
      expect(screen.getByText("Abacaxi, cozido, caramelado")).toBeInTheDocument();
    });
  });

  test("muda entre informações de alimentos corretamente", async () => {
    render(<Search />);
    
    const searchInput = screen.getByPlaceholderText("Search for a product...");
    
    // Primeira busca - Abacaxi
    fireEvent.change(searchInput, { target: { value: "Abacaxi, cozido, caramelado" } });
    
    await waitFor(() => {
      const abacaxiOption = screen.getAllByText("Abacaxi, cozido, caramelado");
      fireEvent.click(abacaxiOption[0]);
    });
    // Segunda busca - Feijão preto
    fireEvent.change(searchInput, { target: { value: "Abóbora, moranga, refogada (c/ óleo, cebola e alho), s/ sal" } });
    
    await waitFor(() => {
      const aboboraOption = screen.getAllByText("Abóbora, moranga, refogada (c/ óleo, cebola e alho), s/ sal");
      fireEvent.click(aboboraOption[0]);
    });
    
    // Verifica que mudou para informações da abobora
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 2, name: "Abóbora, moranga, refogada (c/ óleo, cebola e alho), s/ sal" })).toBeInTheDocument();
      expect(screen.getByText("Energia em kcal: 30")).toBeInTheDocument();
      expect(screen.getByText("Carboidratos: 5.98g")).toBeInTheDocument();
      expect(screen.getByText("Proteina: 0.39g")).toBeInTheDocument();
    });
    
    // Verifica que as informações antigas não estão mais visíveis
    expect(screen.queryByText("Energia em kcal: 136")).not.toBeInTheDocument();
  });

  test("renderiza lista de alimentos já pesquisados corretamente", async () => {
    // Mock do localStorage com histórico de múltiplos produtos
    const mockHistory = JSON.stringify([
      {
        name: "Arroz branco",
        calories: 130,
        carbs: 28.1,
        protein: 2.5,
        fat: 0.3,
        fiber: 0.4
      },
      {
        name: "Feijão preto",
        calories: 77,
        carbs: 14.0,
        protein: 4.5,
        fat: 0.5,
        fiber: 8.4
      }
    ]);
    localStorageMock.getItem.mockReturnValue(mockHistory);
    
    render(<Search />);
    
    // Verifica que o título do histórico está presente
    expect(screen.getByText("Buscados Anteriormente")).toBeInTheDocument();
    
    // Verifica que os itens do histórico estão sendo renderizados
    await waitFor(() => {
      expect(screen.getByText("Arroz branco")).toBeInTheDocument();
      expect(screen.getByText("Feijão preto")).toBeInTheDocument();
    });
    
    // Testa clique em item do histórico
    const historicoArroz = screen.getByText("Arroz branco");
    fireEvent.click(historicoArroz);
    
    // Verifica que as informações do arroz são exibidas
    await waitFor(() => {
      expect(screen.getByText("Energia em kcal: 130")).toBeInTheDocument();
      expect(screen.getByText("Carboidratos: 28.1g")).toBeInTheDocument();
    });
  });
});