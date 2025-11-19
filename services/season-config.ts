/**
 * Mock season configuration data
 * คำนวณการแบ่งฤดูกาลตามประเทศปลายทาง
 * วิธีคำนวณ:
 * 1. ใช้ข้อมูลราคาเฉลี่ยตามเดือนจากข้อมูลจริง (หรือ mock data)
 * 2. แบ่งเป็น 3 กลุ่มตาม percentile: Low (0-33%), Normal (33-66%), High (66-100%)
 * 3. ปรับตามเทศกาลและฤดูกาลของแต่ละประเทศ
 */

export interface SeasonConfig {
  low: { months: string[]; priceMultiplier: { min: number; max: number }; bestDealDates: string }
  normal: { months: string[]; priceMultiplier: { min: number; max: number }; bestDealDates: string }
  high: { months: string[]; priceMultiplier: { min: number; max: number }; bestDealDates: string }
}

// Default configuration สำหรับประเทศที่ไม่มี Rule เฉพาะ
const defaultConfig: SeasonConfig = {
  low: {
    months: ['พฤษภาคม', 'มิถุนายน', 'กันยายน'],
    priceMultiplier: { min: 0.7, max: 0.85 },
    bestDealDates: '15-22 พฤษภาคม 2025',
  },
  normal: {
    months: ['กุมภาพันธ์', 'มีนาคม', 'ตุลาคม', 'พฤศจิกายน'],
    priceMultiplier: { min: 0.85, max: 1.1 },
    bestDealDates: '5-12 มีนาคม 2025',
  },
  high: {
    months: ['มกราคม', 'เมษายน', 'กรกฎาคม', 'สิงหาคม', 'ธันวาคม'],
    priceMultiplier: { min: 1.1, max: 1.5 },
    bestDealDates: '10-17 กรกฎาคม 2025',
  },
}

