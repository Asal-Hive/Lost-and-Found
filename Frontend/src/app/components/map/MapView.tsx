import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, useMapEvents } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import type { LatLngLiteral } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { itemsApi, Item, CATEGORY_LABELS } from '../../../services/itemsApi';
import { ItemDetailModal } from '../items/ItemDetailModal';
import { MyLocationControl } from './MyLocationControl';
import { CreateItemModal } from '../items/CreateItemModal';
import { Input } from '../ui/input';
import { Search, MapPin, Filter, X } from 'lucide-react';

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

function DblClickToCreate({ onPick }: { onPick: (pos: { lat: number; lng: number }) => void }) {
  useMapEvents({
    dblclick(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createPos, setCreatePos] = useState<{ lat: number; lng: number } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [titleFilter, setTitleFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(''); // tag/category
  const [locationFilter, setLocationFilter] = useState('');

  const handleMapDblClick = (pos: { lat: number; lng: number }) => {
    setCreatePos(pos);
    setIsCreateOpen(true);
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setTitleFilter('');
    setCategoryFilter('');
    setLocationFilter('');
  };

  useEffect(() => {
    const t = setTimeout(() => {
      loadItems();
    }, titleFilter ? 500 : 0); // debounce only when typing title

    return () => clearTimeout(t);
  }, [statusFilter, titleFilter, categoryFilter, locationFilter]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await itemsApi.getItems({
        status: statusFilter === 'all' ? undefined : statusFilter,
        // backend "search" includes title/description/location; we still apply title-only below
        search: titleFilter || undefined,
        category: categoryFilter || undefined,
        location: locationFilter || undefined,
      });
      let out = data.filter((it) => it.is_active);

      // Title-only filter (so it doesn't match description)
      const t = titleFilter.trim().toLowerCase();
      if (t) {
        out = out.filter((it) => (it.title || '').toLowerCase().includes(t));
      }

      setItems(out);
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
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DblClickToCreate onPick={handleMapDblClick} />
        <MyLocationControl onLocate={setMyPos} label="مکان فعلی من" />
        {myPos && <Marker position={myPos} />}
        {!loading && items.length > 0 && (
          <MarkerClusterLayer items={items} onMarkerClick={handleMarkerClick} />
        )}
      </MapContainer>

      {/* Filters (Map) */}
      <div className="absolute bottom-0 right-0 bg-white/90 backdrop-blur shadow-lg p-3 z-[1000] w-[320px] rounded-xl" dir="rtl">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">فیلترها</div>

          <div className="flex items-center gap-2">
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-blue-700 hover:text-blue-900"
            >
              پاک کردن
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-2 text-xs bg-red-50 border border-red-200 text-red-800 rounded-md p-2">
            {error}
          </div>
        )}

        {/* Status */}
        <div className="flex gap-2 flex-wrap mb-2">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
            }`}
          >
            همه
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('lost')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'lost'
                ? 'bg-red-600 text-white shadow'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-red-400'
            }`}
          >
            گمشده
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('found')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === 'found'
                ? 'bg-green-600 text-white shadow'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-green-400'
            }`}
          >
            پیدا شده
          </button>
        </div>

        {/* Title */}
        <div className="relative mb-2">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            placeholder="فیلتر بر اساس عنوان..."
            className="pr-9"
          />
          {titleFilter && (
            <button
              type="button"
              onClick={() => setTitleFilter('')}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tag/Category */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
            <Filter className="w-4 h-4" />
            برچسب:
          </span>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">همه</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {categoryFilter && (
            <button
              type="button"
              onClick={() => setCategoryFilter('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location */}
        <div className="relative">
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="فیلتر بر اساس مکان..."
            className="pr-9"
          />
          {locationFilter && (
            <button
              type="button"
              onClick={() => setLocationFilter('')}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-2 text-xs text-gray-600">
          {items.length} مورد نمایش داده می‌شود
        </div>
      </div>

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

      <CreateItemModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          loadItems();
        }}
        initialPosition={createPos ?? undefined}
      />

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
