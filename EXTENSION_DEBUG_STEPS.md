# 🔧 **Extension Debugging - Step by Step**

## 🚨 **Issue: YouTube Video Still Playing**

The extension isn't blocking the YouTube video. Let's debug this step by step.

---

## 🎯 **Step 1: Verify Extension is Loaded**

### **1.1 Check Extension Status**
1. Open Chrome: `chrome://extensions/`
2. Find "WorkSpace AI Tab Monitor"
3. **Should see**: ✅ Enabled and running
4. **If not**: Click "Enable" or "Reload"

### **1.2 Check Extension Console**
1. In `chrome://extensions/`, find your extension
2. Click **"Service worker"** (opens DevTools)
3. **Should see**: `🚀 WorkSpace Tab Monitor initialized`
4. **If errors appear**: Screenshot and share

---

## 🎯 **Step 2: Start Extension Session**

### **2.1 Click Extension Icon**
1. Find WorkSpace AI icon in Chrome toolbar
2. Click the icon
3. **Should see**: Popup with Start/Stop buttons

### **2.2 Start Session**
1. Click **"Start"** button
2. **Should see**: Status changes to "Session Active"
3. **Extension console should show**: `🔄 Session started - Tab monitoring active`

---

## 🎯 **Step 3: Test YouTube Video**

### **3.1 Visit the Video**
1. Go to: https://www.youtube.com/watch?v=gXKy3GQJRKA
2. **Extension console should show**:
   ```
   🔄 Tab updated: https://www.youtube.com/watch?v=gXKy3GQJRKA
   🎬 YouTube detected - monitoring content
   📝 Title: [video title]
   🔗 URL: [video URL]
   ```

### **3.2 Check Backend Call**
1. **Extension console should show**:
   ```
   🧠 YouTube AI Analysis (from backend): {...}
   ```
2. **If error**: `❌ Backend not available, using local YouTube analysis`

### **3.3 Expected Result**
- **If distracting**: Red warning overlay → 5-second countdown → Block
- **If educational**: Console shows `✅ Educational YouTube content allowed`

---

## 🎯 **Step 4: Test Instagram**

### **4.1 Visit Instagram**
1. Go to: https://www.instagram.com
2. **Extension console should show**:
   ```
   🔄 Tab updated: https://www.instagram.com
   🚫 Instagram detected - showing warning
   ```

### **4.2 Expected Result**
- **Should see**: Red warning overlay → 5-second countdown → Block

---

## 🔍 **Debugging Checklist**

### **✅ Extension Console Check**
- [ ] `🚀 WorkSpace Tab Monitor initialized`
- [ ] `🔄 Session started - Tab monitoring active`
- [ ] `🔄 Tab updated: [URL]` when visiting sites
- [ ] `🎬 YouTube detected - monitoring content` for YouTube
- [ ] `🚫 Instagram detected - showing warning` for Instagram
- [ ] No red errors in console

### **✅ Backend Check**
```bash
# Test backend directly
curl -X POST http://localhost:8000/analyze/tab \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=gXKy3GQJRKA", "title": "YouTube"}'

# Should return: {"success": true, "result": {"is_distraction": true}}
```

### **✅ Visual Check**
- [ ] Extension icon appears in toolbar
- [ ] Extension popup opens when clicked
- [ ] Session starts when clicking "Start"
- [ ] Warning overlay appears for distracting content

---

## 🆘 **Common Issues & Fixes**

### **Issue 1: Extension Not Loaded**
**Symptoms**: No extension icon, no console messages
**Fix**: 
1. `chrome://extensions/` → Reload extension
2. Check for errors in extension details
3. Remove and re-add extension if needed

### **Issue 2: Session Not Active**
**Symptoms**: Extension loaded but no monitoring
**Fix**:
1. Click extension icon
2. Click "Start" button
3. Check console for session start message

### **Issue 3: Backend Not Available**
**Symptoms**: `❌ Backend not available, using local YouTube analysis`
**Fix**:
1. Check backend is running: `curl http://localhost:8000/health`
2. Restart backend if needed
3. Check port conflicts

### **Issue 4: No Warning Overlay**
**Symptoms**: Console shows detection but no visual warning
**Fix**:
1. Check Chrome allows content scripts
2. Try reloading the tab
3. Check for JavaScript errors in extension console

---

## 🎯 **Quick Test Commands**

### **Test Backend Health**
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok","python":true}
```

### **Test YouTube Analysis**
```bash
curl -X POST http://localhost:8000/analyze/tab \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=gXKy3GQJRKA", "title": "YouTube"}'
# Expected: {"success": true, "result": {"is_distraction": true}}
```

### **Test Instagram Analysis**
```bash
curl -X POST http://localhost:8000/analyze/tab \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.instagram.com", "title": "Instagram"}'
# Expected: {"success": true, "result": {"is_distraction": true}}
```

---

## 📊 **What to Report Back**

If it's still not working, please share:

### **Extension Console Messages**
1. Open `chrome://extensions/` → "WorkSpace AI Tab Monitor" → "Service worker"
2. Screenshot the console messages
3. Look for any red errors

### **Extension Popup Status**
1. Click extension icon
2. Screenshot the popup
3. Does it show "Session Active"?

### **Backend Status**
1. Run: `curl http://localhost:8000/health`
2. Share the output

---

## 🎉 **Expected Success**

When everything works:
1. **Extension console**: Shows monitoring messages
2. **YouTube video**: Red warning → 5-second countdown → Block
3. **Instagram**: Red warning → 5-second countdown → Block
4. **Educational content**: Stays open with console confirmation

**Follow these steps exactly and let me know what happens at each stage!**
