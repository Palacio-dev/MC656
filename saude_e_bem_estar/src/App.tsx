import { BrowserRouter, Routes, Route } from "react-router-dom";
import './Styles/App.css';

//pages Import
import LoginSignUp from './Components/login_sign_up/LoginSignUp';
import ShoppingList from "./Pages/ShoppingList";
import Search from "./Pages/Search";
import Welcome from "./Pages/Welcome";

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSignUp />}/>
        <Route path="/Welcome" element={<Welcome />} />
        <Route path="/BuscadeProdutos" element={<Search />} />
        <Route path="/ListadeCompras" element={<ShoppingList />} />
      </Routes>
    </BrowserRouter>
  );
}
