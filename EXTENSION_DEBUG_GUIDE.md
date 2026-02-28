# 🔧 Extension Debug Guide

## ❌ Current Issues & Solutions

### Issue 1: Backend Connection Error
```
Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
```

**✅ Fixed**: Added fallback to local analysis when backend is not available

### Issue 2: Unknown Message Type
```
⚠️ Unknown message type: to_background
```

**✅ Fixed**: Added proper message handling for `to_background` messages

### Issue 3: Extension Analyzing Everything
The extension is analyzing all tabs including:
- `localhost:8000/dashboard.html`
- `chrome://extensions/`
- `chrome://newtab/`

**✅ Fixed**: Added filtering for internal Chrome pages

## 🔧 **How to Fix Now**

### Step 1: Reload Extension
1. Open `chrome://extensions/`
2. Find "WorkSpace AI Tab Monitor"
3. Click **"Reload"** (🔄)

### Step 2: Start Session
1. Open `http://localhost:8000/dashboard.html`
2. Click **"🚀 Start Session"**
3. Extension should now work without errors

### Step 3: Test Instagram Blocking
1. Visit `https://www.instagram.com`
2. Should see: `🚫 Blocking tab: www.instagram.com`
3. Tab should close and educational site should open

## 📊 **Expected Console Output**

### After Fixes:
```
🚀 WorkSpace AI Extension initialized
🔄 Tab activated: https://www.instagram.com
🔍 Analyzing tab: www.instagram.com
❌ Backend not available, using local analysis: Connection failed
🧠 Local Analysis: {content_type: "distraction", distraction_score: 85}
🚫 Blocking tab: https://www.instagram.com
```

### Educational Site:
```
🔄 Tab activated: https://www.khanacademy.org
🔍 Analyzing tab: khanacademy.org
🧠 Local Analysis: {content_type: "educational", distraction_score: 10}
✅ Educational content allowed
```

## 🎯 **What the Extension Does Now**

### ✅ **Smart Analysis**
- **Tries AI backend first** (if available)
- **Falls back to local analysis** (if backend fails)
- **Uses URL and title** for classification
- **No backend dependency** required

### ✅ **Local Classification Rules**
- **Educational sites**: khanacademy.org, github.com, coursera.org → **Allowed**
- **Distracting sites**: instagram.com, facebook.com, youtube.com → **Blocked**
- **Productive sites**: stackoverflow.com, figma.com, notion.so → **Allowed**
- **Neutral sites**: Everything else → **Monitored only**

### ✅ **Proper Message Handling**
- Handles `session_started` messages from dashboard
- Handles `session_stopped` messages from dashboard
- Handles `get_status` requests from popup
- No more "Unknown message type" errors

## 🧪 **Testing the Fixed Extension**

### Test 1: Start Session
1. Open dashboard
2. Click "Start Session"
3. **Result**: No backend errors, session starts

### Test 2: Educational Site
1. Visit `https://khanacademy.org`
2. **Result**: Tab stays open, no blocking

### Test 3: Distracting Site
1. Visit `https://instagram.com`
2. **Result**: Tab closes, educational site opens

### Test 4: Extension Popup
1. Click extension icon
2. **Result**: Shows "Session Active" and blocked count

## 🔍 **Debug Information**

### Backend Status
- ✅ **AI Backend Running**: `http://localhost:8005`
- ✅ **Fallback Available**: Local analysis works without backend
- ✅ **No Dependencies**: Extension works even if backend is down

### Extension Status
- ✅ **Message Handling**: Fixed `to_background` messages
- ✅ **Error Handling**: Graceful fallback when backend fails
- ✅ **Tab Filtering**: Ignores internal Chrome pages

---

## 🎉 **Your Extension Should Now Work Perfectly!**

**The fixed extension:**
- ✅ **No more connection errors**
- ✅ **No more unknown message errors**
- ✅ **Works with or without AI backend**
- ✅ **Blocks Instagram automatically**
- ✅ **Allows educational sites**
- ✅ **Provides real-time statistics**

**Try reloading the extension and starting a session - all errors should be resolved! 🚀**
