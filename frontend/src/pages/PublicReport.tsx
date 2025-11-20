import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../lib/axios';
import { PROVINCES } from '../data/provinces';

export default function PublicReport() {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ lấy vị trí.');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setValue('latitude', latitude);
        setValue('longitude', longitude);
        
        // Reverse Geocoding (Coords -> Address)
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            const data = await res.json();
            if (data.address) {
                const addr = data.address;
                // Normalize Province
                let rawProv = addr.city || addr.state || "";
                let matchedProv = "";

                // Special handling for common variations
                if (rawProv.toLowerCase().includes("hồ chí minh")) matchedProv = "TP Hồ Chí Minh";
                else if (rawProv.toLowerCase().includes("thừa thiên")) matchedProv = "Thừa Thiên Huế";
                else if (rawProv.toLowerCase().includes("bà rịa")) matchedProv = "Bà Rịa - Vũng Tàu";
                else {
                    // Try to find the province in our list
                    // We strip common prefixes to compare
                    const cleanRaw = rawProv.toLowerCase().replace(/^(tỉnh|thành phố|tp\.?)\s+/i, "").trim();
                    
                    matchedProv = PROVINCES.find(p => {
                        const cleanP = p.toLowerCase().replace(/^(tỉnh|thành phố|tp\.?)\s+/i, "").trim();
                        return cleanRaw === cleanP || cleanRaw.includes(cleanP) || cleanP.includes(cleanRaw);
                    }) || rawProv;
                }

                // If we found a match in our list, use it. Otherwise use the raw value (which might not select anything in dropdown)
                if (PROVINCES.includes(matchedProv)) {
                    setValue('province', matchedProv);
                } else {
                    // Fallback: try to set it anyway, or maybe alert user
                    console.log("Could not match province exactly:", rawProv);
                    setValue('province', matchedProv); 
                }

                setValue('district', addr.city_district || addr.county || addr.district || "");
                setValue('ward', addr.suburb || addr.quarter || addr.neighbourhood || "");
                setValue('street', (addr.house_number ? addr.house_number + " " : "") + (addr.road || ""));
                
                // Auto-fill description address
                const fullAddr = [
                    (addr.house_number ? addr.house_number + " " : "") + (addr.road || ""),
                    addr.suburb || addr.quarter,
                    addr.city_district || addr.county || addr.district,
                    matchedProv
                ].filter(Boolean).join(', ');
                setValue('address', fullAddr);
            }
        } catch (e) {
            console.error("Error reverse geocoding", e);
        }
        setGettingLocation(false);
      },
      (error) => {
        console.error(error);
        alert('Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập vị trí.');
        setGettingLocation(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 0 
      }
    );
  };

  const getCoordinatesFromAddress = async () => {
    const p = watch('province');
    const d = watch('district');
    const w = watch('ward');
    const s = watch('street');
    const full = [s, w, d, p].filter(Boolean).join(', ');
    
    if (!full) return alert("Vui lòng nhập ít nhất Tỉnh/Thành phố");
    
    setGettingLocation(true);
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(full)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
            setValue('latitude', parseFloat(data[0].lat));
            setValue('longitude', parseFloat(data[0].lon));
            alert(`Đã tìm thấy tọa độ: ${data[0].lat}, ${data[0].lon}`);
        } else {
            alert("Không tìm thấy tọa độ cho địa chỉ này. Hãy thử nhập chi tiết hơn hoặc kiểm tra lại.");
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi khi tìm kiếm tọa độ.");
    } finally {
        setGettingLocation(false);
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('fullName', data.name || 'Người cần hỗ trợ');
      if (data.age) formData.append('age', data.age);
      formData.append('description', data.description || 'Không có mô tả');
      formData.append('reporterName', data.reporterName || 'Ẩn danh');
      formData.append('reporterPhone', data.reporterPhone || 'Không có');
      formData.append('lastSeenDate', new Date().toISOString());
      formData.append('contactInfo', data.reporterPhone || 'Không có');
      formData.append('gender', 'UNKNOWN');

      const locationData = {
        latitude: data.latitude ? parseFloat(data.latitude) : 0,
        longitude: data.longitude ? parseFloat(data.longitude) : 0,
        address: `${data.street ? data.street + ', ' : ''}${data.ward ? data.ward + ', ' : ''}${data.district ? data.district + ', ' : ''}${data.province || ''}`,
        province: data.province || '',
        district: data.district || '',
        ward: data.ward || '',
        street: data.street || ''
      };
      formData.append('location', JSON.stringify(locationData));

      if (data.photos && data.photos.length > 0) {
        for (let i = 0; i < data.photos.length; i++) {
          formData.append('photos', data.photos[i]);
        }
      }

      await api.post('/missing-persons', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Báo cáo đã được gửi — cảm ơn bạn đã hỗ trợ.');
      // Optional: Reset form here
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Gửi báo cáo thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Báo cáo người mất tích / Cần hỗ trợ</h2>

      {message && <div className="mb-4 p-3 bg-gray-100 rounded">{message}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">


        <div>
          <label className="block text-sm font-medium">Mô tả</label>
          <textarea {...register('description')} className="w-full mt-1 border rounded p-2" placeholder="Mô tả tình trạng, nhu cầu..." />
        </div>

        <div>
          <label className="block text-sm font-medium">Hình ảnh (Tối đa 3 ảnh)</label>
          <input type="file" multiple accept="image/*" {...register('photos')} className="w-full mt-1 border rounded p-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium">Tỉnh / Thành phố</label>
                <select {...register('province')} className="w-full mt-1 border rounded p-2">
                    <option value="">-- Chọn Tỉnh/Thành --</option>
                    {PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium">Quận / Huyện</label>
                <input {...register('district')} className="w-full mt-1 border rounded p-2" placeholder="Ví dụ: Quận 1" />
            </div>
            <div>
                <label className="block text-sm font-medium">Phường / Xã</label>
                <input {...register('ward')} className="w-full mt-1 border rounded p-2" placeholder="Ví dụ: Phường Bến Nghé" />
            </div>
            <div>
                <label className="block text-sm font-medium">Số nhà / Đường</label>
                <input {...register('street')} className="w-full mt-1 border rounded p-2" placeholder="Ví dụ: 123 Nguyễn Huệ" />
            </div>
        </div>

        <div className="flex justify-end">
            <button 
                type="button"
                onClick={getCoordinatesFromAddress}
                disabled={gettingLocation}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
                {gettingLocation ? 'Đang tìm...' : '📍 Tìm tọa độ từ địa chỉ trên'}
            </button>
        </div>

        <div>
          <label className="block text-sm font-medium">Ghi chú thêm về vị trí</label>
          <input {...register('address')} className="w-full mt-1 border rounded p-2" placeholder="Mô tả thêm (gần trường học, chợ...)" />
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-blue-800">Tọa độ vị trí (Quan trọng để cứu hộ)</label>
            <button 
              type="button" 
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
            >
              {gettingLocation ? 'Đang lấy...' : '📍 Lấy vị trí hiện tại'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500">Vĩ độ (Latitude)</label>
              <input {...register('latitude')} className="w-full mt-1 border rounded p-2 bg-white" placeholder="Ví dụ: 21.0285" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Kinh độ (Longitude)</label>
              <input {...register('longitude')} className="w-full mt-1 border rounded p-2 bg-white" placeholder="Ví dụ: 105.8542" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">* Nhấn nút "Lấy vị trí hiện tại" nếu bạn đang ở nơi cần cứu trợ.</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Tên người báo</label>
          <input {...register('reporterName')} className="w-full mt-1 border rounded p-2" placeholder="Không bắt buộc" />
        </div>

        <div>
          <label className="block text-sm font-medium">Số điện thoại người báo</label>
          <input {...register('reporterPhone')} className="w-full mt-1 border rounded p-2" placeholder="Không bắt buộc" />
        </div>

        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded">
          {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
        </button>
      </form>
    </div>
  );
}
