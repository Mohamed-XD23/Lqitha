"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";

// Fix Leaflet default icon في Next.js
const goldIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 32px; height: 32px;
      background: #C4A35A;
      border: 2px solid #080810;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(196,163,90,0.4);
    "></div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface Props {
  value: { lat: number; lng: number } | null;
  onChange: (loc: { lat: number; lng: number; address?: string }) => void;
}

function ClickHandler({ onChange }: { onChange: Props["onChange"] }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        );
        const data = await res.json();
        const address = data.display_name?.split(",").slice(0, 3).join(", ");
        onChange({ lat, lng, address });
      } catch {
        onChange({ lat, lng });
      }
    },
  });
  return null;
}

export default function MapSelector({ value, onChange }: Props) {
  const defaultCenter: [number, number] = [36.7538, 3.0588];
  const center: [number, number] = value
    ? [value.lat, value.lng]
    : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "280px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <ClickHandler onChange={onChange} />
      {value && <Marker position={[value.lat, value.lng]} icon={goldIcon} />}
    </MapContainer>
  );
}
