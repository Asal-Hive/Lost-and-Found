import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
  // Sharif University of Technology coordinates
  const sharifCenter: [number, number] = [35.7042, 51.3510];
  const defaultZoom = 17;

  return (
    <div className="w-full h-full">
      <MapContainer
        center={sharifCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
};

export default MapView;
