import type { FC } from 'react'
import {
  IconUsersGroup,
  IconCertificate,
  IconShieldCheck,
  IconChartBar,
  IconDownload,
} from '@tabler/icons-react'

export const Mentoring: FC = () => {
  return (
    <section id="mentoring" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F27024] block mb-2">
            TÍNH NĂNG VẬN HÀNH TOÀN DIỆN
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Mọi công cụ điều phối nằm trong tầm tay
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Bộ công cụ chuyên biệt hóa dành riêng cho Ban Giám hiệu, Điều phối viên khoa và Cán bộ quản lý Đại học FPT.
          </p>
        </div>

        {/* 2x2 Elevated Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: User Directory & Multi-campus */}
          <div className="bg-gradient-to-br from-white via-white to-orange-50/20 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-orange-200 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100/80 text-[#F27024] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-2xs">
                <IconUsersGroup size={24} stroke={2} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-[#F27024] transition-colors">
                Quản lý Người dùng & An toàn Đa cơ sở
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                Tra cứu danh bạ cựu sinh viên, phân quyền vai trò (Admin, Moderator, Faculty) và thực thi tạm khóa/mở khóa tài khoản có kèm lý do vi phạm và nhật ký kiểm toán an ninh.
              </p>
            </div>

            {/* Interactive Preview Element */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cơ sở:</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-100">Hà Nội (Hòa Lạc)</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">TP. Hồ Chí Minh</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">Đà Nẵng</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">Cần Thơ</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">Quy Nhơn</span>
            </div>
          </div>

          {/* Card 2: Diploma Verification & Verified Badge */}
          <div className="bg-gradient-to-br from-white via-white to-blue-50/20 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-blue-200 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1B365D] border border-blue-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-2xs">
                <IconCertificate size={24} stroke={2} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-[#1B365D] transition-colors">
                Thẩm định Bằng cấp & Cấp Huy hiệu Verified
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                Hàng đợi kiểm duyệt bằng tốt nghiệp cựu sinh viên trực quan. Xét duyệt hồ sơ để cấp huy hiệu chính danh FPT Verified Alumni, phòng ngừa mạo danh uy tín nhà trường.
              </p>
            </div>

            {/* Interactive Preview Element */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold">Hàng đợi xét duyệt:</span>
                <span className="text-slate-500">Đối chiếu trực tiếp mã sinh viên (MSSV)</span>
              </div>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                1-Click Duyệt
              </span>
            </div>
          </div>

          {/* Card 3: Content Moderation & Safety */}
          <div className="bg-gradient-to-br from-white via-white to-emerald-50/20 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-emerald-200 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-2xs">
                <IconShieldCheck size={24} stroke={2} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                Kiểm duyệt Báo cáo & An toàn Diễn đàn
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                Tiếp nhận báo cáo vi phạm bài viết, bình luận từ cộng đồng. Cho phép gỡ bài vi phạm, cảnh cáo tài khoản hoặc bác bỏ báo cáo sai, duy trì diễn đàn thảo luận lành mạnh.
              </p>
            </div>

            {/* Interactive Preview Element */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Hành động khả dụng:</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="px-2 py-0.5 rounded bg-slate-100">Ẩn bài viết</span>
                <span className="px-2 py-0.5 rounded bg-slate-100">Cảnh cáo</span>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">Tạm khóa</span>
              </div>
            </div>
          </div>

          {/* Card 4: Analytics & CSV Data Export */}
          <div className="bg-gradient-to-br from-white via-white to-sky-50/20 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-sky-200 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-2xs">
                <IconChartBar size={24} stroke={2} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-sky-700 transition-colors">
                Thống kê Hệ thống & Xuất Báo cáo CSV
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                Bảng điều khiển trực quan hóa phân bổ chuyên ngành, tỷ lệ tương tác mentor, dòng sự kiện quản trị và tính năng xuất file bảng tính CSV phục vụ báo cáo định kỳ.
              </p>
            </div>

            {/* Interactive Preview Element */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <IconDownload size={14} className="text-sky-600" />
                <span className="font-semibold">Xuất CSV:</span>
                <span className="text-slate-500">Audit logs & Danh bạ thành viên</span>
              </div>
              <span className="font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                Chuẩn UTF-8
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
