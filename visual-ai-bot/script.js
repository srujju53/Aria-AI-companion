// Main Application Logic

// DOM Elements
const app = {
  video: document.getElementById('video'),
  canvas: document.getElementById('canvas'),
  camButton: document.getElementById('camButton'),
  micButton: document.getElementById('micButton'),
  inputText: document.getElementById('inputText'),
  sendButton: document.getElementById('sendButton'),
  messagesContainer: document.getElementById('messagesContainer'),
  chatEndRef: null,
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),
  appTitle: document.querySelector('.app-title'),
  noSignal: document.getElementById('noSignal'),
  liveIndicator: document.getElementById('liveIndicator'),
  camError: document.getElementById('camError'),
  visionStatus: document.getElementById('visionStatus'),
  speechStatus: document.getElementById('speechStatus')
};

// State
const state = {
  camActive: false,
  listening: false,
  loading: false,
  messages: [...DEFAULT_MESSAGES],
  stream: null,
  recognition: null,
  glitchInterval: null,
  apiKey: null
};

// Initialize application
function init() {
  setupEventListeners();
  renderMessages();
  startGlitchEffect();
  displayWelcomeMessage();
  initializeAPIKey();
}

// Initialize API Key once
function initializeAPIKey() {
  // Check if Groq API key is stored in localStorage
  const storedKey = localStorage.getItem('groqApiKey');

  if (storedKey) {
    state.apiKey = storedKey;
  } else {
    // Ask for Groq key on first load
    const apiKey = prompt(
      'Enter your Groq API key:\n\nGet free key from: https://console.groq.com/keys\n\n(Completely FREE - unlimited requests!)\n\nThe key will be saved in your browser.'
    );
    if (!apiKey) {
      alert('No API key provided. ARIA will not work until a key is added.');
      return;
    }
    state.apiKey = apiKey;
    localStorage.setItem('groqApiKey', apiKey);
  }
}

// Event listeners
function setupEventListeners() {
  app.camButton.addEventListener('click', toggleCamera);
  app.micButton.addEventListener('click', toggleListen);
  app.sendButton.addEventListener('click', handleSend);
  app.inputText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });
  app.inputText.addEventListener('input', updateSendButtonState);
}

// Camera functions
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(
      { video: { width: 640, height: 480 }, audio: false }
    );
    state.stream = stream;
    app.video.srcObject = stream;
    app.video.play();
    state.camActive = true;
    updateCameraUI();
    app.camError.style.display = 'none';
  } catch (error) {
    app.camError.textContent = 'Camera access denied. Please allow camera permission.';
    app.camError.style.display = 'block';
    state.camActive = false;
  }
}

function stopCamera() {
  if (state.stream) {
    state.stream.getTracks().forEach(track => track.stop());
  }
  state.stream = null;
  state.camActive = false;
  updateCameraUI();
}

function toggleCamera() {
  if (state.camActive) {
    stopCamera();
  } else {
    startCamera();
  }
}

function updateCameraUI() {
  if (state.camActive) {
    app.camButton.textContent = '◻ STOP';
    app.camButton.classList.add('stop');
    app.statusDot.classList.add('active');
    app.statusText.textContent = 'CAM ONLINE';
    app.noSignal.style.display = 'none';
    app.liveIndicator.style.display = 'flex';
    app.visionStatus.textContent = 'ACTIVE';
    app.visionStatus.parentElement.querySelector('.stat-value').classList.add('active');
    app.inputText.placeholder = 'Type or speak — I can see you...';
    updateSendButtonState();
  } else {
    app.camButton.textContent = '◉ START CAM';
    app.camButton.classList.remove('stop');
    app.statusDot.classList.remove('active');
    app.statusText.textContent = 'CAM OFFLINE';
    app.noSignal.style.display = 'flex';
    app.liveIndicator.style.display = 'none';
    app.visionStatus.textContent = 'OFFLINE';
    app.visionStatus.parentElement.querySelector('.stat-value').classList.remove('active');
    app.inputText.placeholder = 'Start camera then type here...';
    updateSendButtonState();
  }
}

// Frame capture
function captureFrame() {
  if (!app.video || !app.canvas || !state.camActive) return null;
  app.canvas.width = CAMERA_CONFIG.width;
  app.canvas.height = CAMERA_CONFIG.height;
  const ctx = app.canvas.getContext('2d');
  ctx.drawImage(app.video, 0, 0, CAMERA_CONFIG.width, CAMERA_CONFIG.height);
  return app.canvas.toDataURL('image/jpeg', CAMERA_CONFIG.quality).split(',')[1];
}

