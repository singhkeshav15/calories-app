import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import AddFoodForm from './components/AddFoodForm'
import FoodList from './components/FoodList'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import './App.css'

const API_URL = `${import.meta.env.VITE_API_URL}/api/foods`

function App() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [showRegister, setShowRegister] = useState(false)

  // Called after successful login/register — saves token to state
  const handleLogin = (newToken) => {
    setToken(newToken)
  }

  // Logout — clears token from state and localStorage
  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setFoods([])
  }

  // Fetch foods whenever token changes (login/logout)
  useEffect(() => {
    if (!token) return
    const fetchFoods = async () => {
      try {
        setLoading(true)
        const response = await fetch(API_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        setFoods(data)
      } catch (err) {
        setError("Could not load foods. Is the server running?")
      } finally {
        setLoading(false)
      }
    }
    fetchFoods()
  }, [token])

  // Sends POST to server with auth header
  const addFood = async (newFood) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(newFood)
    })
    const data = await response.json()
    setFoods((prevFoods) => [...prevFoods, data])
  }

  // Sends DELETE to server with auth header
  const deleteFood = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': `Bearer ${token}` }
    })
    setFoods(foods.filter((food) => food.id !== id))
  }

  // Show login/register if not authenticated
  if (!token) {
    return showRegister
      ? <Register onLogin={handleLogin} switchToLogin={() => setShowRegister(false)} />
      : <Login onLogin={handleLogin} switchToRegister={() => setShowRegister(true)} />
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
        <div className="header-top">
          <h1 className="app-title">CalorieMate <span>🥗</span></h1>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
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