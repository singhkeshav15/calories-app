import { useState } from 'react'

function Onboarding({ token, onComplete }) {
  const [mode, setMode] = useState(null)
  const [step, setStep] = useState(1)
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Calculated mode fields
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [activity, setActivity] = useState('')
  const [goal, setGoal] = useState('')

  // Manual mode
  const [manualGoal, setManualGoal] = useState('')

  const handleCalculate = async (e) => {
    e.preventDefault()
    if (!age || !gender || !height || !weight || !activity || !goal) {
      setError('Please fill in all fields')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          age: Number(age),
          gender,
          height_cm: Number(height),
          weight_kg: Number(weight),
          activity_level: activity,
          goal,
          goal_set_by: 'calculated'
        })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.message)
      setRecommendation(data.daily_goal)
      setStep(2)
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleManual = async (e) => {
    e.preventDefault()
    if (!manualGoal || Number(manualGoal) <= 0) {
      setError('Please enter a valid calorie goal')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          daily_goal: Number(manualGoal),
          goal_set_by: 'manual'
        })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.message)
      onComplete(data.daily_goal)
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  // Screen 1 — Pick mode
  if (mode === null) return (
    <div className="auth-screen">
      <div className="auth-card">
        <span className="auth-logo">🎯</span>
        <h1 className="auth-title">Set Your Goal</h1>
        <p className="auth-subtitle">How would you like to set your daily calorie target?</p>

        <div className="onboard-options">
          <button className="onboard-option" onClick={() => setMode('calculated')}>
            <span className="onboard-option-icon">🧮</span>
            <strong>Calculate for me</strong>
            <small>Based on your body & goal</small>
          </button>
          <button className="onboard-option" onClick={() => setMode('manual')}>
            <span className="onboard-option-icon">✏️</span>
            <strong>Set manually</strong>
            <small>I know my calorie target</small>
          </button>
        </div>
      </div>
    </div>
  )

  // Screen 2 — Manual entry
  if (mode === 'manual') return (
    <div className="auth-screen">
      <div className="auth-card">
        <span className="auth-logo">✏️</span>
        <h1 className="auth-title">Your Daily Goal</h1>
        <p className="auth-subtitle">Enter your target calories per day</p>

        <form onSubmit={handleManual} className="auth-form">
          <div className="input-group">
            <label className="input-label">Daily Calories (kcal)</label>
            <input
              type="number"
              placeholder="e.g. 2200"
              value={manualGoal}
              onChange={e => setManualGoal(e.target.value)}
              className="food-input"
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Goal'}
          </button>
          <button type="button" className="back-btn" onClick={() => setMode(null)}>
            ← Back
          </button>
        </form>
      </div>
    </div>
  )

  // Screen 3 — Calculate: Confirmation
  if (mode === 'calculated' && step === 2) return (
    <div className="auth-screen">
      <div className="auth-card">
        <span className="auth-logo">✅</span>
        <h1 className="auth-title">Your Recommended Intake</h1>
        <p className="auth-subtitle">Based on your body data and goal</p>

        <div className="recommendation-box">
          <span className="recommendation-number">{recommendation?.toLocaleString()}</span>
          <span className="recommendation-unit">kcal / day</span>
          <p className="recommendation-meta">
            Goal: <strong>{goal}</strong> · Activity: <strong>{activity}</strong>
          </p>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="recommendation-actions">
          <button
            className="submit-btn"
            onClick={() => onComplete(recommendation)}
          >
            ✅ Use this
          </button>
          <button
            className="back-btn"
            onClick={() => { setMode('manual'); setManualGoal(recommendation) }}
          >
            ✏️ Set different number
          </button>
        </div>
      </div>
    </div>
  )

  // Screen 4 — Calculate: Form
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <span className="auth-logo">🧮</span>
        <h1 className="auth-title">Your Profile</h1>
        <p className="auth-subtitle">We'll calculate your ideal calorie target</p>

        <form onSubmit={handleCalculate} className="auth-form">
          <div className="onboard-row">
            <div className="input-group">
              <label className="input-label">Age</label>
              <input type="number" placeholder="22" value={age}
                onChange={e => setAge(e.target.value)} className="food-input" />
            </div>
            <div className="input-group">
              <label className="input-label">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="food-input">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="onboard-row">
            <div className="input-group">
              <label className="input-label">Height (cm)</label>
              <input type="number" placeholder="175" value={height}
                onChange={e => setHeight(e.target.value)} className="food-input" />
            </div>
            <div className="input-group">
              <label className="input-label">Weight (kg)</label>
              <input type="number" placeholder="70" value={weight}
                onChange={e => setWeight(e.target.value)} className="food-input" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Activity Level</label>
            <select value={activity} onChange={e => setActivity(e.target.value)} className="food-input">
              <option value="">Select activity level</option>
              <option value="sedentary">Sedentary (desk job, no gym)</option>
              <option value="light">Light (gym 1-2x / week)</option>
              <option value="moderate">Moderate (gym 3-5x / week)</option>
              <option value="active">Active (gym 6-7x / week)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Goal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)} className="food-input">
              <option value="">Select your goal</option>
              <option value="cutting">Cutting (lose fat)</option>
              <option value="maintenance">Maintenance (stay the same)</option>
              <option value="bulking">Bulking (gain muscle)</option>
            </select>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate my goal →'}
          </button>
          <button type="button" className="back-btn" onClick={() => setMode(null)}>
            ← Back
          </button>
        </form>
      </div>
    </div>
  )
}

export default Onboarding
