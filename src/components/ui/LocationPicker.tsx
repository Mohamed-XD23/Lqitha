'use client'

import { useState } from 'react';
import { MapPin, Loader2, } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Dictionary } from "@/lib/dictionary.types";

// ← Leaflet لازم يُحمل client-side فقط
const MapSelector = dynamic(() => import('./MapSelector'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-void rounded-xl flex items-center justify-center">
      <Loader2 className="w-5 h-5 text-gold animate-spin" />
    </div>
  )
})

interface LocationPickerProps {
  value: { lat: number; lng: number; address?: string } | null
  onChange: (loc: { lat: number; lng: number; address?: string } | null) => void
  dict: Dictionary
}

export default function LocationPicker({ value, onChange, dict }: LocationPickerProps) {
  const [showMap, setShowMap] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function useMyLocation() {
    setIsLocating(true)
    setError(null)
    
    if (!navigator.geolocation) {
      setError('الموقع غير مدعوم في هذا المتصفح')
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        
        // Reverse geocoding مجاني عبر Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          )
          const data = await res.json()
          const address = data.display_name?.split(',').slice(0, 3).join(', ')
          onChange({ lat, lng, address })
        } catch {
          onChange({ lat, lng })
        }
        
        setIsLocating(false)
        setShowMap(false)
      },
      (err) => {
        setError('لم نتمكن من تحديد موقعك، اختر يدوياً من الخريطة')
        setIsLocating(false)
        setShowMap(true)
        console.error('Geolocation error:', err)
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  return (
    <div className="space-y-3">
      
      {/* Buttons Row */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={isLocating}
          className="flex items-center gap-2 px-5 py-4 bg-gold/10 border border-gold/30 text-gold rounded-lg text-sm font-medium hover:bg-gold/20 transition-colors disabled:opacity-50"
        >
          {isLocating 
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <MapPin className="w-5 h-5" />
          }
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      {/* Map */}
      {showMap && (
        <div className="rounded-xl overflow-hidden border border-gold/20">
          <MapSelector
            value={value}
            onChange={(loc) => {
              onChange(loc)
              setShowMap(false)
            }}
          />
        </div>
      )}
    </div>
  )
}