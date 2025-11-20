import { useEffect, useState } from 'react';
import { Routes, Route, Link, useSearchParams } from 'react-router-dom';
import Map from './components/Map';
import { getLocations, Location } from './services/locationService';
import PublicReport from './pages/PublicReport';
import Home from './pages/Home';
import ReportDetail from './pages/ReportDetail';
import { PROVINCES } from './data/provinces';

const MapView = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);

  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      setMapCenter([parseFloat(lat), parseFloat(lng)]);
    }
  }, [searchParams]);

  useEffect(() => {
    getLocations()
      .then(setLocations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const province = e.target.value;
    if (!province) return;

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(province + ", Vietnam")}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (error) {
      console.error("Error fetching province coordinates:", error);
    }
  };

  if (loading) return <div>Đang tải bản đồ...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Bản Đồ Trực Tuyến</h2>
        <div className="w-full md:w-64">
          <select 
            onChange={handleProvinceChange}
            className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Chọn Tỉnh/Thành phố --</option>
            {PROVINCES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <Map 
        locations={locations} 
        center={mapCenter}
      />
    </div>
  );
};

const NavBar = () => {
  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-4 container mx-auto">
        <Link to="/" className="text-xl font-bold text-blue-600">Cứu Trợ Lũ Lụt</Link>
        <div className="flex gap-4 items-center">
          <Link to="/" className="hover:text-blue-600 font-medium">Trang Chủ</Link>
          <Link to="/map" className="hover:text-blue-600 font-medium">Bản Đồ</Link>
          <Link to="/report" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium">Báo Cáo Ngay</Link>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/report" element={<PublicReport />} />
          <Route path="/report/:id" element={<ReportDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

