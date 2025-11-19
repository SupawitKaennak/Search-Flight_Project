'use client'

import { useState } from 'react'
import { Search, Plane, X, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
}

interface FlightSearchFormProps {
  onSearch?: (params: FlightSearchParams) => void
}

export function FlightSearchForm({ onSearch }: FlightSearchFormProps) {
  const [origin, setOrigin] = useState('bangkok')
  const [destination, setDestination] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  // Default: select all airlines
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>(
    THAI_AIRLINES.map(a => a.value)
  )

  const handleSearch = () => {
    if (!destination || !dateRange?.from || !dateRange?.to) return
    
    const originData = PROVINCES.find(c => c.value === origin) || { value: 'bangkok', label: 'กรุงเทพมหานคร' }
    const destinationData = PROVINCES.find(c => c.value === destination)
    
    // Calculate duration in days
    const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Use a range around the calculated duration (e.g., if 7 days, use 5-9 range)
    const min = Math.max(3, diffDays - 2)
    const max = diffDays + 2
    
    const searchParams: FlightSearchParams = {
      origin: origin || 'bangkok',
      originName: originData.label,
      destination,
      destinationName: destinationData?.label || '',
      durationRange: { min, max },
      selectedAirlines: selectedAirlines.length > 0 ? selectedAirlines : THAI_AIRLINES.map(a => a.value),
      startDate: dateRange.from,
      endDate: dateRange.to,
    }
    
    onSearch?.(searchParams)
    
    // Save to statistics
    if (typeof window !== 'undefined') {
      const stats = JSON.parse(localStorage.getItem('flightStats') || '{"searches": [], "prices": []}')
      stats.searches.push({
        origin: originData.label,
        destination: destinationData?.label || '',
        durationRange: `${min}-${max}`,
        timestamp: new Date().toISOString(),
      })
      // Ensure prices array exists
      if (!stats.prices) {
        stats.prices = []
      }
      localStorage.setItem('flightStats', JSON.stringify(stats))
    }
  }

  const toggleSelectedAirline = (airline: string) => {
    setSelectedAirlines(prev => 
      prev.includes(airline) 
        ? prev.filter(a => a !== airline)
        : [...prev, airline]
    )
  }

  const selectAllAirlines = () => {
    setSelectedAirlines(THAI_AIRLINES.map(a => a.value))
  }

  const deselectAllAirlines = () => {
    setSelectedAirlines([])
  }

  return (
    <Card className="p-6 bg-background shadow-xl max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="origin">{'จังหวัดต้นทาง'}</Label>
          <Select value={origin} onValueChange={setOrigin}>
            <SelectTrigger id="origin">
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
            <SelectTrigger id="destination">
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
          <Label htmlFor="date-range">{'เลือกวันที่ไป-กลับ'}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-range"
                variant="outline"
                className="w-full justify-start text-left font-normal text-sm overflow-hidden"
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
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2 flex flex-col justify-end lg:col-span-2">
          <Button 
            onClick={handleSearch} 
            className="w-full h-10"
            disabled={!destination || !dateRange?.from || !dateRange?.to}
          >
            <Search className="w-4 h-4 mr-2" />
            {'ค้นหา'}
          </Button>
        </div>
      </div>

      {/* Airline Selection Section */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium block">
            {'เลือกสายการบิน (คลิกเพื่อเลือก/ยกเลิก)'}
          </Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAllAirlines}
              className="h-7 text-xs"
            >
              {'เลือกทั้งหมด'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={deselectAllAirlines}
              className="h-7 text-xs"
            >
              {'ยกเลิกทั้งหมด'}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {'💡 คลิกที่สายการบินที่คุณต้องการให้แสดงในผลการค้นหา (เลือกทั้งหมดเป็นค่าเริ่มต้น)'}
        </p>
        <div className="flex flex-wrap gap-2">
          {THAI_AIRLINES.map((airline) => {
            const isSelected = selectedAirlines.includes(airline.value)
            return (
              <Badge
                key={airline.value}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  isSelected 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "hover:bg-secondary opacity-50"
                }`}
                onClick={() => toggleSelectedAirline(airline.value)}
              >
                {airline.label}
                {isSelected && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </Badge>
            )
          })}
        </div>
        {selectedAirlines.length === 0 && (
          <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-xs font-medium text-destructive mb-1">
              {'⚠️ กรุณาเลือกสายการบินอย่างน้อย 1 สายการบิน'}
            </p>
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground text-center mt-4">
        {'💡 เคล็ดลับ: ระบุข้อมูลให้ครบเพื่อรับคำแนะนำที่แม่นยำที่สุด'}
      </div>
    </Card>
  )
}
