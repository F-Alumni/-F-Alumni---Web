import type { FC } from 'react'
import {
  IconUsers,
  IconShieldCheck,
  IconCertificate,
} from '@tabler/icons-react'

interface PillarItem {
  id: string
  title: string
  subtitle: string
  description: string
  icon: typeof IconUsers
  tag: string
}

const PILLARS: PillarItem[] = [
  {
    id: '01',
    title: 'Quản trị Danh bạ Đa cơ sở',
    subtitle: 'Đồng bộ định danh & Phân quyền',
    description: 'Quản lý tập trung tài khoản sinh viên, cựu sinh viên và giảng viên tại Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ, Quy Nhơn.',
    icon: IconUsers,
    tag: 'Identity & Access',
  },
  {
    id: '02',
    title: 'Kiểm duyệt & An toàn Nội dung',
    subtitle: 'Giám sát chuẩn mực thảo luận',
    description: 'Hàng đợi xử lý vi phạm tức thời, bảo vệ không gian chia sẻ học thuật và kinh nghiệm nghề nghiệp văn minh.',
    icon: IconShieldCheck,
    tag: 'Community Trust',
  },
  {
    id: '03',
    title: 'Thẩm định Bằng & Kết nối OJT',
    subtitle: 'Chứng nhận cựu sinh viên chính quy',
    description: 'Xét duyệt huy hiệu Verified Alumni, kết nối cố vấn học tập và cơ hội việc làm thực tập độc quyền.',
    icon: IconCertificate,
    tag: 'Verified Network',
  },
]

export const Networking: FC = () => {
  return (
    <section id="networking" className="bg-slate-50/80 border-y border-slate-200/60 py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10 lg:gap-14">
          {/* Section Headline */}
          <div className="lg:w-1/3 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F27024] block">
              TRỤ CỘT ĐIỀU HÀNH
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Một nền tảng —
              <br />
              quản trị toàn diện mạng lưới.
            </h2>
            <div className="w-14 h-1.5 bg-[#F27024] rounded-full" />
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-1">
              Được thiết kế đáp ứng các tiêu chuẩn quản trị học thuật chuẩn mực, giúp ban điều phối trường kiểm soát và vận hành mạng lưới hiệu quả.
            </p>
          </div>

          {/* 3 Pillar Cards in a responsive grid */}
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div
                  key={pillar.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-orange-200 hover:-translate-y-1 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F27024] group-hover:bg-[#F27024] group-hover:text-white transition-colors shadow-2xs">
                        <Icon size={20} stroke={2} />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-[#F27024] transition-colors">
                        #{pillar.id}
                      </span>
                    </div>

                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-[#F27024] bg-orange-50/70 px-2 py-0.5 rounded mb-2">
                      {pillar.tag}
                    </span>

                    <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      {pillar.subtitle}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed mt-3 pt-3 border-t border-slate-100">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
