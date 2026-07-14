let mockShowtimes = [
  { id: 1, hallId: 1, hallName: 'Phòng chiếu 1', movieId: 1, movieName: 'Minions & Quái Vật', date: '2026-07-01', startTime: '09:00:00', type: '2D Lồng Tiếng' },
  { id: 2, hallId: 1, hallName: 'Phòng chiếu 1', movieId: 2, movieName: 'Lật Mặt 7: Một Điều Ước', date: '2026-07-01', startTime: '11:15:00', type: '2D Phụ Đề' },
  { id: 3, hallId: 2, hallName: 'Phòng chiếu 2', movieId: 1, movieName: 'Minions & Quái Vật', date: '2026-07-02', startTime: '14:00:00', type: 'IMAX Phụ Đề' },
];

export const getAllShowtimes = async () => {
  return [...mockShowtimes];
};

export const filterShowtimes = async (filters = {}) => {
  let list = [...mockShowtimes];
  if (filters.movieId) {
    list = list.filter(st => st.movieId === Number(filters.movieId));
  }
  if (filters.hallId) {
    list = list.filter(st => st.hallId === Number(filters.hallId));
  }
  if (filters.date) {
    list = list.filter(st => st.date === filters.date);
  }
  return list;
};

export const getShowtimeById = async (id) => {
  return mockShowtimes.find(st => st.id === Number(id)) || null;
};

export const createShowtime = async (showtimeData) => {
  const newShowtime = {
    id: mockShowtimes.length > 0 ? Math.max(...mockShowtimes.map(st => st.id)) + 1 : 1,
    hallId: Number(showtimeData.hallId),
    hallName: `Phòng chiếu ${showtimeData.hallId}`,
    movieId: Number(showtimeData.movieId),
    movieName: `Phim số ${showtimeData.movieId}`,
    date: showtimeData.date,
    startTime: showtimeData.startTime.length === 5 ? `${showtimeData.startTime}:00` : showtimeData.startTime,
    type: showtimeData.type
  };
  mockShowtimes.push(newShowtime);
  return newShowtime;
};

export const updateShowtime = async (id, showtimeData) => {
  const st = mockShowtimes.find(st => st.id === Number(id));
  if (!st) return null;
  st.hallId = Number(showtimeData.hallId);
  st.hallName = `Phòng chiếu ${showtimeData.hallId}`;
  st.movieId = Number(showtimeData.movieId);
  st.movieName = `Phim số ${showtimeData.movieId}`;
  st.date = showtimeData.date;
  st.startTime = showtimeData.startTime.length === 5 ? `${showtimeData.startTime}:00` : showtimeData.startTime;
  st.type = showtimeData.type;
  return st;
};
