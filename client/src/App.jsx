import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import AddFoodForm from './components/AddFoodForm'
import FoodList from './components/FoodList'
import AiEstimator from './components/AiEstimator'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Onboarding from './pages/Onboarding.jsx'
import './App.css'

const API_URL = `${import.meta.env.VITE_API_URL}/api/foods`

function App() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [showRegister, setShowRegister] = useState(false)
  const [dailyGoal, setDailyGoal] = useState(null)
  const [showEditGoal, setShowEditGoal] = useState(false)

  // Called after successful login/register — saves token to state
  const handleLogin = (newToken) => {
    setToken(newToken)
  }

  // Logout — clears token from state and localStorage
  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setFoods([])
    setDailyGoal(null)
  }

  // Called after onboarding completes — sets dailyGoal and hides onboarding
  const handleOnboardingComplete = (goal) => {
    setDailyGoal(goal)
    setShowEditGoal(false)
  }

  // Fetch user profile + foods whenever token changes
  useEffect(() => {
    if (!token) return

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        // Token expired or invalid → auto logout
        if (res.status === 401) return handleLogout()
        const data = await res.json()
        setDailyGoal(data.daily_goal)
      } catch {
        // Network error — keep user logged in, try again later
      }
    }

    const fetchFoods = async () => {
      try {
        setLoading(true)
        const response = await fetch(API_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.status === 401) return handleLogout()
        const data = await response.json()
        setFoods(data)
      } catch {
        setError('Could not load foods. Is the server running?')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
    fetchFoods()
  }, [token])

  // Sends POST to server with auth header
  const addFood = async (newFood) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newFood)
    })
    const data = await response.json()
    setFoods((prevFoods) => [...prevFoods, data])
  }

  // Sends DELETE to server with auth header
  const deleteFood = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
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

  // Show onboarding if no goal set yet, or user clicked "Edit Goal"
  if (!dailyGoal || showEditGoal) {
    return <Onboarding token={token} onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1 className="app-title">CalorieMate <span>🥗</span></h1>
          <div className="header-actions">
            <button onClick={() => setShowEditGoal(true)} className="edit-goal-btn">
              🎯 Edit Goal
            </button>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
        <p className="app-subtitle">Track your daily nutrition</p>
      </header>

      <Dashboard foods={foods} dailyGoal={dailyGoal} />

      <AiEstimator token={token} addFood={addFood} />

      <div className="bottom-section">
        <AddFoodForm addFood={addFood} />
        <FoodList foods={foods} deleteFood={deleteFood} />
      </div>
    </div>
  )
}

export default App