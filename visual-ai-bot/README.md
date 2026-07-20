# ARIA - Visual AI Interface

A futuristic AI video chat companion with webcam integration and speech recognition.

## Project Structure

This project is organized into separate files for easy maintenance:

```
visual-ai-bot/
├── index.html      # HTML structure
├── styles.css      # All CSS styling
├── config.js       # Constants and configuration
├── script.js       # JavaScript logic and functionality
└── README.md       # Documentation
```

## Files Overview

### index.html
- Main HTML document structure
- Contains semantic HTML elements for camera panel, chat interface, and controls
- Imports CSS and JavaScript files

### styles.css
- All styling for the application
- Includes animations (pulse, blink, bounce, fadeUp, glitch)
- Responsive design with grid backgrounds and visual effects
- Scrollbar customization

### config.js
- `SYSTEM_PROMPT` - Instructions for the ARIA AI assistant
- `API_CONFIG` - Anthropic API settings
- `DEFAULT_MESSAGES` - Initial chat message
- `CAMERA_CONFIG` - Video capture settings
- `SPEECH_SYNTHESIS_CONFIG` - Text-to-speech settings

### script.js
- Camera control functions
- Speech recognition implementation
- Message handling and rendering
- API communication with Anthropic Claude
- Text-to-speech functionality
- UI state management

## Features

✨ **Video Chat**
- Real-time webcam access
- Live camera indicator
- Camera on/off controls

🎤 **Speech Recognition**
- Voice input support
- Real-time transcription
- Mic toggle button

🤖 **AI Integration**
- Claude Sonnet 4 integration
- Image analysis from webcam frames
- Natural conversation flow

🔊 **Text-to-Speech**
- AI responses spoken aloud
- Voice preference selection
- Customizable speech rate and pitch

🎨 **Cyberpunk UI**
- Futuristic design with neon colors
- Animated grid background
- Glitch effects and scanlines
- Smooth animations

## Setup Instructions

1. **Open the Project**
   - Open `index.html` in a modern web browser
   - Allow camera and microphone permissions when prompted
   - **You will be prompted to enter your Anthropic API key on first load**

2. **Add Your API Key**
   - On first load, a dialog will ask for your Anthropic API key
   - Get one from: https://console.anthropic.com/
   - The key is saved in browser storage (localStorage) for this session
   - **Note:** The key is stored locally in your browser. Clear it if using a shared computer.

3. **Start Using**
   - Click "START CAM" to activate your camera
   - Click the microphone button to speak or type messages
   - ARIA will analyze your camera feed and respond
   - No more prompts will appear - the key is reused for all messages

## API Key Management

**To change your API key:**
- Open browser console (F12) and run: `clearAPIKey()`
- Then refresh the page to enter a new key

**To remove stored key:**
- Clear browser's localStorage or manually delete the entry named `anthropicApiKey`

## Browser Requirements

- Modern browser with support for:
  - WebRTC (camera/video)
  - Web Speech API (speech recognition)
  - Canvas API (frame capture)
  - Fetch API
  - ES6 JavaScript

## Recommended Browsers

- Chrome/Chromium (best support)
- Firefox (good support)
- Edge (good support)
- Safari (partial support)

## API Requirements

- Anthropic API key (for Claude model access)
- Internet connection

## Customization

### Change AI Personality
Edit `SYSTEM_PROMPT` in `config.js`:
```javascript
const SYSTEM_PROMPT = `Your custom instructions here...`;
```

### Change Colors
Edit CSS variables in `styles.css`:
- Primary color: `#00ffb4` (cyan)
- Secondary color: `#0096ff` (blue)
- Accent color: `#ff4060` (red)

### Change Voice Settings
Edit `SPEECH_SYNTHESIS_CONFIG` in `config.js`:
```javascript
const SPEECH_SYNTHESIS_CONFIG = {
  rate: 1.05,      // Speech speed
  pitch: 1.1,      // Voice pitch
  preferredVoiceNames: ['Google', 'Female', 'Samantha']
};
```

## Troubleshooting

**Camera won't start:**
- Check browser permissions
- Ensure camera is not in use by another app
- Try a different browser

**Speech recognition not working:**
- Check browser support
- Enable microphone permissions
- Try Chrome or Edge

**API errors:**
- Verify API key is correct
- Check internet connection
- Ensure Anthropic API is accessible

## Notes

- Camera frames are sent to Claude with each message for visual context
- Responses are kept concise for natural conversation flow
- All processing happens in real-time
- No data is permanently stored locally

## License

This project uses the Anthropic Claude API.
