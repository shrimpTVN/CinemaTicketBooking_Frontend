import { useState, useEffect, useMemo } from 'react';
import {
  getAllHalls,
  createHall,
  updateHall,
  getAllHallTypes,
  getAllSeatTypes,
  getHallSeatMap,
  updateHallSeatMap,
  generateHallSeatMap,
  createHallType,
  updateHallType
} from '../../../services/hallService';

// Tiện ích chuyển chỉ số hàng thành ký tự A, B, C...
const getRowLabel = (index) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (index < 26) return chars[index];
  // Dự phòng cho rạp siêu lớn
  return `R${index + 1}`;
};

export default function AdminHalls() {
  const [activeTab, setActiveTab] = useState('halls'); // 'halls' | 'types'
  const [halls, setHalls] = useState([]);
  const [hallTypes, setHallTypes] = useState([]);
  const [seatTypes, setSeatTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // States cho modal phòng chiếu (Halls)
  const [hallModalOpen, setHallModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState(null);
  const [hallForm, setHallForm] = useState({ name: '', width: 10, height: 8, hallTypeId: '' });
  const [hallFormErrors, setHallFormErrors] = useState({});
  const [savingHall, setSavingHall] = useState(false);

  // States cho modal loại phòng chiếu (Hall Types)
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeForm, setTypeForm] = useState({ name: '', style: '', convenience: '', description: '', imagesText: '' });
  const [typeFormErrors, setTypeFormErrors] = useState({});
  const [savingType, setSavingType] = useState(false);

  // States cho modal sơ đồ ghế
  const [seatMapModalOpen, setSeatMapModalOpen] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);
  const [gridSeats, setGridSeats] = useState([]); // Lưới ghế cục bộ [{ row, col, seatTypeId, id }]
  const [loadingSeatMap, setLoadingSeatMap] = useState(false);
  const [savingSeatMap, setSavingSeatMap] = useState(false);
  const [selectedPaletteTypeId, setSelectedPaletteTypeId] = useState(null); // ID loại ghế đang chọn để tô vẽ

  // Toasts notifications
  const [toasts, setToasts] = useState([]);
  const addToast = (msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  // Tải dữ liệu ban đầu
  const loadData = async () => {
    setLoading(true);
    try {
      const [hList, tList, sList] = await Promise.all([
        getAllHalls(),
        getAllHallTypes(),
        getAllSeatTypes()
      ]);
      setHalls(hList);
      setHallTypes(tList);
      setSeatTypes(sList);
      
      // Chọn loại ghế thường đầu tiên làm mặc định trong bảng vẽ
      if (sList.length > 0) {
        const reg = sList.find(s => s.name.toLowerCase().includes('thường')) || sList[0];
        setSelectedPaletteTypeId(reg.id);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      addToast('Lỗi khi tải dữ liệu từ máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Tính toán số liệu thống kê phòng chiếu
  const stats = useMemo(() => {
    const total = halls.length;
    const active = halls.filter((h) => h.status !== 'OFF').length;
    const totalSeats = halls.reduce((sum, h) => sum + (h.width * h.height), 0);
    return { total, active, totalSeats };
  }, [halls]);

  // Bật/Tắt hoạt động phòng chiếu trực tiếp
  const handleToggleStatus = async (hall) => {
    const nextStatus = hall.status === 'OFF' ? 'ON' : 'OFF';
    const matchedType = hallTypes.find(t => t.name === hall.hallType);
    const typeId = matchedType ? matchedType.id : 1;

    const payload = {
      name: hall.name,
      width: hall.width,
      height: hall.height,
      hallTypeId: typeId,
      status: nextStatus
    };

    const updated = await updateHall(hall.id, payload);
    if (updated) {
      setHalls((prev) => prev.map((h) => (h.id === hall.id ? { ...h, status: nextStatus } : h)));
      addToast(`Đã thay đổi trạng thái "${hall.name}" thành ${nextStatus === 'ON' ? 'Hoạt động' : 'Tạm dừng'}`, 'success');
    } else {
      addToast('Cập nhật trạng thái thất bại', 'error');
    }
  };

  // Mở modal Thêm/Sửa phòng chiếu
  const openHallModal = (hall = null) => {
    if (hall) {
      setEditingHall(hall);
      const matchedType = hallTypes.find(t => t.name === hall.hallType);
      setHallForm({
        name: hall.name,
        width: hall.width,
        height: hall.height,
        hallTypeId: matchedType ? matchedType.id : (hallTypes[0]?.id || '')
      });
    } else {
      setEditingHall(null);
      setHallForm({
        name: '',
        width: 10,
        height: 8,
        hallTypeId: hallTypes[0]?.id || ''
      });
    }
    setHallFormErrors({});
    setHallModalOpen(true);
  };

  // Validate form phòng chiếu
  const validateHallForm = () => {
    const err = {};
    if (!hallForm.name.trim()) err.name = 'Tên phòng chiếu không được trống';
    if (!hallForm.width || hallForm.width <= 0 || hallForm.width > 24)
      err.width = 'Số cột phải từ 1 đến 24';
    if (!hallForm.height || hallForm.height <= 0 || hallForm.height > 20)
      err.height = 'Số hàng phải từ 1 đến 20';
    if (!hallForm.hallTypeId) err.hallTypeId = 'Vui lòng chọn loại phòng';
    setHallFormErrors(err);
    return Object.keys(err).length === 0;
  };

  // Lưu phòng chiếu
  const handleSaveHall = async (e) => {
    e.preventDefault();
    if (!validateHallForm()) return;
    setSavingHall(true);

    try {
      if (editingHall) {
        const updated = await updateHall(editingHall.id, hallForm);
        if (updated) {
          const matchedType = hallTypes.find(t => t.id === Number(hallForm.hallTypeId));
          setHalls((prev) =>
            prev.map((h) =>
              h.id === editingHall.id
                ? {
                    ...h,
                    name: updated.name,
                    width: updated.width,
                    height: updated.height,
                    hallType: matchedType ? matchedType.name : h.hallType
                  }
                : h
            )
          );
          addToast(`Cập nhật thành công phòng "${updated.name}"`, 'success');
          setHallModalOpen(false);
        } else {
          addToast('Cập nhật phòng chiếu thất bại', 'error');
        }
      } else {
        const created = await createHall(hallForm);
        if (created) {
          setHalls((prev) => [created, ...prev]);
          addToast(`Đã tạo thành công phòng "${created.name}"`, 'success');
          setHallModalOpen(false);
        } else {
          addToast('Tạo phòng chiếu thất bại', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Có lỗi xảy ra khi lưu phòng chiếu', 'error');
    } finally {
      setSavingHall(false);
    }
  };

  // Mở modal Thêm/Sửa loại phòng chiếu
  const openTypeModal = (type = null) => {
    if (type) {
      setEditingType(type);
      let urls = '';
      if (Array.isArray(type.images)) {
        urls = type.images.join('\n');
      } else if (typeof type.images === 'string') {
        try {
          const parsed = JSON.parse(type.images);
          urls = Array.isArray(parsed) ? parsed.join('\n') : type.images;
        } catch {
          urls = type.images;
        }
      }
      setTypeForm({
        name: type.name || '',
        style: type.style || '',
        convenience: type.convenience || '',
        description: type.description || '',
        imagesText: urls
      });
    } else {
      setEditingType(null);
      setTypeForm({
        name: '',
        style: 'Thông thường',
        convenience: '',
        description: '',
        imagesText: ''
      });
    }
    setTypeFormErrors({});
    setTypeModalOpen(true);
  };

  // Validate form loại phòng
  const validateTypeForm = () => {
    const err = {};
    if (!typeForm.name.trim()) err.name = 'Tên loại phòng không được trống';
    if (!typeForm.style.trim()) err.style = 'Phong cách/Công nghệ không được trống';
    if (!typeForm.convenience.trim()) err.convenience = 'Tiện ích không được trống';
    if (!typeForm.description.trim()) err.description = 'Mô tả không được trống';
    setTypeFormErrors(err);
    return Object.keys(err).length === 0;
  };

  // Lưu loại phòng chiếu
  const handleSaveType = async (e) => {
    e.preventDefault();
    if (!validateTypeForm()) return;
    setSavingType(true);

    const imagesArray = typeForm.imagesText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const payload = {
      name: typeForm.name,
      style: typeForm.style,
      convenience: typeForm.convenience,
      description: typeForm.description,
      images: imagesArray
    };

    try {
      if (editingType) {
        const updated = await updateHallType(editingType.id, payload);
        if (updated) {
          setHallTypes((prev) =>
            prev.map((t) => (t.id === editingType.id ? { ...t, ...updated } : t))
          );
          addToast(`Cập nhật thành công loại phòng "${updated.name}"`, 'success');
          setTypeModalOpen(false);
        } else {
          addToast('Cập nhật thất bại', 'error');
        }
      } else {
        const created = await createHallType(payload);
        if (created) {
          setHallTypes((prev) => [...prev, created]);
          addToast(`Tạo thành công loại phòng "${created.name}"`, 'success');
          setTypeModalOpen(false);
        } else {
          addToast('Tạo loại phòng thất bại', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Có lỗi xảy ra khi lưu loại phòng chiếu', 'error');
    } finally {
      setSavingType(false);
    }
  };

  // Mở màn hình chỉnh sơ đồ ghế ngồi
  const openSeatMapModal = async (hall) => {
    setSelectedHall(hall);
    setLoadingSeatMap(true);
    setSeatMapModalOpen(true);
    try {
      const seats = await getHallSeatMap(hall.id);
      
      // Sắp xếp danh sách ghế lấy từ backend theo ID tăng dần
      const sortedSeats = [...seats].sort((a, b) => a.id - b.id);

      const localGrid = [];
      const rows = hall.height;
      const cols = hall.width;
      
      // Nếu số lượng ghế trả về khớp với kích thước phòng, khớp trực tiếp theo chỉ số (index)
      const useIndexMatch = sortedSeats.length === (rows * cols);
      
      const seatLookup = {};
      if (!useIndexMatch) {
        sortedSeats.forEach(s => {
          seatLookup[`${s.rowLabel}-${s.colNumber}`] = s;
        });
      }

      const defaultSeatType = seatTypes.find(s => s.name.toLowerCase().includes('thường')) || seatTypes[0];

      for (let r = 0; r < rows; r++) {
        const rLabel = getRowLabel(r);
        for (let c = 1; c <= cols; c++) {
          let existingSeat = null;
          
          if (useIndexMatch) {
            existingSeat = sortedSeats[r * cols + (c - 1)];
          } else {
            const key = `${rLabel}-${c}`;
            existingSeat = seatLookup[key];
            
            // Fallback: Tìm ghế có colNumber = c trong hàng r của danh sách ghế chưa được khớp (bao gồm cả nhãn hàng 'KO')
            if (!existingSeat) {
              existingSeat = sortedSeats.find(s => 
                s.colNumber === c && 
                (s.rowLabel === rLabel || s.rowLabel === 'KO') &&
                !localGrid.some(g => g.id === s.id)
              );
            }
          }
          
          localGrid.push({
            row: r,
            col: c,
            rowLabel: rLabel,
            colNumber: c,
            seatTypeId: existingSeat ? existingSeat.seatTypeId : (defaultSeatType?.id || 1),
            id: existingSeat ? existingSeat.id : null,
            status: existingSeat ? existingSeat.status : 'ACTIVE'
          });
        }
      }
      setGridSeats(localGrid);
    } catch (err) {
      console.error('Failed to load seat map:', err);
      addToast('Không thể tải sơ đồ ghế của phòng', 'error');
    } finally {
      setLoadingSeatMap(false);
    }
  };

  // Nhấn vẽ ghế trong lưới
  const handleCellClick = (cellIndex) => {
    if (!selectedPaletteTypeId) return;
    setGridSeats((prev) =>
      prev.map((cell, idx) =>
        idx === cellIndex ? { ...cell, seatTypeId: selectedPaletteTypeId } : cell
      )
    );
  };

  // Tô màu hàng loạt
  const fillRow = (rowIdx) => {
    if (!selectedPaletteTypeId) return;
    setGridSeats((prev) =>
      prev.map((cell) =>
        cell.row === rowIdx ? { ...cell, seatTypeId: selectedPaletteTypeId } : cell
      )
    );
  };

  const fillCol = (colNum) => {
    if (!selectedPaletteTypeId) return;
    setGridSeats((prev) =>
      prev.map((cell) =>
        cell.col === colNum ? { ...cell, seatTypeId: selectedPaletteTypeId } : cell
      )
    );
  };

  // Lưu sơ đồ ghế ngồi
  const handleSaveSeatMap = async () => {
    setSavingSeatMap(true);
    try {
      const payload = gridSeats.map((cell) => ({
        id: cell.id,
        seatTypeId: cell.seatTypeId,
        rowLabel: cell.rowLabel,
        colNumber: cell.colNumber,
        status: cell.status || 'ACTIVE'
      }));

      // Kiểm tra xem phòng đã có ghế chưa (nếu tất cả id ghế đều null/undefined tức là phòng trống chưa khởi tạo)
      const isNewSeatMap = gridSeats.every((cell) => !cell.id);

      let result;
      if (isNewSeatMap) {
        // Gọi API POST /halls/{id}/seat-map
        result = await generateHallSeatMap(selectedHall.id, payload);
      } else {
        // Gọi API PATCH /halls/{id}/seat-map
        result = await updateHallSeatMap(selectedHall.id, payload);
      }
      if (result) {
        addToast('Lưu sơ đồ ghế thành công!', 'success');
        setSeatMapModalOpen(false);
      } else {
        addToast('Lưu sơ đồ ghế thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Lỗi hệ thống khi lưu sơ đồ ghế', 'error');
    } finally {
      setSavingSeatMap(false);
    }
  };

  const resetToDefaultGrid = () => {
    const defaultSeatType = seatTypes.find(s => s.name.toLowerCase().includes('thường')) || seatTypes[0];
    if (!defaultSeatType) return;
    setGridSeats((prev) => prev.map((cell) => ({ ...cell, seatTypeId: defaultSeatType.id })));
  };

  // Định nghĩa màu sắc biểu diễn loại ghế
  const getSeatColor = (typeId) => {
    const type = seatTypes.find((t) => t.id === typeId);
    if (!type) return '#4b5563';
    const name = type.name.toLowerCase();

    if (name.includes('vip')) return '#f59e0b';
    if (name.includes('sweet') || name.includes('đôi')) return '#ec4899';
    if (name.includes('bean') || name.includes('lười')) return '#8b5cf6';
    if (name.includes('lối đi') || name.includes('walkway')) return 'rgba(0,0,0,0.15)';
    return '#4b5563';
  };

  const labelClass = "block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 text-left";
  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-white/8 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all bg-[#1a1a1a]";

  return (
    <div className="p-6 space-y-6 text-left">
      {/* Toast Messages container */}
      <div className="fixed top-6 right-6 z-[9999] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 shadow-2xl transition-all animate-bounce ${
              t.type === 'error'
                ? 'bg-red-950/90 border-red-500/30 text-red-200'
                : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
            }`}
          >
            {t.type === 'error' ? (
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            )}
            {t.msg}
          </div>
        ))}
      </div>

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Quản lý rạp chiếu</h2>
          <p className="text-zinc-500 text-xs mt-1">Quản lý sơ đồ phòng chiếu, thiết kế ghế ngồi và định cấu hình loại phòng chiếu</p>
        </div>
        {activeTab === 'halls' ? (
          <button
            onClick={() => openHallModal()}
            className="bg-[#E50914] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#E50914]/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Thêm phòng chiếu
          </button>
        ) : (
          <button
            onClick={() => openTypeModal()}
            className="bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Thêm loại phòng
          </button>
        )}
      </div>

      {/* Tabs Layout Switcher */}
      <div className="flex border-b border-white/5 gap-6">
        <button
          onClick={() => setActiveTab('halls')}
          className={`pb-3 text-sm font-bold tracking-wide uppercase transition-all relative cursor-pointer ${
            activeTab === 'halls' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Phòng chiếu ({halls.length})
          {activeTab === 'halls' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('types')}
          className={`pb-3 text-sm font-bold tracking-wide uppercase transition-all relative cursor-pointer ${
            activeTab === 'types' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Loại phòng chiếu ({hallTypes.length})
          {activeTab === 'types' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
      </div>

      {/* ==================== TAB 1: PHÒNG CHIẾU (HALLS) ==================== */}
      {activeTab === 'halls' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/40 relative overflow-hidden flex flex-col justify-center">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Tổng phòng chiếu</span>
              <span className="text-3xl font-extrabold text-white mt-2">{loading ? '--' : stats.total}</span>
              <div className="absolute right-4 bottom-4 text-zinc-800 opacity-20">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/40 relative overflow-hidden flex flex-col justify-center">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Đang hoạt động</span>
              <span className="text-3xl font-extrabold text-emerald-400 mt-2">{loading ? '--' : stats.active}</span>
              <div className="absolute right-4 bottom-4 text-emerald-800 opacity-20">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                </svg>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/40 relative overflow-hidden flex flex-col justify-center">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Tổng số ghế ngồi</span>
              <span className="text-3xl font-extrabold text-indigo-400 mt-2">{loading ? '--' : stats.totalSeats}</span>
              <div className="absolute right-4 bottom-4 text-indigo-800 opacity-20">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
            </div>
          </div>

          {/* List Table */}
          <div className="rounded-2xl border border-white/5 overflow-hidden bg-zinc-950/20">
            <div
              className="grid items-center px-6 py-3.5 border-b border-white/5 bg-zinc-950/80 text-zinc-400 text-xs font-bold uppercase tracking-wider"
              style={{ gridTemplateColumns: '80px 1.5fr 1fr 1fr 1.2fr 150px' }}
            >
              <span>Mã số</span>
              <span>Tên phòng chiếu</span>
              <span>Định dạng</span>
              <span>Kích thước</span>
              <span>Trạng thái</span>
              <span className="text-center">Hành động</span>
            </div>

            {loading ? (
              <div className="divide-y divide-white/5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="grid items-center px-6 py-4"
                    style={{ gridTemplateColumns: '80px 1.5fr 1fr 1fr 1.2fr 150px' }}
                  >
                    <div className="h-4 rounded bg-white/5 animate-pulse w-2/3" />
                    <div className="h-4 rounded bg-white/5 animate-pulse w-2/3" />
                    <div className="h-4 rounded bg-white/5 animate-pulse w-1/3" />
                    <div className="h-4 rounded bg-white/5 animate-pulse w-1/2" />
                    <div className="h-4 rounded bg-white/5 animate-pulse w-1/3" />
                    <div className="h-4 rounded bg-white/5 animate-pulse w-2/3 mx-auto" />
                  </div>
                ))}
              </div>
            ) : halls.length === 0 ? (
              <div className="py-20 text-center text-zinc-500">
                <p className="text-sm font-medium">Chưa có phòng chiếu nào được tạo</p>
              </div>
            ) : (
              halls.map((hall) => (
                <div
                  key={hall.id}
                  className="grid items-center px-6 py-3.5 border-b border-white/5 hover:bg-white/2 transition-all text-sm text-zinc-300"
                  style={{ gridTemplateColumns: '80px 1.5fr 1fr 1fr 1.2fr 150px' }}
                >
                  <span className="font-bold text-zinc-500">#{hall.id}</span>
                  <span className="font-semibold text-white">{hall.name}</span>
                  <span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/5 border border-white/8 text-zinc-400">
                      {hall.hallType}
                    </span>
                  </span>
                  <span className="font-mono text-zinc-400">{hall.height} hàng x {hall.width} cột ({hall.width * hall.height} ghế)</span>
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      hall.status !== 'OFF' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {hall.status !== 'OFF' ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      onClick={() => openHallModal(hall)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openSeatMapModal(hall)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/10 text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300 transition-all text-xs font-bold cursor-pointer"
                    >
                      Sơ đồ ghế
                    </button>
                    <button
                      onClick={() => handleToggleStatus(hall)}
                      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                      style={{ backgroundColor: hall.status !== 'OFF' ? '#10b981' : '#3f3f46' }}
                    >
                      <span
                        className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        style={{ transform: hall.status !== 'OFF' ? 'translateX(16px)' : 'translateX(0px)' }}
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: LOẠI PHÒNG CHIẾU (HALL TYPES) ==================== */}
      {activeTab === 'types' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 overflow-hidden bg-zinc-950/20">
            <div
              className="grid items-center px-6 py-3.5 border-b border-white/5 bg-zinc-950/80 text-zinc-400 text-xs font-bold uppercase tracking-wider"
              style={{ gridTemplateColumns: '80px 1.5fr 1fr 2fr 1.5fr 80px' }}
            >
              <span>Mã số</span>
              <span>Tên loại phòng</span>
              <span>Phong cách</span>
              <span>Tiện ích chính</span>
              <span>Mô tả</span>
              <span className="text-center">Sửa</span>
            </div>

            {loading ? (
              <div className="divide-y divide-white/5">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="grid items-center px-6 py-4"
                    style={{ gridTemplateColumns: '80px 1.5fr 1fr 2fr 1.5fr 80px' }}
                  >
                    <div className="h-4 rounded bg-white/5 animate-pulse w-2/3" />
                    <div className="h-4 rounded bg-white/5 animate-pulse w-2/3" />
                    <div className="h-4 rounded bg-white/5 animate-pulse w-1/3" />
                    <div className="h-4 rounded bg-white/5 animate-pulse w-2/3" />
                    <div className="h-4 rounded bg-white/5 animate-pulse w-3/4" />
                    <div className="h-4 rounded bg-white/5 animate-pulse w-2/3 mx-auto" />
                  </div>
                ))}
              </div>
            ) : hallTypes.length === 0 ? (
              <div className="py-20 text-center text-zinc-500">
                <p className="text-sm font-medium">Chưa có loại phòng chiếu nào trong CSDL</p>
              </div>
            ) : (
              hallTypes.map((type) => (
                <div
                  key={type.id}
                  className="grid items-start px-6 py-4 border-b border-white/5 hover:bg-white/2 transition-all text-sm text-zinc-300"
                  style={{ gridTemplateColumns: '80px 1.5fr 1fr 2fr 1.5fr 80px' }}
                >
                  <span className="font-bold text-zinc-500 pt-1">#{type.id}</span>
                  <div className="pt-1 flex flex-col gap-2">
                    <span className="font-semibold text-white">{type.name}</span>
                    {/* Preview Images badge */}
                    {type.images && (
                      <span className="text-[10px] text-zinc-500">
                        ({Array.isArray(type.images) ? type.images.length : 0} ảnh đính kèm)
                      </span>
                    )}
                  </div>
                  <span className="text-indigo-400 font-bold pt-1">{type.style}</span>
                  <span className="text-zinc-400 text-xs leading-relaxed pt-1 whitespace-pre-wrap">{type.convenience}</span>
                  <span className="text-zinc-500 text-xs leading-relaxed pt-1 line-clamp-2" title={type.description}>
                    {type.description}
                  </span>

                  <div className="flex items-center justify-center pt-0.5">
                    <button
                      onClick={() => openTypeModal(type)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: THÊM / SỬA PHÒNG CHIẾU (HALL) */}
      {hallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8 px-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-zinc-950">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950">
              <h3 className="text-white font-bold text-base">{editingHall ? 'Chỉnh sửa phòng chiếu' : 'Thêm phòng chiếu mới'}</h3>
              <button onClick={() => setHallModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveHall} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Tên phòng chiếu *</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Ví dụ: Phòng chiếu 1, Phòng IMAX..."
                  value={hallForm.name}
                  onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
                />
                {hallFormErrors.name && <p className="text-red-400 text-xs mt-1 text-left">{hallFormErrors.name}</p>}
              </div>

              <div>
                <label className={labelClass}>Loại định dạng phòng *</label>
                <select
                  className={inputClass}
                  style={{ background: '#1a1a1a', color: '#fff' }}
                  value={hallForm.hallTypeId}
                  onChange={(e) => setHallForm({ ...hallForm, hallTypeId: e.target.value })}
                >
                  <option value="" disabled style={{ background: '#1a1a1a' }}>-- Chọn loại phòng --</option>
                  {hallTypes.map((type) => (
                    <option key={type.id} value={type.id} style={{ background: '#1a1a1a' }}>
                      {type.name} ({type.style})
                    </option>
                  ))}
                </select>
                {hallFormErrors.hallTypeId && <p className="text-red-400 text-xs mt-1 text-left">{hallFormErrors.hallTypeId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Số hàng ghế (Chiều cao) *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className={inputClass}
                    value={hallForm.height}
                    onChange={(e) => setHallForm({ ...hallForm, height: Number(e.target.value) })}
                  />
                  {hallFormErrors.height && <p className="text-red-400 text-xs mt-1 text-left">{hallFormErrors.height}</p>}
                </div>
                <div>
                  <label className={labelClass}>Số cột ghế (Chiều rộng) *</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    className={inputClass}
                    value={hallForm.width}
                    onChange={(e) => setHallForm({ ...hallForm, width: Number(e.target.value) })}
                  />
                  {hallFormErrors.width && <p className="text-red-400 text-xs mt-1 text-left">{hallFormErrors.width}</p>}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setHallModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingHall}
                  className="bg-[#E50914] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-opacity-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingHall && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {editingHall ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / SỬA LOẠI PHÒNG CHIẾU (HALL TYPE) */}
      {typeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8 px-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-zinc-950">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950">
              <h3 className="text-white font-bold text-base">{editingType ? 'Chỉnh sửa loại phòng chiếu' : 'Thêm loại phòng mới'}</h3>
              <button onClick={() => setTypeModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveType} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tên loại phòng *</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Ví dụ: IMAX, Phòng chiếu 2D, Lagom..."
                    value={typeForm.name}
                    onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  />
                  {typeFormErrors.name && <p className="text-red-400 text-xs mt-1 text-left">{typeFormErrors.name}</p>}
                </div>
                <div>
                  <label className={labelClass}>Phong cách / Nhóm *</label>
                  <select
                    className={inputClass}
                    style={{ background: '#1a1a1a', color: '#fff' }}
                    value={typeForm.style}
                    onChange={(e) => setTypeForm({ ...typeForm, style: e.target.value })}
                  >
                    <option value="Thông thường" style={{ background: '#1a1a1a' }}>Thông thường</option>
                    <option value="Công nghệ" style={{ background: '#1a1a1a' }}>Công nghệ</option>
                    <option value="Phong cách" style={{ background: '#1a1a1a' }}>Phong cách</option>
                  </select>
                  {typeFormErrors.style && <p className="text-red-400 text-xs mt-1 text-left">{typeFormErrors.style}</p>}
                </div>
              </div>

              <div>
                <label className={labelClass}>Tiện ích (Tiện nghi chính) *</label>
                <textarea
                  rows="2"
                  className={inputClass}
                  placeholder="Ví dụ: Hệ thống âm thanh vòm Dolby, Ghế bọc da BoConcept, ẩm thực phục vụ..."
                  value={typeForm.convenience}
                  onChange={(e) => setTypeForm({ ...typeForm, convenience: e.target.value })}
                />
                {typeFormErrors.convenience && <p className="text-red-400 text-xs mt-1 text-left">{typeFormErrors.convenience}</p>}
              </div>

              <div>
                <label className={labelClass}>Mô tả chi tiết *</label>
                <textarea
                  rows="3"
                  className={inputClass}
                  placeholder="Mô tả kỹ lưỡng về loại phòng chiếu này để hiển thị trang giới thiệu phòng chiếu..."
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                />
                {typeFormErrors.description && <p className="text-red-400 text-xs mt-1 text-left">{typeFormErrors.description}</p>}
              </div>

              <div>
                <label className={labelClass}>Liên kết hình ảnh (Đường dẫn URLs, Mỗi dòng 1 đường dẫn)</label>
                <textarea
                  rows="3"
                  className={`${inputClass} font-mono text-xs`}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  value={typeForm.imagesText}
                  onChange={(e) => setTypeForm({ ...typeForm, imagesText: e.target.value })}
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTypeModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingType}
                  className="bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingType && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {editingType ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THIẾT KẾ SƠ ĐỒ GHẾ NGỒI */}
      {seatMapModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start" style={{ background: '#0c0c0c' }}>
          {/* Header Bar */}
          <div className="h-16 px-6 border-b border-white/5 bg-zinc-950 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-white font-bold text-base">Thiết kế Sơ đồ ghế: {selectedHall?.name}</h3>
              <p className="text-zinc-500" style={{ fontSize: '11px' }}>Kích thước: {selectedHall?.height} hàng x {selectedHall?.width} cột</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={resetToDefaultGrid}
                className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Tải lại ghế thường
              </button>
              <button
                onClick={handleSaveSeatMap}
                disabled={savingSeatMap || loadingSeatMap}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingSeatMap && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Lưu sơ đồ ghế
              </button>
              <button
                onClick={() => setSeatMapModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Interactive Workspace Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT WORKSPACE: Grid */}
            <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-zinc-950/20">
              {loadingSeatMap ? (
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-zinc-500 text-sm">Đang tải sơ đồ ghế...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center max-w-full">
                  <div className="w-[300px] sm:w-[480px] h-3 bg-zinc-800 rounded-b-2xl shadow-[0_4px_16px_rgba(255,255,255,0.05)] border-t border-white/5 text-center text-[8px] font-bold tracking-[0.3em] text-zinc-500 uppercase py-0.5 mb-14 shrink-0">
                    MÀN HÌNH CHIẾU
                  </div>

                  <div
                    className="grid gap-2 border border-white/5 p-4 rounded-2xl bg-zinc-900/10 shadow-inner"
                    style={{
                      gridTemplateColumns: `36px repeat(${selectedHall?.width || 1}, minmax(32px, 42px))`,
                    }}
                  >
                    <div className="h-8 flex items-center justify-center text-[10px] text-zinc-600 font-bold uppercase">
                      Hàng
                    </div>
                    {[...Array(selectedHall?.width || 0)].map((_, c) => (
                      <button
                        key={c}
                        onClick={() => fillCol(c + 1)}
                        title={`Tô toàn bộ Cột ${c + 1}`}
                        className="h-8 flex items-center justify-center text-[10px] text-zinc-500 hover:text-white font-bold rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        {c + 1}
                      </button>
                    ))}

                    {[...Array(selectedHall?.height || 0)].map((_, r) => {
                      const rLabel = getRowLabel(r);
                      return (
                        <div key={r} className="contents">
                          <button
                            onClick={() => fillRow(r)}
                            title={`Tô toàn bộ Hàng ${rLabel}`}
                            className="h-8 flex items-center justify-center text-[11px] text-zinc-400 hover:text-white font-black rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                          >
                            {rLabel}
                          </button>

                          {gridSeats
                            .filter((cell) => cell.row === r)
                            .map((cell, cIdx) => {
                              const cellIndexInArray = gridSeats.findIndex(
                                (x) => x.row === r && x.col === cell.colNumber
                              );
                              const typeName = seatTypes.find(t => t.id === cell.seatTypeId)?.name || 'Ghế';
                              const isWalkway = typeName.toLowerCase().includes('lối đi');

                              return (
                                <button
                                  key={cIdx}
                                  onClick={() => handleCellClick(cellIndexInArray)}
                                  title={`${cell.rowLabel}${cell.colNumber} (${typeName})`}
                                  className="aspect-square w-full rounded-lg text-[9px] font-bold flex items-center justify-center transition-all cursor-pointer border border-black/30 hover:scale-105 active:scale-95 text-zinc-200"
                                  style={{
                                    backgroundColor: getSeatColor(cell.seatTypeId),
                                    border: isWalkway ? '1.5px dashed rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.05)',
                                    color: isWalkway ? 'transparent' : 'rgba(255,255,255,0.9)',
                                    boxShadow: isWalkway ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.1)'
                                  }}
                                >
                                  {!isWalkway && `${cell.rowLabel}${cell.colNumber}`}
                                </button>
                              );
                            })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR: Palette */}
            <div className="w-80 border-l border-white/5 bg-zinc-950 p-6 flex flex-col justify-between shrink-0">
              <div className="space-y-6">
                <div>
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Bảng màu vẽ ghế</h4>
                  <p className="text-zinc-500 text-[11px]">Chọn một loại ghế bên dưới rồi click lên ô bất kỳ ở sơ đồ để tô loại ghế đó.</p>
                </div>

                <div className="space-y-3">
                  {seatTypes.map((type) => {
                    const isSelected = selectedPaletteTypeId === type.id;
                    const isWalkway = type.name.toLowerCase().includes('lối đi');
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedPaletteTypeId(type.id)}
                        className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-indigo-600/10 border-indigo-500 text-white'
                            : 'bg-zinc-900/30 border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-300'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-md border border-black/30 shrink-0"
                          style={{
                            backgroundColor: getSeatColor(type.id),
                            border: isWalkway ? '1.5px dashed rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.05)'
                          }}
                        />
                        <div>
                          <p className="text-xs font-bold">{type.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{type.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/10">
                  <h5 className="text-zinc-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Mẹo tô hàng loạt</h5>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Bạn có thể nhấp chuột vào chữ cái tên Hàng (A, B, C...) hoặc chỉ số Cột (1, 2, 3...) để phủ loại ghế đang chọn lên toàn bộ hàng/cột đó ngay lập tức.
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-zinc-600 leading-relaxed pt-4 border-t border-white/5">
                Các ô có loại ghế <span className="font-bold">Lối đi</span> sẽ tự động chuyển trống và không tính vào sức chứa ghế của phòng, đồng thời sẽ không hiển thị trên giao diện mua vé của khách hàng.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
