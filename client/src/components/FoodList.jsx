import React from 'react'

const FoodList = ({ foods, deleteFood }) => {
  if (foods.length === 0) {
    return (
      <div className="foodlist-card">
        <h2 className="foodlist-title">Today's Foods</h2>
        <div className="empty-state">
          <span className="empty-icon">🍽️</span>
          <p>No foods logged yet. Add something above!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="foodlist-card">
      <h2 className="foodlist-title">
        Today's Foods <span className="food-count">{foods.length} items</span>
      </h2>
      <ul className="food-list">
        {foods.map((food) => (
          <li key={food.id} className="food-item">
            <div className="food-info">
              <span className="food-name">{food.name}</span>
              <span className="food-calories">{food.calories} kcal</span>
            </div>
            <button
              className="delete-btn"
              onClick={() => deleteFood(food.id)}
              title="Remove food"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FoodList
