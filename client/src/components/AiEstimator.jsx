import { useState } from 'react'

function AiEstimator({ token, addFood }) {
  const [description, setDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  const handleEstimate = async (e) => {
    e.preventDefault()
    if (!description.trim()) return

    setLoading(true)
    setError('')
    setResult(null)
    setAdded(false)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description })
      })
      const data = await res.json()
      if (!res.ok) return setError(data.message)
      setResult(data)
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToLog = () => {
    addFood({
      name: description.slice(0, 80),   // use description as food name
      calories: result.calories,
      protein: result.protein
    })
    setAdded(true)
    setDescription('')
    setResult(null)
  }

  return (
    <div className="form-card ai-card">
      <h2 className="form-title">
        <span className="ai-badge">✨ AI</span>
        Estimate from Description
      </h2>
      <p className="ai-subtitle">Describe what you ate in plain words</p>

      <form onSubmit={handleEstimate} className="food-form">
        <div className="input-group">
          <textarea
            className="food-input ai-textarea"
            placeholder="e.g. 2 rotis, bowl of dal, a banana and chai with milk..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <span className="char-count">{description.length}/500</span>
        </div>

        {error && <p className="form-error">⚠️ {error}</p>}

        <button type="submit" className="submit-btn" disabled={loading || !description.trim()}>
          {loading ? (
            <span className="ai-loading">🤖 Estimating...</span>
          ) : (
            '✨ Estimate Calories'
          )}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="ai-result">
          <div className="ai-result-header">
            <div className="ai-stat">
              <span className="ai-stat-value">{result.calories.toLocaleString()}</span>
              <span className="ai-stat-label">kcal</span>
            </div>
            <div className="ai-divider" />
            <div className="ai-stat">
              <span className="ai-stat-value">{result.protein}</span>
              <span className="ai-stat-label">g protein</span>
            </div>
          </div>

          {/* Breakdown */}
          {result.items?.length > 0 && (
            <ul className="ai-breakdown">
              {result.items.map((item, i) => (
                <li key={i} className="ai-breakdown-item">
                  <span>{item.name}</span>
                  <span className="ai-breakdown-cal">{item.calories} kcal</span>
                </li>
              ))}
            </ul>
          )}

          {result.note && (
            <p className="ai-note">💡 {result.note}</p>
          )}

          <p className="ai-disclaimer">
            ⚠️ AI estimates — accuracy may vary by ±20%
          </p>

          {added ? (
            <p className="ai-added">✅ Added to your food log!</p>
          ) : (
            <button onClick={handleAddToLog} className="submit-btn">
              + Add to Log
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default AiEstimator
