// Flight price analysis utilities

import { getBasePrice } from '@/services/route-prices'
import { getSeasonConfig } from '@/services/season-config'
import { getBestAirline } from '@/services/airline-data'

export interface SeasonData {
  type: 'high' | 'normal' | 'low'
  months: string[]
  priceRange: { min: number; max: number }
  bestDeal: {
    dates: string
    price: number
    airline: string
  }
  description: string
}

export interface PriceComparison {
  ifGoBefore: {
    date: string
    price: number
    difference: number
    percentage: number
  }
  ifGoAfter: {
    date: string
    price: number
    difference: number
    percentage: number
  }
}

export interface FlightAnalysisResult {
  recommendedPeriod: {
    startDate: string
    endDate: string
    returnDate: string
    price: number
    airline: string
    season: 'high' | 'normal' | 'low'
    savings: number
  }
  seasons: SeasonData[]
  priceComparison: PriceComparison
  priceChartData: Array<{
    startDate: string
    returnDate: string
    price: number
    season: 'high' | 'normal' | 'low'
  }>
}

// Mock data generator - ในอนาคตจะเชื่อมต่อกับ Google Flights API
export function analyzeFlightPrices(
  origin: string,
  destination: string,
  durationRange: { min: number; max: number },
  selectedAirlines: string[],
  startDate?: Date,
  endDate?: Date
): FlightAnalysisResult {
  // Generate mock data based on origin, destination and duration range
  const avgDuration = (durationRange.min + durationRange.max) / 2
  const basePrice = getBasePrice(origin, destination, avgDuration)
  
  // Calculate seasons based on destination and historical data
  // วิธีคำนวณ: ใช้ข้อมูลราคาตามประเทศปลายทางและช่วงเวลา
  const seasonConfig = getSeasonConfig(destination)
  
  const seasons: SeasonData[] = [
    {
      type: 'low',
      months: seasonConfig.low.months,
      priceRange: {
        min: Math.round(basePrice * seasonConfig.low.priceMultiplier.min),
        max: Math.round(basePrice * seasonConfig.low.priceMultiplier.max),
      },
      bestDeal: {
        dates: seasonConfig.low.bestDealDates,
        // ใช้ราคาเฉลี่ยของช่วง (ไม่ใช่ min) เพื่อให้สมดุลกับ season อื่น
        price: Math.round(basePrice * (seasonConfig.low.priceMultiplier.min + seasonConfig.low.priceMultiplier.max) / 2),
        airline: getBestAirline(destination, selectedAirlines, 'low'),
      },
      description: 'ราคาถูกที่สุดของปี เหมาะสำหรับผู้ที่มีความยืดหยุ่นในการเดินทาง',
    },
    {
      type: 'normal',
      months: seasonConfig.normal.months,
      priceRange: {
        min: Math.round(basePrice * seasonConfig.normal.priceMultiplier.min),
        max: Math.round(basePrice * seasonConfig.normal.priceMultiplier.max),
      },
      bestDeal: {
        dates: seasonConfig.normal.bestDealDates,
        // ใช้ราคาใกล้ min (แต่ไม่ใช่ min) เพื่อให้มีโอกาสชนะ Low Season
        price: Math.round(basePrice * (seasonConfig.normal.priceMultiplier.min * 0.9 + seasonConfig.normal.priceMultiplier.max * 0.1)),
        airline: getBestAirline(destination, selectedAirlines, 'normal'),
      },
      description: 'ราคาปานกลาง อากาศดี เหมาะสำหรับการท่องเที่ยว',
    },
    {
      type: 'high',
      months: seasonConfig.high.months,
      priceRange: {
        min: Math.round(basePrice * seasonConfig.high.priceMultiplier.min),
        max: Math.round(basePrice * seasonConfig.high.priceMultiplier.max),
      },
      bestDeal: {
        dates: seasonConfig.high.bestDealDates,
        // ใช้ราคาใกล้ min เพื่อให้มีโอกาสชนะเมื่อราคาไม่ต่างกันมาก
        price: Math.round(basePrice * (seasonConfig.high.priceMultiplier.min * 0.95 + seasonConfig.high.priceMultiplier.max * 0.05)),
        airline: getBestAirline(destination, selectedAirlines, 'high'),
      },
      description: 'ช่วงเทศกาลและปิดเทอม ราคาสูงสุด แนะนำจองล่วงหน้า',
    },
  ]

  // Find best deal - เลือกตามราคาต่ำสุดจริงๆ (เพราะ label เป็น "ราคาถูกที่สุด")
  const bestDeal = seasons.reduce((best, season) => {
    // เลือกตามราคาต่ำสุดจริงๆ (ราคาถูกที่สุด)
    return season.bestDeal.price < best.bestDeal.price ? season : best
  })

  // Generate price comparison
  const recommendedPrice = bestDeal.bestDeal.price
  const beforePrice = recommendedPrice * 1.15
  const afterPrice = recommendedPrice * 1.2

  const priceComparison: PriceComparison = {
    ifGoBefore: {
      date: '1-8 พฤษภาคม 2025',
      price: Math.round(beforePrice),
      difference: Math.round(beforePrice - recommendedPrice),
      percentage: 15,
    },
    ifGoAfter: {
      date: '23-30 พฤษภาคม 2025',
      price: Math.round(afterPrice),
      difference: Math.round(afterPrice - recommendedPrice),
      percentage: 20,
    },
  }

  // Generate chart data - แกน X คือวันที่เริ่มเดินทาง
  // วันกลับจะคำนวณตามช่วงวันที่ที่ผู้ใช้ระบุ
  const priceChartData = generateChartData(basePrice, durationRange, selectedAirlines, startDate, endDate)

  // Always use bestDeal dates (Low Season dates) for recommendation
  // This shows the recommended period, not the user's selected dates
  const datesMatch = bestDeal.bestDeal.dates.match(/(\d+)-(\d+)\s+(.+)/)
  const startDateStr = datesMatch ? `${datesMatch[1]} ${datesMatch[3]}` : bestDeal.bestDeal.dates.split('-')[0]
  const endDateStr = datesMatch ? `${datesMatch[2]} ${datesMatch[3]}` : bestDeal.bestDeal.dates.split('-')[1] || bestDeal.bestDeal.dates
  
  // Use user's selected return date (endDate) if available, otherwise calculate from bestDeal dates
  let returnDateStr: string
  if (endDate) {
    // Use actual return date from user's calendar selection
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
    returnDateStr = `${endDate.getDate()} ${thaiMonths[endDate.getMonth()]} ${endDate.getFullYear()}`
  } else {
    // Fallback: Calculate return date based on duration range
    const durationToUse = avgDuration
    returnDateStr = calculateReturnDate(startDateStr, durationToUse)
  }

  return {
    recommendedPeriod: {
      startDate: startDateStr,
      endDate: endDateStr,
      returnDate: returnDateStr,
      price: Math.round(bestDeal.bestDeal.price),
      airline: bestDeal.bestDeal.airline,
      season: bestDeal.type,
      savings: Math.round(seasons.find(s => s.type === 'high')!.bestDeal.price - bestDeal.bestDeal.price),
    },
    seasons,
    priceComparison,
    priceChartData,
  }
}


