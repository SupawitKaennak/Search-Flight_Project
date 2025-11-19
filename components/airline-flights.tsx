'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plane, Clock, Calendar } from 'lucide-react'
import { FlightSearchParams } from '@/components/flight-search-form'

interface Flight {
  airline: string
  flightNumber: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  date: string
}

interface AirlineFlightsProps {
  searchParams: FlightSearchParams
  selectedAirlines: string[]
}

// Map airline values to display names
const airlineMap: Record<string, string> = {
  'thai-airways': 'Thai Airways',
  'thai-airasia': 'Thai AirAsia',
  'thai-airasia-x': 'Thai AirAsia X',
  'thai-lion-air': 'Thai Lion Air',
  'thai-vietjet': 'Thai Vietjet Air',
  'bangkok-airways': 'Bangkok Airways',
  'nok-air': 'Nok Air',
}

// Generate mock flight data for each airline
function generateFlightsForAirline(
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

function getBasePriceForRoute(origin: string, destination: string, airline: string): number {
  // Base prices vary by airline type
  const airlineBasePrices: Record<string, number> = {
    'thai-airways': 4000,
    'bangkok-airways': 3800,
    'thai-airasia': 2500,
    'thai-airasia-x': 2800,
    'thai-lion-air': 2300,
    'thai-vietjet': 2400,
    'nok-air': 2200,
  }
  
  const base = airlineBasePrices[airline] || 3000
  
  // Adjust based on route distance (simplified)
  const routeMultipliers: Record<string, Record<string, number>> = {
    'bangkok': {
      'chiang-mai': 1.0,
      'phuket': 0.95,
      'hat-yai': 0.9,
      'udon-thani': 0.85,
    },
  }
  
  // Check direct route first, then reverse route
  let multiplier = routeMultipliers[origin]?.[destination]
  if (multiplier === undefined) {
    multiplier = routeMultipliers[destination]?.[origin] || 1.0
  }
  
  return base * multiplier
}

export function AirlineFlights({ searchParams, selectedAirlines }: AirlineFlightsProps) {
  if (!searchParams || selectedAirlines.length === 0) {
    return null
  }

  // Generate flights for each selected airline
  const allFlights = selectedAirlines.flatMap(airline =>
    generateFlightsForAirline(
      airline,
      searchParams.origin,
      searchParams.destination,
      searchParams.startDate,
      searchParams.endDate
    )
  )

  // Group flights by airline
  const flightsByAirline: Record<string, Flight[]> = {}
  allFlights.forEach(flight => {
    if (!flightsByAirline[flight.airline]) {
      flightsByAirline[flight.airline] = []
    }
    flightsByAirline[flight.airline].push(flight)
  })

  return (
    <div className="container mx-auto px-4 mt-8">
      <h3 className="text-2xl font-bold mb-6">
        {'เที่ยวบินตามสายการบิน'}
      </h3>
      
      <div className="space-y-6">
        {Object.entries(flightsByAirline).map(([airline, flights]) => (
          <Card key={airline} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Plane className="w-6 h-6 text-primary" />
              <h4 className="text-xl font-bold">{airline}</h4>
              <Badge variant="outline" className="ml-auto">
                {flights.length} {'เที่ยวบิน'}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {flights.map((flight, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col items-center min-w-[80px]">
                      <div className="text-sm text-muted-foreground">{'เวลาเดินทาง'}</div>
                      <div className="text-lg font-bold">{flight.departureTime}</div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{flight.flightNumber}</span>
                        <Badge variant="outline" className="text-xs">
                          {flight.duration}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {searchParams.originName} → {searchParams.destinationName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {flight.date}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {'ถึง '}{flight.arrivalTime}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-6 text-right">
                    <div className="text-2xl font-bold text-primary">
                      {'฿'}{flight.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {'ไป-กลับ'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

