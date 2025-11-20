import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/App.css';

//pages Import
import LoginSignUp from './pages/LoginSignUp';
import ShoppingListsPage from './pages/ShoppingListPage';
import ShoppingListDetail from './pages/ShoppingListDetail';
import Search from "./pages/ProductSearchView";
import Welcome from "./pages/Welcome";
import { MealPlannerViewModel } from "./hooks/MealPlannerHook";
import { MealPlannerView } from "./pages/MealPlanner";
import { FirebaseMealPlannerModel } from "./models/firebaseMealPlannerModel";
import { auth } from "./config/firebase";


export default function App() {
  const user = auth.currentUser;
  const mealPlannerModel = new FirebaseMealPlannerModel();
  const mealPlannerVM = new MealPlannerViewModel(mealPlannerModel, user?.uid ?? null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSignUp />}/>
        <Route path="Welcome">
          <Route index element={<Welcome />} />
          <Route path="ShoppingList" >
            <Route index element={<ShoppingListsPage />} />
            {/* Rota de detalhes - mostra uma lista específica */}
            <Route path="DetalList" element={<ShoppingListDetail />} />
          </Route>
          <Route
            path="MealPlanner"
            element={<MealPlannerView vm={mealPlannerVM} />}
          />
          <Route path="Search" element={<Search />} />
        </Route>
       
      </Routes>
    </BrowserRouter>
  );
}
