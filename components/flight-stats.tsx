'use client'

import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp, Calendar, Globe } from 'lucide-react'
import { 
  getMostSearchedCountry, 
  getMostSearchedDuration, 
  getTotalSearches
} from '@/lib/stats'
import { useEffect, useState } from 'react'
import { provinceNames } from '@/services/constants'

export function FlightStats() {
  const [stats, setStats] = useState({
    mostSearchedCountry: null as { country: string; count: number } | null,
    mostSearchedDuration: null as { duration: string; count: number } | null,
    totalSearches: 0,
  })

  useEffect(() => {
    const updateStats = () => {
      setStats({
        mostSearchedCountry: getMostSearchedCountry(),
        mostSearchedDuration: getMostSearchedDuration(),
        totalSearches: getTotalSearches(),
      })
    }

    updateStats()
    // Update stats every 2 seconds to catch new searches
    const interval = setInterval(updateStats, 2000)
    return () => clearInterval(interval)
  }, [])

  if (stats.totalSearches === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Search Statistics */}
      {stats.totalSearches > 0 && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold">{'สถิติการค้นหา'}</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
        {/* Total Searches */}
        <div className="p-4 bg-background rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{'จำนวนการค้นหาทั้งหมด'}</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {stats.totalSearches}
          </div>
        </div>

        {/* Most Searched Province */}
        {stats.mostSearchedCountry && (
          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{'จังหวัดที่ค้นหามากที่สุด'}</span>
            </div>
            <div className="text-2xl font-bold">
              {provinceNames[stats.mostSearchedCountry.country] || stats.mostSearchedCountry.country}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {'ค้นหา '}{stats.mostSearchedCountry.count}{' ครั้ง'}
            </div>
          </div>
        )}

        {/* Most Searched Duration */}
        {stats.mostSearchedDuration && (
          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{'ระยะเวลาที่นิยมมากที่สุด'}</span>
            </div>
            <div className="text-2xl font-bold">
              {stats.mostSearchedDuration.duration}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {'ค้นหา '}{stats.mostSearchedDuration.count}{' ครั้ง'}
            </div>
          </div>
        )}
          </div>
        </Card>
      )}
    </div>
  )
}

