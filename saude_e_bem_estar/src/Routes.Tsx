import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import ShoppingListsPage from './Pages/ShopiingListPage';
import ShoppingListDetail from './Pages/ShoppingListDetail';
import Search from "./Pages/Search";
import Welcome from "./Pages/Welcome";
import LoginSignUp from './Pages/LoginSignUp';

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                
                {/* Rota principal - lista todas as listas */}
                <Route path="/" element={<Navigate to="/shopping-lists" replace />} />
                <Route path="/shopping-lists" element={<ShoppingListsPage />} />
                
                {/* Rota de detalhes - mostra uma lista específica */}
                <Route path="/shopping-list/:id" element={<ShoppingListDetailWrapper />} />
                
                {/* Rota 404 */}
                <Route path="*" element={<Navigate to="/shopping-lists" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

// Wrapper para pegar o parâmetro da URL
function ShoppingListDetailWrapper() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    return (
        <ShoppingListDetail 
            listId={id}
            onBack={() => navigate('/shopping-lists')}
        />
    );
}