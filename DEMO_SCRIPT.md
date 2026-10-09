# Disaster Communication Bridge (DCB) — End-to-End Demo Script

This demo script guides evaluators through verifying offline SOS creation, store-and-forward mesh forwarding, cloud synchronization, and intelligent relief matching.

---

## Step 1: Launch App & Complete Onboarding
1. Open the web app or Android APK.
2. The **Onboarding Screen** displays the 3 permission pillars:
   - Nearby Device P2P Mesh
   - GPS Location & Landmarks
   - Local Storage Durability
3. Click **"Grant Permissions & Start DCB"**.

---

## Step 2: Test Offline SOS Creation (Airplane Mode)
1. Turn OFF internet connection or enable Airplane Mode on your device.
2. Observe the top header status badge: **"Cloud Offline"** (High Alert Amber badge).
3. Click the pulsing red **SOS Button** on the Home Screen.
4. Fill in the Emergency Form:
   - **Category:** Flood / Rescue
   - **Severity:** CRITICAL
   - **Description:** *"Family of 4 trapped on rooftop in Anna Nagar. Water level rising fast."*
   - **People Affected:** 4
   - **Location:** Tap **"Refresh GPS"** (or keep landmark *"Anna Nagar West, Chennai"*).
5. Tap **"CREATE & SAVE SOS ALERT"**.
6. **Verification:**
   - Navigates to **My Reports**.
   - Report is displayed with status badge **`LOCAL ONLY`** (Clock icon).
   - Reload or restart the app while remaining offline: the report persists.

---

## Step 3: Test Device-to-Device P2P Mesh Mode
1. In the navigation bar, tap **"P2P Mesh"**.
2. Click **"START MESH"** to activate Emergency Mesh Mode.
3. Observe the top header pill update to **`Mesh ON`** (Cyan pulse indicator).
4. View the discovered compatible DCB peers list (`DCB Relay Node (Galaxy S22)`).
5. In **My Reports**, tap **"Broadcast over Mesh"** on your created report.
6. Observe status badge update to **`SENT TO PEER`** (Mesh Cyan badge).
7. Inspect the **Durable Transfer Audit Log** at the bottom of the Nearby screen:
   - Outbound log recorded with `SUCCESS` status and byte count transferred.

---

## Step 4: Test Resilient Cloud Synchronization
1. Re-enable internet connection / Wi-Fi on your device.
2. Top header status updates automatically to **`Online`** (Green Synced badge).
3. Tap **"Sync"** in the Communication Bridge status bar or Settings.
4. Observe report status update from `Sent to Peer` -> **`UPLOADED CLOUD`** (Verified green cloud badge).

---

## Step 5: Test Intelligent Relief Matching (Coordinator Role)
1. In the top header role selector, switch role from **"Affected Person"** to **"Coordinator"**.
2. Click **"Coordinator"** in the navigation bar.
3. Select your target Emergency Report in the dropdown.
4. View the **Explainable AI Match Recommendations**:
   - **Rank #1:** Ramesh Kumar (Fisherman Corps - Rescue Boat).
   - **Match Score:** 88/100.
   - **Match Rationale:** *"Match Score 88/100. Exact category match (rescue boat for rescue). Located 3.2 km away. Capacity (8) satisfies 4 people affected."*
5. Click **"Confirm Help Assignment"**.
6. Verification: Report status updates to **`ASSIGNED`** with audit confirmation badge.
