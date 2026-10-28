import type { FC } from 'react'

interface PillarItem {
  id: string
  title: string
  subtitle: string
}

const PILLARS: PillarItem[] = [
  {
    id: '01',
    title: 'Kết nối thật',
    subtitle: 'Mở rộng network',
  },
  {
    id: '02',
    title: 'Học từ trải nghiệm',
    subtitle: 'Chia sẻ kiến thức',
  },
  {
    id: '03',
    title: 'Cơ hội rõ ràng',
    subtitle: 'Nghề nghiệp & mentor',
  },
]

export const Networking: FC = () => {
  return (
    <section id="networking" className="bg-slate-50/70 border-y border-slate-200/60 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">
          {/* Section Headline */}
          <div className="lg:w-1/3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              Một cộng đồng —
              <br />
              nhiều cách để tiến xa
            </h2>
            <div className="w-12 h-1 bg-[#F27024] rounded-full mt-3" />
          </div>

          {/* 3 Pillar Cards in a responsive grid */}
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F27024] font-mono font-bold text-xs mb-3 group-hover:bg-[#F27024] group-hover:text-white transition-colors">
                  {pillar.id}
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  {pillar.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {pillar.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
