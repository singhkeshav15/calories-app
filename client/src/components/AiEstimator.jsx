import { useState, useRef } from 'react'

function AiEstimator({ token, addFood }) {
  const [description, setDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  // AbortController ref — lets us cancel the in-flight request
  const abortRef = useRef(null)

  const handleEstimate = async (e) => {
    e.preventDefault()
    if (!description.trim()) return

    setLoading(true)
    setError('')
    setResult(null)
    setAdded(false)

    // Create a new AbortController for this request
    abortRef.current = new AbortController()

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description }),
        signal: abortRef.current.signal   // attach cancel signal
      })
      const data = await res.json()
      if (!res.ok) return setError(friendlyError(data.message))
      setResult(data)
    } catch (err) {
      // Cancelled by user — don't show error
      if (err.name === 'AbortError') return
      setError('Could not connect to server')
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current.abort()
      setLoading(false)
      setError('')
    }
  }

  const handleAddToLog = () => {
    addFood({
      name: description.slice(0, 80),
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
            disabled={loading}
          />
          <span className="char-count">{description.length}/500</span>
        </div>

        {error && <p className="form-error">⚠️ {error}</p>}

        {loading ? (
          <div className="ai-loading-row">
            <div className="ai-loading-indicator">
              <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
              <span className="ai-loading-text">Estimating...</span>
            </div>
            <button type="button" className="ai-cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="submit" className="submit-btn" disabled={!description.trim()}>
            ✨ Estimate Calories
          </button>
        )}
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

          {result.note && <p className="ai-note">💡 {result.note}</p>}

          <p className="ai-disclaimer">⚠️ AI estimates — accuracy may vary by ±20%</p>

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

// Convert raw API/model errors → user-friendly messages
function friendlyError(msg = '') {
  if (msg.includes('503') || msg.includes('high demand') || msg.includes('Service Unavailable'))
    return 'AI is busy right now — please try again in a few seconds.'
  if (msg.includes('API key') || msg.includes('API_KEY'))
    return 'AI service is not configured. Contact support.'
  if (msg.includes('quota') || msg.includes('rate limit') || msg.includes('429'))
    return 'Too many requests — wait a moment and try again.'
  if (msg.includes('not a valid food') || msg.includes('Not a valid food'))
    return 'That doesn\'t look like food — try describing a meal.'
  return msg || 'Estimation failed — please try again.'
}

export default AiEstimator
