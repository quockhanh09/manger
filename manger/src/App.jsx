import { useState, useMemo, useEffect } from 'react'
import './App.css'

// Cấu hình Link Google Sheets (Web App URL)
const GOOGLE_SHEET_API = 'https://script.google.com/macros/s/AKfycbzpaezT2D8zjP7oV6YzCmne6PfchfT8aVp0eqhMbWjPHMeY9O3seh-YbfNtWoJOvOaa0g/exec'; 

// Dữ liệu mẫu dự phòng khi chưa kết nối Google Sheet thành công
const FALLBACK_ARTISTS = [
  {
    id: 1,
    cmsIndex: 1248,
    name: 'APJ',
    englishName: 'APJ',
    type: 'MAN SOLO',
    artistClass: 'ARTIST',
    country: 'Việt Nam',
    company: 'Độc lập',
    workPhone: '0964041788',
    workEmail: 'Booking@spacespeakers.vn',
    managerNote: '',
    debutYear: '2017',
    birthday: '04/04/1996',
    bio: 'Tham gia Underground cuối năm 2017. Được mọi người biết đến qua những bài hát rnb luyến láy...',
    instagram: 'https://www.instagram.com/aypichay/',
    facebook: 'https://www.facebook.com/APJ.Melody/',
    twitter: '',
    tiktok: '',
    youtube: 'https://www.youtube.com/@APJmb',
    threads: 'https://www.threads.net/@aypichay',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'
  }
];

