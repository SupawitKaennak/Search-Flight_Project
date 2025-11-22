'use client'

import { Card } from '@/components/ui/card'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { defaultChartData } from '@/services/mock-chart-data'
import { monthOrder } from '@/services/constants'

const getChartConfig = (tripType?: 'one-way' | 'round-trip' | null) => ({
  price: {
    label: tripType === 'one-way' ? 'ราคาเที่ยวเดียว' : 'ราคาไป-กลับ',
    color: 'hsl(221, 83%, 53%)', // สีน้ำเงินสวย
  },
})

interface PriceChartProps {
  data?: Array<{
    startDate: string
    returnDate: string
    price: number
    season: 'high' | 'normal' | 'low'
    duration?: number
  }>
  tripType?: 'one-way' | 'round-trip' | null
}

export function PriceChart({ data, tripType }: PriceChartProps) {
  // Fallback to mock data if no data provided
  const chartData = data || defaultChartData
  const chartConfig = getChartConfig(tripType)

  const lowestPrice = Math.min(...chartData.map(d => d.price))
  
  // Transform data for chart - use startDate for X-axis
  // เรียงข้อมูลตามลำดับวันที่เพื่อให้เส้นเชื่อมต่อกันถูกต้อง
  
  const transformedData = chartData
    .map(d => ({
      date: d.startDate,
      price: d.price,
      season: d.season,
      returnDate: d.returnDate,
      duration: d.duration || 0,
      // เพิ่ม sortKey สำหรับเรียงลำดับ
      sortKey: (() => {
        const match = d.startDate.match(/(\d+)\s+(.+)/)
        if (match) {
          const day = parseInt(match[1])
          const month = monthOrder[match[2]] || 0
          return month * 100 + day
        }
        return 0
      })(),
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
  return (
    <div className="min-h-[350px] w-full max-w-full">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={transformedData} margin={{ top: 30, right: 40, left: 10, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={70}
              interval={0}
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
              tickCount={8}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value: any, name: any, props: any) => {
                  const returnDate = props?.payload?.returnDate || ''
                  const startDate = props?.payload?.date || ''
                  const duration = props?.payload?.duration || 0
                  
                  if (tripType === 'one-way') {
                    // One-way: แสดงแค่ราคา (ไม่แสดง label ซ้ำ)
                    return [
                      `฿${Number(value).toLocaleString()}`,
                      'ราคาเที่ยวเดียว'
                    ]
                  } else {
                    // Round-trip: แสดง "ไปวันที่ A - กลับวันที่ B (รวม X วัน)"
                    if (returnDate && startDate) {
                      return [
                        `฿${Number(value).toLocaleString()}`,
                        `ไปวันที่ ${startDate} - กลับวันที่ ${returnDate}${duration > 0 ? ` (รวม ${duration} วัน)` : ''}`
                      ]
                    }
                    return [
                      `฿${Number(value).toLocaleString()}`,
                      returnDate ? `กลับ ${returnDate}` : 'ราคาไป-กลับ'
                    ]
                  }
                }}
                labelFormatter={(label) => {
                  if (tripType === 'one-way') {
                    return `เดินทางวันที่ ${label}`
                  }
                  return `วันที่ออกเดินทาง: ${label}`
                }}
              />} 
            />
            <defs>
              {/* Gradient สำหรับพื้นที่กราฟ */}
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.4} />
                <stop offset="50%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.05} />
              </linearGradient>
              {/* Gradient สำหรับเส้นกราฟ */}
              <linearGradient id="priceStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(221, 83%, 53%)" />
                <stop offset="50%" stopColor="hsl(221, 83%, 60%)" />
                <stop offset="100%" stopColor="hsl(221, 83%, 53%)" />
              </linearGradient>
            </defs>
            <ReferenceLine 
              y={lowestPrice} 
              stroke="hsl(142, 76%, 36%)" 
              strokeDasharray="3 3"
              strokeWidth={2}
              label={{ 
                value: 'ราคาถูกที่สุด', 
                position: 'insideTopRight', 
                fill: 'hsl(142, 76%, 36%)',
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="url(#priceStrokeGradient)" 
              fill="url(#priceGradient)"
              strokeWidth={3}
              dot={{ 
                fill: 'hsl(221, 83%, 53%)', 
                r: 5, 
                strokeWidth: 3, 
                stroke: 'hsl(0, 0%, 100%)',
                opacity: 0.9
              }}
              activeDot={{ 
                r: 7, 
                strokeWidth: 3, 
                stroke: 'hsl(0, 0%, 100%)',
                fill: 'hsl(221, 83%, 53%)',
                style: { filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.5))' }
              }}
              connectNulls={false}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
