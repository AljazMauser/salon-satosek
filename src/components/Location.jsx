import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import L from 'leaflet'

// Fix Leaflet default icon paths with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const position = [45.5647, 15.1914] // Nazorjeva ulica 9, Črnomelj
const googleMapsUrl = 'https://www.google.com/maps/place/Nazorjeva+ulica+9,+8340+Črnomelj/@45.5647,15.1914,17z'

export default function Location() {
  return (
    <section id="lokacija" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="text-gold-500 text-xs md:text-sm uppercase tracking-[0.3em] font-medium">
            Kje smo
          </span>
          <h2 className="section-heading mt-3">Lokacija</h2>
          <div className="gold-line mt-4 mb-6" />
          <p className="section-subheading">
            Nahajamo se v središču Črnomlja, na Nazorjevi ulici 9. Z lahkoto
            nas najdete — parkirni prostor je na voljo pred salonom.
          </p>
        </div>

        {/* Map */}
        <div className="border border-dark-700/50 overflow-hidden">
          <div className="h-[400px] md:h-[500px] w-full">
            <MapContainer
              center={position}
              zoom={16}
              scrollWheelZoom={false}
              className="h-full w-full"
              style={{ background: '#1A1A1A' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>
                  <div className="text-center">
                    <strong>Frizerski salon Satošek</strong>
                    <br />
                    Nazorjeva ulica 9, 8340 Črnomelj
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* Open in Google Maps link */}
        <div className="text-center mt-6">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-dark-300 hover:text-gold-400 transition-colors duration-300 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Odpri v Google Maps
          </a>
        </div>
      </div>
    </section>
  )
}
