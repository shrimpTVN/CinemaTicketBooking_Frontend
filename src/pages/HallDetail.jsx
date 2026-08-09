import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { getNowShowing } from '../services/movieService';
import { getHallTypeById, getAllHallTypes, getAllSeatTypes } from '../services/hallService';
import { getAllShowtimes } from '../services/showtimeService';
import { Info, Images, ArrowLeft, Sparkles } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import BackButton from '../components/BackButton';
import ScrollReveal from '../components/ScrollReveal';

const ROOMS_DATA = {
  '2d': {
    name: 'Phòng Chiếu 2D Tiêu Chuẩn',
    roomNumber: 'Phòng 01 - 04',
    tagline: 'Trải nghiệm điện ảnh chuẩn mực hàng ngày',
    description: 'Hệ thống phòng chiếu tiêu chuẩn đáp ứng đầy đủ các tiêu chí khắt khe về độ phân giải và chất lượng âm thanh kỹ thuật số. Thiết kế phòng chiếu thông minh tối ưu hóa góc nhìn từ mọi vị trí ghế, mang lại cảm giác thoải mái nhất cho khán giả.',
    images: [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'
    ],
    features: [
      { label: 'Loại màn hình', value: 'Màn chiếu phẳng độ phản xạ cao' },
      { label: 'Hệ thống chiếu', value: 'Laser thế hệ mới 2K' },
      { label: 'Hệ thống âm thanh', value: 'Dolby Digital 7.1 đa hướng' }
    ],
    seats: ['standard', 'premium', 'sweetbox']
  },
  '3d': {
    name: 'Phòng Chiếu 3D Tiêu Chuẩn',
    roomNumber: 'Phòng 05',
    tagline: 'Độ sâu hình ảnh ba chiều sống động',
    description: 'Phục vụ trình chiếu phim định dạng 3D với hệ thống kính lọc phân cực và máy chiếu thế hệ mới có tần số quét cao, tạo độ nổi và chiều sâu chân thực cho hình ảnh trong từng phân cảnh.',
    images: [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'
    ],
    features: [
      { label: 'Loại màn hình', value: 'Màn chiếu phủ bạc tăng độ sáng 3D' },
      { label: 'Hệ thống chiếu', value: 'Laser 3D phân cực tần số quét cao' },
      { label: 'Hệ thống âm thanh', value: 'Dolby Digital 7.1 đa hướng' }
    ],
    seats: ['standard', 'premium', 'sweetbox']
  },
  'imax': {
    name: 'IMAX® - Đỉnh Cao Điện Ảnh',
    roomNumber: 'Phòng 06',
    tagline: 'Immersive Movie Experience - Vượt qua giới hạn tầm nhìn',
    description: 'Màn hình IMAX cong cực đại phủ kín tầm nhìn, máy chiếu laser đôi thế hệ mới mang lại độ sáng vượt trội gấp hai lần, cùng hệ thống âm thanh vòm hiệu chỉnh tùy biến cho phép nghe rõ từng tiếng động nhỏ nhất.',
    images: [
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop'
    ],
    features: [
      { label: 'Loại màn hình', value: 'Màn chiếu IMAX® cong sát trần cực đại' },
      { label: 'Hệ thống chiếu', value: 'Dual Laser Projector siêu nét 4K' },
      { label: 'Hệ thống âm thanh', value: 'IMAX® Immersive Sound 12 kênh độc quyền' }
    ],
    seats: ['standard', 'premium']
  },
  '4dx': {
    name: '4DX® - Đa Giác Quan Độc Đáo',
    roomNumber: 'Phòng 07',
    tagline: 'Công nghệ 4D chuyển động và hiệu ứng môi trường thực tế',
    description: 'Hệ thống ghế chuyển động đa hướng (roll, pitch, heave) kết hợp đồng bộ hoàn hảo với các hiệu ứng môi trường thực tế như gió, nước, mùi hương, chớp sáng, sương mù và tuyết rơi.',
    images: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop'
    ],
    features: [
      { label: 'Loại màn hình', value: 'Màn chiếu phẳng độ phản xạ cao' },
      { label: 'Hệ thống chiếu', value: 'Laser Christie 4K thế hệ mới' },
      { label: 'Hệ thống âm thanh', value: 'Dolby Atmos đa hướng vòm' }
    ],
    seats: ['standard', 'premium']
  },
  'screenx': {
    name: 'ScreenX - Màn Hình Đa Diện 270 Độ',
    roomNumber: 'Phòng 08',
    tagline: 'Mở rộng hình ảnh sang ba màn hình đột phá',
    description: 'Công nghệ chiếu đa diện sử dụng hệ thống máy chiếu đa điểm mở rộng màn hình sang hai bên tường, tạo ra góc nhìn 270 độ rộng lớn giúp khán giả hoàn toàn chìm đắm vào bối cảnh phim.',
    images: [
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'
    ],
    features: [
      { label: 'Loại màn hình', value: 'Màn hình đa diện 270 độ (3 góc màn chiếu)' },
      { label: 'Hệ thống chiếu', value: 'Hệ thống đa máy chiếu đồng bộ Christie' },
      { label: 'Hệ thống âm thanh', value: 'Dolby Digital 7.1 đa hướng' }
    ],
    seats: ['standard', 'premium']
  },
  'starium': {
    name: 'Starium - Màn Chiếu Khổng Lồ',
    roomNumber: 'Phòng 09',
    tagline: 'Kỷ nguyên chiếu phim màn hình rộng sắc nét',
    description: 'Sở hữu màn hình cong khổng lồ được tối ưu hóa góc nhìn. Hệ thống máy chiếu Laser Christie tối tân mang lại độ sáng đồng đều nhất tại bất kỳ góc ngồi nào.',
    images: [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'
    ],
    features: [
      { label: 'Loại màn hình', value: 'Màn hình cong Starium khổng lồ' },
      { label: 'Hệ thống chiếu', value: 'Laser Christie Christie 4K cực sáng' },
      { label: 'Hệ thống âm thanh', value: 'Dolby Atmos toàn dải đa tầng' }
    ],
    seats: ['standard', 'premium']
  },
  'gold-class': {
    name: 'Gold Class - Hạng Thương Gia Đẳng Cấp',
    roomNumber: 'Phòng 10',
    tagline: 'Khoang thương gia hàng không thượng lưu đẳng cấp',
    description: 'Gold Class được trang bị các cặp ghế sofa da cao cấp điều khiển điện tự động ngả lưng linh hoạt đến 180 độ, cổng sạc USB, đi kèm dịch vụ phòng chờ hạng sang.',
    images: [
      'https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop'
    ],
    features: [
      { label: 'Loại màn hình', value: 'Màn chiếu phẳng độ phản xạ cao' },
      { label: 'Hệ thống chiếu', value: 'Laser Christie 4K thế hệ mới' },
      { label: 'Hệ thống âm thanh', value: 'Dolby Digital 7.1 đa hướng' }
    ],
    seats: ['gold-class']
  },
  'lamour': {
    name: 'L\'amour - Phòng Chiếu Giường Nằm Lãng Mạn',
    roomNumber: 'Phòng 11',
    tagline: 'Thư giãn tuyệt đối với giường nằm cao cấp cho các cặp đôi',
    description: 'Thay thế toàn bộ ghế ngồi bằng các giường nằm nệm lò xo cao cấp rộng 1.6m đi kèm chăn ấm và gối êm ái. Khách hàng được phục vụ trà, cà phê và đồ ăn nhẹ miễn phí tại giường.',
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop'
    ],
    features: [
      { label: 'Loại màn hình', value: 'Màn chiếu phẳng phủ bạc phản quang' },
      { label: 'Hệ thống chiếu', value: 'Laser Christie 4K thế hệ mới' },
      { label: 'Hệ thống âm thanh', value: 'Dolby Digital 7.1 đa hướng' }
    ],
    seats: ['lamour-bed']
  },
  'cine-living': {
    name: 'Cine & Living - Không Gian Phòng Khách',
    roomNumber: 'Phòng 12',
    tagline: 'Màn hình Onyx LED 4K tự phát sáng rực rỡ',
    description: 'Thiết kế theo phong cách phòng khách biệt thự Bắc Âu với tông màu hồng pastel ngọt ngào, sofa thời trang và rạp chiếu duy nhất sở hữu màn hình tự phát sáng Samsung Onyx LED 4K.',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop'
    ],
    features: [
      { label: 'Loại màn hình', value: 'Samsung Onyx LED 4K tự phát sáng' },
      { label: 'Hệ thống chiếu', value: 'Không dùng máy chiếu (Màn LED tự phát sáng)' },
      { label: 'Hệ thống âm thanh', value: 'Harman Kardon chuyên nghiệp cao cấp' }
    ],
    seats: ['vip-sofa']
  },
  'cine-suite': {
    name: 'Cine & Suite - Sảnh Suite Sang Trọng',
    roomNumber: 'Phòng 13',
    tagline: 'Phòng khách Suite hạng sang ấm cúng riêng tư',
    description: 'Thiết kế theo phong cách của các phòng khách Suite tại khách sạn 5 sao. Cine & Suite trang bị ghế sofa da đơn rộng rãi có vách ngăn cao, mang lại trải nghiệm xem phim đẳng cấp.',
    images: [
      'https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop'
    ],
    features: [
      { label: 'Loại màn hình', value: 'Màn chiếu phẳng độ phản xạ cao' },
      { label: 'Hệ thống chiếu', value: 'Laser Christie 4K sắc nét' },
      { label: 'Hệ thống âm thanh', value: 'Dolby Digital 7.1 đa hướng' }
    ],
    seats: ['vip-sofa']
  },
  'cine-foret': {
    name: 'Cine & Forêt - Tổ Ấm Thiên Nhiên',
    roomNumber: 'Phòng 14',
    tagline: 'Không gian rạp phim rừng rậm thiên nhiên xanh mát',
    description: 'Phòng chiếu được thiết kế phủ cỏ xanh nhân tạo và cây cảnh tươi mát. Trang bị máy khuếch tán oxy và hệ thống chiếu sáng tự nhiên mô phỏng buổi chiều tối trong rừng xanh.',
    images: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop'
    ],
    features: [
      { label: 'Loại màn hình', value: 'Màn chiếu cong góc nhìn rộng' },
      { label: 'Hệ thống chiếu', value: 'Laser Christie 4K thế mới' },
      { label: 'Hệ thống âm thanh', value: 'Dolby Atmos âm thanh vòm 360 độ' }
    ],
    seats: ['standard', 'premium']
  }
};

