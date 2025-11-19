/**
 * Mock default seasons data
 * Fallback data for seasonal breakdown component
 */
import { SeasonData } from '@/lib/flight-analysis'

export const defaultSeasons: SeasonData[] = [
  {
    type: 'low',
    months: ['เมษายน', 'พฤษภาคม', 'มิถุนายน'],
    priceRange: { min: 12500, max: 14500 },
    bestDeal: {
      dates: '15-22 พฤษภาคม 2025',
      price: 12500,
      airline: 'Thai AirAsia X',
    },
    description: 'ราคาถูกที่สุดของปี เหมาะสำหรับผู้ที่มีความยืดหยุ่นในการเดินทาง',
  },
  {
    type: 'normal',
    months: ['กุมภาพันธ์', 'มีนาคม', 'กันยายน', 'ตุลาคม'],
    priceRange: { min: 14800, max: 17800 },
    bestDeal: {
      dates: '5-12 มีนาคม 2025',
      price: 14800,
      airline: 'Thai Airways',
    },
    description: 'ราคาปานกลาง อากาศดี เหมาะสำหรับการท่องเที่ยว',
  },
  {
    type: 'high',
    months: ['มกราคม', 'กรกฎาคม', 'สิงหาคม', 'พฤศจิกายน', 'ธันวาคม'],
    priceRange: { min: 18200, max: 22500 },
    bestDeal: {
      dates: '10-17 กรกฎาคม 2025',
      price: 18200,
      airline: 'Japan Airlines',
    },
    description: 'ช่วงเทศกาลและปิดเทอม ราคาสูงสุด แนะนำจองล่วงหน้า',
  },
]

