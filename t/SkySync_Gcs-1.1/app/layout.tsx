import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { MainLayout } from "@/components/main-layout"
import { Preloader } from "@/components/preloader"
import { Navigation } from "@/components/navigation"
import { HistoryDataCollector } from "@/components/history-data-collector"
import { AutoCollectProvider } from "@/components/auto-collect-context";

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Drone Control Interface",
  description: "A modern web interface for drone control and monitoring",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + " h-screen w-screen"}>
        <AutoCollectProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <HistoryDataCollector />
            <Preloader />
            <Navigation />
            {/* Remove pt-4 and set h-full to main */}
            <main className="pt-12 h-screen w-screen">
              <MainLayout>{children}</MainLayout>
            </main>
          </ThemeProvider>
        </AutoCollectProvider>
      </body>
    </html>
  )
}

