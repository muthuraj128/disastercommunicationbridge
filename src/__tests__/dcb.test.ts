import { describe, it, expect } from 'vitest';
import { MeshProtocolEngine } from '../services/p2p/meshProtocolEngine';
import { ReliefMatchingEngine } from '../services/matching/reliefMatchingEngine';
import type { EmergencyReport, ReliefResource, P2PMessageEnvelope } from '../types/dcb';

describe('MeshProtocolEngine Tests', () => {
  const dummyReport: EmergencyReport = {
    id: 'rep_test_101',
    sourceDeviceId: 'dev_origin_01',
    category: 'rescue',
    severity: 'critical',
    description: 'Test flood alert trapped on roof',
    peopleAffected: 4,
    location: {
      latitude: 13.0827,
      longitude: 80.2707,
      accuracy: 5.0,
      locationName: 'Anna Nagar',
      isStale: false,
      timestamp: new Date().toISOString()
    },
    status: 'local_only',
    syncStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    hopCount: 1,
    hopLimit: 5,
    forwardingHistory: []
  };

  it('should construct a valid versioned envelope', () => {
    const envelope = MeshProtocolEngine.createEnvelope(dummyReport, 'dev_relay_02');
    expect(envelope.protocolVersion).toBe('1.0');
    expect(envelope.hopCount).toBe(2);
    expect(envelope.messageType).toBe('SOS_REPORT');
    expect(envelope.reportId).toBe('rep_test_101');
  });

  it('should reject expired message envelopes', () => {
    const expiredEnvelope: P2PMessageEnvelope = {
      messageId: 'msg_exp_01',
      reportId: 'rep_exp_01',
      protocolVersion: '1.0',
      messageType: 'SOS_REPORT',
      createdAt: new Date(Date.now() - 100000).toISOString(),
      expiresAt: new Date(Date.now() - 1000).toISOString(),
      hopCount: 1,
      hopLimit: 5,
      sourceDeviceId: 'dev_old',
      payload: {},
      integrityHash: 'sha256_test',
      relayPath: []
    };

    const result = MeshProtocolEngine.validateEnvelope(expiredEnvelope);
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('expired');
  });

  it('should enforce hop limit boundary', () => {
    const exceededHopEnvelope: P2PMessageEnvelope = {
      messageId: 'msg_hop_01',
      reportId: 'rep_hop_01',
      protocolVersion: '1.0',
      messageType: 'SOS_REPORT',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      hopCount: 6,
      hopLimit: 5,
      sourceDeviceId: 'dev_hop',
      payload: {},
      integrityHash: 'sha256_test',
      relayPath: []
    };

    const result = MeshProtocolEngine.validateEnvelope(exceededHopEnvelope);
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Hop limit exceeded');
  });
});

describe('ReliefMatchingEngine Heuristic Tests', () => {
  const medicalReport: EmergencyReport = {
    id: 'rep_med_01',
    sourceDeviceId: 'dev_01',
    category: 'medical',
    severity: 'critical',
    description: 'Fracture patient needing immediate ambulance',
    peopleAffected: 1,
    location: {
      latitude: 13.0827,
      longitude: 80.2707,
      accuracy: 5.0,
      locationName: 'Anna Nagar',
      isStale: false,
      timestamp: new Date().toISOString()
    },
    status: 'local_only',
    syncStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    hopCount: 0,
    hopLimit: 5,
    forwardingHistory: []
  };

  const sampleResources: ReliefResource[] = [
    {
      id: 'res_boat',
      ownerId: 'vol_01',
      ownerName: 'Boat Volunteer',
      ownerPhone: '123',
      resourceType: 'rescue_boat',
      quantity: 1,
      availableCapacity: 6,
      location: { latitude: 13.0850, longitude: 80.2750, accuracy: 5.0, locationName: 'Dock', isStale: false, timestamp: null },
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'res_med',
      ownerId: 'vol_02',
      ownerName: 'Medical Red Cross',
      ownerPhone: '456',
      resourceType: 'medical_kit',
      quantity: 10,
      availableCapacity: 10,
      location: { latitude: 13.0830, longitude: 80.2710, accuracy: 5.0, locationName: 'Clinic', isStale: false, timestamp: null },
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  it('should rank medical_kit above rescue_boat for medical emergency', () => {
    const matches = ReliefMatchingEngine.matchResourcesForReport(medicalReport, sampleResources);
    expect(matches.length).toBe(2);
    expect(matches[0].resource?.resourceType).toBe('medical_kit');
    expect(matches[0].score).toBeGreaterThan(matches[1].score);
    expect(matches[0].matchRationale).toContain('Exact category match');
  });
});
