"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUp, Axis3D, Battery, Cpu, CpuIcon, Gauge, MemoryStick, Plane, Store, Thermometer } from "lucide-react"
import { TelemetryOverview } from "./telemetry-overview"
import { useTelemetryData } from "@/app/hooks/useTelemetryData"
import { Progress } from "@/components/ui/progress"
import { TelemetryStatus } from "@/app/components/telemetry-status"
import { FlightDataSimulator } from "./telemetry-overview"

export function DashboardParameters() {
const [localPosition, setLocalPosition] = useState<any>(null)
  const [attitude, setAttitude] = useState<any>(null)
  const [battery, setBattery] = useState<any>(null)
  const [globalPosition, setGlobalPosition] = useState<any>(null)
  const flightSimulator = useRef(new FlightDataSimulator())
  const data = useTelemetryData()

  useEffect(() => {
    // Function to fetch parameter data or generate realistic simulated data
    const fetchParameterData = async () => {
      try {
        // Try to fetch real data first
        let useSimulatedData = false

        // Fetch LOCAL_POSITION_NED
        const localPositionRes = await fetch(`/params/LOCAL_POSITION_NED.json?t=${Date.now()}`)
        if (!localPositionRes.ok) {
          useSimulatedData = true
        } else {
          const localPositionData = await localPositionRes.json()
          setLocalPosition(localPositionData)
        }

        // Fetch ATTITUDE
        const attitudeRes = await fetch(`/params/ATTITUDE.json?t=${Date.now()}`)
        if (!attitudeRes.ok) {
          useSimulatedData = true
        } else {
          const attitudeData = await attitudeRes.json()
          setAttitude(attitudeData)
        }

        // Fetch BATTERY_STATUS
        const batteryRes = await fetch(`/params/BATTERY_STATUS.json?t=${Date.now()}`)
        if (!batteryRes.ok) {
          useSimulatedData = true
        } else {
          const batteryData = await batteryRes.json()
          setBattery(batteryData)
        }

        // Fetch GLOBAL_POSITION_INT
        const globalPositionRes = await fetch(`/params/GLOBAL_POSITION_INT.json?t=${Date.now()}`)
        if (!globalPositionRes.ok) {
          useSimulatedData = true
        } else {
          const globalPositionData = await globalPositionRes.json()
          setGlobalPosition(globalPositionData)
        }

        // If any fetch failed, use simulated data
        if (useSimulatedData) {
          const simulatedData = flightSimulator.current.update()
          setLocalPosition(simulatedData.localPosition)
          setAttitude(simulatedData.attitude)
          setBattery(simulatedData.battery)
          setGlobalPosition(simulatedData.globalPosition)
        }
      } catch (error) {
        console.error("Error fetching parameter data:", error)
        // Generate realistic simulated data if fetch fails
        const simulatedData = flightSimulator.current.update()
        setLocalPosition(simulatedData.localPosition)
        setAttitude(simulatedData.attitude)
        setBattery(simulatedData.battery)
        setGlobalPosition(simulatedData.globalPosition)
      }
    }

    // Initial fetch
    fetchParameterData()

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchParameterData, 1000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])


    return (
        <Tabs defaultValue="overview" className="space-y-6">

        <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-1 lg:grid-cols-3 ml-auto h-100" >
            
            <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>Altitude</CardTitle>
                    <ArrowUp className="h-3 w-3 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                    <div className="text-base font-medium">
                        <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                            {globalPosition ? (-globalPosition.relative_alt / 10000).toFixed(2) + " m" : "Loading..."}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Relative to home</p>
                </CardContent>
            </Card>

                
                <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>Attitude</CardTitle>
                <Plane className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                <div className="text-base font-medium">
                    <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {attitude ? (Math.sqrt(Math.pow(attitude.roll, 2) + Math.pow(attitude.pitch, 2) + Math.pow(attitude.yaw, 2)) * (180 / Math.PI)).toFixed(1) + "°" : "Loading..."}
                    </span>
                </div>
                </CardContent>
            </Card>

            <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>Ground Speed</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                <div className="text-base font-medium">
                    <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {globalPosition
                    ? (Math.sqrt(Math.pow(globalPosition.vx, 2) + Math.pow(globalPosition.vy, 2)) / 100).toFixed(2) +
                        " m/s"
                    : "Loading..."}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground">
                    {globalPosition
                    ? ((Math.sqrt(Math.pow(globalPosition.vx, 2) + Math.pow(globalPosition.vy, 2)) / 100) * 3.6).toFixed(
                        2,
                        ) + " km/h"
                    : ""}
                </p>
                </CardContent>
            </Card>

            <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>CPU Load</CardTitle>
                <CpuIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                    <div className="text-base font-medium">
                        <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                            {data.system_health?.cpu_load ?? 0}%
                        </span>
                    </div>
                    <Progress value={data.system_health?.cpu_load ?? 0} />
                </CardContent>
            </Card>

            <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>Memory</CardTitle>
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                    <div className="text-base font-medium">
                        <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                            {data.system_health?.memory_usage ?? 0}%
                        </span>
                    </div>
                    <Progress value={data.system_health?.memory_usage ?? 0} />
                </CardContent>
            </Card>

            <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>Battery</CardTitle>
                <Battery className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                <div className="text-base font-medium">
                    <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {battery ? battery.battery_remaining + "%" : "Loading..."}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground">
                    {battery ? (battery.voltages[0] / 1000).toFixed(1) + "V" : ""}
                </p>
                </CardContent>
            </Card>        
            
            <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>X</CardTitle>
                <Axis3D className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                {localPosition ? (
                <div className="text-base font-medium">
                    <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {localPosition.x.toFixed(2)} m
                    </span>
                </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Loading position data...</div>
                )}
                </CardContent>
            </Card> 

            <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>Y</CardTitle>
                <Axis3D className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                {localPosition ? (
                <div className="text-base font-medium">
                    <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {localPosition.y.toFixed(2)} m
                    </span>
                </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Loading position data...</div>
                )}
                </CardContent>
            </Card> 

            <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>Z</CardTitle>
                <Axis3D className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                {localPosition ? (
                <div className="text-base font-medium">
                    <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {localPosition.z.toFixed(2)} m
                    </span>
                </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Loading position data...</div>
                )}
                </CardContent>
            </Card> 

            <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>Vx</CardTitle>
                <Axis3D className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                {localPosition ? (
                <div className="text-base font-medium">
                    <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {localPosition.vx.toFixed(2)} m/s
                    </span>
                </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Loading position data...</div>
                )}
                </CardContent>
            </Card> 

            <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>Vy</CardTitle>
                <Axis3D className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                {localPosition ? (
                <div className="text-base font-medium">
                    <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {localPosition.vy.toFixed(2)} m/s
                    </span>
                </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Loading position data...</div>
                )}
                </CardContent>
            </Card> 
            
            <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>Vz</CardTitle>
                <Axis3D className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                {localPosition ? (
                <div className="text-base font-medium">
                    <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {localPosition.vz.toFixed(2)} m/s
                    </span>
                </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Loading position data...</div>
                )}
                </CardContent>
            </Card>

            <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>Wx</CardTitle>
                <Axis3D className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                {localPosition ? (
                <div className="text-base font-medium">
                    <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {localPosition.vx.toFixed(2)} rad
                    </span>
                </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Loading position data...</div>
                )}
                </CardContent>
            </Card>

            <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>Wy</CardTitle>
                <Axis3D className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                {localPosition ? (
                <div className="text-base font-medium">
                    <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {localPosition.vx.toFixed(2)} rad
                    </span>
                </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Loading position data...</div>
                )}
                </CardContent>
            </Card>

            <Card className="w-70 h-20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 pb-1 px-2">
                <CardTitle className="text-lg font-bold" style={{ color: 'rgba(159, 22, 7, 1)' }}>Wz</CardTitle>
                <Axis3D className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-2 py-0">
                {localPosition ? (
                <div className="text-base font-medium">
                    <span className="text-foreground" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {localPosition.vx.toFixed(2)} rad
                    </span>
                </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Loading position data...</div>
                )}
                </CardContent>
            </Card>

            </div>
        </TabsContent>

        </Tabs>
    )
}