function calculateReturnDate(startDate: string, duration: number): string {
  // Parse Thai date string format: "15 พฤษภาคม 2025"
  const monthNames: Record<string, number> = {
    'มกราคม': 0, 'กุมภาพันธ์': 1, 'มีนาคม': 2,
    'เมษายน': 3, 'พฤษภาคม': 4, 'มิถุนายน': 5,
    'กรกฎาคม': 6, 'สิงหาคม': 7, 'กันยายน': 8,
    'ตุลาคม': 9, 'พฤศจิกายน': 10, 'ธันวาคม': 11,
  }
  
  const match = startDate.match(/(\d+)\s+(.+?)\s+(\d+)/)
  if (match) {
    const day = parseInt(match[1])
    const month = monthNames[match[2]] ?? 0
    const year = parseInt(match[3])
    const date = new Date(year, month, day)
    
    // Add duration days using proper date calculation
    date.setDate(date.getDate() + Math.round(duration))
    
    // Format back to Thai date string
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
    
    return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear()}`
  }
  
  return startDate
}


function generateChartData(
  basePrice: number,
  durationRange: { min: number; max: number },
  selectedAirlines: string[],
  userStartDate?: Date,
  userEndDate?: Date
): Array<{
  startDate: string
  returnDate: string
  price: number
  season: 'high' | 'normal' | 'low'
}> {
  const months = [
    { abbr: 'ม.ค.', name: 'มกราคม', season: 'high' as const },
    { abbr: 'ก.พ.', name: 'กุมภาพันธ์', season: 'normal' as const },
    { abbr: 'มี.ค.', name: 'มีนาคม', season: 'normal' as const },
    { abbr: 'เม.ย.', name: 'เมษายน', season: 'low' as const },
    { abbr: 'พ.ค.', name: 'พฤษภาคม', season: 'low' as const },
    { abbr: 'มิ.ย.', name: 'มิถุนายน', season: 'low' as const },
    { abbr: 'ก.ค.', name: 'กรกฎาคม', season: 'high' as const },
    { abbr: 'ส.ค.', name: 'สิงหาคม', season: 'high' as const },
    { abbr: 'ก.ย.', name: 'กันยายน', season: 'normal' as const },
    { abbr: 'ต.ค.', name: 'ตุลาคม', season: 'normal' as const },
    { abbr: 'พ.ย.', name: 'พฤศจิกายน', season: 'high' as const },
    { abbr: 'ธ.ค.', name: 'ธันวาคม', season: 'high' as const },
  ]

  // Helper function to get season from month
  const getSeasonFromDate = (date: Date): 'high' | 'normal' | 'low' => {
    const month = date.getMonth()
    const monthData = months[month]
    return monthData ? monthData.season : 'normal'
  }

  // Helper function to format date to Thai format with abbreviation
  const formatThaiDate = (date: Date): string => {
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    return `${date.getDate()} ${thaiMonths[date.getMonth()]}`
  }

  // Helper function to get price multiplier based on season
  const getPriceMultiplier = (season: 'high' | 'normal' | 'low'): number => {
    if (season === 'low') return 0.7 + Math.random() * 0.15
    if (season === 'normal') return 0.85 + Math.random() * 0.25
    return 1.1 + Math.random() * 0.4
  }

  const data: Array<{ startDate: string; returnDate: string; price: number; season: 'high' | 'normal' | 'low' }> = []
  
  // คำนวณ duration จากช่วงวันที่ที่ผู้ใช้ระบุ (ถ้ามี)
  let durationToUse: number
  if (userStartDate && userEndDate) {
    // ใช้ช่วงวันที่ที่ผู้ใช้ระบุ
    const diffTime = Math.abs(userEndDate.getTime() - userStartDate.getTime())
    durationToUse = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  } else {
    // ใช้ค่าเฉลี่ยของ durationRange
    durationToUse = (durationRange.min + durationRange.max) / 2
  }

  // ถ้ามี userStartDate และ userEndDate ให้สร้างข้อมูลเฉพาะช่วงวันที่ที่เลือก
  if (userStartDate && userEndDate) {
    // ใช้ช่วงวันที่ที่ผู้ใช้เลือกโดยตรง (userStartDate ถึง userEndDate)
    // durationToUse คำนวณจาก userEndDate - userStartDate แล้ว
    // ซึ่งคือระยะเวลาที่ผู้ใช้เลือกไว้ (ช่วงไป ถึง ช่วงกลับ)
    
    // สร้างข้อมูลทุก 3 วัน ภายในช่วงวันที่ที่เลือก
    const currentDate = new Date(userStartDate)
    const endDate = new Date(userEndDate)
    const stepDays = 3 // ทุก 3 วัน
    
    while (currentDate <= endDate) {
      const season = getSeasonFromDate(currentDate)
      const priceMultiplier = getPriceMultiplier(season)
      
      // คำนวณวันกลับ: ใช้ durationToUse ที่คำนวณจากช่วงวันที่ที่ผู้ใช้เลือก
      // durationToUse = userEndDate - userStartDate (ระยะเวลาระหว่างช่วงไปและช่วงกลับ)
      const returnDate = new Date(currentDate)
      returnDate.setDate(returnDate.getDate() + Math.round(durationToUse))

      data.push({
        startDate: formatThaiDate(currentDate),
        returnDate: formatThaiDate(returnDate),
        price: Math.round(basePrice * priceMultiplier),
        season,
      })

      // เพิ่ม 3 วัน
      currentDate.setDate(currentDate.getDate() + stepDays)
    }
  } else {
    // ถ้าไม่มี userStartDate และ userEndDate ใช้วิธีเดิม (วันที่ 1 และ 15 ของทุกเดือน)
    months.forEach((month) => {
      let priceMultiplier = 1
      if (month.season === 'low') priceMultiplier = 0.7 + Math.random() * 0.15
      else if (month.season === 'normal') priceMultiplier = 0.85 + Math.random() * 0.25
      else priceMultiplier = 1.1 + Math.random() * 0.4

      // Add data points for 1st and 15th of each month (วันที่เริ่มเดินทาง)
      // สร้าง Date objects สำหรับวันที่เริ่มเดินทาง
      const currentYear = new Date().getFullYear()
      const monthIndex = months.findIndex(m => m.abbr === month.abbr)
      
      const startDate1Obj = new Date(currentYear, monthIndex, 1)
      const startDate2Obj = new Date(currentYear, monthIndex, 15)
      
      // คำนวณวันกลับตามช่วงวันที่ที่ผู้ใช้ระบุ
      const returnDate1Obj = new Date(startDate1Obj)
      returnDate1Obj.setDate(returnDate1Obj.getDate() + Math.round(durationToUse))
      
      const returnDate2Obj = new Date(startDate2Obj)
      returnDate2Obj.setDate(returnDate2Obj.getDate() + Math.round(durationToUse))
      
      const startDate1 = formatThaiDate(startDate1Obj)
      const startDate2 = formatThaiDate(startDate2Obj)
      const returnDate1 = formatThaiDate(returnDate1Obj)
      const returnDate2 = formatThaiDate(returnDate2Obj)

      data.push({
        startDate: startDate1,
        returnDate: returnDate1,
        price: Math.round(basePrice * priceMultiplier),
        season: month.season,
      })
      data.push({
        startDate: startDate2,
        returnDate: returnDate2,
        price: Math.round(basePrice * (priceMultiplier + (Math.random() * 0.1 - 0.05))),
        season: month.season,
      })
    })
  }

  return data
}


/**
 * วิธีคำนวณที่ดีกว่า (สำหรับอนาคตเมื่อมีข้อมูลจริง):
 * 
 * 1. ใช้ข้อมูลราคาจริงจาก API:
 *    - รวบรวมราคาตลอดทั้งปี (12 เดือน)
 *    - คำนวณค่าเฉลี่ย, median, percentile
 * 
 * 2. แบ่งตาม Percentile:
 *    - Low Season: ราคาต่ำกว่า 33rd percentile
 *    - Normal Season: ราคาระหว่าง 33rd-66th percentile  
 *    - High Season: ราคาสูงกว่า 66th percentile
 * 
 * 3. คำนวณตาม Standard Deviation:
 *    - Low: ราคา < mean - 0.5*std
 *    - Normal: mean - 0.5*std <= ราคา <= mean + 0.5*std
 *    - High: ราคา > mean + 0.5*std
 * 
 * 4. ปรับตามปัจจัยอื่น:
 *    - เทศกาลของประเทศปลายทาง
 *    - ฤดูกาลท่องเที่ยว
 *    - วันหยุดยาว
 *    - ปิดเทอม
 * 
 * ตัวอย่างโค้ด:
 * 
 * function calculateSeasonsFromRealData(prices: number[]): SeasonData[] {
 *   const sorted = [...prices].sort((a, b) => a - b)
 *   const p33 = sorted[Math.floor(sorted.length * 0.33)]
 *   const p66 = sorted[Math.floor(sorted.length * 0.66)]
 *   
 *   const mean = prices.reduce((a, b) => a + b) / prices.length
 *   const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length
 *   const stdDev = Math.sqrt(variance)
 *   
 *   return {
 *     low: { threshold: p33, multiplier: mean - 0.5 * stdDev },
 *     normal: { threshold: p66, multiplier: mean },
 *     high: { threshold: Infinity, multiplier: mean + 0.5 * stdDev },
 *   }
 * }
 */

