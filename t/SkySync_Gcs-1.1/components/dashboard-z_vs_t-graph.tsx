"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TrendingUp } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

interface TelemetrySnapshot {
  timestamp: string
  position?: {
    z: number
  }
}

export default function ZvsTimeChart() {
  const [historyData, setHistoryData] = useState<TelemetrySnapshot[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch historical data (last 1 day)
  const fetchHistoryData = async () => {
    //Added for continuous data fetching(jayesh)
    
    setLoading(true)
    try {
      const response = await fetch(`/api/history-data?days=1`, {
        cache: 'no-store'
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (result.status === 'success') {
        setHistoryData(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching history data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistoryData()
  }, [])

  // Prepare chart data
  // Calculate the start time in ms
  const startTime = historyData.length > 0 ? new Date(historyData[0].timestamp).getTime() : 0;
  const chartData = historyData.map((item) => ({
    seconds: startTime ? (new Date(item.timestamp).getTime() - startTime) / 1000 : 0,
    z: -(item.position?.z || 0), // Invert Z for intuitive display
  }));

  // Determine the visible window (e.g., last 5 minutes or 300 seconds)
  const windowSize = 300; // seconds (5 minutes)
  const latestSecond = chartData.length > 0 ? chartData[chartData.length - 1].seconds : 0;
  const minSecond = Math.max(0, latestSecond - windowSize);
  const visibleData = chartData.filter(d => d.seconds >= minSecond);

  // Custom tick formatter for seconds/minutes
  function formatTimeLabel(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    if (m > 0 && s > 0) return `${m}m${s}s`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
  }

  return (
    <div className="h-full w-full flex flex-col">
      {loading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : visibleData.length === 0 ? (
        <Alert>
          <AlertTitle>No Historical Data</AlertTitle>
          <AlertDescription>
            No telemetry data found. Start data collection to view Z vs Time analysis.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <TrendingUp className="w-5 h-5" />
              Z Position vs Time (Height Above Ground)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={270}>
              <AreaChart data={visibleData} margin={{ left: 0, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="seconds"
                  domain={[minSecond, latestSecond]}
                  type="number"
                  tickFormatter={formatTimeLabel}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={formatTimeLabel}
                  formatter={(value: number) => [value.toFixed(3) + ' m', 'Height Above Ground']}
                />
                <Area
                  type="monotone"
                  dataKey="z"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
