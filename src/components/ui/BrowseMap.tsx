"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { useTheme } from "next-themes";

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

interface Item {
  id: string;
  title: string;
  type: string;
  location: string;
  lat?: number | null;
  lng?: number | null;
}

export default function BrowseMap({ items }: { items: Item[] }) {
  const { theme } = useTheme();

  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const withCoords = items.filter((i) => i.lat && i.lng);

  // center على الجزائر افتراضياً
  const center: [number, number] =
    withCoords.length > 0
      ? [withCoords[0].lat!, withCoords[0].lng!]
      : [36.7538, 3.0588];

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{
        height: "600px",
        width: "100%",
        borderRadius: "0.75rem",
        zIndex: 0,
      }}
    >
      <TileLayer
        key={theme}
        url={tileUrl}
        attribution='© <a href="https://carto.com">CARTO</a>'
      />
      {withCoords.map((item) => (
        <Marker key={item.id} position={[item.lat!, item.lng!]} icon={goldIcon}>
          <Popup>
            <div className="text-sm font-medium">{item.title}</div>
            <div className="text-xs text-gray-500 mt-1">{item.location}</div>
            <Link
              href={`/items/${item.id}`}
              className="text-xs text-blue-500 underline mt-1 block"
            >
              عرض التفاصيل
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
