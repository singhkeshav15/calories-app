import { useState , useEffect} from "react"

function AddFoodForm({ addFood }) {
  const [name, setName] = useState("")
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [error, setError] = useState("")
  const [query, setQuery] = useState('')        // search box value
  const [results, setResults] = useState([])    // search results array
  const [searching, setSearching] = useState(false)  // loading state

 
  const handleSearch = async (searchText) => {
    if (!searchText.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    try{
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search?q=${encodeURIComponent(searchText)}`
      )
      if(!response.ok){
        throw new Error(`HTTP error : ${response.status}`)
      }
      const data = await response.json()
      setResults(data)
    }
    catch(error){
      console.error("Search failed", error)
      setError("Unable to fetch food, try again later")
      setResults([])
    }
    finally{
      setSearching(false)
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectFood = (food) => {
    setName(food.food_name)
    setCalories(food.calories)
    setProtein(food.protein)
    setResults([])
    setQuery('')
  }
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim() || !calories || !protein) {
      setError("Please fill in all fields")
      return
    }
    if (Number(calories) <= 0) {
      setError("Calories must be greater than 0")
      return
    }

    setError("")
    addFood({
      name: name.trim(),
      calories: Number(calories),
      protein: Number(protein)
    })

    setName("")
    setCalories("")
    setProtein("")
  }

  return (
    <div className="form-card">
      <h2 className="form-title">Add Food</h2>
      
      <form onSubmit={handleSubmit} className="food-form">
        <div className="input-group">
          <label className="input-label">Search food</label>
          <input type="text" 
          placeholder="Search food here"
          value={query}
          onChange={(e)=>{
            const value = e.target.value
            setQuery(value)
          }}
          className="food-input"
          />

          {searching && <p>Searching...</p>}

          {results.length > 0 && (
            <ul className="search-dropdown">
              {results.map((food, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectFood(food)}
                  className="search-item"
                >
                  <strong>{food.food_name}</strong>
                  <br />
                  <small>{food.description}</small>
                </li>
              ))}
            </ul>
        )}
        </div>

        
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

        <div className="input-group">
          <label className="input-label">Protein (g)</label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 22 g"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
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