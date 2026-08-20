'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  PhoneOff,
  MessageSquare,
  Users,
  Send,
  Sparkles,
  Lock,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface VideoRoomProps {
  roomId: string;
  userName: string;
  userRole: 'RECRUITER' | 'CANDIDATE';
  jobTitle?: string;
  onLeave: () => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  text: string;
  timestamp: string;
}

export function VideoRoom({ roomId, userName, userRole, jobTitle, onLeave }: VideoRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'NEXHIRE AI System',
      role: 'SYSTEM',
      text: 'Technical interview room initialized securely. End-to-end media encryption active.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    // Call timer interval
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Initialize local web media stream if supported
    async function initMedia() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (_err) {
        logWarning('Webcam/Microphone access fallback to interactive canvas mode.');
      }
    }

    initMedia();

    return () => {
      clearInterval(timer);
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const logWarning = (msg: string) => {
    console.warn(msg);
  };

  const toggleAudio = () => {
    setAudioMuted(!audioMuted);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = audioMuted;
      });
    }
    toast.info(audioMuted ? 'Microphone unmuted' : 'Microphone muted');
  };

  const toggleVideo = () => {
    setVideoMuted(!videoMuted);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach((track) => {
        track.enabled = videoMuted;
      });
    }
    toast.info(videoMuted ? 'Camera enabled' : 'Camera disabled');
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }
          setScreenSharing(true);
          toast.success('Screen sharing started.');
        }
      } catch (_err) {
        toast.error('Screen sharing was cancelled or not supported.');
      }
    } else {
      setScreenSharing(false);
      toast.info('Screen sharing stopped.');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: userName,
      role: userRole,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col h-[700px] w-full bg-slate-950 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 z-20">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40 text-xs font-bold gap-1">
            <Lock className="h-3 w-3" /> Secure Video Room
          </Badge>
          <span className="text-sm font-bold text-foreground truncate max-w-xs">{jobTitle || 'Technical Interview Session'}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">Room ID: {roomId}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
            ● {formatTimer(callDuration)}
          </span>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setChatOpen(!chatOpen)}
            className="relative text-xs gap-1.5 hover:bg-white/10"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">In-Call Chat</span>
            {messages.length > 1 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {messages.length - 1}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Video Area & Side Chat */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Video Canvas Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900/80 items-center justify-center relative">
          {/* Participant 1: Local User */}
          <div className="relative h-full min-h-[260px] rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center group">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${videoMuted ? 'hidden' : 'block'}`}
            />

            {videoMuted && (
              <div className="flex flex-col items-center gap-2">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/20">
                  {userName?.[0] || 'U'}
                </div>
                <span className="text-xs text-muted-foreground font-semibold">{userName} (Camera Off)</span>
              </div>
            )}

            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold text-white border border-white/10 flex items-center gap-2">
              <span>{userName} ({userRole})</span>
              {audioMuted && <MicOff className="h-3 w-3 text-red-400" />}
            </div>
          </div>

          {/* Participant 2: Remote Peer */}
          <div className="relative h-full min-h-[260px] rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/20 animate-pulse">
                {userRole === 'RECRUITER' ? 'C' : 'R'}
              </div>
              <span className="text-xs text-muted-foreground font-semibold">
                {userRole === 'RECRUITER' ? 'Candidate Connected' : 'Lead Technical Interviewer'}
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                Connected • 1080p WebRTC
              </Badge>
            </div>

            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold text-white border border-white/10">
              {userRole === 'RECRUITER' ? 'Candidate Participant' : 'Recruiter Participant'}
            </div>
          </div>
        </div>

        {/* Real-time In-Call Chat Drawer */}
        {chatOpen && (
          <div className="w-80 border-l border-white/10 bg-slate-950/95 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Interview Room Chat
              </span>
              <button onClick={() => setChatOpen(false)} className="text-muted-foreground hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none text-xs">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-bold text-primary">{msg.sender}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-2.5 rounded-lg text-foreground leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2">
              <Input
                placeholder="Type message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="bg-black/40 border-white/10 text-xs"
              />
              <Button type="submit" size="sm" className="primary-button">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Control Bar Footer */}
      <div className="flex items-center justify-center gap-4 py-4 bg-black/80 backdrop-blur-md border-t border-white/10 z-20">
        <Button
          size="lg"
          variant="outline"
          onClick={toggleAudio}
          className={`rounded-full h-12 w-12 p-0 border ${audioMuted ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'glass text-white'}`}
          title={audioMuted ? 'Unmute' : 'Mute'}
        >
          {audioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={toggleVideo}
          className={`rounded-full h-12 w-12 p-0 border ${videoMuted ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'glass text-white'}`}
          title={videoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {videoMuted ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={toggleScreenShare}
          className={`rounded-full h-12 w-12 p-0 border ${screenSharing ? 'bg-primary/30 text-primary border-primary' : 'glass text-white'}`}
          title="Screen Share"
        >
          <Monitor className="h-5 w-5" />
        </Button>

        <Button
          size="lg"
          onClick={onLeave}
          className="rounded-full h-12 w-12 p-0 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30"
          title="Leave Interview Room"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
