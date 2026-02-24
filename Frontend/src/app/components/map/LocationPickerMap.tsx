import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLngLiteral } from "leaflet";
import { MyLocationControl } from "./MyLocationControl";

type Props = {
  value: LatLngLiteral;
  onChange: (next: LatLngLiteral) => void;
  isOpen?: boolean;     // pass modal open state to invalidate size
  zoom?: number;
  height?: number | string;
  draggable?: boolean;
};

function InvalidateSizeOnOpen({ isOpen }: { isOpen?: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => map.invalidateSize(), 120);
    return () => window.clearTimeout(t);
  }, [isOpen, map]);
  return null;
}

function Recenter({ value }: { value: LatLngLiteral }) {
  const map = useMap();
  useEffect(() => {
    map.setView(value, map.getZoom(), { animate: true });
  }, [value.lat, value.lng]);
  return null;
}

function ClickToPick({ onPick }: { onPick: (pos: LatLngLiteral) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MyLocationButton({ onPick }: { onPick: (pos: { lat: number; lng: number }) => void }) {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (!navigator.geolocation) {
      alert("مرورگر شما از موقعیت مکانی پشتیبانی نمی‌کند.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        onPick(next);
        map.flyTo(next, Math.max(map.getZoom(), 17), { animate: true });
      },
      (err) => {
        setLoading(false);
        // Common: user denied permission
        alert(`دسترسی به موقعیت مکانی ممکن نیست. (${err.message})`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 1000,
        pointerEvents: "auto",
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="bg-white shadow rounded-md px-3 py-2 text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
      >
        {loading ? "در حال یافتن..." : "مکان فعلی من"}
      </button>
    </div>
  );
}

export function LocationPickerMap({
  value,
  onChange,
  isOpen,
  zoom = 17,
  height = 260,
  draggable = true,
}: Props) {
  const style = useMemo(
    () => ({ height: typeof height === "number" ? `${height}px` : height, width: "100%" }),
    [height],
  );

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 relative">
        <MapContainer center={value} zoom={zoom} style={style} scrollWheelZoom>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ✅ New: "My current location" (beautiful control) */}
        <MyLocationControl onLocate={onChange} />

        <InvalidateSizeOnOpen isOpen={isOpen} />
        <Recenter value={value} />
        <ClickToPick onPick={onChange} />

        <Marker
            position={value}
            draggable={draggable}
            eventHandlers={
            draggable
                ? {
                    dragend: (e) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const m = e.target as any;
                    const p = m.getLatLng();
                    onChange({ lat: p.lat, lng: p.lng });
                    },
                }
                : undefined
            }
        />
        </MapContainer>
    </div>
    );
}