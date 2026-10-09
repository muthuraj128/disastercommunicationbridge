import type { EmergencyReport, ReliefResource, Shelter, PeerDevice, P2PTransferLog } from '../types/dcb';

export const INITIAL_SAMPLE_REPORTS: EmergencyReport[] = [
  {
    id: 'rep_001_flood_anna_nagar',
    sourceDeviceId: 'dev_phone_alpha',
    reporterId: 'usr_affected_01',
    category: 'rescue',
    severity: 'critical',
    description: 'Rapidly rising flood waters trapped family of 4 on roof. Water level reaching 1st floor ceiling.',
    peopleAffected: 4,
    location: {
      latitude: 13.0827,
      longitude: 80.2707,
      accuracy: 8.5,
      locationName: 'Block 12, Anna Nagar West, Chennai',
      isStale: false,
      timestamp: new Date().toISOString()
    },
    contactInfo: '+91 98765 43210',
    evidenceNotes: 'Visual verification: Roof access only. Urgent boat requirement.',
    status: 'received_by_peer',
    syncStatus: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    expiresAt: new Date(Date.now() + 259200000).toISOString(),
    hopCount: 2,
    hopLimit: 5,
    forwardingHistory: [
      { deviceId: 'dev_phone_alpha', deviceAlias: 'Affected Phone (Self)', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { deviceId: 'dev_node_beta', deviceAlias: 'Volunteer Relay Node B', timestamp: new Date(Date.now() - 1800000).toISOString(), rssi: -62 }
    ]
  },
  {
    id: 'rep_002_med_landslide',
    sourceDeviceId: 'dev_phone_gamma',
    reporterId: 'usr_affected_02',
    category: 'medical',
    severity: 'critical',
    description: 'Elderly diabetic patient with severe leg fracture after mudslide collapse. Needs trauma medical kit & stretcher.',
    peopleAffected: 1,
    location: {
      latitude: 13.0475,
      longitude: 80.2090,
      accuracy: 14.2,
      locationName: 'Near Vadapalani Temple Bus Stand',
      isStale: true,
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    contactInfo: '+91 91234 56789',
    evidenceNotes: 'Coordinates captured before power grid failure. Stale location flag enabled.',
    status: 'local_only',
    syncStatus: 'pending',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    expiresAt: new Date(Date.now() + 259200000).toISOString(),
    hopCount: 0,
    hopLimit: 5,
    forwardingHistory: [
      { deviceId: 'dev_phone_gamma', deviceAlias: 'Origin Device', timestamp: new Date(Date.now() - 7200000).toISOString() }
    ]
  },
  {
    id: 'rep_003_food_shelter',
    sourceDeviceId: 'dev_phone_delta',
    reporterId: 'usr_affected_03',
    category: 'food_water',
    severity: 'medium',
    description: 'Community center housing 18 displaced villagers running out of clean drinking water and baby food.',
    peopleAffected: 18,
    location: {
      latitude: 13.0604,
      longitude: 80.2496,
      accuracy: 6.0,
      locationName: 'Nungambakkam Community Center',
      isStale: false,
      timestamp: new Date(Date.now() - 900000).toISOString()
    },
    contactInfo: '+91 94440 12345',
    evidenceNotes: '18 people including 4 infants.',
    status: 'uploaded_cloud',
    syncStatus: 'synced',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
    expiresAt: new Date(Date.now() + 259200000).toISOString(),
    hopCount: 1,
    hopLimit: 5,
    forwardingHistory: [
      { deviceId: 'dev_phone_delta', deviceAlias: 'Community Lead Phone', timestamp: new Date(Date.now() - 10800000).toISOString() }
    ]
  }
];

export const INITIAL_SAMPLE_RESOURCES: ReliefResource[] = [
  {
    id: 'res_001_boat',
    ownerId: 'vol_001',
    ownerName: 'Ramesh Kumar (Fisherman Corps)',
    ownerPhone: '+91 98401 99999',
    resourceType: 'rescue_boat',
    quantity: 2,
    availableCapacity: 8,
    location: {
      latitude: 13.0850,
      longitude: 80.2750,
      accuracy: 5.0,
      locationName: 'Anna Nagar Waterways Staging Area',
      isStale: false,
      timestamp: new Date().toISOString()
    },
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'res_002_med',
    ownerId: 'vol_002',
    ownerName: 'Dr. Priya Swaminathan (Red Cross)',
    ownerPhone: '+91 97100 88888',
    resourceType: 'medical_kit',
    quantity: 15,
    availableCapacity: 15,
    location: {
      latitude: 13.0500,
      longitude: 80.2120,
      accuracy: 10.0,
      locationName: 'Vadapalani Mobile Clinic Van',
      isStale: false,
      timestamp: new Date().toISOString()
    },
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'res_003_food',
    ownerId: 'vol_003',
    ownerName: 'Rotary Relief Unit 4',
    ownerPhone: '+91 94455 77777',
    resourceType: 'food_rations',
    quantity: 150,
    availableCapacity: 150,
    location: {
      latitude: 13.0620,
      longitude: 80.2520,
      accuracy: 4.0,
      locationName: 'Nungambakkam Warehouse',
      isStale: false,
      timestamp: new Date().toISOString()
    },
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_SAMPLE_SHELTERS: Shelter[] = [
  {
    id: 'shelter_001_st_bedes',
    name: 'St. Bedes Relief Center & Gymnasium',
    managerName: 'Capt. S. Sundaram',
    managerPhone: '+91 98840 11111',
    totalCapacity: 250,
    currentOccupancy: 110,
    location: {
      latitude: 13.0333,
      longitude: 80.2750,
      accuracy: 3.0,
      locationName: 'Santhome High Road, Mylapore',
      isStale: false,
      timestamp: new Date().toISOString()
    },
    address: '12 Santhome High Road, Mylapore, Chennai',
    hasPower: true,
    hasWater: true,
    hasMedical: true,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'shelter_002_loyola',
    name: 'Loyola Indoor Stadium Shelter',
    managerName: 'Sr. Anitha Mary',
    managerPhone: '+91 98840 22222',
    totalCapacity: 500,
    currentOccupancy: 320,
    location: {
      latitude: 13.0630,
      longitude: 80.2320,
      accuracy: 4.5,
      locationName: 'Sterling Road, Nungambakkam',
      isStale: false,
      timestamp: new Date().toISOString()
    },
    address: 'Sterling Road, Nungambakkam, Chennai',
    hasPower: true,
    hasWater: true,
    hasMedical: true,
    isActive: true,
    updatedAt: new Date().toISOString()
  }
];

export const SAMPLE_PEERS: PeerDevice[] = [
  {
    id: 'peer_node_beta',
    name: 'DCB Relay Node (Galaxy S22)',
    rssi: -58,
    status: 'connected',
    lastSeen: 'Just now',
    isCompatible: true,
    protocolVersion: '1.0'
  },
  {
    id: 'peer_node_gamma',
    name: 'DCB Field Volunteer (Pixel 7)',
    rssi: -74,
    status: 'discovered',
    lastSeen: '1 min ago',
    isCompatible: true,
    protocolVersion: '1.0'
  }
];

export const SAMPLE_TRANSFER_LOGS: P2PTransferLog[] = [
  {
    id: 'log_01',
    messageId: 'msg_9f83a210',
    peerId: 'peer_node_beta',
    direction: 'OUTBOUND',
    status: 'SUCCESS',
    transferredBytes: 1048,
    timestamp: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'log_02',
    messageId: 'msg_7b12c490',
    peerId: 'peer_node_gamma',
    direction: 'INBOUND',
    status: 'SUCCESS',
    transferredBytes: 1210,
    timestamp: new Date(Date.now() - 900000).toISOString()
  }
];
