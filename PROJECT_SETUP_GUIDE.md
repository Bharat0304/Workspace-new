# 🚀 Complete WorkSpace AI Project Setup Guide

## 📁 **Project Structure**

```
workspace/
├── ai-backend/           # Python AI backend
├── backend/             # Node.js backend
├── frontend/            # React frontend
├── browser-extension/   # Chrome extension
└── app/                # Main app files
```

## 🎯 **Step-by-Step Setup**

### **Step 1: Start Python AI Backend**

#### **1.1 Navigate to AI Backend**
```bash
cd /Users/user/bharat/workspace/ai-backend
```

#### **1.2 Check Python Requirements**
```bash
# Check if Python 3.8+ is installed
python3 --version

# Install requirements (if needed)
pip3 install -r requirements.txt
```

#### **1.3 Start the Backend**
```bash
# Start the AI backend on port 8005
python3 app.py
```

**Expected Output:**
```
🚀 Starting WorkSpace AI Backend on port 8005
🔌 Browser extension endpoints enabled
INFO:     Started server process...
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8005
```

---

### **Step 2: Start Frontend**

#### **2.1 Navigate to Frontend**
```bash
cd /Users/user/bharat/workspace/frontend
```

#### **2.2 Install Dependencies**
```bash
# Install npm packages
npm install

# Or if using pnpm
pnpm install
```

#### **2.3 Start Frontend**
```bash
# Start development server
npm run dev

# Or with pnpm
pnpm dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

---

### **Step 3: Load Chrome Extension**

#### **3.1 Open Chrome Extensions**
1. Open Chrome browser
2. Go to: `chrome://extensions/`
3. Enable **"Developer mode"** (top right toggle)

#### **3.2 Load Extension**
1. Click **"Load unpacked"**
2. Navigate to: `/Users/user/bharat/workspace/browser-extension/`
3. Select folder and click **"Select"**

#### **3.3 Verify Extension Loaded**
- ✅ Extension appears in list: "WorkSpace AI Tab Monitor"
- ✅ Extension icon appears in Chrome toolbar
- ✅ No errors in extension details

---

### **Step 4: Test Complete System**

#### **4.1 Check Backend Health**
```bash
# Test backend is running
curl http://localhost:8005/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "python": true,
  "time": "2024-02-28T12:00:00.000Z"
}
```

#### **4.2 Check Frontend**
1. Open: `http://localhost:3000`
2. **Expected**: WorkSpace AI dashboard loads
3. **Expected**: Can see focus session controls

#### **4.3 Test Extension**
1. Click extension icon in toolbar
2. Click **"Start"** button
3. **Expected**: Status shows "Session Active"

#### **4.4 Test Blocking**
1. Visit: `https://www.instagram.com`
2. **Expected**: Red warning overlay → 5-second countdown → Block
3. Visit: `https://www.youtube.com/watch?v=rfscVS0vtbw` (educational)
4. **Expected**: Tab stays open
5. Search YouTube for "funny cat videos"
6. **Expected**: Warning overlay → Block after 5 seconds

---

## 🔧 **Quick Start Commands**

### **All Services in Separate Terminals**

#### **Terminal 1: AI Backend**
```bash
cd /Users/user/bharat/workspace/ai-backend
python3 app.py
```

#### **Terminal 2: Frontend**
```bash
cd /Users/user/bharat/workspace/frontend
npm run dev
```

#### **Terminal 3: Extension (Optional - for debugging)**
```bash
# Monitor extension logs
# Go to chrome://extensions/ → Click "Service worker"
```

---

## 🌐 **Access Points**

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main dashboard |
| **AI Backend** | http://localhost:8005 | Extension analysis |
| **Extension** | Chrome toolbar | Tab monitoring |
| **Health Check** | http://localhost:8005/health | Backend status |

---

## 🎯 **Testing Checklist**

### **✅ Backend Working**
- [ ] Python backend starts on port 8005
- [ ] Health endpoint returns `{"status": "ok"}`
- [ ] No Python errors in console

### **✅ Frontend Working**
- [ ] React app loads on localhost:3000
- [ ] Dashboard displays correctly
- [ ] No JavaScript errors in browser console

### **✅ Extension Working**
- [ ] Extension loads in Chrome
- [ ] Extension popup opens when clicked
- [ ] Session starts/stops correctly
- [ ] Instagram shows warning then blocks
- [ ] YouTube educational content allowed
- [ ] YouTube distracting content blocked

---

## 🚨 **Troubleshooting**

### **Backend Issues**
```bash
# Check Python version
python3 --version  # Should be 3.8+

# Install missing packages
pip3 install fastapi uvicorn python-multipart

# Check port availability
lsof -i :8005
```

### **Frontend Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check port availability
lsof -i :3000
```

### **Extension Issues**
1. **Extension not loading**: Check manifest.json syntax
2. **No blocking**: Check session is active
3. **No warnings**: Check extension console for errors
4. **Backend not working**: Check AI backend is running

---

## 🎉 **Success Indicators**

### **When Everything Works:**
- ✅ **Backend**: Running on port 8005 with no errors
- ✅ **Frontend**: Dashboard accessible on localhost:3000
- ✅ **Extension**: Icon in toolbar, popup works
- ✅ **Integration**: Extension blocks Instagram, analyzes YouTube
- ✅ **Console**: Clean logs, no JavaScript errors

### **Expected User Experience:**
1. **Start session** in extension popup
2. **Visit Instagram** → 5-second warning → blocked
3. **Visit educational YouTube** → stays open
4. **Visit funny YouTube** → 5-second warning → blocked
5. **Check dashboard** → see focus statistics

---

## 📱 **Mobile/Web App Usage**

### **Access Main Dashboard**
1. Open browser: `http://localhost:3000`
2. **Features available**:
   - Start/stop focus sessions
   - View productivity statistics
   - Monitor blocked sites
   - Track focus time

### **Extension vs Dashboard**
- **Extension**: Real-time tab monitoring and blocking
- **Dashboard**: Session management and analytics
- **Both work together** for complete focus management

---

## 🎯 **You're Ready!**

**After following these steps:**
1. **AI Backend** running on port 8005
2. **Frontend** running on port 3000  
3. **Extension** loaded in Chrome
4. **All components** integrated and working

**Your WorkSpace AI system is now fully operational! 🚀**

**Start your first focus session and enjoy distraction-free learning!**
