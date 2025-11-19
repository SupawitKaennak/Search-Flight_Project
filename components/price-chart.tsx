'use client'

import { Card } from '@/components/ui/card'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

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
  const chartData = data || [
    { startDate: '01 ม.ค.', returnDate: '08 ม.ค.', price: 18500, season: 'high' },
    { startDate: '15 ม.ค.', returnDate: '22 ม.ค.', price: 19200, season: 'high' },
    { startDate: '01 ก.พ.', returnDate: '08 ก.พ.', price: 17800, season: 'high' },
    { startDate: '15 ก.พ.', returnDate: '22 ก.พ.', price: 16500, season: 'normal' },
    { startDate: '01 มี.ค.', returnDate: '08 มี.ค.', price: 15200, season: 'normal' },
    { startDate: '15 มี.ค.', returnDate: '22 มี.ค.', price: 14800, season: 'normal' },
    { startDate: '01 เม.ย.', returnDate: '08 เม.ย.', price: 13500, season: 'low' },
    { startDate: '15 เม.ย.', returnDate: '22 เม.ย.', price: 12800, season: 'low' },
    { startDate: '01 พ.ค.', returnDate: '08 พ.ค.', price: 12500, season: 'low' },
    { startDate: '15 พ.ค.', returnDate: '22 พ.ค.', price: 12500, season: 'low' },
    { startDate: '01 มิ.ย.', returnDate: '08 มิ.ย.', price: 13200, season: 'low' },
    { startDate: '15 มิ.ย.', returnDate: '22 มิ.ย.', price: 14500, season: 'normal' },
    { startDate: '01 ก.ค.', returnDate: '08 ก.ค.', price: 16800, season: 'normal' },
    { startDate: '15 ก.ค.', returnDate: '22 ก.ค.', price: 18200, season: 'high' },
    { startDate: '01 ส.ค.', returnDate: '08 ส.ค.', price: 19500, season: 'high' },
    { startDate: '15 ส.ค.', returnDate: '22 ส.ค.', price: 20700, season: 'high' },
    { startDate: '01 ก.ย.', returnDate: '08 ก.ย.', price: 18800, season: 'high' },
    { startDate: '15 ก.ย.', returnDate: '22 ก.ย.', price: 16200, season: 'normal' },
    { startDate: '01 ต.ค.', returnDate: '08 ต.ค.', price: 15500, season: 'normal' },
    { startDate: '15 ต.ค.', returnDate: '22 ต.ค.', price: 16800, season: 'normal' },
    { startDate: '01 พ.ย.', returnDate: '08 พ.ย.', price: 18200, season: 'high' },
    { startDate: '15 พ.ย.', returnDate: '22 พ.ย.', price: 19500, season: 'high' },
    { startDate: '01 ธ.ค.', returnDate: '08 ธ.ค.', price: 20800, season: 'high' },
    { startDate: '15 ธ.ค.', returnDate: '22 ธ.ค.', price: 22500, season: 'high' },
  ]

  const lowestPrice = Math.min(...chartData.map(d => d.price))
  
  // Transform data for chart - use startDate for X-axis
  // เรียงข้อมูลตามลำดับวันที่เพื่อให้เส้นเชื่อมต่อกันถูกต้อง
  const monthOrder: Record<string, number> = {
    'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4,
    'พ.ค.': 5, 'มิ.ย.': 6, 'ก.ค.': 7, 'ส.ค.': 8,
    'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12,
  }
  
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
