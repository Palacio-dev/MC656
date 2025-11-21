import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import "../styles/Welcome.css";

export default function Welcome() {
    const navigate = useNavigate();

    return (
        <div className="welcome-container">
            <PageHeader 
                title="Bem-vinde!" 
                showBackButton={false}
                showHomeButton={false}
            />

            <div className="welcome-content">
                <h2 className="welcome-subtitle">Escolha uma das opções abaixo</h2>

                <div className="welcome-grid">
                    <div className="welcome-card" onClick={() => navigate("Search")}>
                        <div className="card-icon">🔍</div>
                        <div className="card-title">Pesquisar Produtos</div>
                        <div className="card-description">Busque informações nutricionais detalhadas de alimentos</div>
                    </div>

                    <div className="welcome-card" onClick={() => navigate("RecipeSearch")}>
                        <div className="card-icon">🍳</div>
                        <div className="card-title">Buscar Receitas</div>
                        <div className="card-description">Encontre receitas deliciosas e saudáveis</div>
                    </div>

                    <div className="welcome-card" onClick={() => navigate("ShoppingList")}>
                        <div className="card-icon">🛒</div>
                        <div className="card-title">Listas de Compras</div>
                        <div className="card-description">Organize suas compras de forma prática</div>
                    </div>

                    <div className="welcome-card" onClick={() => navigate("MealPlanner")}>
                        <div className="card-icon">📅</div>
                        <div className="card-title">Planejar Refeições</div>
                        <div className="card-description">Planeje suas refeições semanais e mensais</div>
                    </div>
                </div>
            </div>
        </div>
    );
}