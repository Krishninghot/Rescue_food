import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons under Vite bundling
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  detail?: string;
  kind?: "donation" | "ngo" | "volunteer" | "restaurant";
}

/**
 * Keyless OpenStreetMap + Leaflet map. Swap the TileLayer/Marker logic for
 * @react-google-maps/api if a Google Maps API key is available in production —
 * the MapPoint interface stays identical either way.
 */
export default function MapView({ center, points, radiusKm, height = 360 }: {
  center: [number, number];
  points: MapPoint[];
  radiusKm?: number;
  height?: number;
}) {
  return (
    <div className="rounded-3xl overflow-hidden border border-forest/10 shadow-soft" style={{ height }}>
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {radiusKm && <Circle center={center} radius={radiusKm * 1000} pathOptions={{ color: "#E3A72E", fillOpacity: 0.05 }} />}
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <strong>{p.label}</strong>
              {p.detail && <div className="text-xs mt-1">{p.detail}</div>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
