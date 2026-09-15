const Dashboard = ({ foods, dailyGoal }) => {
  const totalCal   = foods.reduce((sum, f) => sum + (Number(f.calories) || 0), 0)
  const totalProtein = foods.reduce((sum, f) => sum + (parseFloat(f.protein) || 0), 0)
  const remaining  = dailyGoal - totalCal
  const percentage = Math.min((totalCal / dailyGoal) * 100, 100)
  const isOver     = remaining < 0

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Consumed</span>
          <span className="stat-value consumed">{totalCal.toLocaleString()}</span>
          <span className="stat-unit">kcal</span>
        </div>
        <div className="stat-card stat-card--goal">
          <span className="stat-label">Goal</span>
          <span className="stat-value">{dailyGoal?.toLocaleString()}</span>
          <span className="stat-unit">kcal</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">{isOver ? 'Over' : 'Remaining'}</span>
          <span className={`stat-value ${isOver ? 'over' : 'remaining'}`}>
            {isOver ? `+${Math.abs(remaining).toLocaleString()}` : remaining.toLocaleString()}
          </span>
          <span className="stat-unit">kcal</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Protein</span>
          <span className="stat-value" style={{ color: '#fb923c' }}>{totalProtein.toFixed(1)}</span>
          <span className="stat-unit">g</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-labels">
          <span>{Math.round(percentage)}% of daily goal</span>
          <span>{totalCal.toLocaleString()} / {dailyGoal?.toLocaleString()} kcal</span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${percentage}%`,
              background: isOver
                ? '#f87171'
                : percentage >= 80
                ? 'linear-gradient(90deg, #4ade80, #fb923c)'
                : 'linear-gradient(90deg, #4ade80, #22d3ee)'
            }}
          />
        </div>
        {isOver && (
          <p className="over-limit-msg">⚠️ {Math.abs(remaining).toLocaleString()} kcal over goal</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
