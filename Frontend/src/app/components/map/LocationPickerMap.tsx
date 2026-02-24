import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLngLiteral } from "leaflet";

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
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <MapContainer center={value} zoom={zoom} style={style} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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