// Speech recognition
function toggleListen() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert('Speech recognition not supported in this browser.');
    return;
  }

  if (state.listening) {
    state.recognition?.stop();
    state.listening = false;
    updateMicUI();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  state.recognition = new SpeechRecognition();
  state.recognition.continuous = false;
  state.recognition.interimResults = false;
  state.recognition.lang = 'en-US';

  state.recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    const frame = captureFrame();
    state.listening = false;
    updateMicUI();
    sendToAI(transcript, frame);
  };

  state.recognition.onerror = () => {
    state.listening = false;
    updateMicUI();
  };

  state.recognition.onend = () => {
    state.listening = false;
    updateMicUI();
  };

  state.recognition.start();
  state.listening = true;
  updateMicUI();
}

function updateMicUI() {
  if (state.listening) {
    app.micButton.classList.add('listening');
    app.micButton.textContent = '◼';
    app.speechStatus.textContent = 'LISTENING';
    app.speechStatus.parentElement.querySelector('.stat-value').classList.add('active');
  } else {
    app.micButton.classList.remove('listening');
    app.micButton.textContent = '🎤';
    app.speechStatus.textContent = 'STANDBY';
    app.speechStatus.parentElement.querySelector('.stat-value').classList.remove('active');
  }
}

// AI Communication
async function sendToAI(userText, frameBase64 = null) {
  if (!state.apiKey) {
    app.messagesContainer.innerHTML = '';
    state.messages = [...DEFAULT_MESSAGES];
    state.messages.push({
      role: 'assistant',
      content: 'API key not configured. Please add your Google Gemini key.'
    });
    renderMessages();
    return;
  }

  state.loading = true;
  const userMessage = { role: 'user', content: userText };
  state.messages.push(userMessage);
  renderMessages();

  try {
    // Format messages for Groq (OpenAI format)
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...state.messages.map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : msg.content.text || ''
      }))
    ];

    const response = await fetch(API_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAPIKey()}`
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        max_tokens: API_CONFIG.maxTokens,
        messages: apiMessages
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }
    
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";
    state.messages.push({ role: 'assistant', content: reply });
    renderMessages();

    // Speak the reply
    speakReply(reply);
  } catch (error) {
    console.error('Error:', error);
    state.messages.push({
      role: 'assistant',
      content: `Error: ${error.message}`
    });
    renderMessages();
  }

  state.loading = false;
  updateSendButtonState();
  app.inputText.value = '';
}

function getAPIKey() {
  return state.apiKey;
}

// Text-to-speech
function speakReply(text) {
  if (!('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = SPEECH_SYNTHESIS_CONFIG.rate;
  utterance.pitch = SPEECH_SYNTHESIS_CONFIG.pitch;

  const voices = window.speechSynthesis.getVoices();
  let preferredVoice = null;

  for (const voiceName of SPEECH_SYNTHESIS_CONFIG.preferredVoiceNames) {
    preferredVoice = voices.find(v =>
      v.name.toLowerCase().includes(voiceName.toLowerCase())
    );
    if (preferredVoice) break;
  }

  if (preferredVoice) utterance.voice = preferredVoice;

  window.speechSynthesis.speak(utterance);
}

// Message handling
function handleSend() {
  const text = app.inputText.value.trim();
  if (!text || state.loading) return;

  const frame = captureFrame();
  app.inputText.value = '';
  sendToAI(text, frame);
}

function updateSendButtonState() {
  const canSend = app.inputText.value.trim().length > 0 && !state.loading && state.camActive;
  app.sendButton.disabled = !canSend;
}

// Message rendering
function renderMessages() {
  app.messagesContainer.innerHTML = '';

  state.messages.forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.role}`;

    if (msg.role === 'assistant') {
      const avatar = document.createElement('div');
      avatar.className = 'message-avatar';
      avatar.textContent = '⬡';
      messageDiv.appendChild(avatar);
    }

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = msg.content;
    messageDiv.appendChild(content);

    app.messagesContainer.appendChild(messageDiv);
  });

  if (state.loading) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-message';

    const avatar = document.createElement('div');
    avatar.className = 'loading-avatar';
    avatar.textContent = '⬡';
    loadingDiv.appendChild(avatar);

    const content = document.createElement('div');
    content.className = 'loading-content';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'loading-dot';
      content.appendChild(dot);
    }
    loadingDiv.appendChild(content);

    app.messagesContainer.appendChild(loadingDiv);
  }

  scrollToBottom();
}

function scrollToBottom() {
  app.messagesContainer.scrollTop = app.messagesContainer.scrollHeight;
}

function displayWelcomeMessage() {
  renderMessages();
}

// Glitch effect
function startGlitchEffect() {
  state.glitchInterval = setInterval(() => {
    app.appTitle.classList.add('glitch');
    setTimeout(() => {
      app.appTitle.classList.remove('glitch');
    }, 150);
  }, 8000);
}

// Clear stored API key (for debugging/testing)
function clearAPIKey() {
  localStorage.removeItem('groqApiKey');
  state.apiKey = null;
  alert('API key cleared. Please refresh the page to enter a new one.');
}

// Start the app
init();
