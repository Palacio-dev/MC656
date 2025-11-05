import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ShoppingList from "../Pages/ShoppingListDetail";

describe("ShoppingList", () => {
  test("mostra o título corretamente", () => {
    render(<ShoppingList />);
    expect(screen.getByText("Lista de Compras")).toBeInTheDocument();
  });

  test("adiciona um item na lista", () => {
    render(<ShoppingList />);

    // digita no input
    fireEvent.change(screen.getByPlaceholderText("Adicione genérico"), {
      target: { value: "Arroz" },
    });

    // pega o botão pelo papel sem depender do texto
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    // verifica se o item apareceu
    expect(screen.getByText("Arroz")).toBeInTheDocument();
  });

  test("renderiza a lista depois de adicionar itens", () => {
    render(<ShoppingList />);

    // adicionar feijão
    fireEvent.change(screen.getByPlaceholderText("Adicione genérico"), {
      target: { value: "Arroz" },
    });
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    // adiciona Feijão
    fireEvent.change(screen.getByPlaceholderText("Adicione genérico"), {
      target: { value: "Feijão" },
    });
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    // agora a lista já tem os dois itens
    expect(screen.getByText("Arroz")).toBeInTheDocument();
    expect(screen.getByText("Feijão")).toBeInTheDocument();
  });

  test("remove um item da lista quando clicado no botão de deletar", () => {
    render(<ShoppingList />);

    // adiciona "Pirulito"
    fireEvent.change(screen.getByPlaceholderText(/adicione genérico/i), {
      target: { value: "Pirulito" },
    });
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    // garante que está na tela
    expect(screen.getByText("Pirulito")).toBeInTheDocument();

    // clica no botão de deletar
    fireEvent.click(screen.getByRole("button", { name: "🗑️" }));
    // ou (se você usar aria-label no botão):
    // fireEvent.click(screen.getByRole("button", { name: /remover Arroz/i }));

    // agora o item não deve mais aparecer
    expect(screen.queryByText("Pirulito")).not.toBeInTheDocument();
  });

  test("remove item, e adiciona outro", () => {
    render(<ShoppingList />);

    // adiciona "Pirulito"
    fireEvent.change(screen.getByPlaceholderText(/adicione genérico/i), {
      target: { value: "Pirulito" },
    });
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    // garante que está na tela
    expect(screen.getByText("Pirulito")).toBeInTheDocument();

    // clica no botão de deletar
    fireEvent.click(screen.getByRole("button", { name: "🗑️" }));

    // agora o item não deve mais aparecer
    expect(screen.queryByText("Pirulito")).not.toBeInTheDocument();

    // adiciona "Chocolate"
    fireEvent.change(screen.getByPlaceholderText(/adicione genérico/i), {
      target: { value: "Chocolate" },
    });
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    // garante que está na tela
    expect(screen.getByText("Chocolate")).toBeInTheDocument();
  });

  test("fazer o check do item e depois deletar ele", () => {
    render(<ShoppingList />);

    // adiciona "manteiga"
    fireEvent.change(screen.getByPlaceholderText(/adicione genérico/i), {
      target: { value: "manteiga" },
    });
    fireEvent.click(screen.getByRole("button", { name: "+" }));

    // garante que está na tela
    expect(screen.getByText("manteiga")).toBeInTheDocument();

    // clicar no checkbox (marca)
    fireEvent.click(screen.getByRole("checkbox"));

    // garante que está marcado
    expect(screen.getByRole("checkbox")).toBeChecked();

    // garante que o texto está riscado
    const itemText = screen.getByText("manteiga");
    expect(itemText).toHaveStyle("text-decoration: line-through");

    // clica no botão de deletar
    fireEvent.click(screen.getByRole("button", { name: "🗑️" }));

    // agora o item não deve mais aparecer
    expect(screen.queryByText("manteiga")).not.toBeInTheDocument();
  });
});
