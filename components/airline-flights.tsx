'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Plane, Clock, Calendar } from 'lucide-react'
import { FlightSearchParams } from '@/components/flight-search-form'
import { generateFlightsForAirline, Flight } from '@/services/mock-flights'
import { THAI_AIRLINES } from '@/services/constants'

interface AirlineFlightsProps {
  searchParams: FlightSearchParams
  selectedAirlines: string[]
  onAirlinesChange?: (airlines: string[]) => void
}

// Mapping รูปภาพสำหรับแต่ละสายการบิน
const getAirlineImage = (airline: string): string => {
  const imageMap: Record<string, string> = {
    'Thai Airways': '/airlines/thai-airways.png',
    'Thai AirAsia': '/airlines/thai-airasia.png',
    'Thai Lion Air': '/airlines/thai-lion-air.png',
    'Thai Vietjet Air': '/airlines/thai-vietjet.png',
    'Bangkok Airways': '/airlines/bangkok-airways.png',
    'Nok Air': '/airlines/nok-air.png',
  }
  
  // ใช้ placeholder เป็น default จนกว่าจะมีรูปภาพจริง
  return imageMap[airline] || '/placeholder-logo.png'
}

export function AirlineFlights({ searchParams, selectedAirlines, onAirlinesChange }: AirlineFlightsProps) {
  if (!searchParams) {
    return null
  }

  // ถ้าไม่เลือกเลย ให้แสดงทั้งหมด, ถ้าเลือกแล้วให้แสดงเฉพาะที่เลือก
  const airlinesToShow = selectedAirlines.length === 0 
    ? THAI_AIRLINES.map(a => a.value)
    : selectedAirlines

  // Generate flights for each airline
  const allFlights = airlinesToShow.flatMap(airline =>
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

  // Get flight count for each airline
  const getFlightCount = (airlineValue: string): number => {
    const airline = THAI_AIRLINES.find(a => a.value === airlineValue)
    if (!airline) return 0
    return flightsByAirline[airline.label]?.length || 0
  }

  const toggleAirline = (airlineValue: string) => {
    if (!onAirlinesChange) return
    const newSelected = selectedAirlines.includes(airlineValue)
      ? selectedAirlines.filter(a => a !== airlineValue)
      : [...selectedAirlines, airlineValue]
    onAirlinesChange(newSelected)
  }

  const selectAllAirlines = () => {
    if (!onAirlinesChange) return
    onAirlinesChange(THAI_AIRLINES.map(a => a.value))
  }

  const deselectAllAirlines = () => {
    if (!onAirlinesChange) return
    onAirlinesChange([])
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-8">
      <h3 className="text-2xl font-bold mb-6">
        {'เที่ยวบินตามสายการบิน'}
      </h3>
      
      <div className="flex gap-6">
        {/* Sidebar - Airline Selection */}
        <div className="w-64 flex-shrink-0">
          <Card className="p-4">
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">{'สายการบิน'}</h4>
              <div className="space-y-3">
                {THAI_AIRLINES.map((airline) => {
                  const flightCount = getFlightCount(airline.value)
                  return (
                    <div key={airline.value} className="flex items-center space-x-2 min-h-[2.5rem]">
                      <Checkbox
                        id={airline.value}
                        checked={selectedAirlines.includes(airline.value)}
                        onCheckedChange={() => toggleAirline(airline.value)}
                      />
                      <label
                        htmlFor={airline.value}
                        className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                      >
                        <span>{airline.label}</span>
                        {flightCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({flightCount})
                          </span>
                        )}
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={selectAllAirlines}
                className="text-xs text-primary hover:underline"
              >
                {'เลือกทั้งหมด'}
              </button>
              <span className="text-xs text-muted-foreground">|</span>
              <button
                onClick={deselectAllAirlines}
                className="text-xs text-primary hover:underline"
              >
                {'ยกเลิกทั้งหมด'}
              </button>
            </div>
          </Card>
        </div>

        {/* Main Content - Flights */}
        <div className="flex-1">
          <Card className="p-6">
            <div className="space-y-3">
              {Object.entries(flightsByAirline).map(([airline, flights]) => {
                const airlineImage = getAirlineImage(airline)
                return flights.map((flight, index) => (
                  <div
                    key={`${airline}-${index}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={airlineImage}
                          alt={airline}
                          className="w-10 h-10 object-contain flex-shrink-0 bg-muted rounded"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement
                            // ใช้ relative path แทน absolute path เพื่อหลีกเลี่ยง hydration error
                            if (!target.src.endsWith('/placeholder-logo.png')) {
                              target.src = '/placeholder-logo.png'
                            }
                          }}
                        />
                        <div className="flex flex-col items-center min-w-[80px]">
                          <div className="text-sm text-muted-foreground">{'เวลาเดินทาง'}</div>
                          <div className="text-lg font-bold">{flight.departureTime}</div>
                        </div>
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
                        
                        <div className="ml-6 flex flex-col items-end gap-2">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              {'฿'}{flight.price.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {searchParams.tripType === 'one-way' ? 'เที่ยวเดียว' : 'ไป-กลับ'}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full min-w-[100px]"
                            onClick={() => {
                              // TODO: Handle booking logic
                              console.log('Booking flight:', flight)
                            }}
                          >
                            {'เลือก'}
                          </Button>
                        </div>
                      </div>
                    ))
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

