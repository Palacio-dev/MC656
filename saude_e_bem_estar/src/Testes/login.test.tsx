import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginSignUp from "../Components/login_sign_up/LoginSignUp";

describe("LoginSignUp", () => {
    test("renderiza o componente de login e sign up", () => {
        render(<LoginSignUp />);

        // Verifica se o titulo de login estão presentes
        expect(screen.getAllByText("Login")).toHaveLength(2); // Um no header e outro no botão

        // Verifica se a mensagem de Lost password está presente e o botão de Click here
        expect(screen.getByText("Lost Password?")).toBeInTheDocument();
        expect(screen.getByText("Click Here")).toBeInTheDocument();

        // Verifica se os campos de email e senha estão presentes
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();

        // Verifica se os botões de login e sign up estão presentes
        expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();

        // Verifica se os pngs de email e senha estão presentes
        expect(screen.getByAltText("email_icon")).toBeInTheDocument();
        expect(screen.getByAltText("password_icon")).toBeInTheDocument();
    });

    test("Testa a troca entre Login e Sign Up", () => {
        render(<LoginSignUp />);
        
        // Clica no botão de Sign Up
        fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

        // Verifica se o titulo de Sign Up está presente
        expect(screen.getAllByText("Sign Up")).toHaveLength(2);

        // Verifica se o campo de nome está presente
        expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();

        // Verifica se o png de user está presente
        expect(screen.getByAltText("user_icon")).toBeInTheDocument();

        // Clica no botão de Login
        fireEvent.click(screen.getByRole("button", { name: "Login" }));
        
        // Verifica se o titulo de Login estão presentes
        expect(screen.getAllByText("Login")).toHaveLength(2);

        // Verifica se o campo de nome não está presente
        expect(screen.queryByPlaceholderText("Name")).not.toBeInTheDocument();
        
        // Verifica se o png de user não está presente
        expect(screen.queryByAltText("user_icon")).not.toBeInTheDocument();
    });

    // Tem que fazer os testes de interação com o backend (login, sign up, reset password)

});
