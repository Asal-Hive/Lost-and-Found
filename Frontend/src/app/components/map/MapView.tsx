import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import type { LatLngLiteral } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { itemsApi, Item } from '../../../services/itemsApi';
import { ItemDetailModal } from '../items/ItemDetailModal';
import { MyLocationControl } from './MyLocationControl';

// Fix for Leaflet default icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Import markercluster (extends Leaflet L namespace)
import 'leaflet.markercluster';

// Custom colored icons for lost/found items
const createLostIcon = (): DivIcon => {
  return new DivIcon({
    html: `<div style="
      background-color: #ef4444;
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

const createFoundIcon = (): DivIcon => {
  return new DivIcon({
    html: `<div style="
      background-color: #22c55e;
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

// Component to handle marker clustering using useMap hook
function MarkerClusterLayer({ items, onMarkerClick }: { items: Item[]; onMarkerClick: (itemId: number) => void }) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    // Remove existing cluster group if it exists
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    // Create new cluster group (L.markerClusterGroup is added by leaflet.markercluster)
    // @ts-ignore - markerClusterGroup is added by leaflet.markercluster plugin
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      removeOutsideVisibleBounds: true,
    });

      // Create markers for each item
      items.forEach((item) => {
        const icon = item.status === 'lost' ? createLostIcon() : createFoundIcon();
        const marker = L.marker([item.latitude, item.longitude], { icon });
        
        marker.on('click', () => {
          onMarkerClick(item.id);
        });

        clusterGroup.addLayer(marker);
      });

      // Add cluster group to map
      clusterGroupRef.current = clusterGroup;
      map.addLayer(clusterGroup);

    // Cleanup function
    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [map, items, onMarkerClick]);

  return null;
}

const MapView = () => {
  // Sharif University of Technology coordinates
  const sharifCenter: [number, number] = [35.7042, 51.3510];
  const defaultZoom = 17;

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myPos, setMyPos] = useState<LatLngLiteral | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await itemsApi.getItems();
      setItems(data.filter(item => item.is_active));
    } catch (err) {
      console.error('Error loading items:', err);
      setError('خطا در بارگذاری آیتم‌ها از نقشه');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (itemId: number) => {
    setSelectedItemId(itemId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItemId(null);
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={sharifCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MyLocationControl onLocate={setMyPos} label="مکان فعلی من" />
        {myPos && <Marker position={myPos} />}
        {!loading && items.length > 0 && (
          <MarkerClusterLayer items={items} onMarkerClick={handleMarkerClick} />
        )}
      </MapContainer>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-700">در حال بارگذاری...</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute top-4 left-4 bg-red-50 border border-red-200 rounded-lg shadow-lg p-3 z-[1000]">
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Legend */}
      {!loading && items.length > 0 && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]" dir="rtl">
          <div className="text-sm font-semibold mb-2">راهنمای نقشه</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
              <span className="text-xs">گم‌شده</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
              <span className="text-xs">پیدا شده</span>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        itemId={selectedItemId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default MapView;
