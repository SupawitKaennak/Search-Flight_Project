'use client'

import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp, Calendar, Globe, Trophy } from 'lucide-react'
import { 
  getMostSearchedCountry, 
  getMostSearchedDuration, 
  getTotalSearches,
  getPopularProvinces
} from '@/lib/stats'
import { useEffect, useState } from 'react'
import { provinceNames } from '@/services/constants'

export function FlightStats() {
  const [stats, setStats] = useState({
    mostSearchedCountry: null as { country: string; count: number } | null,
    mostSearchedDuration: null as { duration: string; count: number } | null,
    totalSearches: 0,
    popularProvinces: [] as Array<{ province: string; count: number }>,
  })

  useEffect(() => {
    const updateStats = () => {
      setStats({
        mostSearchedCountry: getMostSearchedCountry(),
        mostSearchedDuration: getMostSearchedDuration(),
        totalSearches: getTotalSearches(),
        popularProvinces: getPopularProvinces(5),
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

      {/* Travel Statistics - Popular Provinces */}
      {stats.popularProvinces.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold">{'สถิติการเดินทางของผู้ใช้ทั้งหมด'}</h3>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-bold">{'จังหวัดยอดนิยม'}</h4>
            </div>

            <div className="space-y-4">
              {stats.popularProvinces.map((item, index) => {
                const maxCount = stats.popularProvinces[0]?.count || 1
                const percentage = (item.count / maxCount) * 100
                
                return (
                  <div key={item.province} className="flex items-center gap-4">
                    {/* Rank Circle */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">{index + 1}</span>
                    </div>

                    {/* Province Name */}
                    <div className="flex-shrink-0 w-48">
                      <span className="font-medium">
                        {provinceNames[item.province] || item.province}
                      </span>
                    </div>

                    {/* Bar Chart */}
                    <div className="flex-1 relative">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Count */}
                    <div className="flex-shrink-0 text-right">
                      <span className="font-semibold">
                        {item.count.toLocaleString()} {'คน'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

