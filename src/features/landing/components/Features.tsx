import type { FC } from 'react'
import {
  IconLockCheck,
  IconEyeCheck,
  IconSpeakerphone,
} from '@tabler/icons-react'

interface StepItem {
  number: string
  title: string
  subtitle: string
  description: string
  icon: typeof IconLockCheck
  highlight?: boolean
}

const STEPS: StepItem[] = [
  {
    number: '01',
    title: 'Xác thực & Phân quyền Bảo mật',
    subtitle: 'Đăng nhập định danh đại học',
    description: 'Truy cập an toàn qua tài khoản cán bộ quản trị FPT Education hoặc Google Workspace (@fpt.edu.vn). Áp dụng mô hình RBAC phân định quyền hạn chặt chẽ.',
    icon: IconLockCheck,
  },
  {
    number: '02',
    title: 'Giám sát & Điều phối Tức thời',
    subtitle: 'Vận hành các luồng nghiệp vụ',
    description: 'Theo dõi chỉ số mạng lưới, tiếp nhận hàng đợi báo cáo vi phạm, thẩm định bằng tốt nghiệp cựu sinh viên và điều phối cơ hội thực tập OJT.',
    icon: IconEyeCheck,
    highlight: true,
  },
  {
    number: '03',
    title: 'Phát hành Thông báo & Phát triển',
    subtitle: 'Kết nối mạng lưới cựu sinh viên',
    description: 'Phát sóng thông báo toàn trường, ghim thông báo chuyên khoa và xuất báo cáo dữ liệu định kỳ phục vụ chiến lược kết nối cựu sinh viên.',
    icon: IconSpeakerphone,
  },
]

export const Features: FC = () => {
  return (
    <section id="features" className="bg-slate-50/80 border-t border-slate-200/60 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 lg:mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F27024] block mb-2">
            QUY TRÌNH VẬN HÀNH CHUẨN MỰC
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Ba bước để quản trị & điều phối mạng lưới
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Quy trình điều hành khép kín, minh bạch và tuân thủ các quy định bảo mật dữ liệu của Đại học FPT.
          </p>
        </div>

        {/* 3 Step Timeline Cards */}
        <div className="relative">
          {/* Subtle horizontal connecting line on desktop */}
          <div className="hidden lg:block absolute top-10 left-16 right-16 h-0.5 bg-slate-200/90 -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className={`rounded-3xl p-6 sm:p-8 border transition-all flex flex-col justify-between ${
                    step.highlight
                      ? 'bg-white border-orange-300/80 shadow-lg shadow-orange-950/5 ring-1 ring-orange-200'
                      : 'bg-white border-slate-200/80 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-base shadow-xs ${
                          step.highlight
                            ? 'bg-[#F27024] text-white shadow-orange-500/25'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {step.number}
                      </div>

                      {step.highlight ? (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-[#F27024] border border-orange-200/80 uppercase tracking-wider">
                          Trọng tâm
                        </span>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <Icon size={18} stroke={1.8} />
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] font-semibold text-[#F27024] uppercase tracking-wider block mb-1">
                      {step.subtitle}
                    </span>

                    <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2.5 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {step.description}
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