const SEATS_DATA = [
  {
    id: 'standard',
    name: 'Ghế Standard (Tiêu chuẩn)',
    description: 'Ghế đệm nỉ bọc cao cấp thoải mái, tay vịn tích hợp chỗ để cốc tiện dụng, bố trí ở các hàng ghế thường.',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'premium',
    name: 'Ghế Premium (VIP)',
    description: 'Bố trí tại vùng trung tâm của phòng chiếu (sweet spot) với góc nhìn và âm thanh tối ưu nhất, nệm ngồi dày dặn hơn.',
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'sweetbox',
    name: 'Ghế đôi Sweetbox',
    description: 'Thiết kế ghế đôi rộng rãi, tháo bỏ tay vịn ở giữa và vách ngăn gỗ cao hai bên mang lại không gian riêng tư cho các cặp đôi.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'vip-sofa',
    name: 'Ghế Sofa da VIP',
    description: 'Ghế sofa bọc da đơn cỡ lớn, có cơ chế ngả lưng nhẹ và gác tay siêu êm ái, nâng tầm trải nghiệm thư giãn trong rạp.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'gold-class',
    name: 'Sofa Gold Class (Hạng VIP)',
    description: 'Ghế sofa đôi bọc da cao cấp có điều khiển điện ngả lưng linh hoạt đến 180 độ, cổng sạc USB, khay để đồ và dịch vụ phòng chờ thương gia.',
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'lamour-bed',
    name: 'Giường nằm L\'amour',
    description: 'Giường nằm nệm cao cấp 1.6m trang bị chăn ấm gối êm, dịch vụ F&B phục vụ tận giường miễn phí, đem lại trải nghiệm điện ảnh giống tại gia.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop'
  }
];

