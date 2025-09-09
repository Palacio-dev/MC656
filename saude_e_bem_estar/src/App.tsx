import { BrowserRouter, Routes, Route } from "react-router-dom";
import './Styles/App.css';
import LoginSignUp from './components/login_sign_up/LoginSignUp';

//pages Import
import ShoppingList from "./Pages/ShoppingList";

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSignUp />}/>
        <Route path="/shoppinglist" element={<ShoppingList />} />
      </Routes>
    </BrowserRouter>
  );
}
