export default function PrivacyTab() {
  return (
    <div className="relative z-10 flex flex-col gap-6 text-left">
      <h3 className="text-subtitle font-bold text-white pb-2 border-b border-zinc-800/60 text-lg">
        Chính sách bảo mật thông tin
      </h3>
      
      <div className="flex flex-col gap-5 text-body3 text-zinc-400 leading-relaxed h-[360px] overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <h4 className="font-bold text-zinc-300 text-body2 mb-1">1. Thu thập thông tin cá nhân</h4>
          <p className="text-zinc-500 text-body3">
            Chúng tôi thu thập các thông tin cá nhân khi bạn đăng ký tài khoản thành viên, bao gồm họ tên, địa chỉ email, số điện thoại và ngày sinh để xác nhận danh tính và cung cấp các dịch vụ đặt vé trực tuyến thuận tiện nhất.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-zinc-300 text-body2 mb-1">2. Sử dụng thông tin của bạn</h4>
          <p className="text-zinc-500 text-body3">
            Thông tin của bạn sẽ được sử dụng cho việc xử lý đơn hàng vé xem phim, gửi thư điện tử xác nhận đặt chỗ, thông báo các chương trình khuyến mãi tích sao đổi quà, và liên lạc khi cần thiết để hỗ trợ khách hàng.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-zinc-300 text-body2 mb-1">3. Bảo mật dữ liệu người dùng</h4>
          <p className="text-zinc-500 text-body3">
            Logo Cinema cam kết bảo vệ thông tin cá nhân của khách hàng bằng các phương thức bảo mật kỹ thuật số tiên tiến nhất. Dữ liệu của bạn được mã hóa an toàn và không chia sẻ cho bất kỳ bên thứ ba nào khi không có sự đồng ý của bạn.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-zinc-300 text-body2 mb-1">4. Quyền chỉnh sửa và xóa thông tin</h4>
          <p className="text-zinc-500 text-body3">
            Bạn có quyền chỉnh sửa các thông tin cá nhân trong trang cài đặt tài khoản bất kỳ lúc nào. Nếu bạn muốn vô hiệu hóa hoặc xóa bỏ tài khoản của mình khỏi hệ thống, vui lòng liên hệ với bộ phận CSKH để được trợ giúp nhanh nhất.
          </p>
        </div>
      </div>
    </div>
  );
}
