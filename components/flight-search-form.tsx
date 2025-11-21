'use client'

import { useState } from 'react'
import { Search, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PROVINCES, THAI_AIRLINES } from '@/services/constants'

export interface FlightSearchParams {
  origin: string
  originName: string
  destination: string
  destinationName: string
  durationRange: { min: number; max: number }
  selectedAirlines: string[]
  startDate?: Date
  endDate?: Date
  tripType?: 'one-way' | 'round-trip' | null
  passengerCount?: number
}

interface FlightSearchFormProps {
  onSearch?: (params: FlightSearchParams) => void
}

export function FlightSearchForm({ onSearch }: FlightSearchFormProps) {
  const [origin, setOrigin] = useState('bangkok')
  const [destination, setDestination] = useState('')
  const [tripType, setTripType] = useState<'one-way' | 'round-trip' | null>(null) // null = ยังไม่เลือก, 'one-way' หรือ 'round-trip'
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const [passengerCount, setPassengerCount] = useState('1')

  // Handle trip type change
  const handleTripTypeChange = (type: 'one-way' | 'round-trip') => {
    setTripType(type)
    // Clear the other type's data when switching
    if (type === 'one-way') {
      setDateRange({ from: undefined, to: undefined })
    } else {
      setDepartureDate(undefined)
    }
  }

  // Auto-detect trip type when user selects a date
  const handleDepartureDateSelect = (date: Date | undefined) => {
    setDepartureDate(date)
    if (date) {
      setTripType('one-way')
      setDateRange({ from: undefined, to: undefined })
    } else {
      // ถ้าล้างข้อมูล ให้ enable ทั้งสองฟิลด์
      if (!dateRange?.from) {
        setTripType(null)
      }
    }
  }

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    // ถ้าเลือกวันเดียวกัน ให้ clear to date
    if (range?.from && range?.to) {
      const fromDate = new Date(range.from)
      const toDate = new Date(range.to)
      fromDate.setHours(0, 0, 0, 0)
      toDate.setHours(0, 0, 0, 0)
      
      // ถ้าวันเดียวกัน ให้ clear to date
      if (fromDate.getTime() === toDate.getTime()) {
        setDateRange({ from: range.from, to: undefined })
        return
      }
    }
    
    setDateRange(range)
    if (range?.from) {
      setTripType('round-trip')
      setDepartureDate(undefined)
    } else {
      // ถ้าล้างข้อมูล ให้ enable ทั้งสองฟิลด์
      if (!departureDate) {
        setTripType(null)
      }
    }
  }

  const handleSearch = () => {
    // ต้องมี destination และต้องมีวันที่ตาม trip type ที่เลือก
    if (!destination) return
    if (tripType === 'one-way' && !departureDate) return
    if (tripType === 'round-trip' && (!dateRange?.from || !dateRange?.to)) return
    // ถ้ายังไม่เลือก trip type แต่มีวันที่ ให้ auto-detect
    if (!tripType) {
      if (departureDate) {
        setTripType('one-way')
      } else if (dateRange?.from) {
        setTripType('round-trip')
      } else {
        return
      }
    }
    
    const originData = PROVINCES.find(c => c.value === origin) || { value: 'bangkok', label: 'กรุงเทพมหานคร' }
    const destinationData = PROVINCES.find(c => c.value === destination)
    
    // Calculate duration in days
    let min = 3
    let max = 5
    let startDate: Date | undefined
    let endDate: Date | undefined

    if (tripType === 'round-trip' && dateRange?.from && dateRange?.to) {
      // ใช้ข้อมูลไป-กลับ (ต้องมีทั้ง from และ to)
      startDate = dateRange.from
      const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      min = Math.max(3, diffDays - 2)
      max = diffDays + 2
      endDate = dateRange.to
    } else if (tripType === 'one-way' && departureDate) {
      // ใช้ข้อมูลไปอย่างเดียว (default 3-5 วัน)
      startDate = departureDate
      endDate = undefined
    }
    
    const searchParams: FlightSearchParams = {
      origin: origin || 'bangkok',
      originName: originData.label,
      destination,
      destinationName: destinationData?.label || '',
      durationRange: { min, max },
      selectedAirlines: [], // Default: ไม่เลือกสายการบิน (แสดงทั้งหมด)
      startDate,
      endDate,
      tripType,
    }
    
    onSearch?.(searchParams)
    
    // Save to statistics
    if (typeof window !== 'undefined') {
      const stats = JSON.parse(localStorage.getItem('flightStats') || '{"searches": [], "prices": []}')
      stats.searches.push({
        origin: origin,
        originName: originData.label,
        destination: destination,
        destinationName: destinationData?.label || '',
        durationRange: `${min}-${max}`,
        tripType: tripType || null,
        timestamp: new Date().toISOString(),
      })
      // Keep only last 1000 search records to avoid localStorage overflow
      if (stats.searches.length > 1000) {
        stats.searches = stats.searches.slice(-1000)
      }
      // Ensure prices array exists
      if (!stats.prices) {
        stats.prices = []
      }
      localStorage.setItem('flightStats', JSON.stringify(stats))
    }
  }

  return (
    <Card className="p-8 bg-background/60  shadow-xl max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="origin">{'จังหวัดต้นทาง'}</Label>
          <Select value={origin} onValueChange={setOrigin}>
            <SelectTrigger id="origin" className="bg-white border-gray-300 w-full min-w-[200px]">
              <SelectValue placeholder="เลือกจังหวัด" />
            </SelectTrigger>
            <SelectContent>
              {PROVINCES.map((province) => (
                <SelectItem key={province.value} value={province.value}>
                  {province.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination">{'จังหวัดปลายทาง'}</Label>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger id="destination" className="bg-white border-gray-300 w-full min-w-[200px]">
              <SelectValue placeholder="เลือกจังหวัด" />
            </SelectTrigger>
            <SelectContent>
              {PROVINCES.filter(c => c.value !== origin).map((province) => (
                <SelectItem key={province.value} value={province.value}>
                  {province.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="departure-date">{'เลือกวันที่ไป(เที่ยวเดียว)'}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="departure-date"
                variant="outline"
                disabled={tripType === 'round-trip'}
                onClick={() => {
                  if (tripType === 'round-trip') {
                    handleTripTypeChange('one-way')
                  }
                }}
                className={`w-full bg-white border-gray-300 justify-start text-left font-normal text-sm overflow-hidden ${
                  tripType === 'round-trip' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {departureDate ? (
                    format(departureDate, 'dd/MM/yyyy')
                  ) : (
                    <span className="text-muted-foreground">{'เลือกวันที่ไป'}</span>
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            {tripType !== 'round-trip' && (
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={departureDate}
                  onSelect={handleDepartureDateSelect}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            )}
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-range">{'เลือกวันที่ไป-กลับ'}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-range"
                variant="outline"
                disabled={tripType === 'one-way'}
                onClick={() => {
                  if (tripType === 'one-way') {
                    handleTripTypeChange('round-trip')
                  }
                }}
                className={`w-full bg-white border-gray-300 justify-start text-left font-normal text-sm overflow-hidden min-w-[200px] ${
                  tripType === 'one-way' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd/MM/yyyy')} -{' '}
                        {format(dateRange.to, 'dd/MM/yyyy')}
                      </>
                    ) : (
                      format(dateRange.from, 'dd/MM/yyyy')
                    )
                  ) : (
                    <span className="text-muted-foreground">{'เลือกวันที่'}</span>
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            {tripType !== 'one-way' && (
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeSelect}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            )}
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="passengers">{'จำนวนผู้โดยสาร'}</Label>
          <Select value={passengerCount} onValueChange={setPassengerCount}>
            <SelectTrigger id="passengers" className="bg-white border-gray-300 w-full min-w-[200px]">
              <SelectValue placeholder="เลือกจำนวน" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'คน' : 'คน'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Button Section */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-center">
          <Button 
            onClick={handleSearch} 
            className="w-80 h-10 px-8"
            disabled={(() => {
              // ตรวจสอบเงื่อนไขพื้นฐาน
              if (!destination || !passengerCount) return true
              
              // ตรวจสอบวันที่ตาม trip type
              if (tripType === 'one-way') {
                return !departureDate
              }
              
              if (tripType === 'round-trip') {
                // ต้องมีทั้ง from และ to - ตรวจสอบอย่างชัดเจน
                if (!dateRange?.from || dateRange.to === undefined || dateRange.to === null) {
                  return true
                }
                // ตรวจสอบว่าวันเดียวกันหรือไม่
                if (dateRange.from && dateRange.to) {
                  const fromDate = new Date(dateRange.from)
                  const toDate = new Date(dateRange.to)
                  fromDate.setHours(0, 0, 0, 0)
                  toDate.setHours(0, 0, 0, 0)
                  if (fromDate.getTime() === toDate.getTime()) {
                    return true // disable ถ้าวันเดียวกัน
                  }
                }
                return false
              }
              
              // ถ้ายังไม่เลือก trip type
              if (tripType === null) {
                // ถ้ามี departureDate (one-way) ก็ใช้ได้
                if (departureDate) return false
                // ถ้ามี dateRange ต้องมีทั้ง from และ to
                if (dateRange?.from) {
                  return !dateRange.to
                }
                // ไม่มีวันที่เลย
                return true
              }
              
              return false
            })()}
          >
            <Search className="w-8 h-4 mr-2" />
            {'ค้นหา'}
          </Button>
        </div>
      </div>

    </Card>
  )
}
