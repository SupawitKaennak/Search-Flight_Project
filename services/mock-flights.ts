/**
 * Mock flight data generation
 * Generate mock flight data for each airline
 */

import { airlineMap, getBasePriceForRoute } from './airline-data'

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
  
  // Generate 3-5 flights per airline
  const flightCount = 3 + Math.floor(Math.random() * 3)
  const flights: Flight[] = []
  
  const dates = startDate ? [startDate] : [
    new Date(2025, 4, 15), // May 15
    new Date(2025, 4, 20), // May 20
    new Date(2025, 5, 1),  // June 1
  ]
  
  for (let i = 0; i < flightCount; i++) {
    const date = dates[i % dates.length]
    const dateStr = date.toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
    
    // Generate random times
    const departureHour = 6 + Math.floor(Math.random() * 16) // 6 AM - 10 PM
    const departureMinute = Math.floor(Math.random() * 4) * 15 // 0, 15, 30, 45
    const durationHours = 1 + Math.floor(Math.random() * 2) // 1-2 hours for domestic
    const durationMinutes = Math.floor(Math.random() * 4) * 15
    
    const arrivalHour = departureHour + durationHours
    const arrivalMinute = departureMinute + durationMinutes
    
    flights.push({
      airline: airlineName,
      flightNumber: `${airline.substring(0, 2).toUpperCase()}${100 + i}${Math.floor(Math.random() * 10)}`,
      departureTime: `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`,
      arrivalTime: `${(arrivalHour % 24).toString().padStart(2, '0')}:${(arrivalMinute % 60).toString().padStart(2, '0')}`,
      duration: `${durationHours}h ${durationMinutes}m`,
      price: Math.round(basePrice * (0.9 + Math.random() * 0.2)), // ±10% variation
      date: dateStr,
    })
  }
  
  return flights.sort((a, b) => a.price - b.price) // Sort by price
}

