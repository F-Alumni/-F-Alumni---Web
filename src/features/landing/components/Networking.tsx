import type { FC } from 'react'
import {
  IconUsers,
  IconShieldCheck,
  IconCertificate,
  IconLockCheck,
  IconCamera,
} from '@tabler/icons-react'

interface PillarItem {
  id: string
  title: string
  subtitle: string
  description: string
  icon: typeof IconUsers
  tag: string
  metrics: string
  features: string[]
}

const PILLARS: PillarItem[] = [
  {
    id: '01',
    title: 'Quản trị Danh bạ & Phân quyền Đa cơ sở',
    subtitle: 'Đồng bộ định danh & Phân quyền RBAC',
    description: 'Quản lý tập trung tài khoản sinh viên, cựu sinh viên và giảng viên tại Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ, Quy Nhơn theo tiêu chuẩn bảo mật danh tính.',
    icon: IconUsers,
    tag: 'Identity & Access',
    metrics: '5 Cơ sở Đồng bộ',
    features: [
      'Phân quyền 3 tầng: Admin, Moderator, Faculty',
      'Định danh theo email trường (@fpt.edu.vn)',
      'Tạm khóa tài khoản kèm lý do vi phạm an ninh',
    ],
  },
  {
    id: '02',
    title: 'Kiểm duyệt Báo cáo & An toàn Diễn đàn',
    subtitle: 'Giám sát chuẩn mực thảo luận văn minh',
    description: 'Hàng đợi xử lý vi phạm tức thời, bảo vệ không gian chia sẻ học thuật và kinh nghiệm nghề nghiệp lành mạnh cho toàn bộ sinh viên và cựu sinh viên.',
    icon: IconShieldCheck,
    tag: 'Community Trust',
    metrics: 'Giám sát 24/7',
    features: [
      'Tiếp nhận báo cáo vi phạm tức thời từ cộng đồng',
      'Thao tác 1-chạm: Ẩn bài viết, Cảnh cáo, Khóa',
      'Lưu trữ hồ sơ xử phạt và nhật ký kiểm toán',
    ],
  },
  {
    id: '03',
    title: 'Thẩm định Bằng & Kết nối OJT',
    subtitle: 'Chứng nhận cựu sinh viên chính quy',
    description: 'Xét duyệt hồ sơ cấp huy hiệu Verified Alumni, chống mạo danh uy tín trường và điều phối cơ hội cố vấn đồ án tốt nghiệp, thực tập doanh nghiệp.',
    icon: IconCertificate,
    tag: 'Academic Verification',
    metrics: 'Khớp 100% MSSV',
    features: [
      'Đối chiếu dữ liệu với phòng Đào tạo FPT',
      'Cấp huy hiệu Verified Alumni chính thức',
      'Kết nối cựu sinh viên tuyển dụng OJT & Mentor',
    ],
  },
]

export const Networking: FC = () => {
  return (
    <section id="networking" className="bg-slate-50/80 border-b border-slate-200/70 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Headline */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-[#F27024] uppercase tracking-wider mb-3">
            <IconLockCheck size={14} />
            TRỤ CỘT ĐIỀU HÀNH HỆ THỐNG
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Một nền tảng — Quản trị toàn diện mạng lưới cựu sinh viên.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Được thiết kế đáp ứng các tiêu chuẩn quản trị học thuật chuẩn mực, giúp ban điều phối trường kiểm soát và vận hành mạng lưới hiệu quả trên toàn quốc.
          </p>
        </div>

        {/* 3 Pillar Bento Cards in a responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-orange-200 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100/90 flex items-center justify-center text-[#F27024] group-hover:bg-[#F27024] group-hover:text-white transition-colors shadow-2xs">
                      <Icon size={24} stroke={2} />
                    </div>
                    <span className="font-mono text-sm font-black text-slate-300 group-hover:text-[#F27024] transition-colors">
                      #{pillar.id}
                    </span>
                  </div>

                  <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-[#F27024] bg-orange-50 px-2.5 py-1 rounded-md mb-2.5 border border-orange-100/80">
                    {pillar.tag}
                  </span>

                  <h3 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    {pillar.subtitle}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mt-3.5 pt-3.5 border-t border-slate-100">
                    {pillar.description}
                  </p>

                  {/* Bullet feature list */}
                  <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3.5">
                    {pillar.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F27024] mt-1.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                    {pillar.metrics}
                  </span>
                  <a
                    href="#mentoring"
                    className="text-xs font-bold text-[#F27024] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                  >
                    Xem chi tiết &rarr;
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {/* Supporting Real Event Proof Banner */}
        <div className="mt-12 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200">
              <img
                src="/images/fpt-photos/alumni-networking-event.jpg"
                alt="FPT Alumni Networking Event"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Sự kiện Giao lưu & Kết nối Cựu sinh viên FPT (Networking Event)
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Official FPT Event
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Các sự kiện kết nối thực tế được lưu vết và bảo chứng trên nền tảng quản trị trung tâm của trường.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0">
            <IconCamera size={16} className="text-[#F27024]" />
            <span>Nguồn ảnh: Đại học FPT (daihoc.fpt.edu.vn)</span>
          </div>
        </div>

      </div>
    </section>
  )
}
