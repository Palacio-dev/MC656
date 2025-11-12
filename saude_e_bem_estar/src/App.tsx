import { BrowserRouter, Routes, Route } from "react-router-dom";
import './Styles/App.css';

//pages Import
import LoginSignUp from './Pages/LoginSignUp';
import ShoppingList from "./Pages/ShoppingList";
import Welcome from "./Pages/Welcome";
import ProductSearchView from "./Pages/ProductSearchView";

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSignUp />}/>
        <Route path="Welcome">
          <Route index element={<Welcome />} />
          <Route path="ShoppingList" element={<ShoppingList />} />
          <Route path="/" element={<ProductSearchView />}/>
          {/* <Route path="Search" element={<ProductSearchView />} /> */}
        </Route>
       
      </Routes>
    </BrowserRouter>
  );
}
