import type { FC } from 'react'
import {
  IconUserCheck,
  IconEyeCheck,
  IconRocket,
  IconShieldCheck,
  IconBuildingCommunity,
} from '@tabler/icons-react'

interface StepItem {
  step: string
  title: string
  subtitle: string
  description: string
  icon: typeof IconUserCheck
  highlight?: boolean
}

const STEPS: StepItem[] = [
  {
    step: '01',
    title: 'Xác thực & Phân quyền Bảo mật',
    subtitle: 'Đăng nhập định danh Đại học',
    description: 'Truy cập an toàn qua tài khoản cán bộ quản trị FPT Education hoặc Google Workspace (@fpt.edu.vn). Áp dụng mô hình RBAC phân định quyền hạn chặt chẽ theo từng cơ sở.',
    icon: IconUserCheck,
  },
  {
    step: '02',
    title: 'Giám sát & Điều phối Tức thời',
    subtitle: 'Vận hành các luồng nghiệp vụ',
    description: 'Theo dõi chỉ số mạng lưới, tiếp nhận hàng đợi báo cáo vi phạm, thẩm định bằng tốt nghiệp cựu sinh viên và điều phối cơ hội thực tập OJT.',
    icon: IconEyeCheck,
    highlight: true,
  },
  {
    step: '03',
    title: 'Phát hành Thông báo & Phát triển',
    subtitle: 'Kết nối mạng lưới cựu sinh viên',
    description: 'Phát sóng thông báo toàn trường, ghim thông báo chuyên khoa và xuất báo cáo dữ liệu định kỳ phục vụ chiến lược kết nối cựu sinh viên và doanh nghiệp.',
    icon: IconRocket,
  },
]

export const Features: FC = () => {
  return (
    <section id="features" className="bg-slate-50/70 py-16 sm:py-20 lg:py-24 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-[#F27024] uppercase tracking-wider mb-3">
            <IconShieldCheck size={14} />
            QUY TRÌNH ĐIỀU HÀNH CHUẨN MỰC
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Ba bước để quản trị & điều phối mạng lưới
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Quy trình điều hành khép kín, minh bạch và tuân thủ các quy định bảo mật dữ liệu của Đại học FPT.
          </p>
        </div>

        {/* 3 Steps with Connected Glowing Timeline */}
        <div className="relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-1/2 left-12 right-12 h-1 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 -translate-y-6 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {STEPS.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.step}
                  className={`rounded-3xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between ${
                    s.highlight
                      ? 'bg-gradient-to-b from-orange-50/70 to-white border-2 border-[#F27024] shadow-xl -translate-y-2'
                      : 'bg-white border border-slate-200/90 shadow-sm hover:shadow-lg'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-sm ${
                          s.highlight
                            ? 'bg-[#F27024] text-white'
                            : 'bg-orange-50 text-[#F27024] border border-orange-100'
                        }`}
                      >
                        <Icon size={24} stroke={2} />
                      </div>
                      <div className="flex items-center gap-2">
                        {s.highlight && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F27024] bg-orange-100/80 px-2 py-0.5 rounded-full">
                            Trọng tâm
                          </span>
                        )}
                        <span className="font-mono text-2xl font-black text-slate-300">
                          {s.step}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      {s.subtitle}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mt-3">
                      {s.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Real Convocation Photo Banner Supporting the Academic Workflow */}
        <div className="mt-14 rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-sm flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 aspect-[16/10] lg:aspect-auto lg:h-72 w-full overflow-hidden relative">
            <img
              src="/images/fpt-photos/fpt-convocation-2024.jpg"
              alt="FPT University Convocation Day 2024 Graduation Ceremony"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent lg:hidden" />
            <span className="absolute bottom-3 left-4 text-xs font-bold text-white bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm lg:hidden">
              Convocation Day 2024 · Đại học FPT
            </span>
          </div>
          <div className="lg:w-1/2 p-6 sm:p-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100 uppercase tracking-wider">
              <IconBuildingCommunity size={13} />
              Minh chứng thực tế từ Lễ Tốt nghiệp
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Gắn kết ba thế hệ: Sinh viên — Cựu sinh viên — Nhà trường
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mỗi khóa tốt nghiệp tại Đại học FPT là một cột mốc quan trọng để dữ liệu tân cử nhân được cập nhật vào danh bạ cựu sinh viên toàn quốc. Cổng quản trị F-Alumni đảm bảo quy trình kết nối không bao giờ đứt gãy sau ngày lễ nhận bằng.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 font-medium">
              Nguồn tư liệu: <em>Convocation Day 2024 — Trường Đại học FPT (daihoc.fpt.edu.vn)</em>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
