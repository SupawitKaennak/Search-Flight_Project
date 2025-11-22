// Data source abstraction - allows switching between mock and real API

import { FlightAnalysisResult } from '@/lib/flight-analysis'
import { FlightSearchParams } from '@/components/flight-search-form'
import { FlightPriceParams, FlightPrice } from '@/lib/api/types'
import { analyzeFlightPrices as mockAnalyzeFlightPrices } from '@/services/mock/flight-mock'
import { flightApi } from '@/lib/api/flight-api'

/**
 * Data source interface for flight data
 */
export interface FlightDataSource {
  analyzeFlightPrices(params: FlightSearchParams): Promise<FlightAnalysisResult>
  getFlightPrices?(params: FlightPriceParams): Promise<FlightPrice[]>
}

/**
 * Mock data source implementation
 * Uses existing mock logic from flight-analysis.ts
 */
class MockFlightDataSource implements FlightDataSource {
  async analyzeFlightPrices(
    params: FlightSearchParams
  ): Promise<FlightAnalysisResult> {
    // Use existing mock logic
    return mockAnalyzeFlightPrices(
      params.origin,
      params.destination,
      params.durationRange,
      params.selectedAirlines || [],
      params.startDate,
      params.endDate,
      params.tripType || null,
      params.passengerCount || 1
    )
  }
}

/**
 * Real API data source implementation
 * Calls actual backend API
 */
class RealFlightDataSource implements FlightDataSource {
  async analyzeFlightPrices(
    params: FlightSearchParams
  ): Promise<FlightAnalysisResult> {
    // Transform FlightSearchParams to API request format
    const request = {
      origin: params.origin,
      destination: params.destination,
      durationRange: params.durationRange,
      selectedAirlines: params.selectedAirlines || [],
      startDate: params.startDate?.toISOString(),
      endDate: params.endDate?.toISOString(),
      tripType: params.tripType || null,
      passengerCount: params.passengerCount || 1,
    }

    return await flightApi.analyzeFlightPrices(request)
  }

  async getFlightPrices(params: FlightPriceParams): Promise<FlightPrice[]> {
    return await flightApi.getFlightPrices(params)
  }
}

/**
 * Factory function to get the appropriate data source
 * Uses environment variable to determine which source to use
 */
export function getFlightDataSource(): FlightDataSource {
  // Check environment variable to determine data source
  // Default to mock if not set or set to 'true'
  const useMock =
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
    !process.env.NEXT_PUBLIC_USE_MOCK_DATA ||
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === undefined

  return useMock ? new MockFlightDataSource() : new RealFlightDataSource()
}

