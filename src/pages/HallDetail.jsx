import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { getNowShowing } from '../services/movieService';
import { Info, Check, Calendar, CircleUser, Images, ArrowLeft } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';

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

export default function HallDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);

  const currentRoom = ROOMS_DATA[id] || ROOMS_DATA['2d'];

  const roomTypeName = id === '2d' ? '2D' :
    id === '3d' ? '3D' :
      id === 'imax' ? 'IMAX®' :
        id === '4dx' ? '4DX®' :
          id === 'screenx' ? 'ScreenX' :
            id === 'starium' ? 'Starium' :
              id === 'gold-class' ? 'Gold Class' :
                id === 'lamour' ? 'L\'amour' :
                  id === 'cine-living' ? 'Cine & Living' :
                    id === 'cine-suite' ? 'Cine & Suite' :
                      id === 'cine-foret' ? 'Cine & Forêt' : '2D';

  // Fetch movies currently showing on mount
  useEffect(() => {
    const fetchMovies = async () => {
      setLoadingMovies(true);
      try {
        const movies = await getNowShowing();
        setNowShowingMovies(movies);
      } catch (err) {
        console.error('Failed to load now showing movies for detail page', err);
      } finally {
        setLoadingMovies(false);
      }
    };
    fetchMovies();
  }, []);

  const handleBack = () => {
    // Navigate back to Hall list and restore category state
    navigate('/hall', { state: { category: location.state?.category || 'tech' } });
  };

  // Filter movies playing in this hall dynamically
  const getFilteredMovies = () => {
    if (!nowShowingMovies || nowShowingMovies.length === 0) return [];

    // Assign movies dynamically based on format rules
    switch (id) {
      case 'imax':
        return nowShowingMovies.filter(m =>
          m.genre?.some(g => ['Hành Động', 'Viễn Tưởng', 'Phiêu Lưu'].includes(g)) || m.id === 3
        );
      case '4dx':
      case 'screenx':
      case 'starium':
        return nowShowingMovies.filter(m =>
          m.genre?.some(g => ['Hành Động', 'Gia Đình', 'Hài Hước'].includes(g)) || m.id === 2 || m.id === 3
        );
      case 'gold-class':
      case 'cine-suite':
        return nowShowingMovies.filter(m => m.id === 1 || m.id === 2);
      case 'lamour':
        return nowShowingMovies.filter(m =>
          m.genre?.some(g => ['Tâm Lý', 'Tình Cảm', 'Gia Đình'].includes(g)) || m.id === 1
        );
      case 'cine-living':
      case 'cine-foret':
        return nowShowingMovies.filter(m =>
          m.genre?.some(g => ['Gia Đình', 'Hài Hước'].includes(g)) || m.id === 2
        );
      case '2d':
      case '3d':
      default:
        return nowShowingMovies;
    }
  };

  const filteredMovies = getFilteredMovies();

  // Filter seats present in the active hall
  const filteredSeats = SEATS_DATA.filter((seat) =>
    currentRoom.seats?.includes(seat.id)
  );

  return (
    <div className="bg-bg-dark text-text-main min-h-screen pt-8 pb-20">
      {/* Back button and breadcrumb */}
      <section className="max-w-7xl mx-auto px-4 mb-8">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-body2 font-bold text-text-sub3 hover:text-white transition-colors cursor-pointer bg-zinc-900/60 border border-zinc-800 px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4 text-text-sub2" strokeWidth={2} />
          Quay lại
        </button>
      </section>

      {/* Room Details Block */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Image View */}
            <div className="relative group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 aspect-[16/10] shadow-[0_0_25px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 border border-transparent group-hover:border-zinc-850 rounded-xl transition-all duration-300 pointer-events-none z-20"></div>

              <img
                src={currentRoom.images[activeImageIndex]}
                alt={currentRoom.name}
                className="w-full h-full object-cover z-10"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent opacity-50 z-10"></div>

              {/* Image index badge */}
              <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-xs text-[11px] text-text-sub1 px-2.5 py-1 rounded-full border border-zinc-850 flex items-center gap-1.5 z-20">
                <Images className="w-3.5 h-3.5 text-text-sub3" />
                {activeImageIndex + 1} / {currentRoom.images.length}
              </span>
            </div>

            {/* Thumbnails Row */}
            <div className="grid grid-cols-4 gap-3">
              {currentRoom.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-[16/10] rounded-lg overflow-hidden border transition-all relative group cursor-pointer ${activeImageIndex === idx
                      ? 'border-white scale-[1.02] shadow-[0_0_10px_rgba(255,255,255,0.15)]'
                      : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-700'
                    }`}
                >
                  <img src={img} alt={`${currentRoom.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Room Details */}
          <div className="lg:col-span-5 text-left space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-body3 bg-zinc-900 border border-zinc-800 text-text-sub2 px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                  {currentRoom.roomNumber}
                </span>
              </div>
              <h2 className="text-heading1 font-bold text-white tracking-wide mb-2">
                Phòng chiếu <span className="text-cta">{roomTypeName}</span>
              </h2>
            </div>

            <p className="text-body2 text-text-sub2 leading-relaxed">
              {currentRoom.description}
            </p>

            {/* Specification Features (Aligned columns for database compatibility) */}
            <div className="border-t border-zinc-800 pt-6 space-y-4">
              <h3 className="text-label-custom font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-text-sub2" />
                Thông số phòng chiếu
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {currentRoom.features.map((feature, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-zinc-800/40 pb-2">
                    <span className="text-body3 text-text-sub3 w-32 flex-shrink-0 font-medium">{feature.label}:</span>
                    <span className="text-body2 text-text-sub1 font-light">
                      {feature.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seats Available in THIS Room Section (Clean design, minimal colors) */}
      <section className="bg-zinc-950/40 border-t border-b border-[#222222] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading hasBorder={true} className="mb-10">
            Loại ghế có trong phòng chiếu này
          </SectionHeading>

          {/* Seats Cards Flex Layout (centered automatically for any number of seats) */}
          <div className="flex flex-wrap gap-6 justify-center max-w-5xl mx-auto">
            {filteredSeats.map((seat) => (
              <div
                key={seat.id}
                className="w-full sm:w-[320px] bg-zinc-900/40 border border-zinc-850 rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-lg group hover:border-white"
              >
                {/* Seat Type Image */}
                <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-950 border-b border-zinc-850">
                  <img
                    src={seat.image}
                    alt={seat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Seat Type Content */}
                <div className="p-5 flex flex-col flex-grow justify-between gap-2 text-left">
                  <div>
                    <h4 className="text-subtitle font-bold text-white mb-2">
                      {seat.name}
                    </h4>
                    <p className="text-body3 text-text-sub2 leading-relaxed font-light">
                      {seat.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Seating note panel */}
          <div className="mt-12 p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl max-w-3xl mx-auto flex items-start gap-4">
            <Info className="w-6 h-6 text-text-sub2 flex-shrink-0 mt-0.5" />
            <div className="text-left space-y-1.5">
              <h4 className="text-label-custom font-bold text-white">Lưu ý khi đặt vé</h4>
              <p className="text-body3 text-text-sub2 leading-relaxed">
                Từng phòng chiếu được sắp xếp các kiểu ghế tối ưu riêng biệt. Khi tiến hành đặt vé cho suất chiếu tại phòng này, hệ thống sơ đồ ghế ngồi sẽ chỉ hiển thị các loại ghế ở trên. Quý khách vui lòng lưu ý vị trí ghế để có trải nghiệm xem phim hoàn mỹ nhất.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Movies Showing In This Hall Section (4-column layout on large screens) */}
      <section className="border-t border-zinc-850 py-16 md:py-20 bg-zinc-950/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/80">
            <SectionHeading>
              Phim đang chiếu tại {roomTypeName}
            </SectionHeading>
            <span className="text-body3 text-text-sub3 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full font-medium">
              Có {filteredMovies.length} phim
            </span>
          </div>

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
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
