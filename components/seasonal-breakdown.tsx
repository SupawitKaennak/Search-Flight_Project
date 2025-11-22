'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, Info, AlertCircle, TrendingUp } from 'lucide-react'
import { SeasonData } from '@/lib/flight-analysis'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { defaultSeasons } from '@/services/mock/mock-seasons'
import { thaiMonths, thaiMonthsFull } from '@/services/constants'
import { useState } from 'react'

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

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

  // Get current season
  const currentSeason = monthSeasonMap[currentMonth] || 'normal'

  // Get low season months for recommendation
  const lowSeasonData = seasons.find(s => s.type === 'low')
  const lowSeasonMonths = lowSeasonData?.months.join(', ') || ''

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

  // Get recommendation styling based on current season
  const getRecommendationConfig = () => {
    switch (currentSeason) {
      case 'low':
        return {
          borderColor: 'border-accent',
          bgColor: 'bg-accent/5',
          iconBg: 'bg-accent',
          iconColor: 'text-accent-foreground',
          icon: TrendingDown,
          badgeBg: 'bg-accent text-accent-foreground',
          badgeText: 'ราคาถูกที่สุด',
          priceColor: 'text-accent',
          savingsColor: 'text-green-600',
          showRecommendation: true,
        }
      case 'high':
        return {
          borderColor: 'border-red-500',
          bgColor: 'bg-red-500/5',
          iconBg: 'bg-red-500',
          iconColor: 'text-white',
          icon: AlertCircle,
          badgeBg: 'bg-red-500 text-white',
          badgeText: 'High Season',
          priceColor: 'text-red-600',
          savingsColor: 'text-red-600',
          showRecommendation: false,
        }
      case 'normal':
        return {
          borderColor: 'border-blue-500',
          bgColor: 'bg-blue-500/5',
          iconBg: 'bg-blue-500',
          iconColor: 'text-white',
          icon: TrendingUp,
          badgeBg: 'bg-blue-500 text-white',
          badgeText: 'Normal Season',
          priceColor: 'text-blue-600',
          savingsColor: 'text-blue-600',
          showRecommendation: false,
        }
    }
  }

  const recConfig = getRecommendationConfig()
  const RecIcon = recConfig.icon

  return (
    <div className="w-full max-w-6xl mx-auto">
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
      {recommendedPeriod && (() => {
        const currentSeasonData = seasons.find(s => s.type === currentSeason)
        const otherSeasons = seasons.filter(s => s.type !== currentSeason)
        // ราคาปัจจุบันควรมาจาก currentSeason ไม่ใช่ recommendedPeriod.price
        // เพราะ recommendedPeriod.price เป็นราคาของ bestDeal (Low Season) เสมอ
        const currentPrice = currentSeasonData?.bestDeal.price || recommendedPeriod.price
        
        // Calculate comparison with other seasons
        const seasonComparisons = otherSeasons.map(season => {
          const seasonPrice = season.bestDeal.price
          const difference = seasonPrice - currentPrice
          const percentage = Math.round((difference / currentPrice) * 100)
          return {
            type: season.type,
            name: season.type === 'low' ? 'Low Season' : season.type === 'normal' ? 'Normal Season' : 'High Season',
            price: seasonPrice,
            priceRange: season.priceRange,
            difference,
            percentage,
            months: season.months.join(', '),
          }
        })

        return (
          <div
            onMouseMove={(e) => {
              setMousePosition({ x: e.clientX, y: e.clientY })
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative"
          >
            <Card className={`p-8 mb-6 border-2 ${recConfig.borderColor} ${recConfig.bgColor} cursor-help`}>
              <div className="flex items-start gap-6">
                <div className={`w-14 h-14 ${recConfig.iconBg} rounded-full flex items-center justify-center shrink-0`}>
                  <RecIcon className={`w-7 h-7 ${recConfig.iconColor}`} />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{'คำแนะนำของเรา'}</h3>
                    <Badge className={recConfig.badgeBg}>{recConfig.badgeText}</Badge>
                  </div>
              
              {currentSeason === 'low' ? (
                <>
                  <p className="text-lg mb-4 leading-relaxed">
                    {'ช่วงที่แนะนำคือ'} <strong>{recommendedPeriod.startDate}</strong>
                    {' - '}<strong>{recommendedPeriod.endDate}</strong>
                    {' (กลับวันที่ '}{recommendedPeriod.returnDate}{')'}
                    {' ('}
                    {recommendedPeriod.season === 'low' ? 'Low Season' : 
                     recommendedPeriod.season === 'normal' ? 'Normal Season' : 'High Season'}
                    {')'}
                  </p>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">{'ราคาไป-กลับ'}</div>
                      <div className={`text-2xl font-bold ${recConfig.priceColor}`}>
                        {'฿'}{recommendedPeriod.price.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">{'สายการบิน'}</div>
                      <div className="text-lg font-semibold">{recommendedPeriod.airline}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">{'ประหยัดได้ถึง'}</div>
                      <div className={`text-2xl font-bold ${recConfig.savingsColor}`}>
                        {'฿'}{recommendedPeriod.savings.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg mb-4 leading-relaxed">
                    {currentSeason === 'high' 
                      ? 'ตอนนี้อยู่ในช่วง High Season ราคาตั๋วเครื่องบินสูงสุด แนะนำให้จองในช่วง Low Season เพื่อประหยัดค่าใช้จ่าย'
                      : 'ตอนนี้อยู่ในช่วง Normal Season แนะนำให้จองในช่วง Low Season เพื่อประหยัดค่าใช้จ่ายมากขึ้น'}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 bg-background rounded-lg border">
                      <div className="text-sm text-muted-foreground mb-2">{'แนะนำจองในช่วง Low Season'}</div>
                      <div className="text-lg font-semibold text-green-600 mb-2">{lowSeasonMonths}</div>
                      {lowSeasonData && (
                        <>
                          <div className="text-sm text-muted-foreground mb-2">
                            {'ราคา: ฿'}{lowSeasonData.priceRange.min.toLocaleString()}
                            {' - ฿'}{lowSeasonData.priceRange.max.toLocaleString()}
                          </div>
                          {lowSeasonData.bestDeal?.airline && (
                            <div className="text-sm text-muted-foreground">
                              {'สายการบินที่ถูกที่สุด: '}
                              <span className="font-semibold text-green-600">
                                {lowSeasonData.bestDeal.airline}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {currentSeason === 'high' && (
                      <div className="p-5 bg-background rounded-lg border">
                        <div className="text-sm text-muted-foreground mb-2">{'ราคาปัจจุบัน (High Season)'}</div>
                        <div className={`text-2xl font-bold ${recConfig.priceColor}`}>
                          {'฿'}{currentPrice.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
        
        {/* Floating comparison tooltip that follows mouse */}
        {isHovering && (
          <div
            className="fixed z-50 max-w-md p-4 bg-popover text-popover-foreground rounded-lg border shadow-lg pointer-events-none"
            style={{
              left: `${mousePosition.x + 15}px`,
              top: `${mousePosition.y + 15}px`,
              transform: 'translate(0, 0)',
            }}
          >
            <div className="space-y-4">
              <div>
                <div className="font-semibold mb-2 text-sm">
                  {'เปรียบเทียบกับ Season อื่นๆ'}
                </div>
                <div className="space-y-3">
                  {/* Current Season */}
                  <div className="p-2 bg-background rounded border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {currentSeason === 'low' ? 'Low Season' : 
                         currentSeason === 'normal' ? 'Normal Season' : 'High Season'}
                        {' (ปัจจุบัน)'}
                      </span>
                      <div className={`text-sm font-bold ${recConfig.priceColor}`}>
                        {'฿'}{currentPrice.toLocaleString()}
                      </div>
                    </div>
                    {currentSeasonData && (
                      <div className="text-xs text-muted-foreground">
                        {'ช่วง: '}{currentSeasonData.months.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Other Seasons */}
                  {seasonComparisons.map((comp) => {
                    const isCheaper = comp.difference < 0
                    const compColor = comp.type === 'low' ? 'text-green-600' : 
                                     comp.type === 'normal' ? 'text-blue-600' : 'text-red-600'
                    
                    return (
                      <div key={comp.type} className="p-2 bg-background rounded border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{comp.name}</span>
                          <div className={`text-sm font-bold ${compColor}`}>
                            {'฿'}{comp.price.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {'ช่วง: '}{comp.months}
                          </span>
                          <span className={isCheaper ? 'text-green-600' : 'text-red-600'}>
                            {isCheaper ? 'ถูกกว่า' : 'แพงกว่า'} {Math.abs(comp.percentage)}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {'ราคา: ฿'}{comp.priceRange.min.toLocaleString()}
                          {' - ฿'}{comp.priceRange.max.toLocaleString()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
        )
      })()}

      {/* Timeline Bar Chart */}
      <Card className="p-8">
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
                        })`,
                        animation: isCurrent ? 'blink 2s ease-in-out infinite' : undefined,
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
