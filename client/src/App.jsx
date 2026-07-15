import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard';
import AddFoodForm from './components/AddFoodForm';
import FoodList from './components/FoodList';
import './App.css'

const API_URL = "http://localhost:5000/api/foods"

function App() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Runs once when app loads — fetches all logged foods from server
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true)
        const response = await fetch(API_URL)
        const data = await response.json()
        setFoods(data)
      } catch (err) {
        setError("Could not load foods. Is the server running?")
      } finally {
        setLoading(false)
      }
    }
    fetchFoods()
  }, [])

  // Sends POST to server, then adds the returned food to state
  const addFood = async (newFood) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFood)
    })
    const data = await response.json()
    setFoods((prevFoods) => [...prevFoods, data.data])
  }

  // Sends DELETE to server, then removes from state
  const deleteFood = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    })
    setFoods(foods.filter((food) => food.id !== id))
  }


  if (loading) return (
    <div className="app">
      <div className="status-screen">
        <div className="spinner" />
        <p>Loading your foods...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="app">
      <div className="status-screen error">
        <span>⚠️</span>
        <p>{error}</p>
      </div>
    </div>
  )

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