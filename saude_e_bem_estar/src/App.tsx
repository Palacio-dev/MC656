import { BrowserRouter, Routes, Route } from "react-router-dom";

//pages Import
import ShoppingList from "./Pages/ShoppingList";

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ShoppingList />} />
      </Routes>
    </BrowserRouter>
  );
}
