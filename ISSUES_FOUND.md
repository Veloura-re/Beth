# Critical Issues Found - BethRewards System

## 🔴 CRITICAL: QR Scan Upload Not Working

### Problem
The mobile app calls `POST /api/qrs/scan` but this endpoint **DOES NOT EXIST**!

**Mobile API call:** (`/mobile/src/utils/api.js`)
```javascript
export const scanQRCode = async (code) => {
  return await apiFetch('/qrs/scan', {  // ❌ WRONG ENDPOINT
    method: 'POST',
    body: JSON.stringify({ code }),
  });
};
```

**Correct endpoint:** `POST /api/scans` (accepts `qrId`, not `code`)

**Backend expects:**
```javascript
// ScanController.ts
const { qrId, lat, lng } = req.body;  // Not "code"
```

### Impact
- Agents scan QR codes but points are NEVER recorded
- No scans are saved to database
- Users see "REGISTRY_REJECTION" errors

---

## 🟠 Settings Page - Non-Functional

The Settings page is completely non-functional:
- All buttons are UI-only with no API integration
- No settings endpoints exist in backend
- No state management for settings

**Affected buttons:**
- Security Protocols
- Intelligence Alerts
- Registry Management
- Global Governance
- Compute Infrastructure

**Missing features:**
- Organization settings API
- Notification preferences
- Security settings (password, 2FA)
- Data export/deletion

---

## 🟡 QR Code Security Issues

### Current Security (Good ✅)
1. **Rate limiting:** 30 seconds between scans
2. **Duplicate prevention:** Agents can't scan same QR twice
3. **Budget enforcement:** Campaigns auto-stop when budget reached
4. **Geolocation verification:** GPS check within ~1km
5. **Expiration dates:** QR codes can expire
6. **Status checks:** Only ACTIVE QRs scannable
7. **Auth required:** AGENT role required

### Security Gaps (Concerning ⚠️)
1. **No QR encryption** - Codes are plain UUIDs (guessable)
2. **No signature verification** - QR codes aren't cryptographically signed
3. **No anti-tampering** - QR data can be modified
4. **Sequential IDs** - If using auto-increment, predictable
5. **No scan throttling per QR** - Same QR can be scanned by different agents unlimited times

### Recommendations
1. Add HMAC signature to QR codes
2. Use encoded/encrypted QR values instead of raw UUIDs
3. Add rate limiting per QR code
4. Implement QR code invalidation after N scans

---

## 🔧 Fixes Required

### Fix 1: Mobile API Endpoint
Update `/mobile/src/utils/api.js`:
```javascript
export const scanQRCode = async (code, lat, lng) => {
  return await apiFetch('/scans', {  // ✅ CORRECT ENDPOINT
    method: 'POST',
    body: JSON.stringify({ qrId: code, lat, lng }),
  });
};
```

### Fix 2: Scanner Screen
Update `/mobile/src/screens/ScannerScreen.js` to pass GPS coordinates:
```javascript
const handleBarCodeScanned = async ({ data }) => {
  // Get location before scanning
  const location = await Location.getCurrentPositionAsync({});
  const response = await scanQRCode(
    data, 
    location.coords.latitude, 
    location.coords.longitude
  );
  // ...
};
```

### Fix 3: Settings API (Optional)
Create new endpoints:
- `GET /api/settings` - Get organization settings
- `PATCH /api/settings` - Update settings
- `POST /api/settings/notifications` - Update notification prefs

---

## 📍 Files Affected

| Issue | File | Status |
|-------|------|--------|
| Wrong scan endpoint | `/mobile/src/utils/api.js` | ❌ Broken |
| Missing GPS in scan | `/mobile/src/screens/ScannerScreen.js` | ❌ Broken |
| Static settings UI | `/dashboard/src/app/settings/page.tsx` | ⚠️ Non-functional |
| No settings API | Backend routes | ❌ Missing |
| QR Security | Backend scan service | ⚠️ Weak |
