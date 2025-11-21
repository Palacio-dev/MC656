import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";
import './styles/App.css';

import LoginSignUp from './pages/LoginSignUp';
import ShoppingListsPage from './pages/ShoppingListPage';
import ShoppingListDetail from './pages/ShoppingListDetail';
import Search from "./pages/ProductSearchView";
import Welcome from "./pages/Welcome";
import RecipeSearch from "./pages/RecipeSearch";
import RecipeDetails from "./pages/RecipeDetails";
import Settings from "./pages/Settings";

import { MealPlannerViewModel } from "./hooks/MealPlannerHook";
import { MealPlannerView } from "./pages/MealPlanner";
import { FirebaseMealPlannerModel } from "./models/firebaseMealPlannerModel";

import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./config/firebase";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [mealPlannerVM] = useState(() => {
    const model = new FirebaseMealPlannerModel();
    return new MealPlannerViewModel(model, null);
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser ?? null);
      mealPlannerVM.setUser(firebaseUser ? firebaseUser.uid : null);
    });

    return () => unsubscribe();
  }, [mealPlannerVM]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginSignUp />} />
        <Route path="Settings" element={<Settings />} />
        <Route path="Welcome">
          <Route index element={<Welcome />} />

          <Route path="ShoppingList">
            <Route index element={<ShoppingListsPage />} />
            <Route path="DetalList" element={<ShoppingListDetail />} />
          </Route>

          <Route
            path="MealPlanner"
            element={
              currentUser ? (
                <MealPlannerView vm={mealPlannerVM} />
              ) : (
                <div>Carregando planner...</div>
              )
            }
          />

          <Route path="Search" element={<Search />} />
          <Route path="RecipeSearch" element={<RecipeSearch />} />
          <Route path="RecipeDetails" element={<RecipeDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
