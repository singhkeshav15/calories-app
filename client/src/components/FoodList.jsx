const FoodList = ({ foods, deleteFood, isToday, selectedDate }) => {

  const formatTitle = () => {
    if (isToday) return "Today's Log"
    if (!selectedDate) return "Food Log"
    const [y, m, d] = selectedDate.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (foods.length === 0) {
    return (
      <div className="foodlist-card">
        <h2 className="foodlist-title">{formatTitle()}</h2>
        <div className="empty-state">
          <span className="empty-icon">🍽️</span>
          <p>{isToday ? 'Nothing logged yet — add food above!' : 'No food logged on this day.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="foodlist-card">
      <h2 className="foodlist-title">
        {formatTitle()}
        <span className="food-count">{foods.length}</span>
      </h2>
      <ul className="food-list">
        {foods.map((food) => (
          <li key={food.id} className="food-item">
            <div className="food-info">
              <span className="food-name">{food.name}</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="food-calories">{food.calories} kcal</span>
                <span className="food-protein">{food.protein}g protein</span>
              </div>
            </div>
            <button
              className="delete-btn"
              onClick={() => deleteFood(food.id)}
              title="Remove food"
            >✕</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FoodList