export default function App() {
  const [searchType, setSearchType] = useState('artist'); // 'artist' hoặc 'company'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [artists, setArtists] = useState(FALLBACK_ARTISTS);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Kết nối và tải dữ liệu từ Google Sheets khi khởi chạy
  useEffect(() => {
    if (!GOOGLE_SHEET_API.includes('YOUR_APPS_SCRIPT_ID')) {
      setIsLoading(true);
      fetch(GOOGLE_SHEET_API)
        .then(res => res.json())
        .then(data => {
          console.log("Dữ liệu thô từ Google Sheets trả về:", data); // Giúp bạn check F12 nếu cần
          if (Array.isArray(data) && data.length > 0) {
            const formattedData = data.map((row, index) => {
              // Hàm trợ giúp tìm kiếm key không phân biệt hoa thường, khoảng trắng và dấu gạch dưới
              const getVal = (possibleKeys) => {
                for (let k of possibleKeys) {
                  // Tìm kiếm chính xác hoặc tìm theo dạng chuẩn hóa key
                  const foundKey = Object.keys(row).find(
                    key => key.trim().toLowerCase().replace(/[\s()_-]/g, '') === k.toLowerCase().replace(/[\s()_-]/g, '')
                  );
                  if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') {
                    return row[foundKey];
                  }
                }
                return '';
              };

              return {
                id: index + 1,
                cmsIndex: getVal(['CMS Index', 'cmsIndex', 'STT']),
                // Hỗ trợ quét toàn bộ các biến thể tên cột nghệ sĩ tiếng Anh & tiếng Việt
                name: getVal(['artist name', 'tên nghệ sĩ', 'name', 'artistName', 'Artist Name']) || 'Chưa cập nhật',
                englishName: getVal(['artist name (EN)', 'tên tiếng anh', 'englishName', 'artistNameEN', 'artist name(EN)']) || getVal(['artist name', 'tên nghệ sĩ']),
                type: getVal(['type', 'loại', 'phân loại']),
                artistClass: getVal(['artist class', 'lớp nghệ sĩ']),
                country: getVal(['country', 'quốc gia']) || 'Việt Nam',
                company: getVal(['entertainment', 'công ty', 'company', 'company name']) || 'Độc lập',
                workPhone: getVal(['SĐT liên hệ công việc', 'sdt', 'phone', 'workPhone', 'điện thoại']),
                workEmail: getVal(['email liên hệ công việc', 'email', 'workEmail']),
                managerNote: getVal(['ghi chú về Công Ty Quản Lý', 'note', 'ghi chú']),
                debutYear: getVal(['debut year', 'năm ra mắt', 'debut']),
                birthday: getVal(['birthday', 'ngày tháng năm sinh', 'sinh nhật']),
                bio: getVal(['artist information', 'thông tin giới thiệu nghệ sĩ', 'bio', 'giới thiệu']) || 'Chưa có thông tin giới thiệu.',
                instagram: getVal(['instagram', 'ig']),
                facebook: getVal(['facebook', 'fb']),
                twitter: getVal(['twitter', 'x']),
                tiktok: getVal(['tiktok']),
                youtube: getVal(['youtube', 'yt']),
                threads: getVal(['threads']),
                avatar: getVal(['avatar', 'ảnh', 'image']) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'
              };
            });
            setArtists(formattedData);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Không thể kết nối Google Sheets API, sử dụng dữ liệu mẫu:', err);
          setFetchError(true);
          setIsLoading(false);
        });
    }
  }, []);

  // Xử lý logic tìm kiếm
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const keyword = searchTerm.toLowerCase().trim();

    if (searchType === 'artist') {
      return artists.filter(item => 
        item.name.toLowerCase().includes(keyword) || 
        (item.englishName && item.englishName.toLowerCase().includes(keyword))
      );
    } else {
      return artists.filter(item => 
        item.company.toLowerCase().includes(keyword) || 
        (item.managerNote && item.managerNote.toLowerCase().includes(keyword))
      );
    }
  }, [searchTerm, searchType, artists]);

  // Gợi ý thông minh khi nhập liệu
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const keyword = searchTerm.toLowerCase().trim();
    if (searchType === 'artist') {
      return artists
        .filter(item => item.name.toLowerCase().includes(keyword))
        .map(i => i.name)
        .slice(0, 5);
    } else {
      const comps = [...new Set(artists.map(i => i.company).filter(Boolean))];
      return comps.filter(c => c.toLowerCase().includes(keyword)).slice(0, 5);
    }
  }, [searchTerm, searchType, artists]);

  // Gom nhóm theo công ty khi tìm kiếm theo công ty quản lý
  const groupedByCompany = useMemo(() => {
    if (searchType !== 'company' || !searchTerm.trim()) return {};
    const result = {};
    searchResults.forEach(art => {
      const compKey = art.company || 'Khác';
      if (!result[compKey]) {
        result[compKey] = [];
      }
      result[compKey].push(art);
    });
    return result;
  }, [searchType, searchResults, searchTerm]);

  return (
    <div className="artist-portal">
      {/* HEADER HERO SECTION */}
      <header className="portal-header">
        <div className="badge-top">🎵 APPA - CMC Artist Directory Portal</div>
        <h1>Tra Cứu Thông Tin Nghệ Sĩ</h1>
        <p>Hệ thống trích xuất dữ liệu trực tiếp từ Google Sheets hệ thống quản lý nghệ sĩ.</p>
        {fetchError && (
          <p className="notice-offline">⚠️ Đang hiển thị dữ liệu mẫu (Chưa cấu hình Google Apps Script Web App URL).</p>
        )}
      </header>

      {/* THANH TÌM KIẾM CHÍNH */}
      <div className="search-container">
        <div className="search-filter-tabs">
          <button 
            className={`tab-btn ${searchType === 'artist' ? 'active' : ''}`}
            onClick={() => { setSearchType('artist'); setSearchTerm(''); }}
          >
            👤 Tìm theo Tên nghệ sĩ
          </button>
          <button 
            className={`tab-btn ${searchType === 'company' ? 'active' : ''}`}
            onClick={() => { setSearchType('company'); setSearchTerm(''); }}
          >
            🏢 Tìm theo Công ty quản lý
          </button>
        </div>

        <div className="search-box-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder={searchType === 'artist' ? "Nhập tên nghệ sĩ..." : "Nhập tên công ty quản lý..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>

        {/* Gợi ý nhanh */}
        {suggestions.length > 0 && searchTerm && (
          <div className="suggestions-dropdown">
            {suggestions.map((sug, idx) => (
              <div 
                key={idx} 
                className="suggestion-item"
                onClick={() => setSearchTerm(sug)}
              >
                <span>{searchType === 'artist' ? '🎤' : '🏢'}</span> {sug}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NỘI DUNG KẾT QUẢ */}
      <main className="portal-content">
        {isLoading ? (
          <div className="loading-state">Đang đồng bộ dữ liệu từ Google Sheets...</div>
        ) : !searchTerm.trim() ? (
          <div className="welcome-state">
            <div className="welcome-icon">✨</div>
            <h3>Hệ thống sẵn sàng tra cứu</h3>
            <p>Chọn phương thức tìm kiếm và nhập từ khóa để xem thông tin chi tiết các cột dữ liệu nghệ sĩ.</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="no-result">
            <p>Không tìm thấy dữ liệu phù hợp với từ khóa <strong>"{searchTerm}"</strong>.</p>
          </div>
        ) : searchType === 'artist' ? (
          <div className="artists-grid">
            {searchResults.map(artist => (
              <div className="artist-card" key={artist.id} onClick={() => setSelectedItem(artist)}>
                <div className="card-avatar-wrapper">
                  <img src={artist.avatar} alt={artist.name} className="card-avatar" />
                  <span className="card-badge">{artist.type || artist.artistClass}</span>
                </div>
                <div className="card-body">
                  <h3>{artist.name}</h3>
                  <p className="company-tag">🏢 {artist.company}</p>
                  <p className="card-desc">{artist.bio}</p>
                  <button className="detail-btn">Xem chi tiết các cột thông tin →</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="company-results-container">
            {Object.keys(groupedByCompany).map(compName => (
              <div className="company-group-card" key={compName}>
                <div className="company-header-info">
                  <h2>🏢 {compName}</h2>
                  <span className="artist-count-badge">{groupedByCompany[compName].length} Nghệ sĩ trực thuộc</span>
                </div>
                <div className="artists-grid">
                  {groupedByCompany[compName].map(artist => (
                    <div className="artist-card" key={artist.id} onClick={() => setSelectedItem(artist)}>
                      <div className="card-avatar-wrapper">
                        <img src={artist.avatar} alt={artist.name} className="card-avatar" />
                        <span className="card-badge">{artist.type || 'ARTIST'}</span>
                      </div>
                      <div className="card-body">
                        <h3>{artist.name}</h3>
                        <p className="genre-tag">🇻🇳 {artist.country} {artist.debutYear ? `• Debut: ${artist.debutYear}` : ''}</p>
                        <p className="card-desc">{artist.bio}</p>
                        <button className="detail-btn">Xem chi tiết các cột thông tin →</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL HIỂN THỊ ĐẦY ĐỦ CÁC CỘT DỮ LIỆU TỪ GOOGLE SHEET */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedItem(null)}>✕</button>
            <div className="modal-header-flex">
              <img src={selectedItem.avatar} alt={selectedItem.name} className="modal-avatar" />
              <div>
                <h2>{selectedItem.name} <span className="en-name">({selectedItem.englishName})</span></h2>
                <p className="modal-company">🏢 Công ty / Entertainment: <strong>{selectedItem.company}</strong></p>
                <p className="modal-meta">
                  <span>🏷️ Loại: {selectedItem.type}</span> • <span>🌍 Quốc gia: {selectedItem.country}</span>
                  {selectedItem.debutYear ? ` • 📅 Năm ra mắt: ${selectedItem.debutYear}` : ''}
                  {selectedItem.birthday ? ` • 🎂 Sinh nhật: ${selectedItem.birthday}` : ''}
                </p>
              </div>
            </div>

            <div className="modal-body-scrollable">
              {/* Thông tin giới thiệu */}
              <div className="info-block">
                <h4>📄 Thông tin giới thiệu nghệ sĩ (artist information):</h4>
                <p className="bio-text">{selectedItem.bio}</p>
              </div>

              {/* Thông tin liên hệ */}
              <div className="info-block grid-2col">
                <div>
                  <strong>📞 SĐT liên hệ công việc:</strong>
                  <p>{selectedItem.workPhone || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <strong>✉️ Email liên hệ công việc:</strong>
                  <p>{selectedItem.workEmail || selectedItem.managerNote || 'Chưa cập nhật'}</p>
                </div>
              </div>

              {/* Mạng xã hội & Kênh truyền thông */}
              <div className="info-block">
                <h4>🌐 Mạng xã hội & Kênh truyền thông:</h4>
                <div className="social-links-grid">
                  {selectedItem.facebook && (
                    <a href={selectedItem.facebook} target="_blank" rel="noreferrer" className="social-chip fb">
                      📘 Facebook
                    </a>
                  )}
                  {selectedItem.instagram && (
                    <a href={selectedItem.instagram} target="_blank" rel="noreferrer" className="social-chip ig">
                      📷 Instagram
                    </a>
                  )}
                  {selectedItem.twitter && (
                    <a href={selectedItem.twitter} target="_blank" rel="noreferrer" className="social-chip tw">
                      🐦 Twitter / X
                    </a>
                  )}
                  {selectedItem.tiktok && (
                    <a href={selectedItem.tiktok} target="_blank" rel="noreferrer" className="social-chip tt">
                      🎵 TikTok
                    </a>
                  )}
                  {selectedItem.youtube && (
                    <a href={selectedItem.youtube} target="_blank" rel="noreferrer" className="social-chip yt">
                      ▶️ YouTube
                    </a>
                  )}
                  {selectedItem.threads && (
                    <a href={selectedItem.threads} target="_blank" rel="noreferrer" className="social-chip th">
                      🧵 Threads
                    </a>
                  )}
                  {!selectedItem.facebook && !selectedItem.instagram && !selectedItem.twitter && !selectedItem.tiktok && !selectedItem.youtube && !selectedItem.threads && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Chưa cập nhật liên kết mạng xã hội.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="portal-footer">
        <p>© 2026 Artist Directory System • Dữ liệu đồng bộ trực tiếp từ Google Sheets</p>
      </footer>
    </div>
  )
}