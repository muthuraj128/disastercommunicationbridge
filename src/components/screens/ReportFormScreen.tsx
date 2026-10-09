import React, { useState } from 'react';
import { AlertTriangle, MapPin, Users, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ReportCategory, ReportSeverity } from '../../types/dcb';
import { LocationService } from '../../services/location/locationService';

export const ReportFormScreen: React.FC = () => {
  const { createSOSReport, setActiveScreen } = useApp();

  const [category, setCategory] = useState<ReportCategory>('rescue');
  const [severity, setSeverity] = useState<ReportSeverity>('critical');
  const [description, setDescription] = useState<string>('');
  const [peopleAffected, setPeopleAffected] = useState<number>(1);
  const [landmarkName, setLandmarkName] = useState<string>('Anna Nagar West, Chennai');
  const [contactInfo, setContactInfo] = useState<string>('');
  const [evidenceNotes, setEvidenceNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(8.5);
  const [isLocationStale, setIsLocationStale] = useState<boolean>(false);

  const handleFetchGps = async () => {
    setIsGpsLoading(true);
    const loc = await LocationService.getCurrentLocation();
    if (loc.latitude && loc.longitude) {
      setLandmarkName(loc.locationName);
      setGpsAccuracy(loc.accuracy);
      setIsLocationStale(loc.isStale);
    } else {
      setIsLocationStale(true);
    }
    setIsGpsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    await createSOSReport({
      category,
      severity,
      description,
      peopleAffected,
      landmarkName,
      contactInfo,
      evidenceNotes
    });

    setIsSubmitting(false);
    setActiveScreen('my_reports');
  };

  return (
    <div style={{ padding: '0 12px 28px 12px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--emergency-red)' }}>
          <AlertTriangle style={{ width: '24px', height: '24px' }} />
          <span>New Emergency SOS Report</span>
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Saved locally first. Accessible offline without cell network.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '14px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            Emergency Category
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'rescue', label: 'Flood/Rescue' },
              { id: 'medical', label: 'Medical Emergency' },
              { id: 'food_water', label: 'Food & Water' },
              { id: 'shelter', label: 'Shelter Need' },
              { id: 'hazard', label: 'Hazard/Landslide' },
              { id: 'other', label: 'Other' }
            ].map(cat => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id as ReportCategory)}
                style={{
                  padding: '10px 6px',
                  borderRadius: 'var(--radius-sm)',
                  border: category === cat.id ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  background: category === cat.id ? 'var(--mesh-cyan-bg)' : 'var(--bg-surface)',
                  color: category === cat.id ? 'var(--accent-blue)' : 'var(--text-main)',
                  fontWeight: category === cat.id ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            Urgency / Severity Level
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { id: 'critical', label: 'CRITICAL', color: 'var(--emergency-red)' },
              { id: 'high', label: 'HIGH', color: 'var(--alert-amber)' },
              { id: 'medium', label: 'MEDIUM', color: 'var(--accent-blue)' },
              { id: 'low', label: 'LOW', color: 'var(--text-muted)' }
            ].map(sev => (
              <button
                type="button"
                key={sev.id}
                onClick={() => setSeverity(sev.id as ReportSeverity)}
                style={{
                  padding: '10px 4px',
                  borderRadius: 'var(--radius-sm)',
                  border: severity === sev.id ? `2px solid ${sev.color}` : '1px solid var(--border-color)',
                  background: severity === sev.id ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  color: severity === sev.id ? sev.color : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                {sev.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Describe Emergency Situation *
            </label>
            <textarea
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., 4 people trapped on rooftop, rising water level, elderly patient needs insulin..."
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Number of People Affected
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
              <input
                type="number"
                className="input-field"
                min="1"
                max="500"
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(parseInt(e.target.value) || 1)}
                style={{ width: '100px' }}
              />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>person(s) requiring assistance</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin style={{ width: '16px', height: '16px', color: 'var(--emergency-red)' }} />
              <span>Location / Landmark</span>
            </label>
            <button
              type="button"
              onClick={handleFetchGps}
              disabled={isGpsLoading}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: 'var(--accent-blue)'
              }}
            >
              {isGpsLoading ? 'Fixing GPS...' : 'Refresh GPS'}
            </button>
          </div>

          <input
            type="text"
            className="input-field"
            value={landmarkName}
            onChange={(e) => setLandmarkName(e.target.value)}
            placeholder="Nearest Landmark / Street / Door No."
          />

          <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {gpsAccuracy && (
              <span className="badge badge-mesh" style={{ fontSize: '0.7rem' }}>
                GPS Accuracy: ±{gpsAccuracy}m
              </span>
            )}
            {isLocationStale && (
              <span className="badge badge-high" style={{ fontSize: '0.7rem' }}>
                <ShieldAlert style={{ width: '10px', height: '10px' }} />
                Cached / Stale Location
              </span>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Contact Phone / Callback (Optional)
            </label>
            <input
              type="tel"
              className="input-field"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Evidence Notes / Access Instructions (Optional)
            </label>
            <input
              type="text"
              className="input-field"
              value={evidenceNotes}
              onChange={(e) => setEvidenceNotes(e.target.value)}
              placeholder="e.g. Enter via side gate, beware of loose electrical wiring..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !description.trim()}
          className="btn btn-danger"
          style={{ width: '100%', minHeight: '52px', fontSize: '1.05rem', fontWeight: 800 }}
        >
          {isSubmitting ? 'Saving to Local SQLite...' : 'CREATE & SAVE SOS ALERT'}
        </button>
      </form>
    </div>
  );
};
