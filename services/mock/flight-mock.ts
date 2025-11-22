// Mock flight data generator
// This file contains all mock data generation logic

import { getBasePrice } from './route-prices'
import { getSeasonConfig } from './season-config'
import { getBasePriceForRoute, airlineMap } from './airline-data'
import { calculatePricingFactors } from '../pricing-factors'
import { THAI_AIRLINES } from '../constants'
import { FlightAnalysisResult, SeasonData, PriceComparison } from '@/lib/flight-analysis'
import { parseBestDealDate, calculateReturnDate, formatThaiDateRange, getSeasonFromDate } from '@/lib/flight-utils'

/**
 * Mock data generator for flight prices
 * This function generates mock flight analysis data based on search parameters
 */
export function analyzeFlightPrices(
  origin: string,
  destination: string,
  durationRange: { min: number; max: number },
  selectedAirlines: string[],
  startDate?: Date,
  endDate?: Date,
  tripType?: 'one-way' | 'round-trip' | null,
  passengerCount: number = 1
): FlightAnalysisResult {
  // Generate mock data based on origin, destination and duration range
  const avgDuration = (durationRange.min + durationRange.max) / 2
  const basePrice = getBasePrice(origin, destination, avgDuration)
  
  // Calculate seasons based on destination and historical data
  const seasonConfig = getSeasonConfig(destination)
  
  // Helper function: คำนวณราคาจริงของแต่ละสายการบินและเลือกที่ถูกที่สุด
  const getCheapestAirlineForSeason = (
    origin: string,
    destination: string,
    selectedAirlines: string[],
    season: 'high' | 'normal' | 'low',
    seasonMultiplier: { min: number; max: number },
    travelDate?: Date,
    bookingDate?: Date
  ): { airline: string; price: number } => {
    const today = bookingDate || new Date()
    const targetDate = travelDate || new Date()

    if (selectedAirlines.length === 0) {
      let baseSeasonPrice = basePrice * (seasonMultiplier.min + seasonMultiplier.max) / 2
      if (travelDate) {
        const factors = calculatePricingFactors(today, travelDate)
        baseSeasonPrice *= factors.totalMultiplier
      }
      return { airline: 'Thai Airways', price: Math.round(baseSeasonPrice) }
    }

    // คำนวณราคาของแต่ละสายการบิน
    const airlinePrices = selectedAirlines.map(airlineKey => {
      const airlineName = airlineMap[airlineKey] || airlineKey
      const airlineBasePrice = getBasePriceForRoute(origin, destination, airlineKey)
      
      let seasonPrice: number
      if (season === 'low') {
        seasonPrice = airlineBasePrice * seasonMultiplier.min
      } else if (season === 'high') {
        seasonPrice = airlineBasePrice * seasonMultiplier.max
      } else {
        seasonPrice = airlineBasePrice * (seasonMultiplier.min + seasonMultiplier.max) / 2
      }

      if (travelDate) {
        const factors = calculatePricingFactors(today, travelDate)
        seasonPrice *= factors.totalMultiplier
      }

      return {
        airlineKey,
        airlineName,
        price: seasonPrice,
      }
    })

    const cheapest = airlinePrices.reduce((best, current) => 
      current.price < best.price ? current : best
    )

    return {
      airline: cheapest.airlineName,
      price: Math.round(cheapest.price),
    }
  }

  // คำนวณ "สายการบินที่ถูกที่สุด" จากทุกสายการบิน
  const allAirlines = THAI_AIRLINES.map(a => a.value)
  
  const seasons: SeasonData[] = [
    {
      type: 'low',
      months: seasonConfig.low.months,
      priceRange: {
        min: Math.round(basePrice * seasonConfig.low.priceMultiplier.min),
        max: Math.round(basePrice * seasonConfig.low.priceMultiplier.max),
      },
      bestDeal: (() => {
        const bestDealDate = startDate || parseBestDealDate(seasonConfig.low.bestDealDates)
        const cheapest = getCheapestAirlineForSeason(origin, destination, allAirlines, 'low', seasonConfig.low.priceMultiplier, bestDealDate, new Date())
        return {
          dates: seasonConfig.low.bestDealDates,
          price: cheapest.price,
          airline: cheapest.airline,
        }
      })(),
      description: 'ราคาถูกที่สุดของปี เหมาะสำหรับผู้ที่มีความยืดหยุ่นในการเดินทาง',
    },
    {
      type: 'normal',
      months: seasonConfig.normal.months,
      priceRange: {
        min: Math.round(basePrice * seasonConfig.normal.priceMultiplier.min),
        max: Math.round(basePrice * seasonConfig.normal.priceMultiplier.max),
      },
      bestDeal: (() => {
        const bestDealDate = startDate || parseBestDealDate(seasonConfig.normal.bestDealDates)
        const cheapest = getCheapestAirlineForSeason(origin, destination, allAirlines, 'normal', seasonConfig.normal.priceMultiplier, bestDealDate, new Date())
        return {
          dates: seasonConfig.normal.bestDealDates,
          price: cheapest.price,
          airline: cheapest.airline,
        }
      })(),
      description: 'ราคาปานกลาง อากาศดี เหมาะสำหรับการท่องเที่ยว',
    },
    {
      type: 'high',
      months: seasonConfig.high.months,
      priceRange: {
        min: Math.round(basePrice * seasonConfig.high.priceMultiplier.min),
        max: Math.round(basePrice * seasonConfig.high.priceMultiplier.max),
      },
      bestDeal: (() => {
        const bestDealDate = startDate || parseBestDealDate(seasonConfig.high.bestDealDates)
        const cheapest = getCheapestAirlineForSeason(origin, destination, allAirlines, 'high', seasonConfig.high.priceMultiplier, bestDealDate, new Date())
        return {
          dates: seasonConfig.high.bestDealDates,
          price: cheapest.price,
          airline: cheapest.airline,
        }
      })(),
      description: 'ช่วงเทศกาลและปิดเทอม ราคาสูงสุด แนะนำจองล่วงหน้า',
    },
  ]

  const bestDeal = seasons.reduce((best, season) => {
    return season.bestDeal.price < best.bestDeal.price ? season : best
  })

  // คำนวณวันที่ "ไปก่อน" และ "ไปหลัง"
  let recommendedStartDate: Date
  let recommendedEndDate: Date
  
  if (startDate) {
    recommendedStartDate = new Date(startDate)
    if (endDate && tripType === 'round-trip') {
      recommendedEndDate = new Date(endDate)
    } else {
      recommendedEndDate = new Date(startDate)
      recommendedEndDate.setDate(recommendedEndDate.getDate() + Math.round(avgDuration))
    }
  } else {
    recommendedStartDate = parseBestDealDate(bestDeal.bestDeal.dates)
    recommendedEndDate = new Date(recommendedStartDate)
    recommendedEndDate.setDate(recommendedEndDate.getDate() + Math.round(avgDuration))
  }
  
  // คำนวณราคาของวันที่ที่เลือกจริง
  const recommendedSeason = getSeasonFromDate(recommendedStartDate)
  const recommendedSeasonConfig = recommendedSeason === 'low' ? seasonConfig.low 
    : recommendedSeason === 'normal' ? seasonConfig.normal 
    : seasonConfig.high
  const recommendedCheapest = getCheapestAirlineForSeason(
    origin,
    destination,
    selectedAirlines,
    recommendedSeason,
    recommendedSeasonConfig.priceMultiplier,
    recommendedStartDate,
    new Date()
  )
  let baseRecommendedPrice = recommendedCheapest.price
  if (tripType === 'one-way') {
    baseRecommendedPrice = baseRecommendedPrice * 0.5
  }
  
  // คำนวณวันที่ "ไปก่อน" และ "ไปหลัง"
  const beforeStartDate = new Date(recommendedStartDate)
  beforeStartDate.setDate(beforeStartDate.getDate() - 7)
  const beforeEndDate = new Date(beforeStartDate)
  beforeEndDate.setDate(beforeEndDate.getDate() + Math.round(avgDuration))
  
  const afterStartDate = new Date(recommendedStartDate)
  afterStartDate.setDate(afterStartDate.getDate() + 7)
  const afterEndDate = new Date(afterStartDate)
  afterEndDate.setDate(afterEndDate.getDate() + Math.round(avgDuration))
  
  // คำนวณราคาสำหรับ "ไปก่อน" และ "ไปหลัง"
  const beforeSeason = getSeasonFromDate(beforeStartDate)
  const beforeSeasonConfig = beforeSeason === 'low' ? seasonConfig.low 
    : beforeSeason === 'normal' ? seasonConfig.normal 
    : seasonConfig.high
  const beforeCheapest = getCheapestAirlineForSeason(
    origin,
    destination,
    selectedAirlines,
    beforeSeason,
    beforeSeasonConfig.priceMultiplier,
    beforeStartDate,
    new Date()
  )
  let beforePrice = beforeCheapest.price
  if (tripType === 'one-way') {
    beforePrice = beforePrice * 0.5
  }
  
  const afterSeason = getSeasonFromDate(afterStartDate)
  const afterSeasonConfig = afterSeason === 'low' ? seasonConfig.low 
    : afterSeason === 'normal' ? seasonConfig.normal 
    : seasonConfig.high
  const afterCheapest = getCheapestAirlineForSeason(
    origin,
    destination,
    selectedAirlines,
    afterSeason,
    afterSeasonConfig.priceMultiplier,
    afterStartDate,
    new Date()
  )
  let afterPrice = afterCheapest.price
  if (tripType === 'one-way') {
    afterPrice = afterPrice * 0.5
  }
  
  const beforeDifference = beforePrice - baseRecommendedPrice
  const beforePercentage = Math.round((beforeDifference / baseRecommendedPrice) * 100)
  
  const afterDifference = afterPrice - baseRecommendedPrice
  const afterPercentage = Math.round((afterDifference / baseRecommendedPrice) * 100)
  
  const priceComparison: PriceComparison = {
    ifGoBefore: {
      date: formatThaiDateRange(beforeStartDate, beforeEndDate, tripType),
      price: Math.round(beforePrice * passengerCount),
      difference: Math.round(beforeDifference * passengerCount),
      percentage: beforePercentage,
    },
    ifGoAfter: {
      date: formatThaiDateRange(afterStartDate, afterEndDate, tripType),
      price: Math.round(afterPrice * passengerCount),
      difference: Math.round(afterDifference * passengerCount),
      percentage: afterPercentage,
    },
  }

  const priceChartData = generateChartData(basePrice, durationRange, selectedAirlines, startDate, endDate, tripType)

  const datesMatch = bestDeal.bestDeal.dates.match(/(\d+)-(\d+)\s+(.+)/)
  const startDateStr = datesMatch ? `${datesMatch[1]} ${datesMatch[3]}` : bestDeal.bestDeal.dates.split('-')[0]
  const endDateStr = datesMatch ? `${datesMatch[2]} ${datesMatch[3]}` : bestDeal.bestDeal.dates.split('-')[1] || bestDeal.bestDeal.dates
  
  let returnDateStr: string
  if (endDate) {
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
    returnDateStr = `${endDate.getDate()} ${thaiMonths[endDate.getMonth()]} ${endDate.getFullYear()}`
  } else {
    const durationToUse = avgDuration
    returnDateStr = calculateReturnDate(startDateStr, durationToUse)
  }

  const baseHighSeasonPrice = seasons.find(s => s.type === 'high')!.bestDeal.price

  return {
    recommendedPeriod: {
      startDate: startDateStr,
      endDate: endDateStr,
      returnDate: returnDateStr,
      price: Math.round(baseRecommendedPrice * passengerCount),
      airline: bestDeal.bestDeal.airline,
      season: bestDeal.type,
      savings: Math.round((baseHighSeasonPrice - baseRecommendedPrice) * passengerCount),
    },
    seasons: seasons.map(season => ({
      ...season,
      priceRange: {
        min: Math.round(season.priceRange.min * passengerCount),
        max: Math.round(season.priceRange.max * passengerCount),
      },
      bestDeal: {
        ...season.bestDeal,
        price: Math.round(season.bestDeal.price * passengerCount),
      },
    })),
    priceComparison,
    priceChartData: priceChartData.map(data => ({
      ...data,
      price: Math.round(data.price * passengerCount),
    })),
  }
}

