import { useState } from "react";
import { useMap } from "react-leaflet";
import type { LatLngLiteral } from "leaflet";

type Props = {
  label?: string;                          // button text
  onLocate?: (pos: LatLngLiteral) => void; // optional callback
  flyZoom?: number;                        // zoom when locating
};

export function MyLocationControl({
  label = "مکان فعلی من",
  onLocate,
  flyZoom = 17,
}: Props) {
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

        onLocate?.(next);
        map.flyTo(next, Math.max(map.getZoom(), flyZoom), { animate: true });
      },
      (err) => {
        setLoading(false);
        alert(`دسترسی به موقعیت مکانی ممکن نیست. (${err.message})`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  };

    return (
    <div className="absolute bottom-3 left-3 z-[1000] pointer-events-auto font-sans">
        <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="
            group inline-flex items-center gap-2
            rounded-full px-4 py-2
            bg-blue-600 text-white
            shadow-lg shadow-blue-900/20
            hover:bg-blue-700 hover:shadow-xl
            active:scale-[0.98]
            transition
            disabled:opacity-60 disabled:cursor-not-allowed
        "
        aria-label={label}
        title={label}
        >
        {loading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
        ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/95">
            <path
                d="M12 2v3m0 14v3M2 12h3m14 0h3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
            </svg>
        )}

        <span className="leading-none">{loading ? "در حال یافتن..." : label}</span>
        </button>
    </div>
    );
}