import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import './Styles/App.css';

//pages Import
import LoginSignUp from './Pages/LoginSignUp';
import ShoppingListsPage from './Pages/ShopiingListPage';
import ShoppingListDetail from './Pages/ShoppingListDetail';
import Search from "./Pages/Search";
import Welcome from "./Pages/Welcome";

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSignUp />}/>

        {/* Rota pai apenas para organização (não renderiza conteúdo) */}
        <Route path="Welcome">
          <Route index element={<Welcome />} />
          <Route path="ShoppingList" >
            <Route index element={<ShoppingListsPage />} />
            {/* Rota de detalhes - mostra uma lista específica */}
            <Route path=":id" element={<ShoppingListDetailWrapper />} />
          </Route>
          <Route path="Search" element={<Search />} />
        </Route>
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
            onBack={() => navigate('/ShoppingList')}
        />
    );
}
