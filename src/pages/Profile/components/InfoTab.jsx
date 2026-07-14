import { CircleUser, Calendar, Mail, Phone, Lock, Edit3, X, Check } from 'lucide-react';

export default function InfoTab({
  user,
  formData,
  errors,
  handleInputChange,
  isEditing,
  handleCancelEdit,
  handleSaveInfo,
  setIsEditing,
  setIsEmailModalOpen,
  setIsPasswordModalOpen,
}) {
  return (
    <div className="relative z-10 flex flex-col gap-6 text-left">
      {/* Personal Information Header Row */}
      <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
        <h3 className="text-subtitle font-bold text-white text-lg">
          Thông tin cá nhân
        </h3>
        
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={handleCancelEdit}
              className="text-body3 border border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-text-sub2 px-4 py-1.5 rounded font-bold cursor-pointer transition-colors flex items-center gap-1.5"
              style={{ background: '#27272A' }}
            >
              <X className="w-3.5 h-3.5" />
              Hủy
            </button>
            <button
              onClick={handleSaveInfo}
              className="text-body3 bg-cta hover:bg-cta-light text-white px-4 py-1.5 rounded font-bold cursor-pointer transition-colors flex items-center gap-1.5"
              style={{ background: '#CF0F47' }}
            >
              <Check className="w-3.5 h-3.5" />
              Lưu
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-body3 bg-zinc-800 border border-zinc-700 hover:bg-zinc-750 text-white px-4 py-1.5 rounded font-bold cursor-pointer transition-colors flex items-center gap-1.5 select-none"
            style={{ background: '#27272A' }}
          >
            <Edit3 className="w-3.5 h-3.5 text-text-sub2" />
            Chỉnh sửa
          </button>
        )}
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {/* Full Name */}
        <div className="flex flex-col space-y-2">
          <label className="text-label-custom text-text-sub2 font-semibold text-zinc-400">Họ và tên</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
              <CircleUser className="w-4.5 h-4.5" strokeWidth={1.5} />
            </span>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Họ và tên"
              className={`w-full h-[42px] text-white rounded-lg pl-11 pr-4 border text-body3 placeholder-zinc-500 transition-all ${
                isEditing
                  ? 'bg-[#333333]/60 border-zinc-700/60 light-cast-input'
                  : 'bg-[#333333]/30 border-zinc-800/40 opacity-70 cursor-not-allowed'
              }`}
            />
          </div>
          {errors.fullName && <span className="text-red-500 text-xs mt-1">{errors.fullName}</span>}
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col space-y-2">
          <label className="text-label-custom text-text-sub2 font-semibold text-zinc-400">Ngày sinh</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
              <Calendar className="w-4.5 h-4.5" />
            </span>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full h-[42px] text-white rounded-lg pl-11 pr-4 border text-body3 transition-all color-scheme-dark ${
                isEditing
                  ? 'bg-[#333333]/60 border-zinc-700/60 light-cast-input'
                  : 'bg-[#333333]/30 border-zinc-800/40 opacity-70 cursor-not-allowed'
              }`}
            />
          </div>
          {errors.birthday && <span className="text-red-500 text-xs mt-1">{errors.birthday}</span>}
        </div>

        {/* Email */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-label-custom text-text-sub2 font-semibold text-zinc-400">Email</label>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
              <Mail className="w-4.5 h-4.5" />
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled={true}
              placeholder="abc@gmail.com"
              className="w-full h-[42px] bg-[#333333]/30 text-white rounded-lg pl-11 pr-4 border border-zinc-800/40 text-body3 placeholder-zinc-500 transition-all opacity-70 cursor-not-allowed"
            />
          </div>
          {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email}</span>}
        </div>

        {/* Phone Number */}
        <div className="flex flex-col space-y-2">
          <label className="text-label-custom text-text-sub2 font-semibold text-zinc-400">Số điện thoại</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
              <Phone className="w-4.5 h-4.5" />
            </span>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="0123456789"
              className={`w-full h-[42px] text-white rounded-lg pl-11 pr-4 border text-body3 placeholder-zinc-500 transition-all ${
                isEditing
                  ? 'bg-[#333333]/60 border-zinc-700/60 light-cast-input'
                  : 'bg-[#333333]/30 border-zinc-800/40 opacity-70 cursor-not-allowed'
              }`}
            />
          </div>
          {errors.phoneNumber && <span className="text-red-500 text-xs mt-1">{errors.phoneNumber}</span>}
        </div>
      </div>

      <hr className="border-zinc-800 my-4" />

      {/* Password and Security Section */}
      <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60 text-left">
        <h3 className="text-subtitle font-bold text-white text-lg">
          Mật khẩu và bảo mật
        </h3>
        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="text-body3 border border-zinc-700 hover:bg-zinc-800 text-white px-4 py-1.5 rounded font-bold cursor-pointer transition-colors"
          style={{ background: '#27272A' }}
        >
          Thay đổi
        </button>
      </div>

      {/* Password input */}
      <div className="flex flex-col space-y-2 max-w-sm text-left">
        <label className="text-label-custom text-text-sub2 font-semibold text-zinc-400">Mật khẩu</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
            <Lock className="w-4.5 h-4.5" />
          </span>
          <input
            type="password"
            value="••••••••••••"
            disabled
            className="w-full h-[42px] bg-[#333333]/30 text-white rounded-lg pl-11 pr-4 border border-zinc-800/40 text-body3 transition-all opacity-70 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
