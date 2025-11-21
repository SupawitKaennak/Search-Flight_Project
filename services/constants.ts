/**
 * Constants and utility data
 * Thai month names, provinces, airlines and other constants
 */

// Thai month abbreviations
export const thaiMonths = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
]

// Thai month full names
export const thaiMonthsFull = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

// Month order mapping for sorting
export const monthOrder: Record<string, number> = {
  'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4,
  'พ.ค.': 5, 'มิ.ย.': 6, 'ก.ค.': 7, 'ส.ค.': 8,
  'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12,
}

// Thai provinces for flight search
export const PROVINCES = [
  { value: 'bangkok', label: 'กรุงเทพมหานคร' },
  { value: 'chiang-mai', label: 'เชียงใหม่' },
  { value: 'phuket', label: 'ภูเก็ต' },
  { value: 'krabi', label: 'กระบี่' },
  { value: 'samui', label: 'เกาะสมุย' },
  { value: 'pattaya', label: 'พัทยา (ชลบุรี)' },
  { value: 'hat-yai', label: 'หาดใหญ่ (สงขลา)' },
  { value: 'udon-thani', label: 'อุดรธานี' },
  { value: 'khon-kaen', label: 'ขอนแก่น' },
  { value: 'nakhon-ratchasima', label: 'นครราชสีมา' },
  { value: 'surat-thani', label: 'สุราษฎร์ธานี' },
  { value: 'trang', label: 'ตรัง' },
  { value: 'surin', label: 'สุรินทร์' },
  { value: 'ubon-ratchathani', label: 'อุบลราชธานี' },
  { value: 'nakhon-sawan', label: 'นครสวรรค์' },
  { value: 'lampang', label: 'ลำปาง' },
  { value: 'mae-hong-son', label: 'แม่ฮ่องสอน' },
  { value: 'nan', label: 'น่าน' },
  { value: 'phitsanulok', label: 'พิษณุโลก' },
  { value: 'sukhothai', label: 'สุโขทัย' },
]

// Thai airlines for flight search
export const THAI_AIRLINES = [
  { value: 'thai-airways', label: 'Thai Airways' },
  { value: 'thai-airasia', label: 'Thai AirAsia' },
  { value: 'thai-lion-air', label: 'Thai Lion Air' },
  { value: 'thai-vietjet', label: 'Thai Vietjet Air' },
  { value: 'bangkok-airways', label: 'Bangkok Airways' },
  { value: 'nok-air', label: 'Nok Air' },
]

// Province names mapping (value -> label)
export const provinceNames: Record<string, string> = PROVINCES.reduce((acc, province) => {
  acc[province.value] = province.label
  return acc
}, {} as Record<string, string>)

