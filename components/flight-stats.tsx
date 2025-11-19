'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, TrendingDown, Minus, Calendar, Globe, DollarSign, Database } from 'lucide-react'
import { 
  getMostSearchedCountry, 
  getMostSearchedDuration, 
  getTotalSearches,
  getAveragePrice,
  getPriceTrend,
  getTotalPriceRecords
} from '@/lib/stats'
import { useEffect, useState } from 'react'

export function FlightStats() {
  const [stats, setStats] = useState({
    mostSearchedCountry: null as { country: string; count: number } | null,
    mostSearchedDuration: null as { duration: string; count: number } | null,
    totalSearches: 0,
    averagePrice: null as number | null,
    priceTrend: null as { trend: 'up' | 'down' | 'stable'; percentage: number } | null,
    totalPriceRecords: 0,
  })

  useEffect(() => {
    const updateStats = () => {
      setStats({
        mostSearchedCountry: getMostSearchedCountry(),
        mostSearchedDuration: getMostSearchedDuration(),
        totalSearches: getTotalSearches(),
        averagePrice: getAveragePrice(),
        priceTrend: getPriceTrend(),
        totalPriceRecords: getTotalPriceRecords(),
      })
    }

    updateStats()
    // Update stats every 2 seconds to catch new searches and prices
    const interval = setInterval(updateStats, 2000)
    return () => clearInterval(interval)
  }, [])

  const provinceNames: Record<string, string> = {
    'bangkok': 'กรุงเทพมหานคร',
    'chiang-mai': 'เชียงใหม่',
    'phuket': 'ภูเก็ต',
    'krabi': 'กระบี่',
    'samui': 'เกาะสมุย',
    'pattaya': 'พัทยา (ชลบุรี)',
    'hat-yai': 'หาดใหญ่ (สงขลา)',
    'udon-thani': 'อุดรธานี',
    'khon-kaen': 'ขอนแก่น',
    'nakhon-ratchasima': 'นครราชสีมา',
    'surat-thani': 'สุราษฎร์ธานี',
    'trang': 'ตรัง',
    'surin': 'สุรินทร์',
    'ubon-ratchathani': 'อุบลราชธานี',
    'nakhon-sawan': 'นครสวรรค์',
    'lampang': 'ลำปาง',
    'mae-hong-son': 'แม่ฮ่องสอน',
    'nan': 'น่าน',
    'phitsanulok': 'พิษณุโลก',
    'sukhothai': 'สุโขทัย',
  }

  if (stats.totalSearches === 0 && stats.totalPriceRecords === 0) {
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

      {/* Price Statistics */}
      {stats.totalPriceRecords > 0 && (
        <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-2">
          <div className="flex items-center gap-2 mb-6">
            <Database className="w-6 h-6 text-accent" />
            <h3 className="text-2xl font-bold">{'สถิติราคา (สำหรับวิเคราะห์แนวโน้ม)'}</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Total Price Records */}
            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{'จำนวนข้อมูลราคาที่เก็บไว้'}</span>
              </div>
              <div className="text-3xl font-bold text-accent">
                {stats.totalPriceRecords}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {'สำหรับวิเคราะห์แนวโน้ม'}
              </div>
            </div>

            {/* Average Price */}
            {stats.averagePrice && (
              <div className="p-4 bg-background rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{'ราคาเฉลี่ยทั้งหมด'}</span>
                </div>
                <div className="text-2xl font-bold">
                  {'฿'}{stats.averagePrice.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {'จากข้อมูลที่เก็บไว้'}
                </div>
              </div>
            )}

            {/* Price Trend */}
            {stats.priceTrend && (
              <div className="p-4 bg-background rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  {stats.priceTrend.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-red-600" />
                  ) : stats.priceTrend.trend === 'down' ? (
                    <TrendingDown className="w-5 h-5 text-green-600" />
                  ) : (
                    <Minus className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">{'แนวโน้มราคา'}</span>
                </div>
                <div className="text-2xl font-bold">
                  {stats.priceTrend.trend === 'up' ? (
                    <span className="text-red-600">{'↑ เพิ่มขึ้น'}</span>
                  ) : stats.priceTrend.trend === 'down' ? (
                    <span className="text-green-600">{'↓ ลดลง'}</span>
                  ) : (
                    <span className="text-muted-foreground">{'→ คงที่'}</span>
                  )}
                </div>
                {stats.priceTrend.percentage > 0 && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {stats.priceTrend.percentage}{'%'}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

