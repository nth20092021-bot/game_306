// src/data/historicalFlashbacks.ts

export interface HistoricalFlashbackItem {
  id: number;
  code: string;
  title: string;
  era: string;
  description: string;
  fileName: string;
  imageUrl: string;
  historicalNote?: string;
}

/**
 * Chuẩn hóa URL ảnh tĩnh tương thích mọi môi trường (Localhost, GitHub Pages subpath, etc.)
 */
export function resolveAssetUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:') || /^https?:\/\//i.test(url)) {
    return url;
  }
  const cleanPath = url.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  return `${cleanBase}${cleanPath}`;
}

export const DEFAULT_FLASHBACK_ITEMS: HistoricalFlashbackItem[] = [
  {
    id: 1,
    code: '#01',
    title: 'Việt Nam Hiện Đại & Kỷ Nguyên Vươn Mình',
    era: 'Hiện Đại (Thập niên 2020)',
    description:
      'Đô thị Việt Nam hiện đại rực sáng, thế hệ trẻ làm chủ khoa học công nghệ và vươn tầm tri thức quốc tế.',
    fileName: 'flashback_01.jpg',
    imageUrl: './assets/flashback/flashback_01.jpg',
  },
  {
    id: 2,
    code: '#02',
    title: 'Đại Hội VI & Công Cuộc Đổi Mới Đất Nước',
    era: 'Tháng 12 Năm 1986 (Khởi Xướng Đổi Mới)',
    description:
      'Đại hội đại biểu toàn quốc lần thứ VI — mốc son lịch sử khởi xướng đường lối Đổi Mới toàn diện, mở cửa và hội nhập.',
    fileName: 'flashback_02.jpg',
    imageUrl: './assets/flashback/flashback_02.jpg',
  },
  {
    id: 3,
    code: '#03',
    title: 'Đại Thắng Mùa Xuân 1975',
    era: 'Ngày 30 Tháng 04 Năm 1975',
    description:
      'Xe tăng Quân Giải phóng tiến vào Dinh Độc Lập trưa ngày 30/04/1975, giải phóng hoàn toàn miền Nam, thống nhất đất nước.',
    fileName: 'flashback_03.jpg',
    imageUrl: './assets/flashback/flashback_03.jpg',
  },
  {
    id: 4,
    code: '#04',
    title: 'Huyền Thoại Đường Trường Sơn',
    era: 'Kháng Chiến Chống Mỹ (1959 – 1975)',
    description:
      'Những đoàn xe vận tải quân sự, bộ đội và thanh niên xung phong "Xẻ dọc Trường Sơn đi cứu nước", chi viện cho tiền tuyến lớn miền Nam.',
    fileName: 'flashback_04.jpg',
    imageUrl: './assets/flashback/flashback_04.jpg',
  },
  {
    id: 5,
    code: '#05',
    title: 'Chiến Thắng Điện Biên Phủ',
    era: 'Ngày 07 Tháng 05 Năm 1954',
    description:
      'Lá cờ "Quyết chiến Quyết thắng" tung bay trên nóc hầm tướng De Castries, làm nên chiến thắng "Lừng lẫy năm châu, chấn động địa cầu".',
    fileName: 'flashback_05.jpg',
    imageUrl: './assets/flashback/flashback_05.jpg',
  },
  {
    id: 6,
    code: '#06',
    title: 'Bác Hồ Đọc Tuyên Ngôn Độc Lập',
    era: 'Ngày 02 Tháng 09 Năm 1945',
    description:
      'Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập tại Quảng trường Ba Đình lịch sử, khai sinh nước Việt Nam Dân chủ Cộng hòa.',
    fileName: 'flashback_06.jpg',
    imageUrl: './assets/flashback/flashback_06.jpg',
  },
  {
    id: 7,
    code: '#07',
    title: 'Tổng Khởi Nghĩa Cách Mạng Tháng Tám',
    era: 'Tháng 08 Năm 1945',
    description:
      'Biển người rợp bóng cờ đỏ sao vàng sục sôi khí thế vùng lên tổng khởi nghĩa giành chính quyền về tay nhân dân.',
    fileName: 'flashback_07.jpg',
    imageUrl: './assets/flashback/flashback_07.jpg',
  },
  {
    id: 8,
    code: '#08',
    title: 'Khởi Nghĩa Yên Thế & Phong Trào Yêu Nước',
    era: 'Cuối Thế Kỷ XIX – Đầu Thế Kỷ XX (1884 – 1913)',
    description:
      'Thủ lĩnh Hoàng Hoa Thám ("Hùm thiêng Yên Thế") cùng nghĩa quân kiên cường chiến đấu chống thực dân Pháp suốt gần 30 năm.',
    fileName: 'flashback_08.jpg',
    imageUrl: './assets/flashback/flashback_08.jpg',
  },
  {
    id: 9,
    code: '#09',
    title: 'Quang Trung Đại Phá Quân Thanh',
    era: 'Mùa Xuân Kỷ Dậu 1789',
    description:
      'Hoàng đế Quang Trung (Nguyễn Huệ) cưỡi voi thúc quân thần tốc, làm nên đại thắng Ngọc Hồi – Đống Đa quét sạch 29 vạn quân Thanh.',
    fileName: 'flashback_09.jpg',
    imageUrl: './assets/flashback/flashback_09.jpg',
  },
  {
    id: 10,
    code: '#10',
    title: 'Hào Khí Đông A – Đại Phá Quân Nguyên Mông',
    era: 'Thế Kỷ XIII (Năm 1258, 1285, 1288 – Nhà Trần)',
    description:
      'Quân dân nhà Trần dưới sự chỉ huy của Quốc công Tiết chế Trần Hưng Đạo ba lần đánh tan đế chế Nguyên Mông với chiến thắng Bạch Đằng năm 1288.',
    fileName: 'flashback_10.jpg',
    imageUrl: './assets/flashback/flashback_10.jpg',
  },
  {
    id: 11,
    code: '#11',
    title: 'Phòng Tuyến Sông Như Nguyệt',
    era: 'Mùa Xuân Năm 1077 (Thời Nhà Lý)',
    description:
      'Thái úy Lý Thường Kiệt lãnh đạo quân dân Đại Việt chặn đứng đại quân Tống bên bờ sông Như Nguyệt với bài thơ thần "Nam quốc sơn hà".',
    fileName: 'flashback_11.jpg',
    imageUrl: './assets/flashback/flashback_11.jpg',
    historicalNote:
      'Lưu ý: Nếu ảnh hiện tại có cờ chữ Trần (陳), bạn có thể bấm "Chọn ảnh khác" để thay bằng tranh Lý Thường Kiệt bên sông Như Nguyệt.',
  },
  {
    id: 12,
    code: '#12',
    title: 'Chiến Thắng Bạch Đằng Giang',
    era: 'Năm 938 (Ngô Quyền Đại Phá Quân Nam Hán)',
    description:
      'Ngô Quyền dùng kế đóng cọc gỗ bịt sắt ngầm trên sông Bạch Đằng đánh tan quân Nam Hán, chấm dứt hơn 1.000 năm Bắc thuộc, mở ra kỷ nguyên độc lập.',
    fileName: 'flashback_12.jpg',
    imageUrl: './assets/flashback/flashback_12.jpg',
  },
  {
    id: 13,
    code: '#13',
    title: 'Khởi Nghĩa Hai Bà Trưng',
    era: 'Mùa Xuân Năm 40 (Thế Kỷ I)',
    description:
      'Tiếng trống đồng Mê Linh vang dội, Trưng Trắc – Trưng Nhị cưỡi voi phất cờ khởi nghĩa đánh đuổi thái thú Tô Định, giành lại quyền tự chủ.',
    fileName: 'flashback_13.jpg',
    imageUrl: './assets/flashback/flashback_13.jpg',
  },
  {
    id: 14,
    code: '#14',
    title: 'Thời Đại Hùng Vương & Văn Minh Đông Sơn',
    era: 'Cội Nguồn Dân Tộc (Nhà Nước Văn Lang – Âu Lạc)',
    description:
      'Thời đại các Vua Hùng dựng nước Văn Lang và nền văn minh Đông Sơn rực rỡ với biểu tượng Trống đồng cùng họa tiết chim Lạc linh thiêng.',
    fileName: 'flashback_14.jpg',
    imageUrl: './assets/flashback/flashback_14.jpg',
  },
];
