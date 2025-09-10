import { BrowserRouter, Routes, Route } from "react-router-dom";
import './Styles/App.css';

//pages Import
import LoginSignUp from './Pages/LoginSignUp';
import ShoppingList from "./Pages/ShoppingList";
import Search from "./Pages/Search";
import Welcome from "./Pages/Welcome";

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSignUp />}/>

        {/* Rota pai apenas para organização (não renderiza conteúdo) */}
        <Route path="/Welcome">
          <Route index element={<Welcome />} />
          <Route path="/BuscadeProdutos" element={<Search />} />
          <Route path="/ListadeCompras" element={<ShoppingList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
