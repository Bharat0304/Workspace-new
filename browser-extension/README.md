# WorkSpace AI Browser Extension

## 🎯 Overview

The WorkSpace AI Browser Extension provides intelligent productivity monitoring and coaching by integrating with the WorkSpace AI Backend. It automatically monitors your browsing behavior and provides real-time feedback to keep you focused on your educational goals.

## 🚀 Features

### 🖥️ **Automatic Site Classification**
- **Educational Sites**: Khan Academy, Coursera, GitHub, Stack Overflow, etc.
- **Distracting Sites**: YouTube, Facebook, Twitter, Instagram, TikTok, etc.
- **Productive Sites**: Code repositories, documentation, productivity tools

### 🚫 **Smart Site Blocking**
- Automatically blocks distracting sites during active sessions
- Provides educational alternatives when possible
- Customizable blocking rules and exceptions

### 🎤 **Voice Assistant Integration**
- Voice commands for session control
- Contextual motivation and coaching
- Real-time productivity insights

### 📊 **Real-time Analytics**
- Focus level monitoring
- Distraction detection
- Productivity scoring
- Session analytics

## 🔧 Installation

### Development Setup

1. **Load Extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `browser-extension` directory

2. **Start AI Backend**:
   ```bash
   cd /Users/user/bharat/workspace/ai-backend
   python app/main.py
   ```

3. **Start Dashboard**:
   ```bash
   cd /Users/user/bharat/workspace/frontend
   python3 -m http.server 8000
   ```

## 🎮 Usage

### Starting a Session
1. Open the WorkSpace AI Dashboard
2. Click "🚀 Start Session"
3. Grant camera and screen permissions when prompted
4. The extension will automatically monitor your browsing

### Voice Commands
- **"Start session"** - Begin monitoring
- **"Stop session"** - End monitoring
- **"Block site"** - Block current site
- **"Status"** - Get current productivity status
- **"Motivate me"** - Get motivational message

### Site Blocking
- Distracting sites are automatically blocked during sessions
- Educational sites are encouraged with positive feedback
- Manual blocking available via popup menu

## 🔒 Privacy & Security

- **No personal data stored**: All analysis happens in real-time
- **Local processing**: Images processed locally, never uploaded
- **User control**: Full control over what gets monitored
- **Transparent**: Clear indication when monitoring is active

## 🛠️ Configuration

### Educational Sites (Auto-allowed)
- khanacademy.org, coursera.org, edx.org, udacity.com
- pluralsight.com, brilliant.org, w3schools.com
- stackoverflow.com, github.com, codecademy.com
- freecodecamp.org, leetcode.com, hackerrank.com

### Distracting Sites (Auto-blocked)
- youtube.com, facebook.com, twitter.com, instagram.com
- tiktok.com, reddit.com, netflix.com, twitch.tv
- discord.com, steam.com, spotify.com

### Customization
Edit `background.js` to modify:
- Site classification rules
- Blocking behavior
- Notification preferences
- Voice command responses

## 🔧 Development

### File Structure
```
browser-extension/
├── manifest.json          # Extension configuration
├── background.js           # Service worker logic
├── content.js             # Content script for UI
├── injection.js           # UI overlay system
├── popup.html             # Extension popup UI
├── popup.js               # Popup controller
└── icons/                 # Extension icons
```

### Key Components

**Background Service Worker** (`background.js`)
- Tab monitoring and classification
- Site blocking logic
- Extension communication
- API integration

**Content Scripts** (`content.js`, `injection.js`)
- UI overlay injection
- Real-time feedback display
- User interaction handling

**Popup Interface** (`popup.html`, `popup.js`)
- Session control interface
- Status display
- Manual site blocking

## 🚨 Troubleshooting

### Extension Not Working
1. Check if AI backend is running on port 8005
2. Verify extension permissions in Chrome settings
3. Check browser console for errors
4. Restart Chrome after installing

### Sites Not Blocking
1. Ensure session is active in dashboard
2. Check if site is in classification lists
3. Verify extension has necessary permissions
4. Review background script logs

### Voice Commands Not Working
1. Check microphone permissions
2. Verify voice backend is running on port 4001
3. Test with simple commands first
4. Check network connectivity

## 📞 Support

For issues and support:
- Check the browser console for error messages
- Verify all backend services are running
- Review extension permissions in Chrome settings
- Check the WorkSpace AI dashboard status

## 🔄 Updates

The extension automatically updates when:
- New site classifications are added
- Voice commands are enhanced
- UI improvements are made
- Backend API changes occur

---

**Built with ❤️ for productive learning and focused work sessions**
