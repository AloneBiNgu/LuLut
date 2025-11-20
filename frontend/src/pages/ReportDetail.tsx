import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMissingPersonById, updateMissingPersonLocation, MissingPerson } from '../services/missingPersonService';

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<MissingPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Location update state
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editAddress, setEditAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundLocation, setFoundLocation] = useState<{lat: number, lon: number, display_name: string} | null>(null);

  useEffect(() => {
    if (id) {
      getMissingPersonById(id)
        .then(data => {
            setReport(data);
            if (data.lastKnownLocation?.address) {
                setEditAddress(data.lastKnownLocation.address);
            }
        })
        .catch(err => {
            console.error(err);
            setError('Không tìm thấy thông tin hoặc có lỗi xảy ra.');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSearchLocation = async () => {
    if (!editAddress) return;
    setIsSearching(true);
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(editAddress)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
            setFoundLocation({
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                display_name: data[0].display_name
            });
        } else {
            alert('Không tìm thấy tọa độ cho địa chỉ này.');
        }
    } catch (e) {
        console.error(e);
        alert('Lỗi khi tìm kiếm.');
    } finally {
        setIsSearching(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!report || !foundLocation) return;
    try {
        await updateMissingPersonLocation(report.id, {
            latitude: foundLocation.lat,
            longitude: foundLocation.lon,
            address: editAddress // Use the user-typed address or the one from nominatim
        });
        
        // Update local state
        setReport(prev => prev ? ({
            ...prev,
            lastKnownLocation: {
                ...prev.lastKnownLocation!,
                latitude: foundLocation.lat,
                longitude: foundLocation.lon,
                address: editAddress
            }
        }) : null);
        
        setIsEditingLocation(false);
        setFoundLocation(null);
        alert('Cập nhật vị trí thành công!');
    } catch (e) {
        console.error(e);
        alert('Lỗi khi lưu vị trí.');
    }
  };

  if (loading) return <div className="text-center py-10 text-xl">Đang tải thông tin chi tiết...</div>;
  if (error || !report) return <div className="text-center py-10 text-red-500 text-xl">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden my-8 border border-gray-100">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
                <Link to="/" className="text-blue-600 hover:underline mb-2 inline-block">← Quay lại trang chủ</Link>
                <h1 className="text-3xl font-bold text-gray-900">{report.fullName}</h1>
                <p className="text-gray-500 mt-1">Đăng ngày: {new Date(report.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            <span className={`px-4 py-2 text-sm font-bold rounded-full ${
                report.status === 'FOUND' ? 'bg-green-100 text-green-800' : 
                report.status === 'NEED_HELP' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
            }`}>
                {report.status === 'FOUND' ? 'ĐÃ TÌM THẤY' : 
                 report.status === 'NEED_HELP' ? 'CẦN HỖ TRỢ' :
                 'ĐANG TÌM KIẾM'}
            </span>
        </div>

        {/* Photos Section */}
        {report.photoUrls && report.photoUrls.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
                {report.photoUrls.map((url, index) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-sm border bg-gray-100">
                        <img 
                            src={`http://localhost:5000${url}`} 
                            alt={`Ảnh ${index + 1}`} 
                            className="max-h-[500px] w-auto object-contain mx-auto"
                        />
                    </div>
                ))}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">Thông Tin Cá Nhân</h2>
                    <div className="space-y-2 text-gray-700">
                        <p><span className="font-semibold">Họ và tên:</span> {report.fullName}</p>
                        <p><span className="font-semibold">Tuổi:</span> {report.age || 'Chưa rõ'}</p>
                        <p><span className="font-semibold">Giới tính:</span> {report.gender === 'MALE' ? 'Nam' : report.gender === 'FEMALE' ? 'Nữ' : 'Khác/Chưa rõ'}</p>
                        {(report.lastKnownLocation as any)?.district && (
                            <p><span className="font-semibold">Khu vực:</span> {(report.lastKnownLocation as any).district}</p>
                        )}
                        <p><span className="font-semibold">Ngày đăng:</span> {new Date(report.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">Mô Tả Chi Tiết</h2>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {report.description}
                    </p>
                </section>
            </div>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">Thông Tin Liên Hệ</h2>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="mb-2"><span className="font-semibold">Người báo tin:</span> {report.reporterName}</p>
                        <a href={`tel:${report.reporterPhone}`} className="flex items-center gap-2 text-blue-700 font-bold text-lg hover:underline">
                            📞 {report.reporterPhone}
                        </a>
                        <p className="text-sm text-gray-500 mt-2">Hãy gọi ngay nếu bạn có thông tin!</p>
                    </div>
                </section>

                <section>
                    <div className="flex justify-between items-center mb-3 border-b pb-2">
                        <h2 className="text-xl font-bold text-gray-800">Vị Trí</h2>
                        <button 
                            onClick={() => setIsEditingLocation(!isEditingLocation)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            {isEditingLocation ? 'Hủy chỉnh sửa' : '✏️ Cập nhật vị trí'}
                        </button>
                    </div>

                    {isEditingLocation && (
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <label className="block text-sm font-medium mb-1">Nhập địa chỉ chính xác:</label>
                            <div className="flex gap-2 mb-2">
                                <input 
                                    type="text" 
                                    value={editAddress}
                                    onChange={(e) => setEditAddress(e.target.value)}
                                    className="flex-1 border rounded px-3 py-2"
                                    placeholder="Ví dụ: 123 Nguyễn Huệ, Quận 1, TP.HCM"
                                />
                                <button 
                                    onClick={handleSearchLocation}
                                    disabled={isSearching}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isSearching ? 'Đang tìm...' : 'Tìm tọa độ'}
                                </button>
                            </div>
                            
                            {foundLocation && (
                                <div className="mt-2">
                                    <p className="text-sm text-green-700 mb-2">✅ Đã tìm thấy: {foundLocation.display_name}</p>
                                    <p className="text-xs text-gray-500 mb-2">Lat: {foundLocation.lat}, Lon: {foundLocation.lon}</p>
                                    <button 
                                        onClick={handleSaveLocation}
                                        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold"
                                    >
                                        Lưu vị trí mới
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {report.lastKnownLocation ? (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {report.lastKnownLocation.address ? (
                                <a 
                                    href={`https://www.google.com/maps/search/${encodeURIComponent(report.lastKnownLocation.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-blue-700 mb-1 text-lg hover:underline block"
                                >
                                    📍 {report.lastKnownLocation.address} ↗
                                </a>
                            ) : (
                                <p className="font-semibold text-gray-900 mb-1 text-lg">Chưa có địa chỉ cụ thể</p>
                            )}
                            
                            {/* Structured Address Display */}
                            {(report.lastKnownLocation as any).province && (
                                <div className="mt-2 space-y-1 text-gray-700">
                                    {(report.lastKnownLocation as any).street && <p>🏠 <span className="font-medium">Đường/Số nhà:</span> {(report.lastKnownLocation as any).street}</p>}
                                    {(report.lastKnownLocation as any).ward && <p>📍 <span className="font-medium">Phường/Xã:</span> {(report.lastKnownLocation as any).ward}</p>}
                                    {(report.lastKnownLocation as any).district && <p>🏙️ <span className="font-medium">Quận/Huyện:</span> {(report.lastKnownLocation as any).district}</p>}
                                    <p>🌍 <span className="font-medium">Tỉnh/Thành:</span> {(report.lastKnownLocation as any).province}</p>
                                </div>
                            )}

                            <div className="text-sm text-gray-600 font-mono mt-3 pt-3 border-t border-gray-200">
                                <div>Lat: {report.lastKnownLocation.latitude}</div>
                                <div>Long: {report.lastKnownLocation.longitude}</div>
                            </div>
                            <div className="mt-4 flex gap-3">
                                <Link to={`/map?lat=${report.lastKnownLocation.latitude}&lng=${report.lastKnownLocation.longitude}`} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                                    🗺️ Xem trên bản đồ chung
                                </Link>
                                <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${report.lastKnownLocation.latitude},${report.lastKnownLocation.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 hover:underline text-sm flex items-center gap-1"
                                >
                                    🚗 Chỉ đường (Google Maps)
                                </a>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Không có thông tin vị trí</p>
                    )}
                </section>
            </div>
        </div>
      </div>
    </div>
  );
}
