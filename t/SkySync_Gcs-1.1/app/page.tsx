"use client"
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle"

import React from "react"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardParameters } from "@/components/dashbard-parameters"
import DashboardSafeSpot from "@/components/dashboard-safespot"
import ZvsTimeChart from "@/components/dashboard-z_vs_t-graph"
import { PositionSimulator } from "@/components/dashboard-livedata"
import LiveMonitoringPanel from "@/components/dashboard-livedata"
import Link from "next/link"
import { useTelemetryData } from "@/app/hooks/useTelemetryData"
import { useAutoCollect } from "@/components/auto-collect-context";
import { RefreshCw } from "lucide-react";


export default function DashboardPage() {
  const telemetry = useTelemetryData();
  const attitude = telemetry?.attitude || { roll: 0, pitch: 0, yaw: 0 };
  const { autoCollect, collecting, toggleAutoCollect, collectCurrentData } = useAutoCollect();

  return (
    <div className="max-h-screen w-full flex flex-col">
      {/* Auto-Collect Button Row */}
      <div className="flex items-center gap-4 p-2">
        <Button
          onClick={toggleAutoCollect}
          variant={autoCollect ? "destructive" : "default"}
          size="sm"
        >
          {autoCollect ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {autoCollect ? "Stop" : "Start"} Auto-Collect
        </Button>
        <Button
          onClick={collectCurrentData}
          disabled={collecting}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${collecting ? "animate-spin" : ""}`} />
          Collect Now
        </Button>
        <span className="text-xs text-muted-foreground">Auto-collect interval: 5 seconds</span>
      </div>
      <main className="flex-1 h-full w-full">
        <div
          className="
            grid
            h-full w-full
            grid-cols-[0.6fr_0.5fr_0.7fr_1.1fr]  
            gap-2
            border border-gray-300
          "
        >
          {/* Live Arena & Safe Spots Section (now first) */}
          <section className="bg-white flex flex-col h-full w-full" style={{ minHeight: 0 , maxHeight:650}}>
            <DashboardSafeSpot />
          </section>
          {/* Events Section (now second) */}
          <section className="bg-white flex flex-col h-full w-full" style={{ minHeight: 0, maxHeight: 650 }}>
            <div className="flex flex-col items-center justify-center h-full w-full border-r border-gray-200">
              <h2 className="text-lg font-bold mb-2">Events</h2>
              <div className="text-gray-500">No events yet.</div>
            </div>
          </section>
          {/* Top Middle Section */}
          <section className="bg-white flex flex-col h-full w-full" style={{ minHeight: 0 , maxHeight:650}}>
            <div className="pl-1">
              <DashboardParameters />
            </div>
            <div className="pl-1 pt-2">
              {/* Attitude Info Card (replaces Live Monitoring) */}
              <div className="bg-background rounded-lg shadow p-4 border mt-2">
                <h3 className="text-base font-semibold mb-2 text-foreground">Attitude</h3>
                <div className="flex flex-row gap-10 text-sm font-mono">
                  <div>
                    <span className="text-muted-foreground">Roll:</span> <span className="text-foreground" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{attitude.roll ? (attitude.roll * 180 / Math.PI).toFixed(1) : "0.0"}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pitch:</span> <span className="text-foreground" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{attitude.pitch ? (attitude.pitch * 180 / Math.PI).toFixed(1) : "0.0"}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Yaw:</span> <span className="text-foreground" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{attitude.yaw ? (attitude.yaw * 180 / Math.PI).toFixed(1) : "0.0"}°</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Top Right Section (YouTube, improved centering and size) */}
          <section className="bg-white flex flex-col h-full w-full items-center justify-center" style={{ minHeight: 0, maxHeight: 400 }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'top', alignItems: 'flex-start', height: '100%', marginTop: '10px' }}>
              <iframe
                width="800"
                height="660"
                src="https://www.youtube.com/embed/xRPjKQtRXR8?autoplay=1"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="YouTube Live Stream"
                style={{ background: '#000', display: 'block', borderRadius: 12, margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
              />
            </div>
          </section>
          {/* Bottom Full-width Section */}
          <section className="col-span-4 bg-white flex flex-col h-full w-full" style={{ minHeight: 0 , maxHeight:400}}>
            <ZvsTimeChart />
          </section>
        </div>
      </main>
    </div>
  )
}


