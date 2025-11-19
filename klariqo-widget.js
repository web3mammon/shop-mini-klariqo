/**
 * Klariqo Voice AI Widget
 * Embeddable voice chat widget for any website
 * Connects to Supabase Edge Function backend
 *
 * Usage: <script src="https://[YOUR-DOMAIN]/klariqo-widget.js?client_id=YOUR_CLIENT_ID"></script>
 */

(function() {
  'use strict';

  // Get client_id and theme from script tag URL parameters
  const currentScript = document.currentScript || document.querySelector('script[src*="klariqo-widget.js"]');
  const scriptSrc = currentScript ? currentScript.src : '';
  const urlParams = new URLSearchParams(scriptSrc.split('?')[1] || '');
  const CLIENT_ID = urlParams.get('client_id');
  const THEME_NAME = urlParams.get('theme') || 'gradient-purple'; // Get theme from URL or default to purple

  if (!CLIENT_ID) {
    console.error('[Klariqo Widget] Error: client_id parameter is required');
    return;
  }

  // Configuration
  const WEBSOCKET_URL = 'wss://btqccksigmohyjdxgrrj.supabase.co/functions/v1/chat-websocket';
  const SUPABASE_URL = 'https://btqccksigmohyjdxgrrj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0cWNja3NpZ21vaHlqZHhncnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgxMzM3NjYsImV4cCI6MjA0MzcwOTc2Nn0.a1qiSqSw3VuIaqRiP9bqX-0d8XlU1WA5nzz4c8_bkM8';

  console.log(`[Klariqo Widget] Initializing for client: ${CLIENT_ID}, theme: ${THEME_NAME}`);

  // Widget configuration - theme comes from URL, other settings can be fetched from DB
  let widgetConfig = {
    theme_name: THEME_NAME, // Use theme from URL parameter
    primary_color: '#ef4444',
    secondary_color: '#1a1a1a',
    text_color: '#ffffff',
    position: 'bottom-right',
    widget_size: 'medium',
    greeting_message: 'Hi! How can I help you today?'
  };

  async function fetchWidgetConfig() {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/widget_config?client_id=eq.${CLIENT_ID}&select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // Keep theme_name from URL, load other settings from database
          widgetConfig = {
            theme_name: THEME_NAME, // Always use theme from URL
            primary_color: data[0].primary_color || widgetConfig.primary_color,
            secondary_color: data[0].secondary_color || widgetConfig.secondary_color,
            text_color: data[0].text_color || widgetConfig.text_color,
            position: data[0].position || widgetConfig.position,
            widget_size: data[0].widget_size || widgetConfig.widget_size,
            greeting_message: data[0].greeting_message || widgetConfig.greeting_message
          };
          console.log('[Klariqo Widget] Configuration loaded:', widgetConfig);
        }
      }
    } catch (error) {
      console.warn('[Klariqo Widget] Could not load config, using defaults:', error);
    }
  }

  // ===========================================
  // STYLES (Generated dynamically from config)
  // ===========================================
  function generateStyles() {
    // Position mapping
    const positions = {
      'bottom-right': 'bottom: 24px; right: 24px;',
      'bottom-left': 'bottom: 24px; left: 24px;',
      'top-right': 'top: 24px; right: 24px;',
      'top-left': 'top: 24px; left: 24px;'
    };

    // Size mapping (button size)
    const sizes = {
      'small': '48px',
      'medium': '64px',
      'large': '80px'
    };

    const buttonSize = sizes[widgetConfig.widget_size] || '64px';
    const positionCSS = positions[widgetConfig.position] || positions['bottom-right'];

    return `
    .klariqo-widget-container {
      position: fixed;
      ${positionCSS}
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .klariqo-tooltip {
      position: absolute;
      bottom: 50%;
      right: calc(100% + 16px);
      transform: translateY(50%);
      background: #1f2937;
      color: white;
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .klariqo-tooltip::after {
      content: '';
      position: absolute;
      top: 50%;
      right: -8px;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-left: 8px solid #1f2937;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
    }

    .klariqo-fab:hover .klariqo-tooltip {
      opacity: 1;
      right: calc(100% + 12px);
    }

    .klariqo-widget-panel.klariqo-open ~ .klariqo-fab .klariqo-tooltip {
      opacity: 0 !important;
    }

    .klariqo-fab {
      width: ${buttonSize};
      height: ${buttonSize};
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: visible;
    }

    .klariqo-fab:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
    }

    .klariqo-fab:active {
      transform: scale(0.95);
    }

    .klariqo-fab-icon {
      width: 28px;
      height: 28px;
      fill: white;
      transition: all 0.3s ease;
    }

    .klariqo-fab.klariqo-open .klariqo-fab-icon {
      transform: rotate(180deg);
    }

    .klariqo-widget-panel {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      max-width: calc(100vw - 48px);
      height: 600px;
      max-height: calc(100vh - 150px);
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transform: translateY(20px);
      pointer-events: none;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .klariqo-widget-panel.klariqo-open {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }

    .klariqo-widget-header {
      background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%);
      color: white;
      padding: 20px;
      text-align: center;
    }

    .klariqo-widget-header h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .klariqo-widget-header p {
      font-size: 13px;
      margin: 0;
      opacity: 0.9;
    }

    .klariqo-chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      padding: 16px;
      gap: 12px;
    }

    .klariqo-message {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .klariqo-message.user {
      flex-direction: row-reverse;
    }

    .klariqo-message-bubble {
      max-width: 70%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .klariqo-message.user .klariqo-message-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .klariqo-message.ai .klariqo-message-bubble {
      background: #f3f4f6;
      color: #1f2937;
      border-bottom-left-radius: 4px;
    }

    .klariqo-widget-content {
      display: flex;
      flex-direction: column;
      background: #f9fafb;
      padding: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .klariqo-voice-button {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%);
      border: none;
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: auto;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .klariqo-voice-button:hover {
      transform: scale(1.05);
    }

    .klariqo-voice-button.klariqo-listening {
      animation: klariqo-pulse 1.5s infinite;
    }

    @keyframes klariqo-pulse {
      0%, 100% { box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3); }
      50% { box-shadow: 0 8px 40px rgba(239, 68, 68, 0.6); }
    }

    .klariqo-ripple {
      position: absolute;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 2px solid #667eea;
      opacity: 0;
    }

    .klariqo-voice-button.klariqo-listening .klariqo-ripple {
      animation: klariqo-ripple-animation 1.5s infinite;
    }

    .klariqo-voice-button.klariqo-listening .klariqo-ripple:nth-child(2) {
      animation-delay: 0.5s;
    }

    .klariqo-voice-button.klariqo-listening .klariqo-ripple:nth-child(3) {
      animation-delay: 1s;
    }

    @keyframes klariqo-ripple-animation {
      0% {
        transform: scale(1);
        opacity: 0.6;
      }
      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }

    .klariqo-status-text {
      text-align: center;
      margin-top: 16px;
      font-size: 14px;
      color: #6b7280;
    }

    .klariqo-status-text.klariqo-listening-text {
      color: #667eea;
      font-weight: 600;
    }
  `;
  }

  // Gradient theme CSS classes
  function getThemeStyles() {
    return `
    /* Purple Gradient */
    .klariqo-widget-container.gradient-purple .klariqo-fab,
    .klariqo-widget-container.gradient-purple .klariqo-widget-header,
    .klariqo-widget-container.gradient-purple .klariqo-voice-button,
    .klariqo-widget-container.gradient-purple .klariqo-message.user .klariqo-message-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    }

    .klariqo-widget-container.gradient-purple .klariqo-ripple {
      border-color: #667eea !important;
    }

    .klariqo-widget-container.gradient-purple .klariqo-status-text.klariqo-listening-text {
      color: #667eea !important;
    }

    /* Ocean Gradient */
    .klariqo-widget-container.gradient-ocean .klariqo-fab,
    .klariqo-widget-container.gradient-ocean .klariqo-widget-header,
    .klariqo-widget-container.gradient-ocean .klariqo-voice-button,
    .klariqo-widget-container.gradient-ocean .klariqo-message.user .klariqo-message-bubble {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
    }

    .klariqo-widget-container.gradient-ocean .klariqo-ripple {
      border-color: #11998e !important;
    }

    .klariqo-widget-container.gradient-ocean .klariqo-status-text.klariqo-listening-text {
      color: #11998e !important;
    }

    /* Sunset Gradient */
    .klariqo-widget-container.gradient-sunset .klariqo-fab,
    .klariqo-widget-container.gradient-sunset .klariqo-widget-header,
    .klariqo-widget-container.gradient-sunset .klariqo-voice-button,
    .klariqo-widget-container.gradient-sunset .klariqo-message.user .klariqo-message-bubble {
      background: linear-gradient(135deg, #f12711 0%, #f5af19 100%) !important;
    }

    .klariqo-widget-container.gradient-sunset .klariqo-ripple {
      border-color: #f12711 !important;
    }

    .klariqo-widget-container.gradient-sunset .klariqo-status-text.klariqo-listening-text {
      color: #f12711 !important;
    }

    /* Forest Gradient */
    .klariqo-widget-container.gradient-forest .klariqo-fab,
    .klariqo-widget-container.gradient-forest .klariqo-widget-header,
    .klariqo-widget-container.gradient-forest .klariqo-voice-button,
    .klariqo-widget-container.gradient-forest .klariqo-message.user .klariqo-message-bubble {
      background: linear-gradient(135deg, #134e5e 0%, #71b280 100%) !important;
    }

    .klariqo-widget-container.gradient-forest .klariqo-ripple {
      border-color: #134e5e !important;
    }

    .klariqo-widget-container.gradient-forest .klariqo-status-text.klariqo-listening-text {
      color: #134e5e !important;
    }

    /* Midnight Gradient */
    .klariqo-widget-container.gradient-midnight .klariqo-fab,
    .klariqo-widget-container.gradient-midnight .klariqo-widget-header,
    .klariqo-widget-container.gradient-midnight .klariqo-voice-button,
    .klariqo-widget-container.gradient-midnight .klariqo-message.user .klariqo-message-bubble {
      background: linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%) !important;
    }

    .klariqo-widget-container.gradient-midnight .klariqo-ripple {
      border-color: #2c3e50 !important;
    }

    .klariqo-widget-container.gradient-midnight .klariqo-status-text.klariqo-listening-text {
      color: #2c3e50 !important;
    }

    /* Rose Gradient */
    .klariqo-widget-container.gradient-rose .klariqo-fab,
    .klariqo-widget-container.gradient-rose .klariqo-widget-header,
    .klariqo-widget-container.gradient-rose .klariqo-voice-button,
    .klariqo-widget-container.gradient-rose .klariqo-message.user .klariqo-message-bubble {
      background: linear-gradient(135deg, #f857a6 0%, #ff5858 100%) !important;
    }

    .klariqo-widget-container.gradient-rose .klariqo-ripple {
      border-color: #f857a6 !important;
    }

    .klariqo-widget-container.gradient-rose .klariqo-status-text.klariqo-listening-text {
      color: #f857a6 !important;
    }

    /* Sky Gradient */
    .klariqo-widget-container.gradient-sky .klariqo-fab,
    .klariqo-widget-container.gradient-sky .klariqo-widget-header,
    .klariqo-widget-container.gradient-sky .klariqo-voice-button,
    .klariqo-widget-container.gradient-sky .klariqo-message.user .klariqo-message-bubble {
      background: linear-gradient(135deg, #2980b9 0%, #6dd5fa 100%) !important;
    }

    .klariqo-widget-container.gradient-sky .klariqo-ripple {
      border-color: #2980b9 !important;
    }

    .klariqo-widget-container.gradient-sky .klariqo-status-text.klariqo-listening-text {
      color: #2980b9 !important;
    }

    /* Emerald Gradient */
    .klariqo-widget-container.gradient-emerald .klariqo-fab,
    .klariqo-widget-container.gradient-emerald .klariqo-widget-header,
    .klariqo-widget-container.gradient-emerald .klariqo-voice-button,
    .klariqo-widget-container.gradient-emerald .klariqo-message.user .klariqo-message-bubble {
      background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%) !important;
    }

    .klariqo-widget-container.gradient-emerald .klariqo-ripple {
      border-color: #56ab2f !important;
    }

    .klariqo-widget-container.gradient-emerald .klariqo-status-text.klariqo-listening-text {
      color: #56ab2f !important;
    }

    /* Crimson Gradient */
    .klariqo-widget-container.gradient-crimson .klariqo-fab,
    .klariqo-widget-container.gradient-crimson .klariqo-widget-header,
    .klariqo-widget-container.gradient-crimson .klariqo-voice-button,
    .klariqo-widget-container.gradient-crimson .klariqo-message.user .klariqo-message-bubble {
      background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%) !important;
    }

    .klariqo-widget-container.gradient-crimson .klariqo-ripple {
      border-color: #eb3349 !important;
    }

    .klariqo-widget-container.gradient-crimson .klariqo-status-text.klariqo-listening-text {
      color: #eb3349 !important;
    }

    /* Gold Gradient */
    .klariqo-widget-container.gradient-gold .klariqo-fab,
    .klariqo-widget-container.gradient-gold .klariqo-widget-header,
    .klariqo-widget-container.gradient-gold .klariqo-voice-button,
    .klariqo-widget-container.gradient-gold .klariqo-message.user .klariqo-message-bubble {
      background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%) !important;
    }

    .klariqo-widget-container.gradient-gold .klariqo-ripple {
      border-color: #f7971e !important;
    }

    .klariqo-widget-container.gradient-gold .klariqo-status-text.klariqo-listening-text {
      color: #f7971e !important;
    }
    `;
  }

  // Inject styles (will be called after config is loaded)
  function injectStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = generateStyles() + getThemeStyles();
    document.head.appendChild(styleSheet);
  }

  // ===========================================
  // AUDIO RECORDER CLASS
  // ===========================================
  class AudioRecorder {
    constructor(onAudioData) {
      this.stream = null;
      this.audioContext = null;
      this.processor = null;
      this.source = null;
      this.onAudioData = onAudioData;
    }

    async start() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 24000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 24000,
        });

        // Resume AudioContext for iOS
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }

        this.source = this.audioContext.createMediaStreamSource(this.stream);
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

        this.processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = this.floatTo16BitPCM(inputData);
          const base64Audio = this.arrayBufferToBase64(pcm16.buffer);
          this.onAudioData(base64Audio);
        };

        this.source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);

        console.log('[Klariqo] Recording started');
      } catch (error) {
        console.error('[Klariqo] Microphone error:', error);
        throw error;
      }
    }

    floatTo16BitPCM(float32Array) {
      const int16Array = new Int16Array(float32Array.length);
      for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      return int16Array;
    }

    arrayBufferToBase64(buffer) {
      const uint8Array = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 0x8000;

      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }

      return btoa(binary);
    }

    stop() {
      if (this.source) {
        this.source.disconnect();
        this.source = null;
      }
      if (this.processor) {
        this.processor.disconnect();
        this.processor = null;
      }
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
      console.log('[Klariqo] Recording stopped');
    }
  }

  // ===========================================
  // AUDIO PLAYER CLASS (Web Audio API for iOS compatibility)
  // ===========================================
  class AudioPlayer {
    constructor() {
      this.audioContext = null;
      this.gainNode = null;
      this.chunkBuffer = {}; // Stores AudioBuffers
      this.nextChunkToPlay = 0;
      this.isPlaying = false;
      this.scheduledSources = []; // Track AudioBufferSourceNodes
      this.nextStartTime = 0;
    }

    async addChunk(audioBase64, chunkIndex) {
      try {
        // Initialize AudioContext on first chunk
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          this.gainNode = this.audioContext.createGain();
          this.gainNode.connect(this.audioContext.destination);
          this.nextStartTime = this.audioContext.currentTime;
          console.log('[Klariqo] AudioContext initialized');
        }

        // Resume if suspended (iOS autoplay policy)
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
          console.log('[Klariqo] AudioContext resumed');
        }

        // Reset on new response (chunk 0)
        if (chunkIndex === 0 && this.nextChunkToPlay > 0) {
          this.chunkBuffer = {};
          this.nextChunkToPlay = 0;
          this.nextStartTime = this.audioContext.currentTime;
          console.log('[Klariqo] New response - reset state');
        }

        // Decode WAV audio (base64 → ArrayBuffer → AudioBuffer)
        const binaryString = atob(audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer.slice(0));
        console.log(`[Klariqo] Chunk #${chunkIndex} decoded - Duration: ${audioBuffer.duration.toFixed(2)}s`);

        // Store AudioBuffer
        this.chunkBuffer[chunkIndex] = audioBuffer;

        // Play buffered chunks
        this.playBufferedChunks();

      } catch (error) {
        console.error('[Klariqo] Audio chunk error:', error);
      }
    }

    playBufferedChunks() {
      // Play all sequential chunks that are buffered
      while (this.chunkBuffer[this.nextChunkToPlay] !== undefined) {
        const audioBuffer = this.chunkBuffer[this.nextChunkToPlay];
        delete this.chunkBuffer[this.nextChunkToPlay];

        console.log(`[Klariqo] Playing chunk #${this.nextChunkToPlay}`);
        this.schedulePlayback(audioBuffer);

        this.nextChunkToPlay++;
      }
    }

    schedulePlayback(audioBuffer) {
      if (!this.audioContext || !this.gainNode) return;

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);

      const currentTime = this.audioContext.currentTime;

      // Schedule playback
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }

      source.start(this.nextStartTime);
      this.isPlaying = true;

      // Update next start time
      this.nextStartTime += audioBuffer.duration;

      // Track source
      this.scheduledSources.push(source);

      // Cleanup when done
      source.onended = () => {
        const index = this.scheduledSources.indexOf(source);
        if (index > -1) {
          this.scheduledSources.splice(index, 1);
        }

        if (this.scheduledSources.length === 0) {
          this.isPlaying = false;
        }
      };
    }

    stop() {
      // Stop all scheduled sources
      this.scheduledSources.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Already stopped
        }
      });
      this.scheduledSources = [];

      this.isPlaying = false;
      this.chunkBuffer = {};
      if (this.audioContext) {
        this.nextStartTime = this.audioContext.currentTime;
      }
      console.log('[Klariqo] Audio stopped');
    }

    getIsPlaying() {
      return this.isPlaying;
    }

    reset() {
      this.chunkBuffer = {};
      this.nextChunkToPlay = 0;
      this.isPlaying = false;
      if (this.audioContext) {
        this.nextStartTime = this.audioContext.currentTime;
      }
    }
  }

  // ===========================================
  // WIDGET CLASS
  // ===========================================
  class KlariqoWidget {
    constructor() {
      this.isOpen = false;
      this.isListening = false;
      this.ws = null;
      this.audioRecorder = null;
      this.audioPlayer = new AudioPlayer();
      this.hasInterrupted = false; // Track if we've interrupted for current turn
      this.ambientAudio = null; // Ambient background audio

      this.initWidget();
    }

    initWidget() {
      // Create widget HTML
      const widgetHTML = `
        <div class="klariqo-widget-container ${widgetConfig.theme_name}">
          <div class="klariqo-widget-panel" id="klariqoPanel">
            <div class="klariqo-widget-header">
              <h2>AI Voice Assistant</h2>
              <p>Click the microphone to start talking</p>
            </div>

            <div class="klariqo-chat-container" id="klariqoChatContainer">
              <!-- Messages will appear here -->
            </div>

            <div class="klariqo-widget-content">
              <button class="klariqo-voice-button" id="klariqoVoiceBtn">
                <div class="klariqo-ripple"></div>
                <div class="klariqo-ripple"></div>
                <div class="klariqo-ripple"></div>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
              <div class="klariqo-status-text" id="klariqoStatus">Tap to speak</div>
            </div>
          </div>

          <button class="klariqo-fab" id="klariqoFab">
            <div class="klariqo-tooltip">Need help? Talk to us!</div>
            <svg class="klariqo-fab-icon" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', widgetHTML);

      // Bind events
      document.getElementById('klariqoFab').addEventListener('click', () => this.toggleWidget());
      document.getElementById('klariqoVoiceBtn').addEventListener('click', () => this.toggleListening());
    }

    toggleWidget() {
      this.isOpen = !this.isOpen;
      const fab = document.getElementById('klariqoFab');
      const panel = document.getElementById('klariqoPanel');

      if (this.isOpen) {
        fab.classList.add('klariqo-open');
        panel.classList.add('klariqo-open');
        this.connectWebSocket();
      } else {
        fab.classList.remove('klariqo-open');
        panel.classList.remove('klariqo-open');
        if (this.isListening) {
          this.toggleListening();
        }
        this.disconnectWebSocket();
      }
    }

    async toggleListening() {
      this.isListening = !this.isListening;
      const btn = document.getElementById('klariqoVoiceBtn');
      const status = document.getElementById('klariqoStatus');

      if (this.isListening) {
        btn.classList.add('klariqo-listening');
        status.textContent = 'Listening... speak now';
        status.classList.add('klariqo-listening-text');

        // Start recording
        this.audioRecorder = new AudioRecorder((audioData) => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
              type: 'audio.chunk',
              audio: audioData
            }));
          }
        });

        try {
          await this.audioRecorder.start();
        } catch (error) {
          alert('Microphone access denied. Please allow microphone access to use voice chat.');
          this.isListening = false;
          btn.classList.remove('klariqo-listening');
          status.textContent = 'Tap to speak';
          status.classList.remove('klariqo-listening-text');
        }
      } else {
        btn.classList.remove('klariqo-listening');
        status.textContent = 'Processing...';
        status.classList.remove('klariqo-listening-text');

        // Stop recording
        if (this.audioRecorder) {
          this.audioRecorder.stop();
          this.audioRecorder = null;
        }

        setTimeout(() => {
          status.textContent = 'Tap to speak';
        }, 1000);
      }
    }

    connectWebSocket() {
      const wsUrl = `${WEBSOCKET_URL}?client_id=${CLIENT_ID}`;
      console.log('[Klariqo] Connecting to:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Klariqo] WebSocket connected');

        // TEMPORARY: Ambient audio disabled for testing WebSocket stability
        // Start ambient background audio
        // if (!this.ambientAudio) {
        //   console.log('[Klariqo] Starting ambient background audio...');
        //   const supabaseStorageUrl = 'https://btqccksigmohyjdxgrrj.supabase.co/storage/v1/object/public/ambient-audio/office-ambience.mp3';
        //   this.ambientAudio = new Audio(supabaseStorageUrl);
        //   this.ambientAudio.loop = true;
        //   this.ambientAudio.volume = 0.10; // 10% volume - subtle background
        //   this.ambientAudio.play().catch(err => {
        //     console.log('[Klariqo] Ambient audio autoplay blocked:', err);
        //   });
        // }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('[Klariqo] Message parse error:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[Klariqo] WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('[Klariqo] WebSocket disconnected');

        // Stop ambient audio when WebSocket closes
        if (this.ambientAudio) {
          this.ambientAudio.pause();
          this.ambientAudio.currentTime = 0;
          this.ambientAudio = null;
          console.log('[Klariqo] Ambient audio stopped');
        }
      };
    }

    disconnectWebSocket() {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }

      // Stop ambient audio
      if (this.ambientAudio) {
        this.ambientAudio.pause();
        this.ambientAudio.currentTime = 0;
        this.ambientAudio = null;
        console.log('[Klariqo] Ambient audio stopped (disconnect)');
      }

      this.audioPlayer.reset();
    }

    interrupt() {
      // Stop audio playback immediately
      this.audioPlayer.stop();

      // Send interrupt signal to backend
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log('[Klariqo] Sending interrupt signal');
        this.ws.send(JSON.stringify({ type: 'interrupt' }));
      }
    }

    addMessage(text, isUser) {
      const chatContainer = document.getElementById('klariqoChatContainer');
      const messageHTML = `
        <div class="klariqo-message ${isUser ? 'user' : 'ai'}">
          <div class="klariqo-message-bubble">${text}</div>
        </div>
      `;
      chatContainer.insertAdjacentHTML('beforeend', messageHTML);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    handleWebSocketMessage(data) {
      switch (data.type) {
        case 'connection.established':
          console.log('[Klariqo] Connection established');
          break;

        case 'transcript.user':
          // Interrupt on FIRST partial transcript (as soon as user starts speaking)
          if (!data.isFinal && !this.hasInterrupted) {
            // Check if audio is actually playing before interrupting
            if (this.audioPlayer.getIsPlaying()) {
              console.log('[Klariqo] User started speaking - interrupting AI');
              this.interrupt();
              this.hasInterrupted = true; // Mark that we've interrupted for this turn
            }
          }

          // Only show final transcripts in UI
          if (data.isFinal) {
            console.log('[Klariqo] User:', data.text);
            this.addMessage(data.text, true);
          }
          break;

        case 'text.chunk':
          console.log('[Klariqo] AI:', data.text);
          this.addMessage(data.text, false);
          // Reset interrupt flag when AI starts speaking (ready for next interrupt)
          this.hasInterrupted = false;
          break;

        case 'audio.chunk':
          this.audioPlayer.addChunk(data.audio, data.chunk_index);
          break;

        case 'audio.complete':
          console.log('[Klariqo] Audio complete');
          break;

        case 'interrupt.acknowledged':
          console.log('[Klariqo] Interrupt acknowledged by backend');
          break;

        case 'error':
          console.error('[Klariqo] Server error:', data.message);
          break;

        case 'ping':
          // Keepalive ping from server - respond with pong to keep connection alive
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'pong' }));
          }
          break;

        default:
          console.log('[Klariqo] Unknown message:', data.type);
      }
    }
  }

  // ===========================================
  // INITIALIZE WIDGET
  // ===========================================
  async function initializeWidget() {
    // Fetch config from database first
    await fetchWidgetConfig();

    // Inject styles with loaded config
    injectStyles();

    // Create widget
    new KlariqoWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    initializeWidget();
  }

})();
