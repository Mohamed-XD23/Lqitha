'use client'

import dynamic from "next/dynamic";
import { Loader2 ,MapPin, Navigation, X } from "lucide-react";
import { useState } from "react";

const ItemMap = dynamic(() => import("./ItemMap"), {
  ssr: false,
  loading: () => (
    <div className="h-55 bg-card border border-primary/15 rounded-xl flex items-center justify-center">
      <Loader2 className="w-5 h-5 text-gold animate-spin" />
    </div>
  ),
})

export default function ItemMapWrapper({ lat, lng, title }: { lat: number, lng: number, title: string }) {
  const [showMap, setShowMap] = useState(false)

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
  const appleMapsUrl = `https://maps.apple.com/?q=${lat},${lng}`
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`

  return (
    <div>
      <button
        onClick={() => setShowMap(!showMap)}
        className="flex items-center justify-between w-full px-6 py-4 hover:bg-primary/5 transition-colors border-b border-border last:border-0"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-3.5 h-3.5 text-primary/50" strokeWidth={2} />
          <span className="font-interface text-xs uppercase tracking-xs text-muted-foreground font-bold">
            GPS
          </span>
        </div>
        <span className="font-interface text-sm font-medium text-foreground font-mono">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
      </button>

      {showMap && (
        <div className="border border-primary/15 rounded-xl overflow-hidden mt-3 shadow-xl">
          <div className="bg-card px-4 py-3 flex items-center justify-between border-b border-primary/10">
            <span className="text-xs font-interface text-muted-foreground uppercase tracking-widest font-bold">
              {title}
            </span>
            <button onClick={() => setShowMap(false)}>
              <X className="w-4 h-4 text-slate hover:text-ivory transition-colors" />
            </button>
          </div>

          <ItemMap lat={lat} lng={lng} title={title} />

          <div className="bg-card border-t border-primary/10 px-4 py-3 flex items-center gap-2 flex-wrap">
            <Navigation className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="text-xs text-muted-foreground font-interface uppercase tracking-widest ml-1">
              فتح في:
            </span>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-interface font-medium transition-colors"
            >
              Google Maps
            </a>
            <a
              href={osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-interface font-medium transition-colors"
            >
              OpenStreetMap
            </a>
            <a
              href={appleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-interface font-medium transition-colors"
            >
              Apple Maps
            </a>
          </div>
        </div>
      )}
    </div>
  )
}