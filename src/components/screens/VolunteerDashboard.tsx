import React, { useState } from 'react';
import { HeartHandshake, MapPin, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ResourceType, ReliefResource } from '../../types/dcb';

export const VolunteerDashboard: React.FC = () => {
  const { resources } = useApp();

  const [resourceType, setResourceType] = useState<ResourceType>('rescue_boat');
  const [capacity, setCapacity] = useState<number>(8);
  const [ownerName] = useState<string>('Ramesh Kumar');
  const [phone] = useState<string>('+91 98401 99999');
  const [locationName, setLocationName] = useState<string>('Anna Nagar Waterways Staging');

  const [localResources, setLocalResources] = useState<ReliefResource[]>(resources);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    const newRes: ReliefResource = {
      id: `res_${Date.now()}`,
      ownerId: `vol_${Date.now()}`,
      ownerName,
      ownerPhone: phone,
      resourceType,
      quantity: 1,
      availableCapacity: capacity,
      location: {
        latitude: 13.0827,
        longitude: 80.2707,
        accuracy: 5.0,
        locationName,
        isStale: false,
        timestamp: new Date().toISOString()
      },
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLocalResources([newRes, ...localResources]);
    setShowAddModal(false);
  };

  const toggleAvailability = (id: string) => {
    setLocalResources(prev => prev.map(r => r.id === id ? { ...r, isAvailable: !r.isAvailable } : r));
  };

  return (
    <div style={{ padding: '0 12px 28px 12px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sync-green)' }}>
            <HeartHandshake style={{ width: '22px', height: '22px' }} />
            <span>Volunteer Relief Dashboard</span>
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Declare available resources, capacity & receive rescue assignments
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(!showAddModal)} style={{ padding: '0 12px', minHeight: '38px', fontSize: '0.8rem' }}>
          + Declare Resource
        </button>
      </div>

      {showAddModal && (
        <form onSubmit={handleAddResource} className="glass-panel" style={{ padding: '16px', marginBottom: '16px', border: '2px solid var(--accent-blue)' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '10px' }}>Declare Available Relief Equipment</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Resource Type</label>
              <select 
                className="input-field" 
                value={resourceType} 
                onChange={(e) => setResourceType(e.target.value as ResourceType)}
                style={{ height: '40px' }}
              >
                <option value="rescue_boat">Rescue Boat</option>
                <option value="medical_kit">Medical Kit</option>
                <option value="food_rations">Food Rations</option>
                <option value="water_liters">Water Liters</option>
                <option value="power_generator">Power Generator</option>
                <option value="ambulance">Ambulance</option>
                <option value="shelter_bed">Shelter Bed</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Available Capacity</label>
              <input 
                type="number" 
                className="input-field" 
                value={capacity} 
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                style={{ height: '40px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Staging Location / Landmark</label>
            <input 
              type="text" 
              className="input-field" 
              value={locationName} 
              onChange={(e) => setLocationName(e.target.value)} 
              style={{ height: '40px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)} style={{ minHeight: '36px' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ minHeight: '36px' }}>Save Resource</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {localResources.map(res => (
          <div key={res.id} className="glass-panel" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Package style={{ width: '18px', height: '18px', color: 'var(--accent-blue)' }} />
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{res.resourceType.toUpperCase().replace('_', ' ')}</span>
                <span className={`badge ${res.isAvailable ? 'badge-synced' : 'badge-local'}`}>
                  {res.isAvailable ? 'AVAILABLE' : 'OFFLINE'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Owner: {res.ownerName} ({res.ownerPhone})
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <MapPin style={{ width: '12px', height: '12px' }} />
                <span>{res.location.locationName}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sync-green)' }}>
                Cap: {res.availableCapacity}
              </div>
              <button
                onClick={() => toggleAvailability(res.id)}
                style={{
                  marginTop: '6px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: 'var(--text-main)'
                }}
              >
                Toggle State
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
