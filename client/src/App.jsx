import { useState } from 'react'
import Dashboard from './components/Dashboard';
import AddFoodForm from './components/AddFoodForm';
import FoodList from './components/FoodList';
import './App.css'

function App() {
  const [foods, setFoods] = useState([
    { id: 1, name: "Eggs", calories: 70 },
    { id: 2, name: "Apple", calories: 95 },
    { id: 3, name: "Banana", calories: 105 },
    { id: 4, name: "Chicken Breast", calories: 165 },
    { id: 5, name: "Rice", calories: 206 },
    { id: 6, name: "Broccoli", calories: 55 },
    { id: 7, name: "Salmon", calories: 208 },
    { id: 8, name: "Almonds", calories: 164 },
    { id: 9, name: "Oatmeal", calories: 150 },
    { id: 10, name: "Yogurt", calories: 100 },
  ]);

  const addFood = (newFood) => {
    setFoods((prevFoods) => [...prevFoods, newFood]);
  };

  const deleteFood = (id) => {
    setFoods(foods.filter((food) => food.id !== id));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">CalorieMate <span>🥗</span></h1>
        <p className="app-subtitle">Track your daily nutrition</p>
      </header>

      <Dashboard foods={foods} />

      <div className="bottom-section">
        <AddFoodForm addFood={addFood} />
        <FoodList foods={foods} deleteFood={deleteFood} />
      </div>
    </div>
  )
}

export default App