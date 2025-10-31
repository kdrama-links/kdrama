
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audio';
import { MicrophoneIcon, StopIcon } from './icons';

// Fix: The LiveSession type is not exported from the SDK. Defined it locally
// based on the methods used from the session object returned by ai.live.connect.
interface LiveSession {
  close(): void;
  sendRealtimeInput(input: { media: Blob }): void;
}

const SYSTEM_INSTRUCTION = `You are 'Kdrama Links Support', a cute funny, witty, and passionate AI expert on Korean dramas and movies.
Your creators are the 'Kdrama links team'. and you are one of the admin in kdrama links channel in telegram
and you ask name before beginning, and use their name to call them everytime to answer them and if anyone ask you to sing a song, you will sing song's for them 
Your goal is to chat with users about K-dramas, recommend shows, discuss actors, and and movie's worldwide share fun facts.
You must only talk about Korean dramas and movies and all movie's from worldwide. If the user asks about something else, politely and humorously steer the conversation back to K-dramas.
You MUST NEVER reveal that you are an AI model or mention Google.
Keep your responses engaging, conversational, and relatively brief to keep the chat flowing.`;

type SpeakerStatus = 'idle' | 'user' | 'ai';

const LiveConversation: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speakerStatus, setSpeakerStatus] = useState<SpeakerStatus>('idle');

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const nextAudioStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isAiSpeakingRef = useRef(false);
  const isStoppingRef = useRef(false);

  const stopConversation = useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    setIsListening(false);
    setIsConnecting(false);
    isAiSpeakingRef.current = false;
    setSpeakerStatus('idle');

    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch (e) {
        console.error("Error closing session:", e);
      }
      sessionPromiseRef.current = null;
    }

    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    
    mediaStreamSourceRef.current?.disconnect();
    mediaStreamSourceRef.current = null;
    
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      await inputAudioContextRef.current.close().catch(console.error);
    }
    inputAudioContextRef.current = null;
    
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      await outputAudioContextRef.current.close().catch(console.error);
    }
    outputAudioContextRef.current = null;

    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    nextAudioStartTimeRef.current = 0;

    isStoppingRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      stopConversation();
    };
  }, [stopConversation]);

  const startConversation = async () => {
    if (isListening || isConnecting || isStoppingRef.current) return;
    
    setIsConnecting(true);
    setError(null);

    try {
      if (!process.env.API_KEY) throw new Error("API_KEY environment variable is not set.");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onopen: () => {
            if (!inputAudioContextRef.current || inputAudioContextRef.current.state === 'closed' || !mediaStreamRef.current) return;
            setIsListening(true);
            setIsConnecting(false);

            const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            mediaStreamSourceRef.current = source;
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);

              let sum = 0.0;
              for (let i = 0; i < inputData.length; ++i) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              
              if (rms > 0.01 && !isAiSpeakingRef.current) {
                  setSpeakerStatus('user');
              } else if (!isAiSpeakingRef.current) {
                  setSpeakerStatus('idle');
              }

              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            // CRITICAL FIX: Connect the processor to the context destination to enable audio processing.
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
              isAiSpeakingRef.current = true;
              setSpeakerStatus('ai');
              const outputContext = outputAudioContextRef.current;
              nextAudioStartTimeRef.current = Math.max(nextAudioStartTimeRef.current, outputContext.currentTime);
              
              const audioBytes = decode(base64Audio);
              const audioBuffer = await decodeAudioData(audioBytes, outputContext, 24000, 1);
              const source = outputContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputContext.destination);

              source.onended = () => {
                audioSourcesRef.current.delete(source);
                if (audioSourcesRef.current.size === 0) {
                  isAiSpeakingRef.current = false;
                  setSpeakerStatus('idle');
                }
              };

              source.start(nextAudioStartTimeRef.current);
              nextAudioStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }
            
            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => s.stop());
              audioSourcesRef.current.clear();
              nextAudioStartTimeRef.current = 0;
              isAiSpeakingRef.current = false;
              setSpeakerStatus('idle');
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error("Session error:", e);
            setError(`An unexpected error occurred. Please try again.`);
            stopConversation();
          },
          onclose: () => {
            stopConversation();
          },
        },
      });
      await sessionPromiseRef.current;
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to start conversation.");
      stopConversation();
    }
  };

  const handleToggleConversation = () => {
    if (isListening) {
      stopConversation();
    } else {
      startConversation();
    }
  };
  
  const getStatusText = () => {
    if (isConnecting) return "Connecting...";
    if (isListening) {
      if (speakerStatus === 'user') return "You're speaking...";
      if (speakerStatus === 'ai') return "Kdrama Links Support is speaking...";
      return "Listening...";
    }
    return "Press the button to talk with AI";
  };

  const getIndicatorClasses = () => {
    const base = "relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 border-4 border-white shadow-lg";
    if (!isListening) return `${base} bg-[#F8BBD0] hover:bg-[#F48FB1]`;
    
    switch(speakerStatus) {
      case 'user': return `${base} bg-[#F06292] animate-pulse-outer`;
      case 'ai': return `${base} bg-[#EC407A] animate-pulse-outer`;
      default: return `${base} bg-[#F48FB1]`;
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl w-full h-full flex flex-col justify-center items-center">
      <div className="flex-grow flex flex-col items-center justify-center w-full">
        <button
          onClick={handleToggleConversation}
          disabled={isConnecting}
          className={getIndicatorClasses()}
          aria-label={isListening ? "Stop conversation" : "Start conversation"}
        >
          <div className="z-10 text-white">
            {isListening ? <StopIcon className="w-16 h-16" /> : <MicrophoneIcon className="w-16 h-16" />}
          </div>
        </button>
        <p className="text-gray-600 mt-8 h-6 font-medium">{getStatusText()}</p>
      </div>

      {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
    </div>
  );
};

export default LiveConversation;
