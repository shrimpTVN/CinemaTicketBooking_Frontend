import { useNavigate } from 'react-router-dom';

export default function FailureScreen({ onRestart }) {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto py-8 text-center flex flex-col items-center">
      {/* Main White Card matching the screenshot */}
      <div
        className="w-full rounded-2xl relative shadow-2xl overflow-hidden flex flex-col text-left mb-6 p-8 border"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(0, 0, 0, 0.08)',
          color: '#1A1A1A'
        }}
      >
        {/* Top visual warning stripe */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#EF4444]" />

        {/* Illustration & Status */}
        <div className="flex flex-col items-center text-center mt-4 mb-6">
          {/* Custom SVG Sad Robot matching the screenshot cap/robot style */}
          <div className="w-24 h-24 mb-4 relative flex items-center justify-center">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              {/* Cap / Hat */}
              <path d="M25 35 C25 20, 75 20, 75 35 Z" fill="#0A2540" />
              <rect x="35" y="32" width="30" height="4" fill="#F59E0B" rx="1" />
              {/* Cap peak */}
              <path d="M20 35 L80 35 L75 39 L25 39 Z" fill="#061B30" />
              
              {/* Robot Face / Head */}
              <rect x="30" y="39" width="40" height="32" rx="6" fill="#0F172A" />
              <rect x="34" y="43" width="32" height="24" rx="4" fill="#1E293B" />
              
              {/* Eyes */}
              <circle cx="43" cy="53" r="3" fill="#EF4444" />
              <circle cx="57" cy="53" r="3" fill="#EF4444" />
              {/* Sad Mouth */}
              <path d="M44 63 Q50 58 56 63" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              
              {/* Speech bubble "Ôi..." */}
              <path d="M68 25 C68 18, 88 18, 88 25 C88 32, 75 32, 68 25 Z" fill="#E2E8F0" />
              <text x="74" y="24" fontSize="8" fontWeight="bold" fill="#0F172A" fontFamily="sans-serif">Ôi...</text>
            </svg>
          </div>

          <h2 className="text-[#1A1A1A] font-bold text-2xl tracking-tight">Xuất vé thất bại</h2>
        </div>

        {/* Text descriptions matching the screenshot */}
        <div className="flex flex-col gap-4 text-zinc-600 text-sm leading-relaxed px-2 font-medium">
          <p>
            Trường hợp giao dịch chưa thành công, quý khách vui lòng không thực hiện giao dịch online lần nữa và tới rạp <span className="font-bold text-[#1A1A1A]">Galaxy Cinema</span> gần nhất để mua vé.
          </p>
          <p>
            Việc phản hồi tới quý khách có thể bị chậm trễ, mong quý khách thông cảm và kiên nhẫn cùng nhân viên CSKH của Galaxy Cinema.
          </p>
          <p>
            Chúng tôi cam kết sẽ hoàn lại <span className="font-bold text-[#EF4444]">100%</span> giá trị giao dịch lỗi đã bị trừ tiền sau khi đội ngũ CSKH kiểm tra và xác nhận. Vui lòng gửi thông tin giao dịch lỗi về email <a href="mailto:supports@galaxystudio.vn" className="text-blue-600 hover:underline">supports@galaxystudio.vn</a> hoặc tin nhắn trang fanpage <a href="https://www.facebook.com/galaxycinevn" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">https://www.facebook.com/galaxycinevn</a>
          </p>
        </div>

        {/* Home Action Button inside card */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-lg text-white font-bold text-sm transition-all cursor-pointer hover:bg-opacity-90"
            style={{ backgroundColor: '#F26F21' }}
          >
            Quay Về Trang Chủ
          </button>
        </div>
      </div>

      {/* Try again from beginning button outside the card */}
      <button
        onClick={onRestart}
        className="w-full bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/8 text-white py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer mt-2"
      >
        Hủy giao dịch & đặt lại
      </button>
    </div>
  );
}
