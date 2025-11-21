'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, TrendingUp, Calendar, ArrowRight, ArrowLeft, TrendingUp as TrendingUpIcon } from 'lucide-react'
import { SeasonalBreakdown } from '@/components/seasonal-breakdown'
import { AirlineFlights } from '@/components/airline-flights'
import { PriceChart } from '@/components/price-chart'
import { FlightSearchParams } from '@/components/flight-search-form'
import { analyzeFlightPrices, FlightAnalysisResult } from '@/lib/flight-analysis'
import { savePriceStat } from '@/lib/stats'
import { THAI_AIRLINES } from '@/services/constants'
import { useState, useEffect } from 'react'

interface PriceAnalysisProps {
  searchParams?: FlightSearchParams | null
}

export function PriceAnalysis({ searchParams }: PriceAnalysisProps) {
  const [analysis, setAnalysis] = useState<FlightAnalysisResult | null>(null)
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])

  // ไม่ต้อง update selectedAirlines จาก searchParams เพราะเราต้องการให้ user เลือกเอง

  useEffect(() => {
    if (searchParams) {
      // ถ้าไม่เลือกเลย ให้ใช้ทั้งหมด, ถ้าเลือกแล้วให้ใช้เฉพาะที่เลือก
      const airlinesToAnalyze = selectedAirlines.length === 0
        ? THAI_AIRLINES.map(a => a.value)
        : selectedAirlines
      
      if (airlinesToAnalyze.length > 0) {
        const result = analyzeFlightPrices(
          searchParams.origin,
          searchParams.destination,
          searchParams.durationRange,
          airlinesToAnalyze,
          searchParams.startDate,
          searchParams.endDate,
          searchParams.tripType,
          searchParams.passengerCount || 1
        )
          setAnalysis(result)
        
        // Save price statistics for future trend analysis
        savePriceStat({
          origin: searchParams.origin,
          destination: searchParams.destination,
          originName: searchParams.originName,
          destinationName: searchParams.destinationName,
          recommendedPrice: result.recommendedPeriod.price,
          season: result.recommendedPeriod.season,
          airline: result.recommendedPeriod.airline,
          timestamp: new Date().toISOString(),
        })
      } else {
        setAnalysis(null)
      }
    } else {
      setAnalysis(null)
    }
  }, [searchParams, selectedAirlines])

  if (!searchParams || !analysis) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{'เริ่มค้นหาเที่ยวบินของคุณ'}</h2>
          <p className="text-muted-foreground">
            {'กรอกข้อมูลด้านบนเพื่อดูการวิเคราะห์ราคาและคำแนะนำ'}
          </p>
        </div>
      </div>
    )
  }

  const { recommendedPeriod, priceComparison, seasons } = analysis
  
  const recommendedSeason = seasons.find(s => s.type === recommendedPeriod.season)

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          {'การวิเคราะห์ราคา - '}{searchParams.originName}{' → '}{searchParams.destinationName}
        </h2>
        <p className="text-muted-foreground">
          {'สำหรับการเดินทาง '}{searchParams.durationRange.min}{'-'}{searchParams.durationRange.max}{' วัน'}
          {selectedAirlines.length > 0 && (
            <span className="ml-2">
              {' (สายการบิน: '}
              {selectedAirlines.length}{' สายการบิน)'}
            </span>
          )}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-12"></div>

      {/* Seasonal Breakdown */}
      <div className="mb-12">
        <SeasonalBreakdown seasons={seasons} recommendedPeriod={recommendedPeriod} />
      </div>

      {/* Price Comparison - If Go Before/After */}
      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-4 mb-8">
        <Card className="p-6 border-2 border-orange-200 bg-orange-50/50">
          <div className="flex items-center gap-3 mb-4">
            <ArrowLeft className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-bold">{'ถ้าคุณไปก่อน'}</h3>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">{'วันที่: '}{priceComparison.ifGoBefore.date}</div>
            <div className="text-2xl font-bold text-orange-600">
              {'฿'}{priceComparison.ifGoBefore.price.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {'แพงกว่า '}
              <span className="font-semibold text-orange-600">
                {'฿'}{priceComparison.ifGoBefore.difference.toLocaleString()}
              </span>
              {' ('}{priceComparison.ifGoBefore.percentage}{'%)'}
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-blue-200 bg-blue-50/50">
          <div className="flex items-center gap-3 mb-4">
            <ArrowRight className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold">{'ถ้าคุณไปหลัง'}</h3>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">{'วันที่: '}{priceComparison.ifGoAfter.date}</div>
            <div className="text-2xl font-bold text-blue-600">
              {'฿'}{priceComparison.ifGoAfter.price.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {'แพงกว่า '}
              <span className="font-semibold text-blue-600">
                {'฿'}{priceComparison.ifGoAfter.difference.toLocaleString()}
              </span>
              {' ('}{priceComparison.ifGoAfter.percentage}{'%)'}
            </div>
          </div>
        </Card>
      </div>


      {/* Airline Flights */}
      <AirlineFlights 
        searchParams={searchParams} 
        selectedAirlines={selectedAirlines}
        onAirlinesChange={setSelectedAirlines}
      />

      {/* Price Trend Chart */}
      <div className="mt-4 w-full max-w-6xl mx-auto">
        <Card className="p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUpIcon className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold">{'กราฟแสดงภาพรวมแนวโน้มราคา (ตั๋วไป-กลับ)'}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {'กราฟแสดงราคาตั๋วเครื่องบินตามวันที่เริ่มเดินทาง เพื่อช่วยให้คุณเลือกช่วงเวลาที่เหมาะสม'}
          </p>
          <div className="w-full overflow-x-auto overflow-y-auto max-h-[500px]">
            <PriceChart data={analysis.priceChartData} tripType={searchParams.tripType} />
          </div>
        </Card>
      </div>
    </div>
  )
}
