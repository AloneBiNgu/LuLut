import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Location } from '../services/locationService';
import { useEffect } from 'react';

// Custom Icons
const createIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const redIcon = createIcon('red');
const blueIcon = createIcon('blue');
const greenIcon = createIcon('green');
const orangeIcon = createIcon('orange');
// const goldIcon = createIcon('gold');

interface MapProps {
  locations: Location[];
  center?: [number, number];
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function Map({ locations, center }: MapProps) {
  // Default center (Vietnam - Hanoi approx)
  const defaultCenter: [number, number] = [21.0285, 105.8542]; 

  // Jitter logic to handle overlapping markers
  const displayLocations = locations.map((loc, _index, self) => {
    // Find all locations with the exact same coordinates
    const sameLocs = self.filter(l => 
      Math.abs(l.latitude - loc.latitude) < 0.00001 && 
      Math.abs(l.longitude - loc.longitude) < 0.00001
    );

    if (sameLocs.length > 1) {
      const idx = sameLocs.findIndex(l => l.id === loc.id);
      // Spread them out in a circle
      const angle = (idx / sameLocs.length) * 2 * Math.PI;
      const radius = 0.0002 * (1 + Math.floor(idx / 8)); // Increase radius if many items
      
      return {
        ...loc,
        latitude: loc.latitude + Math.cos(angle) * radius,
        longitude: loc.longitude + Math.sin(angle) * radius
      };
    }
    return loc;
  });

  const translateType = (type: string) => {
    const types: Record<string, string> = {
      'USER_LOCATION': 'Người cần hỗ trợ',
      'RESOURCE_POINT': 'Điểm cứu trợ',
      'SAFE_ZONE': 'Vùng an toàn',
      'DANGER_ZONE': 'Vùng nguy hiểm',
      'EVACUATION_CENTER': 'Trung tâm sơ tán',
      'FLOODED_AREA': 'Khu vực ngập lụt',
      'HAZARD': 'Nguy hiểm'
    };
    return types[type] || type;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'USER_LOCATION':
      case 'DANGER_ZONE':
      case 'HAZARD':
      case 'FLOODED_AREA':
        return redIcon;
      case 'SAFE_ZONE':
      case 'EVACUATION_CENTER':
        return greenIcon;
      case 'RESOURCE_POINT':
        return orangeIcon;
      default:
        return blueIcon;
    }
  };

  return (
    <MapContainer center={center || defaultCenter} zoom={center ? 15 : 6} scrollWheelZoom={true} className="h-[600px] w-full rounded-lg shadow-lg z-0">
      {center && <ChangeView center={center} zoom={15} />}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {displayLocations.map(loc => (
        <Marker 
          key={loc.id} 
          position={[loc.latitude, loc.longitude]}
          icon={getIcon(loc.locationType)}
        >
          <Popup>
            <div className="font-bold text-base mb-1">{translateType(loc.locationType)}</div>
            {loc.photoUrls && loc.photoUrls.length > 0 && (
              <div className="mb-2">
                <img 
                  src={`http://localhost:5000${loc.photoUrls[0]}`} 
                  alt="Location" 
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}
            <div className="text-sm mb-1">{loc.description || 'Không có mô tả'}</div>
            {loc.address && <div className="text-xs text-gray-500">📍 {loc.address}</div>}
            <div className="text-xs text-gray-400 mt-1">
              {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
            </div>
            {loc.reporterName && <div className="text-xs text-blue-600 mt-1">Báo bởi: {loc.reporterName}</div>}
            <div className="mt-2 pt-2 border-t">
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-green-600 hover:underline flex items-center gap-1"
              >
                🚗 Chỉ đường đến đây
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
