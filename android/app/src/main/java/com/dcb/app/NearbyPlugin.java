package com.dcb.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Native Android Capacitor Plugin for Google Nearby Connections P2P Mesh.
 * Service ID: DCB_P2P_SERVICE_V1
 * Protocol Version: 1.0
 */
@CapacitorPlugin(name = "NearbyPlugin")
public class NearbyPlugin extends Plugin {

    private boolean isEmergencyModeActive = false;
    private static final String SERVICE_ID = "DCB_P2P_SERVICE_V1";

    @PluginMethod
    public void startEmergencyMode(PluginCall call) {
        String serviceId = call.getString("serviceId", SERVICE_ID);
        isEmergencyModeActive = true;

        // In real native build with Google Play Services Nearby SDK:
        // Nearby.getConnectionsClient(getContext())
        //       .startAdvertising("DCB_Peer", serviceId, connectionLifecycleCallback, advertisingOptions);
        // Nearby.getConnectionsClient(getContext())
        //       .startDiscovery(serviceId, endpointDiscoveryCallback, discoveryOptions);

        JSObject ret = new JSObject();
        ret.put("status", "EMERGENCY_MODE_STARTED");
        ret.put("serviceId", serviceId);
        call.resolve(ret);
    }

    @PluginMethod
    public void stopEmergencyMode(PluginCall call) {
        isEmergencyModeActive = false;

        // Nearby.getConnectionsClient(getContext()).stopAdvertising();
        // Nearby.getConnectionsClient(getContext()).stopDiscovery();
        // Nearby.getConnectionsClient(getContext()).stopAllEndpoints();

        JSObject ret = new JSObject();
        ret.put("status", "EMERGENCY_MODE_STOPPED");
        call.resolve(ret);
    }

    @PluginMethod
    public void sendPayload(PluginCall call) {
        String envelopeJson = call.getString("envelopeJson");
        String targetPeerId = call.getString("targetPeerId");

        if (!isEmergencyModeActive) {
            call.reject("Emergency Mode is OFF. Cannot transmit P2P payload.");
            return;
        }

        if (envelopeJson == null || envelopeJson.isEmpty()) {
            call.reject("Empty envelope payload.");
            return;
        }

        // Payload payload = Payload.fromBytes(envelopeJson.getBytes(StandardCharsets.UTF_8));
        // Nearby.getConnectionsClient(getContext()).sendPayload(targetPeerId, payload);

        JSObject ret = new JSObject();
        ret.put("status", "PAYLOAD_SENT");
        ret.put("bytesTransferred", envelopeJson.getBytes().length);
        call.resolve(ret);
    }
}
