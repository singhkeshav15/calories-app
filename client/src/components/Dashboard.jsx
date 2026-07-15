import React from 'react'

const Dashboard = ({ foods }) => {
  const totalCal = foods.reduce((total, food) => total + food.calories, 0)
  const targetCal = 2200
  const remaining = targetCal - totalCal
  const percentage = Math.min((totalCal / targetCal) * 100, 100)

  const getBarColor = () => {
    if (percentage >= 100) return 'var(--danger)'
    if (percentage >= 80) return '#fb923c'
    return 'url(#barGradient)'
  }

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Today's Summary</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Consumed</span>
          <span className="stat-value consumed">{totalCal}</span>
          <span className="stat-unit">kcal</span>
        </div>
        <div className="stat-card stat-card--goal">
          <span className="stat-label">Daily Goal</span>
          <span className="stat-value goal">{targetCal}</span>
          <span className="stat-unit">kcal</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Remaining</span>
          <span className={`stat-value ${remaining < 0 ? 'over' : 'remaining'}`}>
            {remaining < 0 ? `+${Math.abs(remaining)}` : remaining}
          </span>
          <span className="stat-unit">kcal</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-labels">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${percentage}%`,
              background: percentage >= 100
                ? 'var(--danger)'
                : percentage >= 80
                ? 'linear-gradient(90deg, #4ade80, #fb923c)'
                : 'linear-gradient(90deg, #4ade80, #22d3ee)'
            }}
          />
        </div>
        {remaining < 0 && (
          <p className="over-limit-msg">⚠️ You've exceeded your daily goal by {Math.abs(remaining)} kcal</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
