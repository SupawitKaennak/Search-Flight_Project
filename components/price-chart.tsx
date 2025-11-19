'use client'

import { Card } from '@/components/ui/card'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { defaultChartData } from '@/services/mock-chart-data'
import { monthOrder } from '@/services/constants'

const chartConfig = {
  price: {
    label: 'ราคาไป-กลับ',
    color: 'hsl(var(--chart-1))',
  },
}

interface PriceChartProps {
  data?: Array<{
    startDate: string
    returnDate: string
    price: number
    season: 'high' | 'normal' | 'low'
  }>
}

export function PriceChart({ data }: PriceChartProps) {
  // Fallback to mock data if no data provided
  const chartData = data || defaultChartData

  const lowestPrice = Math.min(...chartData.map(d => d.price))
  
  // Transform data for chart - use startDate for X-axis
  // เรียงข้อมูลตามลำดับวันที่เพื่อให้เส้นเชื่อมต่อกันถูกต้อง
  
  const transformedData = chartData
    .map(d => ({
      date: d.startDate,
      price: d.price,
      season: d.season,
      returnDate: d.returnDate,
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
    <div className="h-[300px] w-full max-w-full">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={transformedData} margin={{ top: 0, right: 20, left: 10, bottom: 75 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={65}
              interval={0}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
              tickCount={8}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value: any, name: any, props: any) => {
                  const returnDate = props?.payload?.returnDate || ''
                  const startDate = props?.payload?.date || ''
                  return [
                    `฿${Number(value).toLocaleString()}`,
                    returnDate && startDate 
                      ? `ช่วงไป: ${startDate} - ช่วงกลับ: ${returnDate}`
                      : returnDate 
                        ? `กลับ ${returnDate}`
                        : 'ราคาไป-กลับ'
                  ]
                }}
                labelFormatter={(label) => `วันที่เริ่มเดินทาง: ${label}`}
              />} 
            />
            <ReferenceLine 
              y={lowestPrice} 
              stroke="hsl(var(--accent))" 
              strokeDasharray="3 3"
              label={{ value: 'ราคาถูกที่สุด', position: 'right', fill: 'hsl(var(--accent))' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              connectNulls={false}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
