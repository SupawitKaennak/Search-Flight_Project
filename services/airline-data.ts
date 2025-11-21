/**
 * Mock airline data
 * Airline mappings, base prices, and route multipliers
 */

// Map airline values to display names
export const airlineMap: Record<string, string> = {
  'thai-airways': 'Thai Airways',
  'thai-airasia': 'Thai AirAsia',
  'thai-lion-air': 'Thai Lion Air',
  'thai-vietjet': 'Thai Vietjet Air',
  'bangkok-airways': 'Bangkok Airways',
  'nok-air': 'Nok Air',
}

// Base prices vary by airline type
export const airlineBasePrices: Record<string, number> = {
  'thai-airways': 4000,
  'bangkok-airways': 3800,
  'thai-airasia': 2500,
  'thai-lion-air': 2300,
  'thai-vietjet': 2400,
  'nok-air': 2200,
}

// Adjust based on route distance (simplified)
export const routeMultipliers: Record<string, Record<string, number>> = {
  'bangkok': {
    'chiang-mai': 1.0,
    'phuket': 0.95,
    'hat-yai': 0.9,
    'udon-thani': 0.85,
  },
}

/**
 * Get base price for a route by airline
 */
export function getBasePriceForRoute(origin: string, destination: string, airline: string): number {
  const base = airlineBasePrices[airline] || 3000
  
  // Check direct route first, then reverse route
  let multiplier = routeMultipliers[origin]?.[destination]
  if (multiplier === undefined) {
    multiplier = routeMultipliers[destination]?.[origin] || 1.0
  }
  
  return base * multiplier
}

/**
 * Get best airline based on season
 */
export function getBestAirline(
  province: string,
  selectedAirlines: string[],
  season: 'high' | 'normal' | 'low'
): string {
  // Get available airlines from selected list
  const availableAirlines = selectedAirlines
    .map(val => airlineMap[val])
    .filter(Boolean)

  if (availableAirlines.length === 0) {
    return 'Thai Airways' // Default fallback
  }

  // For low season, prefer budget airlines
  if (season === 'low') {
    const budgetAirlines = availableAirlines.filter(a => 
      a.includes('AirAsia') || 
      a.includes('Lion Air') || 
      a.includes('Vietjet') || 
      a.includes('Nok Air')
    )
    if (budgetAirlines.length > 0) {
      return budgetAirlines[0]
    }
  }

  // For high season, prefer full-service airlines
  if (season === 'high') {
    const fullServiceAirlines = availableAirlines.filter(a => 
      a.includes('Thai Airways') || 
      a.includes('Bangkok Airways')
    )
    if (fullServiceAirlines.length > 0) {
      return fullServiceAirlines[0]
    }
  }

  return availableAirlines[0] || 'Thai Airways'
}

