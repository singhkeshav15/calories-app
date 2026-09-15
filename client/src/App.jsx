import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import AddFoodForm from './components/AddFoodForm'
import FoodList from './components/FoodList'
import AiEstimator from './components/AiEstimator'
import WeeklyChart from './components/WeeklyChart'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Onboarding from './pages/Onboarding.jsx'
import './App.css'

const API_URL = `${import.meta.env.VITE_API_URL}/api/foods`

// Helper: format Date object → "YYYY-MM-DD"
const toDateStr = (date) => date.toISOString().split('T')[0]

// Helper: format "YYYY-MM-DD" → "Sept 15, 2024"
const formatDisplay = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function App() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [showRegister, setShowRegister] = useState(false)
  const [dailyGoal, setDailyGoal] = useState(null)
  const [showEditGoal, setShowEditGoal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)   // increments to trigger chart re-fetch

  // Date navigation state — default to today
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()))
  const today = toDateStr(new Date())

  // Called after successful login/register
  const handleLogin = (newToken) => {
    setToken(newToken)
  }

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setFoods([])
    setDailyGoal(null)
  }

  // Called after onboarding completes
  const handleOnboardingComplete = (goal) => {
    setDailyGoal(goal)
    setShowEditGoal(false)
  }

  // Date navigation handlers
  const goToPrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    setSelectedDate(toDateStr(d))
  }

  const goToNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    setSelectedDate(toDateStr(d))
  }

  const goToToday = () => setSelectedDate(today)

  // Fetch user profile (runs once on login)
  useEffect(() => {
    if (!token) return
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.status === 401) return handleLogout()
        const data = await res.json()
        setDailyGoal(data.daily_goal)
      } catch {
        // Network error — keep user logged in
      }
    }
    fetchProfile()
  }, [token])

  // Fetch foods whenever token OR selectedDate changes
  useEffect(() => {
    if (!token) return
    const fetchFoods = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}?date=${selectedDate}`, {
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
    fetchFoods()
  }, [token, selectedDate])

  // Add food — include selectedDate
  const addFood = async (newFood) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...newFood, logged_date: selectedDate })
    })
    const data = await response.json()
    setFoods((prevFoods) => [...prevFoods, data])
    setRefreshKey(k => k + 1)   // trigger chart refresh
  }

  // Delete food
  const deleteFood = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    setFoods(foods.filter((food) => food.id !== id))
    setRefreshKey(k => k + 1)   // trigger chart refresh
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

  const isToday = selectedDate === today

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

      {/* Date Navigation */}
      <div className="date-nav">
        <button className="date-nav-btn" onClick={goToPrevDay}>←</button>
        <div className="date-nav-center">
          <span className="date-nav-label">
            {isToday ? '📅 Today' : formatDisplay(selectedDate)}
          </span>
          {!isToday && (
            <button className="date-today-btn" onClick={goToToday}>Back to Today</button>
          )}
        </div>
        <button
          className="date-nav-btn"
          onClick={goToNextDay}
          disabled={isToday}
          style={{ opacity: isToday ? 0.3 : 1 }}
        >→</button>
      </div>

      <Dashboard foods={foods} dailyGoal={dailyGoal} />

      <WeeklyChart token={token} dailyGoal={dailyGoal} refreshKey={refreshKey} />

      <AiEstimator token={token} addFood={addFood} />

      <div className="bottom-section">
        <AddFoodForm addFood={addFood} />
        <FoodList foods={foods} deleteFood={deleteFood} />
      </div>
    </div>
  )
}

export default App