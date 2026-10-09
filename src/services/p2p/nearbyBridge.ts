import { Capacitor, registerPlugin } from '@capacitor/core';
import type { PeerDevice, P2PMessageEnvelope } from '../../types/dcb';
import { SAMPLE_PEERS } from '../../data/mockData';

export interface P2PBridgeStatus {
  isEmergencyModeActive: boolean;
  isDiscovering: boolean;
  isAdvertising: boolean;
  connectedPeersCount: number;
  platform: 'android_native' | 'web_simulated';
  errorMessage?: string;
}

interface NearbyPluginNative {
  startEmergencyMode(options: { serviceId: string }): Promise<void>;
  stopEmergencyMode(): Promise<void>;
  sendPayload(options: { targetPeerId?: string; envelopeJson: string }): Promise<void>;
}

const NearbyPlugin = registerPlugin<NearbyPluginNative>('NearbyPlugin');

type PeerListener = (peers: PeerDevice[]) => void;
type MessageListener = (envelope: P2PMessageEnvelope, fromPeerId: string) => void;

class NearbyBridgeService {
  private emergencyMode: boolean = false;
  private discovering: boolean = false;
  private advertising: boolean = false;
  private peers: PeerDevice[] = [...SAMPLE_PEERS];
  private peerListeners: PeerListener[] = [];
  private messageListeners: MessageListener[] = [];
  private broadcastChannel: BroadcastChannel | null = null;
  private myDeviceId: string = `device_${Math.floor(1000 + Math.random() * 9000)}`;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('dcb_mesh_channel_v1');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'P2P_ENVELOPE') {
          const { envelope, senderId } = event.data;
          if (senderId !== this.myDeviceId) {
            this.handleInboundEnvelope(envelope, senderId);
          }
        }
      };
    }
  }

  public getDeviceId(): string {
    return this.myDeviceId;
  }

  public isNativeAndroid(): boolean {
    return Capacitor.getPlatform() === 'android';
  }

  public getStatus(): P2PBridgeStatus {
    return {
      isEmergencyModeActive: this.emergencyMode,
      isDiscovering: this.discovering,
      isAdvertising: this.advertising,
      connectedPeersCount: this.peers.filter(p => p.status === 'connected').length,
      platform: this.isNativeAndroid() ? 'android_native' : 'web_simulated'
    };
  }

  public subscribePeers(listener: PeerListener): () => void {
    this.peerListeners.push(listener);
    listener([...this.peers]);
    return () => {
      this.peerListeners = this.peerListeners.filter(l => l !== listener);
    };
  }

  public subscribeMessages(listener: MessageListener): () => void {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }

  public async startEmergencyMode(): Promise<P2PBridgeStatus> {
    this.emergencyMode = true;
    this.discovering = true;
    this.advertising = true;

    if (this.isNativeAndroid()) {
      try {
        await NearbyPlugin.startEmergencyMode({ serviceId: 'DCB_P2P_SERVICE_V1' });
      } catch (err) {
        console.warn('Native Nearby plugin call fallback', err);
      }
    }

    this.notifyPeerChange();
    return this.getStatus();
  }

  public async stopEmergencyMode(): Promise<P2PBridgeStatus> {
    this.emergencyMode = false;
    this.discovering = false;
    this.advertising = false;

    if (this.isNativeAndroid()) {
      try {
        await NearbyPlugin.stopEmergencyMode();
      } catch (err) {
        console.warn('Native Nearby plugin stop fallback', err);
      }
    }

    this.peers = this.peers.map(p => ({ ...p, status: 'disconnected' }));
    this.notifyPeerChange();
    return this.getStatus();
  }

  public async sendEnvelopeToPeer(envelope: P2PMessageEnvelope, targetPeerId?: string): Promise<boolean> {
    if (!this.emergencyMode) {
      console.warn('Emergency mode is OFF. Cannot transmit envelope.');
      return false;
    }

    if (this.isNativeAndroid()) {
      try {
        await NearbyPlugin.sendPayload({
          targetPeerId,
          envelopeJson: JSON.stringify(envelope)
        });
        return true;
      } catch (err) {
        console.error('Native sendPayload failed', err);
      }
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'P2P_ENVELOPE',
        senderId: this.myDeviceId,
        envelope
      });
      return true;
    }

    return false;
  }

  private handleInboundEnvelope(envelope: P2PMessageEnvelope, senderId: string) {
    this.messageListeners.forEach(l => l(envelope, senderId));
  }

  private notifyPeerChange() {
    this.peerListeners.forEach(l => l([...this.peers]));
  }
}

export const nearbyBridge = new NearbyBridgeService();
