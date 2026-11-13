import type { FC } from 'react'
import {
  IconUsersGroup,
  IconCertificate,
  IconShieldCheck,
  IconChartBar,
  IconSparkles,
} from '@tabler/icons-react'

export const Mentoring: FC = () => {
  return (
    <section id="mentoring" className="bg-white py-16 sm:py-20 lg:py-24 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-[#F27024] uppercase tracking-wider mb-3">
            <IconSparkles size={14} />
            GIAO DIỆN HỆ THỐNG THỰC TẾ
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Mọi tính năng vận hành nằm trong tầm tay
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Xem trước ảnh chụp màn hình thực tế từ các phân hệ quản trị đang vận hành, đảm bảo tính minh bạch và độ tin cậy tuyệt đối của nền tảng F-Alumni Connect.
          </p>
        </div>

        {/* 2x2 Elevated Feature Bento Grid with Real UI Previews inside browser frames */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          
          {/* Feature 1: Quản lý người dùng */}
          <div className="bg-slate-50/70 rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-orange-100 text-[#F27024] flex items-center justify-center shadow-sm">
                  <IconUsersGroup size={22} stroke={2} />
                </div>
                <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  Phân hệ Users
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Quản lý Người dùng & Danh bạ Đa cơ sở
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tra cứu danh bạ cựu sinh viên theo chuyên ngành, khóa tốt nghiệp và thực thi phân quyền, tạm khóa tài khoản kèm lý do vi phạm.
              </p>
            </div>

            {/* Browser Frame with Real Screenshot */}
            <div className="rounded-2xl bg-white border border-slate-200/90 shadow-md overflow-hidden">
              <div className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 border-b border-slate-200 text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[10px] text-slate-500">
                  /admin/users (Danh bạ & Trạng thái tài khoản)
                </span>
              </div>
              <div className="aspect-[16/10] overflow-hidden bg-slate-100 group">
                <img
                  src="/images/admin-previews/users-management.png"
                  alt="Ảnh chụp màn hình phân hệ Quản lý Người dùng F-Alumni"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-3 bg-white border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Bộ lọc Cơ sở, Khóa K, Ngành học & Tạm khóa</span>
                <span className="font-bold text-[#F27024]">Ảnh chụp thực tế</span>
              </div>
            </div>
          </div>

          {/* Feature 2: Thẩm định bằng cấp */}
          <div className="bg-slate-50/70 rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1B365D] border border-blue-100 flex items-center justify-center shadow-sm">
                  <IconCertificate size={22} stroke={2} />
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Phân hệ Verification
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Thẩm định Bằng cấp & Cấp Huy hiệu Verified
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hàng đợi kiểm duyệt bằng tốt nghiệp cựu sinh viên trực quan. Xét duyệt hồ sơ để cấp huy hiệu chính danh FPT Verified Alumni.
              </p>
            </div>

            {/* Browser Frame with Real Screenshot */}
            <div className="rounded-2xl bg-white border border-slate-200/90 shadow-md overflow-hidden">
              <div className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 border-b border-slate-200 text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[10px] text-slate-500">
                  /admin/alumni-verification (Xét duyệt hồ sơ)
                </span>
              </div>
              <div className="aspect-[16/10] overflow-hidden bg-slate-100 group">
                <img
                  src="/images/admin-previews/alumni-verification.png"
                  alt="Ảnh chụp màn hình phân hệ Thẩm định Bằng cấp F-Alumni"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-3 bg-white border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Duyệt/Từ chối 1-chạm & Xem văn bằng đính kèm</span>
                <span className="font-bold text-blue-600">Ảnh chụp thực tế</span>
              </div>
            </div>
          </div>

          {/* Feature 3: Kiểm duyệt diễn đàn */}
          <div className="bg-slate-50/70 rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shadow-sm">
                  <IconShieldCheck size={22} stroke={2} />
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Phân hệ Moderation
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Kiểm duyệt Báo cáo & An toàn Diễn đàn
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tiếp nhận báo cáo vi phạm bài viết, bình luận. Cho phép gỡ bài vi phạm, cảnh cáo tài khoản hoặc bác bỏ báo cáo sai.
              </p>
            </div>

            {/* Browser Frame with Real Screenshot */}
            <div className="rounded-2xl bg-white border border-slate-200/90 shadow-md overflow-hidden">
              <div className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 border-b border-slate-200 text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[10px] text-slate-500">
                  /admin/reports (Hàng đợi xử lý vi phạm)
                </span>
              </div>
              <div className="aspect-[16/10] overflow-hidden bg-slate-100 group">
                <img
                  src="/images/admin-previews/moderation-reports.png"
                  alt="Ảnh chụp màn hình phân hệ Kiểm duyệt Báo cáo F-Alumni"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-3 bg-white border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Tab Chờ xử lý, Lịch sử kỷ luật & Lý do xử phạt</span>
                <span className="font-bold text-emerald-600">Ảnh chụp thực tế</span>
              </div>
            </div>
          </div>

          {/* Feature 4: Phân tích & Báo cáo CSV */}
          <div className="bg-slate-50/70 rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center shadow-sm">
                  <IconChartBar size={22} stroke={2} />
                </div>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  Phân hệ Analytics
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Phân tích Tăng trưởng & Báo cáo CSV
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Biểu đồ tỷ lệ phân bổ chuyên ngành, cơ sở và tính năng xuất file báo cáo audit log chuẩn UTF-8 phục vụ công tác thanh tra.
              </p>
            </div>

            {/* Browser Frame with Real Screenshot */}
            <div className="rounded-2xl bg-white border border-slate-200/90 shadow-md overflow-hidden">
              <div className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 border-b border-slate-200 text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[10px] text-slate-500">
                  /admin/analytics (Chỉ số & Audit Trail)
                </span>
              </div>
              <div className="aspect-[16/10] overflow-hidden bg-slate-100 group">
                <img
                  src="/images/admin-previews/analytics-audit.png"
                  alt="Ảnh chụp màn hình phân hệ Phân tích Thống kê F-Alumni"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-3 bg-white border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Thống kê 5 cơ sở & Xuất Audit Logs UTF-8</span>
                <span className="font-bold text-purple-600">Ảnh chụp thực tế</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
