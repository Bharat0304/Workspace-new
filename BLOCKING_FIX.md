# 🔧 Blocking & Camera Fix Guide

## ❌ Issues Identified

1. **Instagram not blocking** - Extension not receiving session start signal
2. **Camera not turning on** - No screen capture permission flow
3. **Extension not active** - Communication broken between dashboard and extension

## 🔧 **Root Cause & Solutions**

### Issue 1: Extension Not Receiving Session Start
**Problem**: Dashboard sends `action: 'session_started'` but extension listens for `type: 'start_session'`

**✅ Fixed**: Updated extension to handle both message formats:
```javascript
switch (message.type || message.action) {
    case 'start_session':
    case 'session_started':
        this.startSession();
        break;
}
```

### Issue 2: No Camera/Screen Capture
**Problem**: Extension wasn't requesting permissions when session starts

**✅ Fixed**: Added permission request in `startSession()`:
```javascript
// Request screen capture permission
chrome.desktopCapture.chooseDesktopMedia(['screen', 'window', 'tab'], (streamId) => {
    if (streamId) {
        console.log('📹 Screen capture permission granted');
    }
});
```

### Issue 3: Extension Not Monitoring Continuously
**Problem**: Only checked on tab changes, not continuously

**✅ Fixed**: Added periodic checking every 2 seconds:
```javascript
startPeriodicChecks() {
    this.checkInterval = setInterval(() => {
        if (this.sessionActive) {
            this.checkCurrentSite();
        }
    }, 2000);
}
```

## 🚀 **How to Fix Your Setup**

### Step 1: Reload Extension
1. Open `chrome://extensions/`
2. Find "WorkSpace AI Assistant"
3. Click **"Reload"** button (🔄)
4. Check for any errors in extension details

### Step 2: Test Extension Communication
1. Open: `file:///Users/user/bharat/workspace/browser-extension/test_blocking.html`
2. Click **"Check Extension"**
3. Should show: "✅ Extension is working"

### Step 3: Start Session Properly
1. Open: `http://localhost:8000/dashboard.html`
2. Click **"🚀 Start Session"**
3. **Grant permissions** when prompted (camera/screen)
4. Check extension popup - should show "Session Active"

### Step 4: Test Instagram Blocking
1. With session active, open Instagram
2. Should see **red blocking overlay**
3. Extension popup should show increased "Sites Blocked"

### Step 5: Verify Camera/Screen
1. When starting session, you should see:
   - **Screen capture dialog**: "Share your screen"
   - **Camera permission dialog**: "Allow camera access"
2. Grant both permissions for full functionality

## 🔍 **Debugging Steps**

### Check Extension Logs
1. Open `chrome://extensions/`
2. Click "WorkSpace AI Assistant"
3. Click **"Service worker"** (opens DevTools)
4. Look for these messages:
   ```
   🚀 WorkSpace AI Extension initialized
   📨 Extension received message: {action: "session_started"}
   🚀 Session started by extension
   📹 Screen capture permission granted
   ```

### Check Dashboard Console
1. Open `http://localhost:8000/dashboard.html`
2. Open DevTools (F12)
3. Click "Console" tab
4. Look for:
   ```
   🎯 WorkSpace AI Content Script Loaded
   Session started: session_1234567890
   ```

### Test Manual Blocking
1. Start session in dashboard
2. Open extension popup (click toolbar icon)
3. Click **"Block Current Site"**
4. Should show blocking overlay immediately

## 📱 **Expected Behavior**

### When Session Starts:
- ✅ **Extension popup** shows "Session Active"
- ✅ **Permission dialogs** appear (camera/screen)
- ✅ **Console logs** show session started
- ✅ **Periodic checking** begins (every 2 seconds)

### When Visiting Instagram:
- ✅ **Red overlay** appears immediately
- ✅ **Message**: "Site Blocked During Focus Session"
- ✅ **Extension popup** shows increased block count
- ✅ **Activity log** shows "Site Blocked: instagram.com"

### When Visiting Educational Sites:
- ✅ **Green notification** appears
- ✅ **Message**: "Great Choice! Educational resource"
- ✅ **Auto-dismisses** after 5 seconds

## 🆘 **Troubleshooting**

### Instagram Still Not Blocking?
1. **Reload extension** (chrome://extensions/ → Reload)
2. **Start fresh session** (stop → start)
3. **Check console** for errors
4. **Verify session is active** in extension popup

### Camera Not Working?
1. **Check permissions** (chrome://settings/content/camera)
2. **Restart browser**
3. **Try different browser** (Chrome/Edge)

### Extension Not Responding?
1. **Check service worker** (chrome://extensions/ → Service worker)
2. **Look for errors** in console
3. **Reinstall extension** if needed

## 🎯 **Quick Test Sequence**

1. **Reload Extension** → chrome://extensions/ → Reload
2. **Open Test Page** → test_blocking.html → Check Extension
3. **Start Session** → dashboard.html → Start Session
4. **Grant Permissions** → Allow camera/screen
5. **Test Blocking** → Open Instagram → Should be blocked
6. **Verify Logs** → Check extension console for messages

---

## ✅ **Fixes Applied**

- ✅ **Message Handling**: Extension now receives dashboard signals
- ✅ **Permission Requests**: Camera/screen capture added
- ✅ **Continuous Monitoring**: Checks every 2 seconds
- ✅ **Better Blocking**: Immediate overlay injection
- ✅ **Debug Tools**: Test page and logging added

**Your extension should now properly block Instagram and activate camera! 🎉**
