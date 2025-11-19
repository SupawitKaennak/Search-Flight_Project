import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users } from 'lucide-react'

const destinations = [
  {
    province: 'เชียงใหม่',
    city: 'เชียงใหม่',
    searches: '12,450',
    avgPrice: '฿3,500',
    trend: '+15%',
    popular: true,
    image: '/chiang-mai.jpg',
  },
  {
    province: 'ภูเก็ต',
    city: 'ภูเก็ต',
    searches: '9,820',
    avgPrice: '฿3,200',
    trend: '+22%',
    popular: true,
    image: '/phuket.jpg',
  },
  {
    province: 'กระบี่',
    city: 'กระบี่',
    searches: '7,340',
    avgPrice: '฿3,000',
    trend: '+8%',
    popular: false,
    image: '/krabi.jpg',
  },
  {
    province: 'หาดใหญ่',
    city: 'หาดใหญ่ (สงขลา)',
    searches: '6,120',
    avgPrice: '฿2,500',
    trend: '+18%',
    popular: false,
    image: '/hat-yai.jpg',
  },
]

export function PopularDestinations() {
  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{'ปลายทางยอดนิยม'}</h2>
        <p className="text-muted-foreground">
          {'ดูว่าคนอื่นๆ กำลังค้นหาเที่ยวบินไปที่ไหนกัน'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {destinations.map((dest) => (
          <Card key={dest.city} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="relative h-48 bg-muted">
              <img 
                src={dest.image || "/placeholder.svg"} 
                alt={dest.city}
                className="w-full h-full object-cover"
              />
              {dest.popular && (
                <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                  {'ยอดนิยม'}
                </Badge>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{dest.city}</h3>
              <p className="text-sm text-muted-foreground mb-3">{dest.province}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{dest.searches} {'ครั้ง'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{dest.trend}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground mb-1">{'ราคาเฉลี่ย'}</div>
                  <div className="text-xl font-bold text-primary">{dest.avgPrice}</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
