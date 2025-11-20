import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMissingPersons, updateMissingPersonLocation, MissingPerson } from '../services/missingPersonService';

export default function Home() {
  const [reports, setReports] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAutoGeocoding, setIsAutoGeocoding] = useState(false);

  useEffect(() => {
    // Trigger crawl on home page load (Client-side trigger trick)
    // This ensures data is fresh whenever someone visits the site
    fetch(`${import.meta.env.VITE_API_URL}/admin/crawl`, { method: 'POST' })
        .then(() => console.log('Triggered background crawl'))
        .catch(err => console.error('Failed to trigger crawl', err));

    getMissingPersons()
      .then(data => {
        // Sort by updatedAt descending (newest first)
        const sorted = data.sort((a: any, b: any) => {
            const dateA = new Date(a.updatedAt || a.createdAt).getTime();
            const dateB = new Date(b.updatedAt || b.createdAt).getTime();
            return dateB - dateA;
        });
        setReports(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Batch Geocoding Logic
  useEffect(() => {
    if (reports.length > 0 && !isAutoGeocoding) {
        const toProcess = reports.filter(r => 
            r.lastKnownLocation && 
            r.lastKnownLocation.latitude === 0 && 
            r.lastKnownLocation.longitude === 0 &&
            r.lastKnownLocation.address
        );

        if (toProcess.length > 0) {
            processBatchGeocoding(toProcess);
        }
    }
  }, [reports, isAutoGeocoding]);

  const processBatchGeocoding = async (items: MissingPerson[]) => {
    setIsAutoGeocoding(true);
    console.log(`[Batch] Found ${items.length} reports needing geocoding.`);

    for (const report of items) {
        try {
            const addr = report.lastKnownLocation!.address!;
            const district = (report.lastKnownLocation as any).district || '';
            
            // Clean address for better search results
            let cleanAddr = addr.replace(/\n/g, ', ').replace(/\s+/g, ' ').trim();
            cleanAddr = cleanAddr.replace(/^(địa chỉ|tại|ở|khu vực)\s*[:\.]?\s*/i, '');
            cleanAddr = cleanAddr.replace(/\([^)]*\)/g, '').trim();
            
            // If address is too short or generic, append district/area
            if (cleanAddr.length < 10 && district) {
                cleanAddr = `${cleanAddr}, ${district}`;
            } else if (district && !cleanAddr.toLowerCase().includes(district.toLowerCase())) {
                 // Append district if not already in address
                 cleanAddr = `${cleanAddr}, ${district}`;
            }
            
            if (cleanAddr.length > 100) cleanAddr = cleanAddr.substring(0, 100);

            console.log(`[Batch] Geocoding: ${cleanAddr}`);
            
            // 1. Call Nominatim
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanAddr + ', Việt Nam')}&limit=1`);
            const data = await res.json();
            
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                
                console.log(`Found coords: ${lat}, ${lon}`);

                // 2. Update Backend
                await updateMissingPersonLocation(report.id, {
                    latitude: lat,
                    longitude: lon,
                    address: addr // Keep original address
                });

                // 3. Update Local State
                setReports(prev => prev.map(p => {
                    if (p.id === report.id) {
                        return {
                            ...p,
                            lastKnownLocation: {
                                ...p.lastKnownLocation!,
                                latitude: lat,
                                longitude: lon
                            }
                        };
                    }
                    return p;
                }));
            } else {
                console.log(`[Batch] No coords found for: ${cleanAddr}`);
            }
            
            // 4. Wait 1.5s to respect API limits
            await new Promise(r => setTimeout(r, 1500));

        } catch (e) {
            console.error("[Batch] Error:", e);
        }
    }
    setIsAutoGeocoding(false);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center bg-blue-50 rounded-xl">
        <h1 className="text-4xl font-bold text-primary">Nền Tảng Hỗ Trợ Lũ Lụt</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Kết nối những người cần giúp đỡ với cộng đồng. Hãy chia sẻ thông tin để cứu người.
        </p>
        <div className="flex gap-4 mt-4">
          <Link to="/report" className="px-6 py-3 text-white rounded-lg bg-red-600 hover:bg-red-700 font-medium shadow-lg">
            Gửi Yêu Cầu Cứu Trợ
          </Link>
          <Link to="/map" className="px-6 py-3 text-white rounded-lg bg-blue-600 hover:bg-blue-700 font-medium shadow-lg">
            Xem Bản Đồ Cứu Trợ
          </Link>
        </div>
      </div>

      {/* Emergency Hotlines Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">🆘</div>
          <div className="text-2xl font-bold text-red-600">112</div>
          <div className="text-sm text-gray-600 font-medium">Tìm kiếm cứu nạn</div>
          <div className="text-xs text-gray-500">(Toàn quốc)</div>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">👮</div>
          <div className="text-2xl font-bold text-blue-600">113</div>
          <div className="text-sm text-gray-600 font-medium">Cảnh sát</div>
        </div>
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">🚒</div>
          <div className="text-2xl font-bold text-orange-600">114</div>
          <div className="text-sm text-gray-600 font-medium">Cứu hỏa</div>
        </div>
        <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center hover:shadow-md transition-shadow">
          <div className="text-3xl mb-2">🚑</div>
          <div className="text-2xl font-bold text-green-600">115</div>
          <div className="text-sm text-gray-600 font-medium">Cấp cứu</div>
        </div>
      </div>

      {/* Auto Geocoding Status Indicator */}
      {isAutoGeocoding && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-pulse z-50">
          <span>🔄 Đang tự động cập nhật vị trí...</span>
        </div>
      )}

      {/* Recent Reports Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-600 pl-3">Tin Cần Hỗ Trợ Mới Nhất</h2>
        
        {loading ? (
          <div className="text-center py-10">Đang tải danh sách...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Chưa có tin nào được đăng.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                {report.photoUrls && report.photoUrls.length > 0 && (
                  <div className="h-64 overflow-hidden bg-gray-100 border-b">
                    <img 
                      src={`http://localhost:5000${report.photoUrls[0]}`} 
                      alt={report.fullName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">{report.fullName}</h3>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                      report.status === 'FOUND' ? 'bg-green-100 text-green-800' : 
                      report.status === 'NEED_HELP' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status === 'FOUND' ? 'Đã tìm thấy' : 
                       report.status === 'NEED_HELP' ? 'Cần hỗ trợ' :
                       'Đang tìm kiếm'}
                    </span>
                  </div>
                  
                  <p className="text-base text-gray-600 mb-4">
                    Đăng bởi: <span className="font-medium text-gray-900">{report.reporterName}</span> • {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                  </p>

                  <div className="space-y-3 text-base text-gray-800">
                    <p className="line-clamp-4"><span className="font-bold">Mô tả:</span> {report.description}</p>
                    {report.age && <p><span className="font-bold">Tuổi:</span> {report.age}</p>}
                    {(report.lastKnownLocation as any)?.district && (
                        <p><span className="font-bold">Khu vực:</span> {(report.lastKnownLocation as any).district}</p>
                    )}
                    
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-3">
                      <p className="font-bold text-blue-900 mb-1 text-lg">📍 Vị trí hiện tại:</p>
                      {report.lastKnownLocation?.address ? (
                        <a 
                            href={`https://www.google.com/maps/search/${encodeURIComponent(report.lastKnownLocation.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-800 font-medium hover:underline hover:text-blue-600 block"
                            title="Xem trên Google Maps"
                        >
                            {report.lastKnownLocation.address} ↗
                        </a>
                      ) : (
                        <p className="italic text-gray-500">Chưa có địa chỉ cụ thể</p>
                      )}

                      {/* Show Province/District if available */}
                      {(report.lastKnownLocation as any)?.province && (
                        <div className="mt-1 text-sm text-gray-600">
                           {(report.lastKnownLocation as any).district ? `${(report.lastKnownLocation as any).district}, ` : ''}
                           <span className="font-semibold text-blue-700">{(report.lastKnownLocation as any).province}</span>
                        </div>
                      )}
                      
                      {report.lastKnownLocation && (
                        <div className="mt-2 text-sm text-blue-600 flex gap-3 font-mono">
                          <span>Lat: {report.lastKnownLocation.latitude.toFixed(5)}</span>
                          <span>Long: {report.lastKnownLocation.longitude.toFixed(5)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t flex justify-between items-center">
                    <a href={`tel:${report.reporterPhone}`} className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow transition-colors">
                      📞 {report.reporterPhone}
                    </a>
                    <Link to={`/report/${report.id}`} className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                      Xem Chi Tiết →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
