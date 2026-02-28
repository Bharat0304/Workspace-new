# 🔧 Session Startup Troubleshooting Guide

## ❌ Problem: "Not able to start session"

If you're unable to start a session in the WorkSpace AI Dashboard, follow these steps to diagnose and fix the issue.

## 🧪 Quick Test

1. **Open the Test Page**: `http://localhost:8000/test_dashboard.html`
2. **Run System Check**: Click "Check System Status"
3. **Test API Connectivity**: Click "Test AI Backend"
4. **Test Session**: Click "Test Session Start"

## 🔍 Common Issues & Solutions

### 1. **JavaScript Errors**
**Symptoms**: Console shows syntax errors, buttons don't work
**Solution**: ✅ **Fixed** - Dashboard JavaScript has been corrected

### 2. **AI Backend Not Running**
**Symptoms**: "Network error" when starting session
**Solution**:
```bash
cd /Users/user/bharat/workspace/ai-backend
python app/main.py
```
**Verify**: Running on `http://localhost:8005`

### 3. **Frontend Server Not Running**
**Symptoms**: Page not found, 404 errors
**Solution**:
```bash
cd /Users/user/bharat/workspace/frontend
python3 -m http.server 8000
```
**Verify**: Running on `http://localhost:8000`

### 4. **Browser Extension Issues**
**Symptoms**: Extension not responding, no tab monitoring
**Solution**:
1. Open `chrome://extensions/`
2. Check extension is enabled
3. Click "Service worker" to view logs
4. Reload extension if needed

### 5. **CORS Issues**
**Symptoms**: "CORS policy" errors in console
**Solution**: AI backend should handle CORS automatically

### 6. **Permission Issues**
**Symptoms**: Camera/screen permission denied
**Solution**:
1. Click "Start Session" button
2. Grant camera and screen permissions
3. Try again if denied

## 🚀 Step-by-Step Fix

### Step 1: Verify Services
```bash
# Check AI Backend
curl http://localhost:8005/health

# Check Frontend
curl http://localhost:8000/dashboard.html
```

### Step 2: Clear Browser Cache
1. Open Chrome Developer Tools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Step 3: Test Dashboard JavaScript
1. Open `http://localhost:8000/test_dashboard.html`
2. Click "Test Dashboard JavaScript"
3. Check for any errors

### Step 4: Check Console Logs
1. Open `http://localhost:8000/dashboard.html`
2. Open Developer Tools (F12)
3. Click "Console" tab
4. Look for red error messages

### Step 5: Test Session Manually
1. Open Developer Tools
2. In Console, type: `new AIDashboard().startSession()`
3. Check for errors

## 🔧 Debug Commands

### Check AI Backend Status
```bash
curl http://localhost:8005/health
```

### Test Intelligent Assistant
```bash
curl -X POST http://localhost:8005/intelligent-assistant/voice-command \
  -H "Content-Type: application/json" \
  -d '{"command":"test","user_context":{"focus_level":75}}'
```

### Check Frontend Files
```bash
ls -la /Users/user/bharat/workspace/frontend/dashboard.js
```

## 📱 Expected Behavior

### When Session Starts Successfully:
1. ✅ **Button Changes**: "Start Session" → "Stop Session"
2. ✅ **Status Updates**: "Session Active" (green)
3. ✅ **Timer Starts**: Duration counter begins
4. ✅ **AI Monitoring**: Screen and face analysis begins
5. ✅ **Extension Notification**: Browser extension activates
6. ✅ **Activity Log**: Shows "Session started" message

### Console Messages (Expected):
```
🎯 WorkSpace AI Content Script Loaded
📨 Content script received message: {type: "to_extension", action: "session_started"}
🧠 Session started: session_1234567890
```

## 🆘 Still Not Working?

### 1. **Restart Everything**
```bash
# Kill all processes
pkill -f "python.*main.py"
pkill -f "python.*http.server"

# Restart in order
cd /Users/user/bharat/workspace/ai-backend && python app/main.py
cd /Users/user/bharat/workspace/frontend && python3 -m http.server 8000
```

### 2. **Check Port Conflicts**
```bash
lsof -i :8000  # Frontend
lsof -i :8005  # AI Backend
```

### 3. **Verify File Permissions**
```bash
ls -la /Users/user/bharat/workspace/frontend/dashboard.js
ls -la /Users/user/bharat/workspace/ai-backend/app/main.py
```

### 4. **Test with Different Browser**
Try Firefox or Edge to rule out browser-specific issues.

## 🎯 Quick Fix Checklist

- [ ] AI Backend running on port 8005
- [ ] Frontend running on port 8000
- [ ] Dashboard JavaScript fixed (✅ Done)
- [ ] Browser extension installed and enabled
- [ ] No console errors
- [ ] Permissions granted for camera/screen
- [ ] Test page passes all checks

---

## 🎉 **Fixed Issues**

✅ **JavaScript Syntax Errors**: Dashboard.js completely rewritten  
✅ **Missing Methods**: All session methods properly implemented  
✅ **API Integration**: Correct endpoints and error handling  
✅ **Extension Communication**: Message passing fixed  
✅ **Test Page**: Comprehensive testing tool created  

**Your session startup issue should now be resolved! 🚀**
