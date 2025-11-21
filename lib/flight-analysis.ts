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
    duration?: number
  }>
}

// Mock data generator - ในอนาคตจะเชื่อมต่อกับ Google Flights API
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

  // Generate price comparison (ราคา base ก่อนคูณ passengerCount)
  const baseRecommendedPrice = bestDeal.bestDeal.price
  const baseBeforePrice = baseRecommendedPrice * 1.15
  const baseAfterPrice = baseRecommendedPrice * 1.2

  const priceComparison: PriceComparison = {
    ifGoBefore: {
      date: '1-8 พฤษภาคม 2025',
      price: Math.round(baseBeforePrice * passengerCount),
      difference: Math.round((baseBeforePrice - baseRecommendedPrice) * passengerCount),
      percentage: 15,
    },
    ifGoAfter: {
      date: '23-30 พฤษภาคม 2025',
      price: Math.round(baseAfterPrice * passengerCount),
      difference: Math.round((baseAfterPrice - baseRecommendedPrice) * passengerCount),
      percentage: 20,
    },
  }

  // Generate chart data - แกน X คือวันที่เริ่มเดินทาง
  // วันกลับจะคำนวณตามช่วงวันที่ที่ผู้ใช้ระบุ
  // หมายเหตุ: ราคาใน priceChartData จะถูกคูณด้วย passengerCount ใน return statement
  const priceChartData = generateChartData(basePrice, durationRange, selectedAirlines, startDate, endDate, tripType)

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

  // คำนวณราคาตามจำนวนผู้โดยสาร (ใช้ baseRecommendedPrice ที่ define ไว้แล้ว)
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
  userEndDate?: Date,
  tripType?: 'one-way' | 'round-trip' | null
): Array<{
  startDate: string
  returnDate: string
  price: number
  season: 'high' | 'normal' | 'low'
}> {
  // Season mapping ตามข้อมูลจริงของประเทศไทย:
  // Low Season: พฤษภาคม-ตุลาคม (ฤดูฝน)
  // High Season: พฤศจิกายน-เมษายน (อากาศเย็น-แห้ง, วันหยุดสำคัญ)
  // Normal Season: มีนาคม-เมษายน (ช่วงกลาง/Shoulder Season)
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

  // ถ้ามี userStartDate ให้สร้างข้อมูลรอบๆ วันที่ที่เลือก
  if (userStartDate) {
    let chartStartDate: Date
    let chartEndDate: Date
    
    if (userEndDate) {
      // Round-trip: ใช้ช่วงวันที่ที่ผู้ใช้เลือก (userStartDate ถึง userEndDate)
      chartStartDate = new Date(userStartDate)
      chartEndDate = new Date(userEndDate)
    } else {
      // One-way: สร้างข้อมูล ±30 วันรอบวันที่ที่เลือก
      chartStartDate = new Date(userStartDate)
      chartStartDate.setDate(chartStartDate.getDate() - 30)
      chartEndDate = new Date(userStartDate)
      chartEndDate.setDate(chartEndDate.getDate() + 30)
    }
    
    // สร้างข้อมูลทุก 3 วัน ภายในช่วงวันที่ที่เลือก
    const currentDate = new Date(chartStartDate)
    const endDate = new Date(chartEndDate)
    const stepDays = 3 // ทุก 3 วัน
    
    while (currentDate <= endDate) {
      const season = getSeasonFromDate(currentDate)
      const priceMultiplier = getPriceMultiplier(season)
      
      // คำนวณวันกลับ: สำหรับ round-trip ใช้ durationToUse, สำหรับ one-way ไม่มีวันกลับ
      let returnDate: Date | null = null
      if (tripType === 'round-trip' && userEndDate) {
        // durationToUse = userEndDate - userStartDate (ระยะเวลาระหว่างช่วงไปและช่วงกลับ)
        returnDate = new Date(currentDate)
        returnDate.setDate(returnDate.getDate() + Math.round(durationToUse))
      }

      // สำหรับ one-way: ราคาเที่ยวเดียว = ราคาไป-กลับ / 2
      // สำหรับ round-trip: ราคาไป-กลับเต็ม
      const calculatedPrice = tripType === 'one-way' 
        ? Math.round(basePrice * priceMultiplier * 0.5)
        : Math.round(basePrice * priceMultiplier)
      
      // เก็บ duration สำหรับ round-trip เพื่อใช้ใน tooltip
      const duration = tripType === 'round-trip' && returnDate 
        ? Math.round(durationToUse)
        : 0
      
      data.push({
        startDate: formatThaiDate(currentDate),
        returnDate: tripType === 'one-way' || !returnDate ? '' : formatThaiDate(returnDate),
        price: calculatedPrice,
        season,
        duration, // เพิ่ม duration สำหรับใช้ใน tooltip
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

      // สำหรับ one-way: ราคาเที่ยวเดียว = ราคาไป-กลับ / 2
      // สำหรับ round-trip: ราคาไป-กลับเต็ม
      const calculatedPrice1 = tripType === 'one-way' 
        ? Math.round(basePrice * priceMultiplier * 0.5)
        : Math.round(basePrice * priceMultiplier)
      const calculatedPrice2 = tripType === 'one-way' 
        ? Math.round(basePrice * (priceMultiplier + (Math.random() * 0.1 - 0.05)) * 0.5)
        : Math.round(basePrice * (priceMultiplier + (Math.random() * 0.1 - 0.05)))
      
      // เก็บ duration สำหรับ round-trip
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