const FALLBACK_SEAT_IMAGES = {
  1: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop',
  2: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=600&auto=format&fit=crop',
  3: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop',
  4: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop'
};

export default function HallDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [realSeatTypes, setRealSeatTypes] = useState([]);
  const [realHallType, setRealHallType] = useState(null);
  const [loadingMovies, setLoadingMovies] = useState(false);

  // Fetch hall type, seat types, movies, and showtimes from Backend API
  useEffect(() => {
    const fetchAllData = async () => {
      setLoadingMovies(true);
      try {
        const [hallTypeRes, allTypesRes, seatTypesRes, moviesRes, showtimesRes] = await Promise.allSettled([
          id ? getHallTypeById(id) : Promise.resolve(null),
          getAllHallTypes(),
          getAllSeatTypes(),
          getNowShowing(),
          getAllShowtimes()
        ]);

        // 1. Hall Type
        let fetchedType = hallTypeRes.status === 'fulfilled' ? hallTypeRes.value : null;
        if (!fetchedType && allTypesRes.status === 'fulfilled' && Array.isArray(allTypesRes.value)) {
          fetchedType = allTypesRes.value.find(t => String(t.id) === String(id) || t.name?.toLowerCase().includes(String(id).toLowerCase()));
        }
        if (fetchedType) setRealHallType(fetchedType);

        // 2. Seat Types
        if (seatTypesRes.status === 'fulfilled' && Array.isArray(seatTypesRes.value) && seatTypesRes.value.length > 0) {
          setRealSeatTypes(seatTypesRes.value);
        }

        // 3. Movies & Showtimes
        if (moviesRes.status === 'fulfilled' && Array.isArray(moviesRes.value)) {
          setNowShowingMovies(moviesRes.value);
        }
        if (showtimesRes.status === 'fulfilled' && Array.isArray(showtimesRes.value)) {
          setShowtimes(showtimesRes.value);
        }
      } catch (err) {
        console.error('Failed to load hall detail page data:', err);
      } finally {
        setLoadingMovies(false);
      }
    };

    fetchAllData();
  }, [id]);

  const defaultRoom = ROOMS_DATA[id] || ROOMS_DATA['2d'];
  const currentRoom = realHallType ? {
    name: realHallType.name || defaultRoom.name,
    roomNumber: `LOẠI PHÒNG #${realHallType.id}`,
    tagline: realHallType.convenience || defaultRoom.tagline,
    description: realHallType.description || defaultRoom.description,
    images: (Array.isArray(realHallType.images) && realHallType.images.length > 0) ? realHallType.images : defaultRoom.images,
    features: [
      { label: 'Phong cách', value: realHallType.style || 'Tiêu chuẩn' },
      { label: 'Tiện ích & Âm thanh', value: realHallType.convenience || 'Đang cập nhật' }
    ],
    seats: defaultRoom.seats
  } : defaultRoom;

  const roomTypeName = realHallType?.name || (
    id === '2d' ? '2D' :
    id === '3d' ? '3D' :
    id === 'imax' ? 'IMAX®' :
    id === '4dx' ? '4DX®' :
    id === 'screenx' ? 'ScreenX' :
    id === 'starium' ? 'Starium' :
    id === 'gold-class' ? 'Gold Class' :
    id === 'lamour' ? 'L\'amour' :
    id === 'cine-living' ? 'Cine & Living' :
    id === 'cine-suite' ? 'Cine & Suite' :
    id === 'cine-foret' ? 'Cine & Forêt' : '2D'
  );

  const handleBack = () => {
    navigate('/hall', { state: { category: location.state?.category || 'tech' } });
  };

  // Filter movies playing in this hall based on actual showtimes scheduled in this hall/hall type
  const getFilteredMovies = () => {
    if (!nowShowingMovies || nowShowingMovies.length === 0) return [];

    // Filter showtimes belonging to this hall or hall type from backend API
    if (Array.isArray(showtimes)) {
      const activeMovieIds = new Set(
        showtimes
          .filter(st => {
            const matchHallId = String(st.hallId) === String(id);
            const matchHallName = st.hallName && st.hallName.toLowerCase().includes((roomTypeName || '').toLowerCase());
            const matchType = st.type && st.type.toLowerCase().includes((roomTypeName || '').toLowerCase());
            return matchHallId || matchHallName || matchType;
          })
          .map(st => Number(st.movieId))
      );

      // Return ONLY movies that actually have showtimes scheduled in this hall
      return nowShowingMovies.filter(m => activeMovieIds.has(Number(m.id)));
    }

    return [];
  };

  const filteredMovies = getFilteredMovies();



  return (
    <div className="bg-bg-dark text-text-main min-h-screen pt-8 pb-20">
      {/* Back button */}
      <section className="max-w-7xl mx-auto px-4 mb-8 text-left">
        <BackButton label="Quay lại" to="/hall" />
      </section>

      {/* Room Details Block */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <ScrollReveal direction="up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
            {/* Left Column: Image Gallery */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Image View */}
              <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 aspect-[16/10] shadow-[0_0_25px_rgba(0,0,0,0.5)]">
                <img
                  src={currentRoom.images[activeImageIndex] || currentRoom.images[0]}
                  alt={currentRoom.name}
                  className="w-full h-full object-cover z-10 transition-all duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent opacity-50 z-10 pointer-events-none"></div>

                {/* Image index badge */}
                <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-[11px] text-text-sub1 px-2.5 py-1 rounded-full border border-zinc-700/60 flex items-center gap-1.5 z-20">
                  <Images className="w-3.5 h-3.5 text-text-sub3" />
                  {activeImageIndex + 1} / {currentRoom.images.length}
                </span>
              </div>

              {/* Thumbnails Row (Clean Hover & Layout) */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {currentRoom.images.map((img, idx) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-24 sm:w-28 aspect-[16/10] rounded-xl overflow-hidden cursor-pointer shrink-0 transition-all duration-200 border-2 ${
                        isActive
                          ? 'border-white ring-2 ring-white/20 opacity-100 shadow-md scale-[1.02]'
                          : 'border-zinc-800 opacity-50 hover:opacity-100 hover:border-zinc-500'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${currentRoom.name} thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Room Details */}
            <div className="lg:col-span-5 text-left space-y-6">
              <div>
                <span className="inline-block px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-3">
                  {currentRoom.roomNumber}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide leading-tight">
                  Phòng chiếu <span className="text-cta">{roomTypeName}</span>
                </h2>
              </div>

              {/* Mô tả */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Mô tả
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {currentRoom.description}
                </p>
              </div>

              {/* Tiện ích */}
              <div className="border-t border-zinc-800/80 pt-6 space-y-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Tiện ích
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {realHallType?.convenience || currentRoom.tagline || 'Đang cập nhật'}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Movies Showing In This Hall Section (Real Showtimes Filtered) */}
      <section className="border-t border-zinc-850 py-16 md:py-20 bg-zinc-950/20">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal direction="up">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/80">
              <SectionHeading>
                Phim đang chiếu tại {roomTypeName}
              </SectionHeading>
              <span className="text-body3 text-text-sub3 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full font-medium">
                Có {filteredMovies.length} phim
              </span>
            </div>
          </ScrollReveal>

          {loadingMovies ? (
            <div className="py-12 flex justify-center items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#CF0F47]"></div>
              <span className="text-text-sub3 text-body2">Đang tải danh sách phim...</span>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="py-12 text-center text-text-sub3 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/20">
              Hiện tại không có lịch chiếu suất phim nào tại phòng chiếu này. Vui lòng quay lại sau hoặc chọn phòng chiếu khác.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto justify-center">
              {filteredMovies.map((movie, idx) => (
                <ScrollReveal key={movie.id} delay={(idx % 4) * 60} direction="up">
                  <MovieCard movie={movie} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