// Configuration เฉพาะจังหวัด (อิงจากฤดูกาลท่องเที่ยวในประเทศไทย)
const provinceConfigs: Record<string, SeasonConfig> = {
  // === จังหวัดท่องเที่ยวหลัก ===
  'chiang-mai': {
    low: {
      months: ['พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'กันยายน'], // ฤดูฝน
      priceMultiplier: { min: 0.7, max: 0.85 },
      bestDealDates: '1-8 มิถุนายน 2025',
    },
    normal: {
      months: ['มีนาคม', 'เมษายน', 'สิงหาคม', 'ตุลาคม'], 
      priceMultiplier: { min: 0.85, max: 1.1 },
      bestDealDates: '10-17 มีนาคม 2025',
    },
    high: {
      months: ['มกราคม', 'กุมภาพันธ์', 'พฤศจิกายน', 'ธันวาคม'], // ฤดูหนาว/ดอกไม้บาน
      priceMultiplier: { min: 1.2, max: 1.7 },
      bestDealDates: '20-27 ธันวาคม 2025',
    },
  },
  'phuket': {
    low: {
      months: ['พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'กันยายน'], // ฤดูฝน
      priceMultiplier: { min: 0.65, max: 0.8 },
      bestDealDates: '1-8 มิถุนายน 2025',
    },
    normal: {
      months: ['มีนาคม', 'เมษายน', 'สิงหาคม', 'ตุลาคม'], 
      priceMultiplier: { min: 0.8, max: 1.1 },
      bestDealDates: '10-17 มีนาคม 2025',
    },
    high: {
      months: ['มกราคม', 'กุมภาพันธ์', 'พฤศจิกายน', 'ธันวาคม'], // ฤดูท่องเที่ยว
      priceMultiplier: { min: 1.2, max: 1.7 },
      bestDealDates: '20-27 ธันวาคม 2025',
    },
  },
  singapore: { 
    low: {
      months: ['กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน'], // ราคาค่อนข้างคงที่
      priceMultiplier: { min: 0.8, max: 0.95 },
      bestDealDates: '15-22 พฤษภาคม 2025',
    },
    normal: {
      months: ['ตุลาคม', 'พฤศจิกายน'],
      priceMultiplier: { min: 0.95, max: 1.1 },
      bestDealDates: '5-12 ตุลาคม 2025',
    },
    high: {
      months: ['มกราคม', 'ธันวาคม'], // ปีใหม่/เทศกาล
      priceMultiplier: { min: 1.2, max: 1.6 },
      bestDealDates: '1-7 มกราคม 2025',
    },
  },
  vietnam: {
    low: {
      months: ['พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม'], // มรสุม/ร้อนจัด
      priceMultiplier: { min: 0.7, max: 0.85 },
      bestDealDates: '15-22 พฤษภาคม 2025',
    },
    normal: {
      months: ['มีนาคม', 'เมษายน', 'กันยายน', 'ตุลาคม'],
      priceMultiplier: { min: 0.85, max: 1.1 },
      bestDealDates: '5-12 มีนาคม 2025',
    },
    high: {
      months: ['มกราคม', 'กุมภาพันธ์', 'พฤศจิกายน', 'ธันวาคม'], // อากาศดี/เทศกาล
      priceMultiplier: { min: 1.1, max: 1.5 },
      bestDealDates: '1-7 มกราคม 2025',
    },
  },
  malaysia: {
    low: {
      months: ['กุมภาพันธ์', 'พฤษภาคม', 'มิถุนายน', 'กันยายน', 'ตุลาคม'],
      priceMultiplier: { min: 0.75, max: 0.9 },
      bestDealDates: '10-17 กุมภาพันธ์ 2025',
    },
    normal: {
      months: ['มีนาคม', 'เมษายน', 'กรกฎาคม', 'สิงหาคม', 'พฤศจิกายน'],
      priceMultiplier: { min: 0.9, max: 1.1 },
      bestDealDates: '5-12 มีนาคม 2025',
    },
    high: {
      months: ['มกราคม', 'ธันวาคม'],
      priceMultiplier: { min: 1.1, max: 1.5 },
      bestDealDates: '20-27 ธันวาคม 2025',
    },
  },
  // === ประเทศในเอเชียตะวันออก ===
  japan: {
    low: {
      months: ['มิถุนายน', 'กรกฎาคม', 'สิงหาคม'], // ฤดูร้อน/ฝน
      priceMultiplier: { min: 0.75, max: 0.9 },
      bestDealDates: '15-22 มิถุนายน 2025',
    },
    normal: {
      months: ['กุมภาพันธ์', 'กันยายน'],
      priceMultiplier: { min: 0.9, max: 1.15 },
      bestDealDates: '5-12 กันยายน 2025',
    },
    high: {
      months: ['มกราคม', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'], // ซากุระ/ใบไม้เปลี่ยนสี
      priceMultiplier: { min: 1.2, max: 1.8 },
      bestDealDates: '25 มีนาคม - 5 เมษายน 2025', 
    },
  },
  korea: {
    low: {
      months: ['มกราคม', 'กุมภาพันธ์', 'กรกฎาคม', 'สิงหาคม'], // ฤดูหนาวจัด/ร้อนจัด/ฝน
      priceMultiplier: { min: 0.7, max: 0.85 },
      bestDealDates: '15-22 มกราคม 2025',
    },
    normal: {
      months: ['มีนาคม', 'มิถุนายน', 'กันยายน', 'ธันวาคม'],
      priceMultiplier: { min: 0.85, max: 1.1 },
      bestDealDates: '5-12 กันยายน 2025',
    },
    high: {
      months: ['เมษายน', 'พฤษภาคม', 'ตุลาคม', 'พฤศจิกายน'], // ฤดูใบไม้ผลิ/ใบไม้ร่วง
      priceMultiplier: { min: 1.15, max: 1.6 },
      bestDealDates: '5-15 เมษายน 2025',
    },
  },
  taiwan: {
    low: {
      months: ['กรกฎาคม', 'สิงหาคม'], // พายุไต้ฝุ่น/ร้อน
      priceMultiplier: { min: 0.7, max: 0.85 },
      bestDealDates: '15-22 กรกฎาคม 2025',
    },
    normal: {
      months: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'มิถุนายน', 'กันยายน', 'ธันวาคม'],
      priceMultiplier: { min: 0.85, max: 1.1 },
      bestDealDates: '5-12 มีนาคม 2025',
    },
    high: {
      months: ['เมษายน', 'พฤษภาคม', 'ตุลาคม', 'พฤศจิกายน'], // อากาศดี
      priceMultiplier: { min: 1.1, max: 1.6 },
      bestDealDates: '1-8 พฤศจิกายน 2025',
    },
  },
  'hong-kong': {
    low: {
      months: ['พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม'], // ร้อน/พายุ
      priceMultiplier: { min: 0.7, max: 0.85 },
      bestDealDates: '15-22 มิถุนายน 2025',
    },
    normal: {
      months: ['มีนาคม', 'เมษายน', 'กันยายน', 'ตุลาคม'],
      priceMultiplier: { min: 0.85, max: 1.1 },
      bestDealDates: '5-12 เมษายน 2025',
    },
    high: {
      months: ['มกราคม', 'กุมภาพันธ์', 'พฤศจิกายน', 'ธันวาคม'], // อากาศดี/เทศกาล
      priceMultiplier: { min: 1.1, max: 1.5 },
      bestDealDates: '1-7 ธันวาคม 2025',
    },
  },
  // === ประเทศตะวันตก ===
  france: {
    low: {
      months: ['มกราคม', 'กุมภาพันธ์', 'พฤศจิกายน'],
      priceMultiplier: { min: 0.75, max: 0.9 },
      bestDealDates: '10-17 พฤศจิกายน 2025',
    },
    normal: {
      months: ['มีนาคม', 'เมษายน', 'กันยายน', 'ตุลาคม'],
      priceMultiplier: { min: 0.9, max: 1.2 },
      bestDealDates: '1-8 มีนาคม 2025',
    },
    high: {
      months: ['พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'ธันวาคม'], // ฤดูร้อน/เทศกาล
      priceMultiplier: { min: 1.3, max: 1.9 },
      bestDealDates: '1-15 กรกฎาคม 2025',
    },
  },
  italy: {
    low: {
      months: ['มกราคม', 'กุมภาพันธ์', 'พฤศจิกายน'],
      priceMultiplier: { min: 0.7, max: 0.85 },
      bestDealDates: '10-17 พฤศจิกายน 2025',
    },
    normal: {
      months: ['มีนาคม', 'เมษายน', 'กันยายน', 'ตุลาคม'],
      priceMultiplier: { min: 0.85, max: 1.15 },
      bestDealDates: '1-8 มีนาคม 2025',
    },
    high: {
      months: ['พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'ธันวาคม'], // ฤดูร้อน/เทศกาล
      priceMultiplier: { min: 1.25, max: 2.0 },
      bestDealDates: '1-15 กรกฎาคม 2025',
    },
  },
  usa: {
    low: {
      months: ['มกราคม', 'กุมภาพันธ์', 'กันยายน', 'ตุลาคม'],
      priceMultiplier: { min: 0.75, max: 0.95 },
      bestDealDates: '15-22 กันยายน 2025',
    },
    normal: {
      months: ['มีนาคม', 'เมษายน', 'พฤษภาคม', 'พฤศจิกายน'],
      priceMultiplier: { min: 0.95, max: 1.2 },
      bestDealDates: '5-12 พฤศจิกายน 2025',
    },
    high: {
      months: ['มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'ธันวาคม'], // Summer Holidays/Christmas
      priceMultiplier: { min: 1.2, max: 1.8 },
      bestDealDates: '1-15 กรกฎาคม 2025',
    },
  },
}

/**
 * Get season configuration for a destination
 */
export function getSeasonConfig(destination: string): SeasonConfig {
  // ใช้ชื่อจังหวัดเป็นตัวพิมพ์เล็กในการค้นหา
  const normalizedDestination = destination.toLowerCase().replace(/ /g, '-')
  return provinceConfigs[normalizedDestination] || defaultConfig
}

