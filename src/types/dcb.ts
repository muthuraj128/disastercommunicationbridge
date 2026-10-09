export type UserRole = 'affected_person' | 'volunteer' | 'coordinator';

export type ReportCategory = 'medical' | 'rescue' | 'food_water' | 'shelter' | 'hazard' | 'other';

export type ReportSeverity = 'critical' | 'high' | 'medium' | 'low';

export type ReportStatus = 
  | 'local_only'        // Saved in local SQLite / IndexedDB only
  | 'sent_to_peer'      // Dispatched to nearby P2P peer
  | 'received_by_peer'  // Received from a nearby peer
  | 'uploaded_cloud'    // Successfully synced to Supabase
  | 'assigned'          // Coordinator matched resource/volunteer
  | 'in_progress'       // Relief team en-route
  | 'resolved'          // Rescue/relief completed
  | 'failed'            // Sync error or delivery failure
  | 'expired';          // TTL elapsed

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'conflict' | 'error';

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  locationName: string;
  isStale: boolean;
  timestamp: string | null;
}

export interface EmergencyReport {
  id: string; // UUIDv4
  sourceDeviceId: string;
  reporterId?: string;
  category: ReportCategory;
  severity: ReportSeverity;
  description: string;
  peopleAffected: number;
  location: LocationData;
  contactInfo?: string;
  evidenceNotes?: string;
  status: ReportStatus;
  syncStatus: SyncStatus;
  createdAt: string; // ISO String
  updatedAt: string;
  expiresAt: string;
  hopCount: number;
  hopLimit: number;
  forwardingHistory: RelayHop[];
}

export interface RelayHop {
  deviceId: string;
  deviceAlias?: string;
  timestamp: string;
  rssi?: number;
}

export interface P2PMessageEnvelope {
  messageId: string;
  reportId: string;
  protocolVersion: string;
  messageType: 'SOS_REPORT' | 'STATUS_ACK' | 'RELIEF_UPDATE' | 'HEARTBEAT';
  createdAt: string;
  expiresAt: string;
  hopCount: number;
  hopLimit: number;
  sourceDeviceId: string;
  payload: Partial<EmergencyReport>;
  integrityHash: string;
  relayPath: RelayHop[];
}

export interface PeerDevice {
  id: string;
  name: string;
  rssi: number;
  status: 'discovered' | 'connecting' | 'connected' | 'disconnected' | 'rejected';
  lastSeen: string;
  isCompatible: boolean;
  protocolVersion: string;
}

export type ResourceType = 
  | 'medical_kit' 
  | 'food_rations' 
  | 'water_liters' 
  | 'rescue_boat' 
  | 'power_generator' 
  | 'ambulance' 
  | 'shelter_bed';

export interface ReliefResource {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  resourceType: ResourceType;
  quantity: number;
  availableCapacity: number;
  location: LocationData;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Shelter {
  id: string;
  name: string;
  managerName: string;
  managerPhone: string;
  totalCapacity: number;
  currentOccupancy: number;
  location: LocationData;
  address: string;
  hasPower: boolean;
  hasWater: boolean;
  hasMedical: boolean;
  isActive: boolean;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  reportId: string;
  resourceId?: string;
  shelterId?: string;
  assignedBy: string;
  assignedToVolunteerId?: string;
  assignedToVolunteerName?: string;
  status: 'assigned' | 'en_route' | 'completed' | 'cancelled';
  recommendationScore: number;
  matchRationale: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchRecommendation {
  resource?: ReliefResource;
  shelter?: Shelter;
  score: number;
  matchRationale: string;
  distanceKm: number;
  medicalConstraintPassed: boolean;
  capacitySatisfied: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  role: UserRole;
  organization?: string;
  isVerified: boolean;
}

export interface P2PTransferLog {
  id: string;
  messageId: string;
  peerId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'SUCCESS' | 'FAILED' | 'DUPLICATE_REJECTED' | 'EXPIRED_REJECTED';
  transferredBytes: number;
  timestamp: string;
}
