import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon path issues with Leaflet when bundlers change assets
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/assets/brand/fs-icon.svg',
  iconUrl: '/assets/brand/fs-icon.svg',
  shadowUrl: ''
});

const Dispatch: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // placeholder for realtime connection (socket.io)
  }, []);

  return (
    <div className="h-[80vh]">
      <h1 className="text-2xl font-bold mb-4">Dispatch Center</h1>
      <div className="card h-full">
        <MapContainer center={[14.5995, 120.9842]} zoom={12} style={{ height: '70vh', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[14.5995, 120.9842]}>
            <Popup>Sample vehicle</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default Dispatch;
