import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Plane } from 'lucide-react'
import { SeasonData } from '@/lib/flight-analysis'

interface SeasonalBreakdownProps {
  seasons?: SeasonData[]
}

export function SeasonalBreakdown({ seasons: propSeasons }: SeasonalBreakdownProps) {
  // Fallback to default seasons if none provided
  const defaultSeasons: SeasonData[] = [
    {
      type: 'low',
      months: ['เมษายน', 'พฤษภาคม', 'มิถุนายน'],
      priceRange: { min: 12500, max: 14500 },
      bestDeal: {
        dates: '15-22 พฤษภาคม 2025',
        price: 12500,
        airline: 'Thai AirAsia X',
      },
      description: 'ราคาถูกที่สุดของปี เหมาะสำหรับผู้ที่มีความยืดหยุ่นในการเดินทาง',
    },
    {
      type: 'normal',
      months: ['กุมภาพันธ์', 'มีนาคม', 'กันยายน', 'ตุลาคม'],
      priceRange: { min: 14800, max: 17800 },
      bestDeal: {
        dates: '5-12 มีนาคม 2025',
        price: 14800,
        airline: 'Thai Airways',
      },
      description: 'ราคาปานกลาง อากาศดี เหมาะสำหรับการท่องเที่ยว',
    },
    {
      type: 'high',
      months: ['มกราคม', 'กรกฎาคม', 'สิงหาคม', 'พฤศจิกายน', 'ธันวาคม'],
      priceRange: { min: 18200, max: 22500 },
      bestDeal: {
        dates: '10-17 กรกฎาคม 2025',
        price: 18200,
        airline: 'Japan Airlines',
      },
      description: 'ช่วงเทศกาลและปิดเทอม ราคาสูงสุด แนะนำจองล่วงหน้า',
    },
  ]

  const seasons = propSeasons || defaultSeasons

  const getSeasonConfig = (type: 'high' | 'normal' | 'low') => {
    switch (type) {
      case 'low':
        return {
          name: 'Low Season',
          icon: TrendingDown,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        }
      case 'normal':
        return {
          name: 'Normal Season',
          icon: Minus,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        }
      case 'high':
        return {
          name: 'High Season',
          icon: TrendingUp,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        }
    }
  }
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">{'การแบ่งช่วงตามฤดูกาล'}</h3>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {seasons.map((season) => {
          const config = getSeasonConfig(season.type)
          const Icon = config.icon
          return (
            <Card 
              key={season.type} 
              className={`p-6 border-2 ${config.borderColor} ${config.bgColor}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg">{config.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{season.months.join(', ')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">{'ช่วงราคา'}</div>
                  <div className="text-xl font-bold">
                    {'฿'}{season.priceRange.min.toLocaleString()}
                    {' - '}
                    {'฿'}{season.priceRange.max.toLocaleString()}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {'ดีลที่ดีที่สุด'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{'วันที่:'}</span>
                      <span className="text-sm font-medium">{season.bestDeal.dates}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{season.bestDeal.airline}</span>
                    </div>
                    <div className="text-2xl font-bold text-primary mt-2">
                      {'฿'}{season.bestDeal.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed pt-3 border-t">
                  {season.description}
                </p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
