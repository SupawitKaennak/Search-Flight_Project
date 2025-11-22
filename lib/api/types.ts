// API request and response types

import { FlightAnalysisResult } from '@/lib/flight-analysis'
import { FlightSearchParams } from '@/components/flight-search-form'

export interface FlightPriceParams {
  origin: string
  destination: string
  startDate: string
  endDate?: string
  tripType: 'one-way' | 'round-trip'
  passengerCount: number
  selectedAirlines: string[]
}

export interface FlightPrice {
  airline: string
  price: number
  departureTime: string
  arrivalTime: string
  duration: number
  flightNumber: string
}

export interface AnalyzeFlightPricesRequest {
  origin: string
  destination: string
  durationRange: { min: number; max: number }
  selectedAirlines: string[]
  startDate?: string
  endDate?: string
  tripType?: 'one-way' | 'round-trip' | null
  passengerCount: number
}

export interface AnalyzeFlightPricesResponse extends FlightAnalysisResult {}

