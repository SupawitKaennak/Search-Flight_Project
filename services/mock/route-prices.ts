/**
 * Mock route prices data
 * Base prices in THB for round trip between Thai provinces
 * Prices vary based on distance and route popularity
 */
export const routePrices: Record<string, Record<string, number>> = {
  'bangkok': {
    'chiang-mai': 3500,
    'phuket': 3200,
    'krabi': 3000,
    'samui': 2800,
    'pattaya': 1500,
    'hat-yai': 2500,
    'udon-thani': 2800,
    'khon-kaen': 2600,
    'nakhon-ratchasima': 2000,
    'surat-thani': 2700,
    'trang': 2900,
    'surin': 2400,
    'ubon-ratchathani': 3000,
    'nakhon-sawan': 1800,
    'lampang': 3200,
    'mae-hong-son': 3800,
    'nan': 3400,
    'phitsanulok': 2500,
    'sukhothai': 2700,
  },
}

/**
 * Get base price for a route
 */
export function getBasePrice(origin: string, destination: string, avgDuration: number): number {
  // Check direct route first
  let base = routePrices[origin]?.[destination]
  
  // If not found, check reverse route (prices are usually the same)
  if (base === undefined) {
    base = routePrices[destination]?.[origin]
  }
  
  // If still not found, use default calculation
  if (base === undefined) {
    base = origin === destination ? 0 : 2500 // Default price for domestic flights
  }
  
  // Adjust based on duration (longer trips might be slightly more expensive)
  return base * (1 + (avgDuration - 5) * 0.05)
}

