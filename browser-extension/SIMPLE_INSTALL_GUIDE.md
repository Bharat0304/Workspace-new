# 🚀 Simple WorkSpace AI Extension - Installation Guide

## 📋 What This Extension Does

✅ **Monitors tab content** (not screen recording)  
✅ **Analyzes content** via your AI backend at `http://localhost:8005`  
✅ **Blocks distracting tabs** by closing them  
✅ **Opens educational alternatives** automatically  
✅ **Uses your existing API endpoints**  

## 📦 Installation Steps

### Step 1: Prepare Extension Files
Make sure you have these files in `/Users/user/bharat/workspace/browser-extension/`:
- ✅ `manifest_simple.json` - Extension configuration
- ✅ `background_simple.js` - Main monitoring logic
- ✅ `popup_simple.html` - Extension popup UI
- ✅ `popup_simple.js` - Popup functionality
- ✅ `icons/` folder with icon files

### Step 2: Load Extension in Chrome
1. **Open Chrome Extensions**: `chrome://extensions/`
2. **Enable Developer Mode**: Toggle switch (top right)
3. **Load Extension**: Click "Load unpacked"
4. **Select Folder**: Choose `/Users/user/bharat/workspace/browser-extension/`
5. **Verify**: "WorkSpace AI Tab Monitor" appears in list

### Step 3: Verify Installation
- ✅ Extension icon appears in Chrome toolbar
- ✅ Click icon shows popup with "Session Inactive"
- ✅ No errors in extension details

## 🎮 How to Use

### Start Monitoring
1. **Click extension icon** in toolbar
2. **Click "Start" button**
3. **Session becomes "Active"**
4. **Extension now monitors all tabs**

### What Happens During Monitoring
- ✅ **Every 5 seconds**: Checks current tab
- ✅ **Captures tab screenshot** (content analysis)
- ✅ **Sends to AI backend** for analysis
- ✅ **Blocks distracting sites** (closes tab)
- ✅ **Opens educational alternative**

### Stop Monitoring
1. **Click extension icon**
2. **Click "Stop" button**
3. **Session becomes "Inactive"**
4. **Monitoring stops**

## 🧪 Testing the Extension

### Test 1: Educational Site (Should Allow)
1. Start session
2. Visit `https://www.khanacademy.org`
3. **Result**: Tab stays open, no blocking

### Test 2: Distracting Site (Should Block)
1. Start session  
2. Visit `https://www.instagram.com`
3. **Result**: Tab closes, educational site opens

### Test 3: Popup Status
1. Click extension icon
2. **Check**: "Sites Blocked" count increases
3. **Check**: "Session Time" counts up
4. **Check**: "Current Tab" shows domain

## 🔧 Troubleshooting

### Extension Not Loading?
1. **Check manifest**: `manifest_simple.json` is valid JSON
2. **Reload extension**: chrome://extensions/ → Reload
3. **Check permissions**: All required permissions granted

### Not Blocking Sites?
1. **Check AI backend**: Running at `http://localhost:8005`
2. **Check console**: chrome://extensions/ → Service worker
3. **Verify session**: Extension popup shows "Session Active"

### API Errors?
1. **Check backend**: `curl http://localhost:8005/health`
2. **Check endpoint**: `/analyze/screen` exists
3. **Check CORS**: Backend allows extension requests

## 📊 Expected Behavior

### When Session Starts:
```
🚀 Session started - Tab monitoring active
🔄 Tab updated: https://www.example.com
🔍 Analyzing tab: www.example.com
🧠 AI Analysis: {distraction_score: 80, content_type: "social"}
🚫 Blocking tab: https://www.instagram.com
```

### When Educational Site Detected:
```
✅ Educational site detected: khanacademy.org
✅ Educational content allowed: https://www.khanacademy.org
```

### Popup Shows:
- **Session Status**: Active/Inactive
- **Sites Blocked**: Count (increments)
- **Session Time**: MM:SS format
- **Current Tab**: Domain name

## 🎯 Key Features

### ✅ **What Works**
- Tab content monitoring (no screen recording)
- AI-powered content analysis
- Automatic blocking of distracting sites
- Educational site redirection
- Real-time popup statistics
- 5-second polling interval

### ❌ **What It Doesn't Do**
- Record your screen or camera
- Store personal data
- Monitor when session is inactive
- Block without AI analysis

---

## 🎉 **Ready to Install!**

**Your simple WorkSpace AI extension is ready to:**
1. **Monitor tab content intelligently**
2. **Block distractions automatically** 
3. **Keep you focused on learning**
4. **Provide real-time statistics**

**Install now and boost your productivity! 🚀**
