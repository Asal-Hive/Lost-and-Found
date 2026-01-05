import MapView from "../components/map/MapView";

export default function MapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6" dir="rtl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">نقشه دانشگاه</h2>
        <p className="text-gray-600">
          نقشه تعاملی دانشگاه شریف
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-[600px]">
          <MapView />
        </div>
      </div>
    </div>
  );
}
