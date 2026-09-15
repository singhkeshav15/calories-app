import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell
} from 'recharts'

function WeeklyChart({ token, dailyGoal, refreshKey }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeekly = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/foods/weekly`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const json = await res.json()
        setData(json)
      } catch {
        // silently fail — chart just shows empty
      } finally {
        setLoading(false)
      }
    }
    fetchWeekly()
  }, [token, refreshKey])   // re-fetch when refreshKey changes

  // Custom tooltip shown on hover
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const cal = payload[0].value
      const over = cal > dailyGoal
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-day">{label}</p>
          <p className="chart-tooltip-cal" style={{ color: over ? '#ef4444' : '#4ade80' }}>
            {cal.toLocaleString()} kcal
          </p>
          {over && <p className="chart-tooltip-over">+{cal - dailyGoal} over goal</p>}
          {cal === 0 && <p className="chart-tooltip-over">No food logged</p>}
        </div>
      )
    }
    return null
  }

  const hasData = data.some(d => d.calories > 0)

  return (
    <div className="chart-card">
      <h2 className="form-title">📊 Weekly Progress</h2>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.85rem' }}>
        Last 7 days vs your {dailyGoal?.toLocaleString()} kcal goal
      </p>

      {loading ? (
        <div className="chart-loading">Loading chart...</div>
      ) : !hasData ? (
        <div className="chart-empty">
          <p>No data yet — start logging food to see your weekly trend 📈</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />

            {/* Goal reference line */}
            <ReferenceLine
              y={dailyGoal}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{ value: 'Goal', fill: '#ef4444', fontSize: 10, position: 'right' }}
            />

            <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.calories === 0
                      ? 'rgba(255,255,255,0.06)'
                      : entry.calories > dailyGoal
                      ? '#ef4444'
                      : '#4ade80'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default WeeklyChart
