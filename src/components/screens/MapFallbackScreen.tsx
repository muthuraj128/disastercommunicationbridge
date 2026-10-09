import React from 'react';
import { Map, MapPin, Compass, Navigation } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MapFallbackScreen: React.FC = () => {
  const { reports, shelters } = useApp();

  return (
    <div style={{ padding: '0 12px 28px 12px', maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--alert-amber)' }}>
          <Map style={{ width: '22px', height: '22px' }} />
          <span>Offline Fallback Map & Coordinate Grid</span>
        </h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Accessible vector grid when OpenStreetMap web tiles are unavailable offline
        </div>
      </div>

      <div className="glass-panel" style={{
        padding: '20px',
        marginBottom: '16px',
        background: 'var(--bg-surface-elevated)',
        borderRadius: 'var(--radius-md)',
        position: 'relative',
        minHeight: '260px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.15,
          backgroundImage: 'radial-gradient(circle, var(--text-main) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', zIndex: 1 }}>
          <span className="badge badge-mesh" style={{ gap: '4px' }}>
            <Compass style={{ width: '12px', height: '12px' }} /> Vector Map Mode
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            N 13.0827° / E 80.2707°
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', zIndex: 1, margin: '20px 0' }}>
          {reports.slice(0, 2).map((r, index) => (
            <div key={r.id} style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--emergency-red-border)',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '0.78rem'
            }}>
              <div style={{ fontWeight: 800, color: 'var(--emergency-red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin style={{ width: '14px', height: '14px' }} />
                <span>SOS #{index + 1} ({r.severity.toUpperCase()})</span>
              </div>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>{r.location.locationName}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '2px' }}>
                {r.location.latitude}° N, {r.location.longitude}° E
              </div>
            </div>
          ))}

          {shelters.slice(0, 2).map((s) => (
            <div key={s.id} style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--sync-green-border)',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '0.78rem'
            }}>
              <div style={{ fontWeight: 800, color: 'var(--sync-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Navigation style={{ width: '14px', height: '14px' }} />
                <span>Shelter: {s.name}</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '2px' }}>
                {s.totalCapacity - s.currentOccupancy} beds available
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textAlign: 'center', zIndex: 1 }}>
          ⚠️ OpenStreetMap tile cache offline. Coordinates displayed via local GPS & landmark index.
        </div>
      </div>
    </div>
  );
};
