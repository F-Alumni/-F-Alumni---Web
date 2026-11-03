import type { FC } from 'react'
import {
  IconUsersGroup,
  IconCertificate,
  IconShieldCheck,
  IconChartBar,
} from '@tabler/icons-react'

interface FeatureValue {
  id: string
  title: string
  description: string
  icon: typeof IconUsersGroup
  iconBg: string
  iconColor: string
}

const VALUES: FeatureValue[] = [
  {
    id: 'user-management',
    title: 'Quản lý Người dùng & An toàn',
    description: 'Tra cứu danh bạ, quản lý cờ quyền riêng tư và điều phối lệnh khóa tài khoản vi phạm.',
    icon: IconUsersGroup,
    iconBg: 'bg-orange-100/80',
    iconColor: 'text-[#F27024]',
  },
  {
    id: 'alumni-verification',
    title: 'Xác minh Hồ sơ Cựu sinh viên',
    description: 'Thẩm định hồ sơ bằng cấp, xét duyệt huy hiệu xác minh cựu sinh viên chính quy Đại học FPT.',
    icon: IconCertificate,
    iconBg: 'bg-navy-50 border border-navy-100',
    iconColor: 'text-[#1B365D]',
  },
  {
    id: 'content-moderation',
    title: 'Kiểm duyệt Báo cáo & Nội dung',
    description: 'Tiếp nhận báo cáo vi phạm, kiểm duyệt bài đăng diễn đàn và duy trì văn hóa thảo luận lành mạnh.',
    icon: IconShieldCheck,
    iconBg: 'bg-emerald-50 border border-emerald-100',
    iconColor: 'text-[#15803D]',
  },
  {
    id: 'analytics-reports',
    title: 'Thống kê & Báo cáo Tương tác',
    description: 'Theo dõi các chỉ số tăng trưởng thành viên, số lượng kết nối mentor và cơ hội việc làm theo thời gian thực.',
    icon: IconChartBar,
    iconBg: 'bg-sky-50 border border-sky-100',
    iconColor: 'text-[#0369A1]',
  },
]

export const Mentoring: FC = () => {
  return (
    <section id="mentoring" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F27024] block mb-2">
            CHỨC NĂNG QUẢN TRỊ NỀN TẢNG
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Mọi công cụ vận hành nằm trong tầm tay
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Hệ thống hỗ trợ toàn diện các nghiệp vụ quản trị, kiểm duyệt và phân tích số liệu mạng lưới FPT Alumni.
          </p>
        </div>

        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {VALUES.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:border-slate-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight group-hover:text-[#F27024] transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
