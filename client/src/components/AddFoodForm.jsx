import { useState } from "react";

function AddFoodForm({ addFood }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !calories) {
      setError("Please fill in both fields");
      return;
    }
    if (Number(calories) <= 0) {
      setError("Calories must be greater than 0");
      return;
    }

    setError("");
    addFood({
      id: Date.now(),
      name: name.trim(),
      calories: Number(calories),
    });

    setName("");
    setCalories("");
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Add Food</h2>
      <form onSubmit={handleSubmit} className="food-form">
        <div className="input-group">
          <label className="input-label">Food Name</label>
          <input
            type="text"
            placeholder="e.g. Chicken Rice"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="food-input"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Calories (kcal)</label>
          <input
            type="number"
            placeholder="e.g. 450"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="food-input"
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="submit-btn">
          + Add Food
        </button>
      </form>
    </div>
  );
}

export default AddFoodForm;