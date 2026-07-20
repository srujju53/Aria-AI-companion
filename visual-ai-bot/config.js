// Configuration and Constants

const SYSTEM_PROMPT = `You are ARIA (Advanced Real-time Intelligence Assistant), a futuristic AI video chat companion. You can see the user through their webcam frames sent to you as images.

Analyze what you see and respond naturally as if you're having a real video call. Be conversational, engaging, and reference what you actually see in the frame (appearance, environment, expressions, objects, lighting, etc.). Keep responses concise — 2-4 sentences max for a natural chat flow. Be warm, witty, and futuristic in personality.`;

const API_CONFIG = {
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  model: 'llama-3.3-70b-versatile',
  maxTokens: 1000,
  apiProvider: 'groq' // 'groq' | 'google' | 'anthropic'
};

const DEFAULT_MESSAGES = [
  { role: 'assistant', content: "Hey! I'm ARIA. Activate your camera and start talking — I can see and hear you." }
];

const CAMERA_CONFIG = {
  video: true,
  audio: false,
  width: 640,
  height: 480,
  quality: 0.7
};

const SPEECH_SYNTHESIS_CONFIG = {
  rate: 1.05,
  pitch: 1.1,
  preferredVoiceNames: ['Google', 'Female', 'Samantha']
};
