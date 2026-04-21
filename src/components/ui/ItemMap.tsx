"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

interface Props {
  lat: number;
  lng: number;
  title: string;
}

export default function ItemMap({ lat, lng, title }: Props) {
  const { theme } = useTheme();
  const tileUrl =
  theme === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ height: "220px", width: "100%", zIndex: 0 }}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
    >
      <TileLayer
        key={theme}
        url={tileUrl}
        attribution='© <a href="https://carto.com">CARTO</a>'
      />
      <Marker position={[lat, lng]} icon={goldIcon}>
        <Popup>{title}</Popup>
      </Marker>
    </MapContainer>
  );
}
