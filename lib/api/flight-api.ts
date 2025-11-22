// Flight-specific API calls

import { apiClient } from './client'
import {
  AnalyzeFlightPricesRequest,
  AnalyzeFlightPricesResponse,
  FlightPriceParams,
  FlightPrice,
} from './types'

export class FlightApi {
  /**
   * Analyze flight prices based on search parameters
   */
  async analyzeFlightPrices(
    params: AnalyzeFlightPricesRequest
  ): Promise<AnalyzeFlightPricesResponse> {
    return apiClient.post<AnalyzeFlightPricesResponse>(
      '/flights/analyze',
      params
    )
  }

  /**
   * Get flight prices for specific dates
   */
  async getFlightPrices(params: FlightPriceParams): Promise<FlightPrice[]> {
    return apiClient.post<FlightPrice[]>('/flights/prices', params)
  }

  /**
   * Get available airlines for a route
   */
  async getAvailableAirlines(
    origin: string,
    destination: string
  ): Promise<string[]> {
    return apiClient.get<string[]>('/flights/airlines', {
      origin,
      destination,
    })
  }
}

export const flightApi = new FlightApi()

