import type { FC } from 'react'
import {
  IconArrowUpRight,
  IconUsersGroup,
  IconBriefcase,
  IconHeartHandshake,
} from '@tabler/icons-react'

interface FeatureValue {
  id: string
  title: string
  description: string
  icon: typeof IconArrowUpRight
  iconBg: string
  iconColor: string
}

const VALUES: FeatureValue[] = [
  {
    id: 'mentorship',
    title: 'Mentorship',
    description: 'Tìm mentor phù hợp, nhận lời khuyên từ người đi trước.',
    icon: IconArrowUpRight,
    iconBg: 'bg-orange-100/80',
    iconColor: 'text-[#F27024]',
  },
  {
    id: 'communities',
    title: 'Cộng đồng chuyên ngành',
    description: 'Thảo luận, chia sẻ dự án và học hỏi cùng những người cùng lĩnh vực.',
    icon: IconUsersGroup,
    iconBg: 'bg-blue-100/80',
    iconColor: 'text-[#0066B2]',
  },
  {
    id: 'opportunities',
    title: 'Cơ hội nghề nghiệp',
    description: 'Khám phá việc làm, thực tập và cơ hội phát triển sự nghiệp.',
    icon: IconBriefcase,
    iconBg: 'bg-emerald-100/80',
    iconColor: 'text-[#0DB04B]',
  },
  {
    id: 'alumni',
    title: 'Kết nối alumni',
    description: 'Tìm kiếm cựu sinh viên và xây dựng mối quan hệ lâu dài.',
    icon: IconHeartHandshake,
    iconBg: 'bg-indigo-100/80',
    iconColor: 'text-indigo-600',
  },
]

export const Mentoring: FC = () => {
  return (
    <section id="mentoring" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F27024] block mb-2">
            KHÁM PHÁ GIÁ TRỊ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Cơ hội bắt đầu từ một kết nối
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Tất cả những gì bạn cần để học hỏi, sẻ chia và phát triển cùng cộng đồng FPT.
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
