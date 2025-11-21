/**
 * Mock flight data generation
 * Generate mock flight data for each airline
 */

import { airlineMap, getBasePriceForRoute } from './airline-data'
import { calculatePricingFactors } from './pricing-factors'

export interface Flight {
  airline: string
  flightNumber: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  date: string
}

/**
 * Generate mock flight data for each airline
 */
export function generateFlightsForAirline(
  airline: string,
  origin: string,
  destination: string,
  startDate?: Date,
  endDate?: Date
): Flight[] {
  const airlineName = airlineMap[airline] || airline
  const basePrice = getBasePriceForRoute(origin, destination, airline)
  
  // Generate fixed number of flights per airline (4 flights) for testing
  const flightCount = 4
  const flights: Flight[] = []
  
  const dates = startDate ? [startDate] : [
    new Date(2025, 4, 15), // May 15
    new Date(2025, 4, 20), // May 20
    new Date(2025, 5, 1),  // June 1
    new Date(2025, 5, 10), // June 10
  ]
  
  // Fixed times for testing: 08:00, 12:00, 16:00, 20:00
  const fixedTimes = [
    { hour: 8, minute: 0, durationHours: 1, durationMinutes: 30 },
    { hour: 12, minute: 0, durationHours: 2, durationMinutes: 0 },
    { hour: 16, minute: 0, durationHours: 1, durationMinutes: 45 },
    { hour: 20, minute: 0, durationHours: 2, durationMinutes: 15 },
  ]
  
  for (let i = 0; i < flightCount; i++) {
    const date = dates[i % dates.length]
    const dateStr = date.toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
    
    // ใช้เวลาคงที่แทนการสุ่ม
    const time = fixedTimes[i % fixedTimes.length]
    const departureHour = time.hour
    const departureMinute = time.minute
    const durationHours = time.durationHours
    const durationMinutes = time.durationMinutes
    
    const arrivalHour = departureHour + durationHours
    const arrivalMinute = departureMinute + durationMinutes
    
    // คำนวณราคาโดยใช้ pricing factors (เทศกาล, วันในสัปดาห์, การจองล่วงหน้า)
    const today = new Date()
    const factors = calculatePricingFactors(today, date)
    const finalPrice = Math.round(basePrice * factors.totalMultiplier)

    flights.push({
      airline: airlineName,
      flightNumber: `${airline.substring(0, 2).toUpperCase()}${100 + i}0`, // Fixed flight number
      departureTime: `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`,
      arrivalTime: `${(arrivalHour % 24).toString().padStart(2, '0')}:${(arrivalMinute % 60).toString().padStart(2, '0')}`,
      duration: `${durationHours}h ${durationMinutes}m`,
      price: finalPrice, // ใช้ราคาที่คำนวณจาก pricing factors
      date: dateStr,
    })
  }
  
  return flights.sort((a, b) => a.price - b.price) // Sort by price
}

