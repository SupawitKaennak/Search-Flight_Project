// Flight price analysis types and interfaces
// Business logic utilities are in lib/flight-utils.ts
// Mock data generation is in services/mock/flight-mock.ts

// Re-export mock function for backward compatibility
// This allows existing code to continue working while we migrate to service layer
import { analyzeFlightPrices as mockAnalyzeFlightPrices } from '@/services/mock/flight-mock'

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

/**
 * @deprecated Use FlightService.analyzePrices() instead
 * This function is kept for backward compatibility
 * Mock data generation has been moved to services/mock/flight-mock.ts
 */
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
  return mockAnalyzeFlightPrices(
    origin,
    destination,
    durationRange,
    selectedAirlines,
    startDate,
    endDate,
    tripType,
    passengerCount
  )
}
