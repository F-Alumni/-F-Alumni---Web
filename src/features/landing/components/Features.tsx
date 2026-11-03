import type { FC } from 'react'

interface StepItem {
  number: string
  title: string
  description: string
  highlight?: boolean
}

const STEPS: StepItem[] = [
  {
    number: '01',
    title: 'Xác thực & Phân quyền',
    description: 'Đăng nhập bảo mật qua tài khoản Quản trị viên FPT Education hoặc Google Workspace (@fpt.edu.vn).',
  },
  {
    number: '02',
    title: 'Giám sát & Điều phối',
    description: 'Theo dõi chỉ số mạng lưới, tiếp nhận báo cáo nội dung và thẩm định hồ sơ cựu sinh viên.',
    highlight: true,
  },
  {
    number: '03',
    title: 'Ra quyết định & Tối ưu',
    description: 'Ban hành cảnh cáo, điều phối danh mục cộng đồng và thúc đẩy mạng lưới alumni phát triển.',
  },
]

export const Features: FC = () => {
  return (
    <section id="features" className="bg-slate-50/70 border-t border-slate-200/60 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 lg:mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F27024] block mb-2">
            QUY TRÌNH VẬN HÀNH CHUẨN MỰC
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Ba bước để quản trị & điều phối mạng lưới
          </h2>
        </div>

        {/* 3 Step Timeline Cards */}
        <div className="relative">
          {/* Subtle horizontal connecting line on desktop */}
          <div className="hidden lg:block absolute top-6 left-12 right-12 h-0.5 bg-slate-200/80 -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-base font-bold font-mono transition-transform ${
                        step.highlight
                          ? 'bg-[#F27024] text-white shadow-md shadow-orange-500/25 scale-105'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {step.number}
                    </span>
                    {step.highlight && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-[#F27024] border border-orange-200">
                        Cốt lõi
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