/**
 * Generate chart data for price trend visualization
 */
function generateChartData(
  basePrice: number,
  durationRange: { min: number; max: number },
  selectedAirlines: string[],
  userStartDate?: Date,
  userEndDate?: Date,
  tripType?: 'one-way' | 'round-trip' | null
): Array<{
  startDate: string
  returnDate: string
  price: number
  season: 'high' | 'normal' | 'low'
  duration?: number
}> {
  const months = [
    { abbr: 'ม.ค.', name: 'มกราคม', season: 'high' as const },
    { abbr: 'ก.พ.', name: 'กุมภาพันธ์', season: 'high' as const },
    { abbr: 'มี.ค.', name: 'มีนาคม', season: 'normal' as const },
    { abbr: 'เม.ย.', name: 'เมษายน', season: 'normal' as const },
    { abbr: 'พ.ค.', name: 'พฤษภาคม', season: 'low' as const },
    { abbr: 'มิ.ย.', name: 'มิถุนายน', season: 'low' as const },
    { abbr: 'ก.ค.', name: 'กรกฎาคม', season: 'low' as const },
    { abbr: 'ส.ค.', name: 'สิงหาคม', season: 'low' as const },
    { abbr: 'ก.ย.', name: 'กันยายน', season: 'low' as const },
    { abbr: 'ต.ค.', name: 'ตุลาคม', season: 'low' as const },
    { abbr: 'พ.ย.', name: 'พฤศจิกายน', season: 'high' as const },
    { abbr: 'ธ.ค.', name: 'ธันวาคม', season: 'high' as const },
  ]

  const getSeasonFromDateLocal = (date: Date): 'high' | 'normal' | 'low' => {
    const month = date.getMonth()
    const monthData = months[month]
    return monthData ? monthData.season : 'normal'
  }

  const formatThaiDate = (date: Date): string => {
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    return `${date.getDate()} ${thaiMonths[date.getMonth()]}`
  }

  const getPriceMultiplier = (season: 'high' | 'normal' | 'low'): number => {
    if (season === 'low') return 0.75
    if (season === 'normal') return 1.0
    return 1.3
  }

  const calculatePriceWithFactors = (
    basePrice: number,
    seasonMultiplier: number,
    travelDate: Date,
    tripType: 'one-way' | 'round-trip' | null
  ): number => {
    const today = new Date()
    const factors = calculatePricingFactors(today, travelDate)
    
    let price = basePrice * seasonMultiplier * factors.totalMultiplier
    
    if (tripType === 'one-way') {
      price = price * 0.5
    }
    
    return Math.round(price)
  }

  const data: Array<{ startDate: string; returnDate: string; price: number; season: 'high' | 'normal' | 'low'; duration?: number }> = []
  
  let durationToUse: number
  if (userStartDate && userEndDate) {
    const diffTime = Math.abs(userEndDate.getTime() - userStartDate.getTime())
    durationToUse = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  } else {
    durationToUse = (durationRange.min + durationRange.max) / 2
  }

  if (userStartDate) {
    let chartStartDate: Date
    let chartEndDate: Date
    
    if (userEndDate) {
      chartStartDate = new Date(userStartDate)
      chartEndDate = new Date(userEndDate)
    } else {
      chartStartDate = new Date(userStartDate)
      chartStartDate.setDate(chartStartDate.getDate() - 30)
      chartEndDate = new Date(userStartDate)
      chartEndDate.setDate(chartEndDate.getDate() + 30)
    }
    
    const currentDate = new Date(chartStartDate)
    const endDate = new Date(chartEndDate)
    const stepDays = 3
    
    while (currentDate <= endDate) {
      const season = getSeasonFromDateLocal(currentDate)
      const priceMultiplier = getPriceMultiplier(season)
      
      let returnDate: Date | null = null
      if (tripType === 'round-trip' && userEndDate) {
        returnDate = new Date(currentDate)
        returnDate.setDate(returnDate.getDate() + Math.round(durationToUse))
      }

      const calculatedPrice = calculatePriceWithFactors(basePrice, priceMultiplier, currentDate, tripType || null)
      
      const duration = tripType === 'round-trip' && returnDate 
        ? Math.round(durationToUse)
        : 0
      
      data.push({
        startDate: formatThaiDate(currentDate),
        returnDate: tripType === 'one-way' || !returnDate ? '' : formatThaiDate(returnDate),
        price: calculatedPrice,
        season,
        duration,
      })

      currentDate.setDate(currentDate.getDate() + stepDays)
    }
  } else {
    months.forEach((month) => {
      let priceMultiplier = 1
      if (month.season === 'low') priceMultiplier = 0.75
      else if (month.season === 'normal') priceMultiplier = 1.0
      else priceMultiplier = 1.3

      const currentYear = new Date().getFullYear()
      const monthIndex = months.findIndex(m => m.abbr === month.abbr)
      
      const startDate1Obj = new Date(currentYear, monthIndex, 1)
      const startDate2Obj = new Date(currentYear, monthIndex, 15)
      
      const returnDate1Obj = new Date(startDate1Obj)
      returnDate1Obj.setDate(returnDate1Obj.getDate() + Math.round(durationToUse))
      
      const returnDate2Obj = new Date(startDate2Obj)
      returnDate2Obj.setDate(returnDate2Obj.getDate() + Math.round(durationToUse))
      
      const startDate1 = formatThaiDate(startDate1Obj)
      const startDate2 = formatThaiDate(startDate2Obj)
      const returnDate1 = formatThaiDate(returnDate1Obj)
      const returnDate2 = formatThaiDate(returnDate2Obj)

      const calculatedPrice1 = calculatePriceWithFactors(basePrice, priceMultiplier, startDate1Obj, tripType || null)
      const calculatedPrice2 = calculatePriceWithFactors(basePrice, priceMultiplier, startDate2Obj, tripType || null)
      
      const duration = tripType === 'round-trip' ? Math.round(durationToUse) : 0
      
      data.push({
        startDate: startDate1,
        returnDate: tripType === 'one-way' ? '' : returnDate1,
        price: calculatedPrice1,
        season: month.season,
        duration,
      })
      data.push({
        startDate: startDate2,
        returnDate: tripType === 'one-way' ? '' : returnDate2,
        price: calculatedPrice2,
        season: month.season,
        duration,
      })
    })
  }

  return data
}

