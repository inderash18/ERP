import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useErp } from '../../context/ErpContext';

// Fix Leaflet's default icon paths issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const factoryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const vendorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A small orange circle to represent moving goods
const truckIcon = new L.DivIcon({
  className: 'moving-truck-icon',
  html: '<div style="background-color: #f59e0b; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

// Main Hub Coordinates (e.g. Navi Mumbai)
const FACTORY_COORDS = [19.0330, 73.0297];

// Simple geocoder mock dictionary
const GEO_DICTIONARY = {
  'mumbai': [19.0760, 72.8777],
  'pune': [18.5204, 73.8567],
  'delhi': [28.7041, 77.1025],
  'bengaluru': [12.9716, 77.5946],
  'chennai': [13.0827, 80.2707],
  'kolkata': [22.5726, 88.3639],
  'hyderabad': [17.3850, 78.4867],
  'ahmedabad': [23.0225, 72.5714],
  'surat': [21.1702, 72.8311],
  'jaipur': [26.9124, 75.7873],
};

function extractCityCoordinates(address) {
  if (!address) return null;
  const lowerAddress = address.toLowerCase();
  for (const [city, coords] of Object.entries(GEO_DICTIONARY)) {
    if (lowerAddress.includes(city)) {
      // Add a tiny bit of random jitter so markers in the same city don't completely overlap
      return [
        coords[0] + (Math.random() - 0.5) * 0.05,
        coords[1] + (Math.random() - 0.5) * 0.05
      ];
    }
  }
  return null;
}

// Helper component to fit map to bounds
const FitBounds = ({ markers }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const group = new L.featureGroup(markers.map(m => L.marker(m.coords)));
      map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 10 });
    }
  }, [markers, map]);
  return null;
};

// Animated Truck Component
const MovingTruck = ({ start, end, duration = 10000, delay = 0 }) => {
  const [position, setPosition] = useState(start);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let startTime;
    let animationFrame;
    let timeout;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        const lat = start[0] + (end[0] - start[0]) * progress;
        const lng = start[1] + (end[1] - start[1]) * progress;
        setPosition([lat, lng]);
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Loop animation
        startTime = null;
        setVisible(false);
        timeout = setTimeout(() => {
          setPosition(start);
          setVisible(true);
          animationFrame = requestAnimationFrame(animate);
        }, 2000);
      }
    };

    timeout = setTimeout(() => {
      setVisible(true);
      animationFrame = requestAnimationFrame(animate);
    }, delay);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timeout);
    };
  }, [start, end, duration, delay]);

  if (!visible) return null;

  return <Marker position={position} icon={truckIcon} zIndexOffset={1000} />;
};


export default function SupplyChainMap() {
  const { suppliers = [] } = useErp();

  // Process suppliers to get coordinates
  const mappedSuppliers = useMemo(() => {
    return suppliers
      .filter(s => s.address && s.status !== 'INACTIVE')
      .map(s => ({
        ...s,
        coords: extractCityCoordinates(s.address)
      }))
      .filter(s => s.coords !== null);
  }, [suppliers]);

  // If no suppliers can be mapped, fallback to a default view
  const center = FACTORY_COORDS;

  return (
    <div className="erp-card" style={{ height: 400, width: '100%', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
      <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Factory Hub Marker */}
        <Marker position={FACTORY_COORDS} icon={factoryIcon}>
          <Popup>
            <div style={{ fontWeight: 600 }}>Elvara Furniture Factory</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Main Manufacturing Hub</div>
          </Popup>
        </Marker>

        {/* Supplier Markers and Routes */}
        {mappedSuppliers.map((supplier, idx) => (
          <React.Fragment key={supplier.id || supplier._id}>
            <Marker position={supplier.coords} icon={vendorIcon}>
              <Popup>
                <div style={{ fontWeight: 600 }}>{supplier.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{supplier.address}</div>
                <div style={{ fontSize: 10, marginTop: 4, color: '#059669', fontWeight: 600 }}>ACTIVE ROUTE</div>
              </Popup>
            </Marker>

            {/* Route Line */}
            <Polyline 
              positions={[supplier.coords, FACTORY_COORDS]} 
              color="#3b82f6" 
              weight={2} 
              opacity={0.6}
              dashArray="5, 5"
            />

            {/* Moving Goods Simulation */}
            <MovingTruck 
              start={supplier.coords} 
              end={FACTORY_COORDS} 
              duration={8000 + (Math.random() * 5000)} // random duration between 8-13s
              delay={idx * 1500} // stagger start times
            />
          </React.Fragment>
        ))}

        <FitBounds markers={[...mappedSuppliers, { coords: FACTORY_COORDS }]} />
      </MapContainer>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20, zIndex: 1000,
        background: 'rgba(255,255,255,0.9)', padding: '8px 12px',
        borderRadius: 6, boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        fontSize: 11, fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 6
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#cb2b3e', display: 'inline-block' }} /> Factory Hub
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2a81cb', display: 'inline-block' }} /> Vendor Location
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', border: '1px solid #fff', display: 'inline-block' }} /> Goods In Transit
        </div>
      </div>
    </div>
  );
}
