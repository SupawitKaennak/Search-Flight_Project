'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, Info } from 'lucide-react'
import { SeasonData } from '@/lib/flight-analysis'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { defaultSeasons } from '@/services/mock-seasons'
import { thaiMonths, thaiMonthsFull } from '@/services/constants'

interface RecommendedPeriod {
  startDate: string
  endDate: string
  returnDate: string
  price: number
  airline: string
  season: 'high' | 'normal' | 'low'
  savings: number
}

interface SeasonalBreakdownProps {
  seasons?: SeasonData[]
  recommendedPeriod?: RecommendedPeriod | null
}

export function SeasonalBreakdown({ seasons: propSeasons, recommendedPeriod }: SeasonalBreakdownProps) {
  const seasons = propSeasons || defaultSeasons

  // Get current month
  const currentMonth = new Date().getMonth()

  // Create month-season mapping
  const monthSeasonMap: Record<number, 'high' | 'normal' | 'low'> = {}
  seasons.forEach(season => {
    season.months.forEach(monthName => {
      const monthIndex = thaiMonthsFull.findIndex(m => m === monthName)
      if (monthIndex !== -1) {
        monthSeasonMap[monthIndex] = season.type
      }
    })
  })

  // Get season color
  const getSeasonColor = (type: 'high' | 'normal' | 'low') => {
    switch (type) {
      case 'low':
        return 'bg-green-500'
      case 'normal':
        return 'bg-blue-500'
      case 'high':
        return 'bg-red-500'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">{'การแบ่งช่วงตามฤดูกาล'}</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Info className="w-4 h-4 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <div className="space-y-2">
              {seasons.map(season => (
                <div key={season.type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${getSeasonColor(season.type)}`} />
                  <span className="text-xs">
                    <strong>{season.type === 'low' ? 'Low' : season.type === 'normal' ? 'Normal' : 'High'} Season:</strong>{' '}
                    {season.months.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Best Deal Recommendation */}
      {recommendedPeriod && (
        <Card className="p-6 mb-6 border-2 border-accent bg-accent/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shrink-0">
              <TrendingDown className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold">{'คำแนะนำของเรา'}</h3>
                <Badge className="bg-accent text-accent-foreground">{'ราคาถูกที่สุด'}</Badge>
              </div>
              <p className="text-lg mb-4 leading-relaxed">
                {'ช่วงที่แนะนำคือ'} <strong>{recommendedPeriod.startDate}</strong>
                {' - '}<strong>{recommendedPeriod.endDate}</strong>
                {' (กลับวันที่ '}{recommendedPeriod.returnDate}{')'}
                {' ('}
                {recommendedPeriod.season === 'low' ? 'Low Season' : 
                 recommendedPeriod.season === 'normal' ? 'Normal Season' : 'High Season'}
                {')'}
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">{'ราคาไป-กลับ'}</div>
                  <div className="text-2xl font-bold text-accent">
                    {'฿'}{recommendedPeriod.price.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">{'สายการบิน'}</div>
                  <div className="text-lg font-semibold">{recommendedPeriod.airline}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">{'ประหยัดได้ถึง'}</div>
                  <div className="text-2xl font-bold text-green-600">
                    {'฿'}{recommendedPeriod.savings.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline Bar Chart */}
      <Card className="p-6">
        <div className="mb-4">
          <h4 className="font-semibold mb-2">{'Timeline ฤดูกาลตลอดทั้งปี'}</h4>
          <p className="text-sm text-muted-foreground">
            {'สีเขียว = Low Season | สีฟ้า = Normal Season | สีแดง = High Season'}
          </p>
        </div>

        {/* Timeline Bar */}
        <div className="relative">
          <div className="flex h-12 rounded-lg overflow-hidden border border-border">
            {thaiMonths.map((month, index) => {
              const season = monthSeasonMap[index] || 'normal'
              const isCurrent = index === currentMonth
              
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex-1 relative cursor-pointer transition-all ${
                        isCurrent 
                          ? 'ring-2 ring-offset-2 ring-primary z-10 scale-105' 
                          : 'hover:opacity-80'
                      }`}
                      style={{
                        background: `linear-gradient(to bottom, ${
                          season === 'low' ? '#4ade80, #16a34a' :
                          season === 'normal' ? '#60a5fa, #2563eb' :
                          '#f87171, #dc2626'
                        })`
                      }}
                    >
                      {isCurrent && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                          <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-semibold whitespace-nowrap">
                            {'ปัจจุบัน'}
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xs font-medium ${
                          isCurrent ? 'text-white drop-shadow' : 'text-white/90'
                        }`}>
                          {month}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-semibold">{thaiMonthsFull[index]}</div>
                      <div className="text-xs">
                        {season === 'low' ? 'Low Season' : 
                         season === 'normal' ? 'Normal Season' : 
                         'High Season'}
                      </div>
                      {seasons.find(s => s.type === season) && (
                        <div className="text-xs text-muted-foreground">
                          {'฿'}{seasons.find(s => s.type === season)!.priceRange.min.toLocaleString()}
                          {' - '}
                          {'฿'}{seasons.find(s => s.type === season)!.priceRange.max.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>

        {/* Legend (Compact) */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>{'Low Season'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>{'Normal Season'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>{'High Season'}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
