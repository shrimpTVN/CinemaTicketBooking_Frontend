export default function EmailModal({
  open,
  onClose,
  handleSaveEmail,
  newEmailForm,
  setNewEmailForm,
  emailErrors,
  setEmailErrors,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-xs select-none">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-[420px] mx-4 bg-zinc-955 border border-zinc-850 rounded-2xl p-6 md:p-8 shadow-2xl z-10 animate-slide-down" style={{ background: '#1C1C1E' }}>
        <h3 className="text-heading2 font-bold text-white mb-6 border-b border-zinc-850 pb-3">
          Thay đổi email
        </h3>

        <form onSubmit={handleSaveEmail} className="space-y-4">
          {/* New Email */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-body3 text-text-sub2 font-semibold">Email mới</label>
            <div className="relative">
              <input
                type="email"
                name="newEmail"
                value={newEmailForm.newEmail}
                onChange={(e) => {
                  setNewEmailForm({ newEmail: e.target.value });
                  if (emailErrors.newEmail) setEmailErrors({});
                }}
                placeholder="Nhập email mới"
                className="w-full h-[42px] bg-[#333333]/60 text-white rounded-lg pl-4 pr-4 border border-zinc-700/60 text-body3 placeholder-zinc-500 light-cast-input"
                autoFocus
              />
            </div>
            {emailErrors.newEmail && (
              <span className="text-red-500 text-[11px] mt-1">{emailErrors.newEmail}</span>
            )}
          </div>

          {/* Modal Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="text-body3 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-text-sub2 px-5 py-2 rounded font-bold cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="text-body3 bg-cta hover:bg-cta-light text-text-main px-5 py-2 rounded font-bold cursor-pointer transition-colors"
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
