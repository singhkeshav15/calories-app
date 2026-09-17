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

// Format Date object → "YYYY-MM-DD" using local time (not UTC)
const toDateStr = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Format "YYYY-MM-DD" → "Sep 15, 2024"
const formatDisplay = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function App() {
  const [foods, setFoods] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)  // first load only
  const [dateLoading, setDateLoading] = useState(false)        // date navigation
  const [error, setError] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [showRegister, setShowRegister] = useState(false)
  const [dailyGoal, setDailyGoal] = useState(null)
  const [showEditGoal, setShowEditGoal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()))
  const today = toDateStr(new Date())

  const handleLogin = (newToken) => setToken(newToken)

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setFoods([])
    setDailyGoal(null)
  }

  const handleOnboardingComplete = (goal) => {
    setDailyGoal(goal)
    setShowEditGoal(false)
  }

  // Date navigation
  const goToPrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    date.setDate(date.getDate() - 1)
    setSelectedDate(toDateStr(date))
  }

  const goToNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    date.setDate(date.getDate() + 1)
    setSelectedDate(toDateStr(date))
  }

  const goToToday = () => setSelectedDate(today)

  // Fetch profile once on login
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

  // Fetch foods on token change (initial) or date change (navigation)
  useEffect(() => {
    if (!token) return

    const isInitial = initialLoading
    if (isInitial) setInitialLoading(true)
    else setDateLoading(true)

    const fetchFoods = async () => {
      try {
        const response = await fetch(`${API_URL}?date=${selectedDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.status === 401) return handleLogout()
        const data = await response.json()
        setFoods(data)
      } catch {
        setError('Could not load foods. Is the server running?')
      } finally {
        setInitialLoading(false)
        setDateLoading(false)
      }
    }

    fetchFoods()
  }, [token, selectedDate])

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
    setFoods(prev => [...prev, data])
    setRefreshKey(k => k + 1)
  }

  const deleteFood = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    setFoods(prev => prev.filter(f => f.id !== id))
    setRefreshKey(k => k + 1)
  }

  // Auth gates
  if (!token) {
    return showRegister
      ? <Register onLogin={handleLogin} switchToLogin={() => setShowRegister(false)} />
      : <Login onLogin={handleLogin} switchToRegister={() => setShowRegister(true)} />
  }

  if (initialLoading) return (
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
      </header>

      {/* Date Navigation */}
      <div className="date-nav">
        <button className="date-nav-btn" onClick={goToPrevDay}>←</button>
        <div className="date-nav-center">
          <span className="date-nav-label">
            {isToday ? '📅 Today' : `📅 ${formatDisplay(selectedDate)}`}
          </span>
          {!isToday && (
            <button className="date-today-btn" onClick={goToToday}>Back to Today</button>
          )}
        </div>
        <button
          className="date-nav-btn"
          onClick={goToNextDay}
          disabled={isToday}
        >→</button>
      </div>

      {/* Inline loading bar when navigating dates */}
      {dateLoading && <div className="date-loading-bar" />}

      <Dashboard foods={foods} dailyGoal={dailyGoal} />

      <WeeklyChart token={token} dailyGoal={dailyGoal} refreshKey={refreshKey} />

      <AiEstimator token={token} addFood={addFood} />

      <div className="bottom-section">
        <AddFoodForm addFood={addFood} />
        <FoodList foods={foods} deleteFood={deleteFood} isToday={isToday} selectedDate={selectedDate} />
      </div>
    </div>
  )
}

export default App