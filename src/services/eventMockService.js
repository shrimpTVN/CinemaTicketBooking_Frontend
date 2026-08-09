let mockEvents = [
  {
    id: 1,
    title: "Chương trình Khuyến Mãi VéXemPhim Hè 2026: Đồng Giá 45K Suất Chiếu Sớm",
    description: "Đón chào mùa hè rực rỡ với ưu đãi cực sốc dành riêng cho thành viên rạp chiếu phim. Thưởng thức các bộ phim bom tấn chiếu sớm đồng giá chỉ 45.000 VNĐ cho mọi suất chiếu trước 12:00 hàng ngày.",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop",
    banner: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
    status: "ACTIVE"
  },
  {
    id: 2,
    title: "Đêm Chiếu Phim Đa Trải Nghiệm IMAX® Special Fan Night",
    description: "Sự kiện tri ân khán giả đam mê trải nghiệm điện ảnh IMAX với quà tặng độc quyền như Poster tráng kim, vé xem phim Holographic mạ vàng và cơ hội giao lưu cùng các nhà làm phim hàng đầu.",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop",
    banner: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop",
    status: "ACTIVE"
  },
  {
    id: 3,
    title: "Combo Bắp Nước Hàng Hiệu 'Movie Season 2026' Giảm Đến 30%",
    description: "Thỏa thích thưởng thức bắp phô mai và nước ngọt mát lạnh khi mua Combo cặp đôi tại quầy vé hoặc đặt vé online trên ứng dụng web chính thức.",
    poster: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=800&auto=format&fit=crop",
    banner: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=1200&auto=format&fit=crop",
    status: "ACTIVE"
  }
];

export const getAllEvents = async () => {
  return [...mockEvents];
};

export const getEventById = async (id) => {
  return mockEvents.find(e => String(e.id) === String(id)) || null;
};

export const createEvent = async (eventData) => {
  const newEvent = {
    id: mockEvents.length > 0 ? Math.max(...mockEvents.map(e => e.id)) + 1 : 1,
    title: eventData.title,
    description: eventData.description,
    poster: eventData.poster,
    banner: eventData.banner || eventData.poster,
    status: "ACTIVE"
  };
  mockEvents.push(newEvent);
  return newEvent;
};

export const updateEvent = async (id, eventData) => {
  const item = mockEvents.find(e => e.id === Number(id));
  if (item) {
    item.title = eventData.title;
    item.description = eventData.description;
    if (eventData.poster) item.poster = eventData.poster;
    if (eventData.banner) item.banner = eventData.banner;
  }
  return item || null;
};

export const updateEventStatus = async (id, status) => {
  const item = mockEvents.find(e => e.id === Number(id));
  if (item) {
    item.status = status;
  }
  return item || null;
};
