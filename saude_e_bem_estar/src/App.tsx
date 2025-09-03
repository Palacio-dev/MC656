import { BrowserRouter, Routes, Route } from "react-router-dom";

//pages Import
import ShoppingList from "./Pages/ShoppingList";
import Search from "./Pages/Search";

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ListadeCompras" element={<ShoppingList />} />
        <Route path="/BuscadeProdutos" element={<Search />} />
      </Routes>
    </BrowserRouter>
  );
}
