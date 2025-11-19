'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plane, Clock, Calendar } from 'lucide-react'
import { FlightSearchParams } from '@/components/flight-search-form'
import { generateFlightsForAirline, Flight } from '@/services/mock-flights'

interface AirlineFlightsProps {
  searchParams: FlightSearchParams
  selectedAirlines: string[]
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

