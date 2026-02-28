# 🧪 Test Extension Now - Step by Step

## 🚀 **Immediate Fix Steps**

### **Step 1: Remove Old Extension**
1. Open `chrome://extensions/`
2. Find "WorkSpace AI Assistant" (the old complex one)
3. Click **"Remove"** - delete it completely

### **Step 2: Load Simple Extension**
1. Click **"Load unpacked"**
2. Navigate to: `/Users/user/bharat/workspace/browser-extension/`
3. Select the folder
4. **Verify**: "WorkSpace AI Tab Monitor" appears

### **Step 3: Test Extension**
1. Click extension icon (should show popup)
2. Click **"Start"** button
3. Should show "Session Active"

### **Step 4: Test Instagram Blocking**
1. Open new tab
2. Go to `https://www.instagram.com`
3. **Should see in console**:
   ```
   🚫 Distracting site detected
   🧠 Analysis result: {content_type: "distraction", distraction_score: 90}
   🚫 Blocking: Known distracting domain
   🚫 Blocking tab: https://www.instagram.com
   ```
4. **Tab should close automatically**

## 🔍 **Console Check**

### **Open Extension Console**
1. `chrome://extensions/`
2. Find "WorkSpace AI Tab Monitor"
3. Click **"Service worker"** (opens DevTools)
4. Look for these messages:

### **Expected Messages**
```
🚀 WorkSpace AI Extension initialized
🔄 Tab activated: https://www.instagram.com
🔍 Analyzing tab: www.instagram.com
❌ Backend not available, using local analysis
🧠 Local analysis: domain=www.instagram.com, title=instagram
🚫 Distracting site detected
🧠 Analysis result: {content_type: "distraction", distraction_score: 90}
🔍 Blocking decision: score=90, type=distraction, domain=www.instagram.com
🚫 Blocking: Known distracting domain
🚫 Blocking tab: https://www.instagram.com
```

## 🎯 **If Still Not Working**

### **Check 1: Extension Loaded Correctly**
- Extension name: "WorkSpace AI Tab Monitor" (not "WorkSpace AI Assistant")
- Has popup when clicked
- Shows "Start/Stop" buttons

### **Check 2: Session Active**
- Click extension icon
- Click "Start" button
- Should show "Session Active" status
- Blocked count should increase

### **Check 3: Instagram Test**
1. Make sure session is active
2. Go to instagram.com
3. Watch extension console
4. Tab should close within 2 seconds

### **Check 4: Manual Test**
1. Open extension console
2. Run this command:
   ```javascript
   // Test blocking manually
   chrome.runtime.sendMessage({action: 'start_session'});
   ```

## 🆘 **Troubleshooting**

### **No Popup Appears?**
- Reload extension
- Check manifest has `"default_popup": "popup_simple.html"`

### **Console Shows No Messages?**
- Extension not loaded properly
- Remove and reload extension
- Check for errors in extension details

### **Tab Not Blocking?**
- Check session is active
- Check console for analysis messages
- Look for "🚫 Blocking tab" message

### **Backend Errors?**
- Extension should work without backend
- Look for "using local analysis" message
- Blocking should work with local analysis

---

## 🎉 **Expected Final Result**

**When you test Instagram:**
1. ✅ Extension console shows analysis messages
2. ✅ Tab closes automatically within 2 seconds
3. ✅ Educational site opens in new tab
4. ✅ Extension popup shows increased blocked count

**The extension should now block Instagram immediately when session is active! 🚀**
