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

function createClusterIcon(count: number): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative; width:40px; height:40px;">
        <div style="
          width: 40px; height: 40px;
          background: #C4A35A;
          border: 2.5px solid #080810;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(196,163,90,0.5);
        "></div>
        <div style="
          position:absolute; top:-2px; right:-2px;
          min-width:18px; height:18px;
          background:#c96b6b; color:#fff;
          font-family:system-ui; font-size:10px; font-weight:700;
          border-radius:9px; display:flex; align-items:center; justify-content:center;
          padding:0 4px; box-shadow:0 2px 6px rgba(0,0,0,0.4);
          border:1.5px solid #080810;
          z-index:10;
        ">${count}</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
}

interface Item {
  id: string;
  title: string;
  type: string;
  location: string;
  lat?: number | null;
  lng?: number | null;
}

export default function BrowseMap({ items }: { items: Item[] }) {
  const withCoords = items.filter((i) => i.lat && i.lng);

  // center على الجزائر افتراضياً
  const center: [number, number] =
    withCoords.length > 0
      ? [withCoords[0].lat!, withCoords[0].lng!]
      : [36.7538, 3.0588];

  // Group items by lat/lng to handle overlapping markers
  const grouped = withCoords.reduce<Record<string, Item[]>>((acc, item) => {
    const key = `${item.lat},${item.lng}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

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
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {Object.entries(grouped).map(([key, group]) => {
        const [lat, lng] = key.split(",").map(Number);
        const count = group.length;
        const isCluster = count > 1;
        const icon = isCluster ? createClusterIcon(count) : goldIcon;

        return (
          <Marker key={key} position={[lat, lng]} icon={icon}>
            <Popup>
              {isCluster ? (
                <div className="min-w-[160px] max-w-[220px]">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                    {count} items
                  </p>
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                    {group.map((item) => (
                      <Link
                        key={item.id}
                        href={`/items/${item.id}`}
                        className="block border-b border-gray-100 pb-1.5 last:border-0 last:pb-0 hover:opacity-80"
                      >
                        <div className="text-sm font-medium">
                          {item.type === "LOST" ? "🔴" : "🟢"} {item.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {item.location}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-medium">
                    {group[0].type === "LOST" ? "🔴" : "🟢"} {group[0].title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {group[0].location}
                  </div>
                  <Link
                    href={`/items/${group[0].id}`}
                    className="text-xs text-blue-500 underline mt-1 block"
                  >
                    عرض التفاصيل
                  </Link>
                </div>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
