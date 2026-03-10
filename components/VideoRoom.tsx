"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Settings, Users, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VideoRoomProps {
  interviewId: string;
  token: string;
  onLeave: () => void;
}

interface Participant {
  user_id: string;
  name: string;
}

interface RoomState {
  type: "room_state";
  is_host: boolean;
  active_candidate_id: string | null;
  participants_count: number;
  queue: Participant[];
  queue_position?: number;
}

export default function VideoRoom({ interviewId, token, onLeave }: VideoRoomProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status, setStatus] = useState("Connecting...");
  
  // Room State
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isAdmitted, setIsAdmitted] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

  useEffect(() => {
    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        
        initializeWebsocket(stream);
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setStatus("Failed to access camera/microphone");
      }
    }

    setupMedia();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
      ws.current?.close();
      pc.current?.close();
    };
  }, []);

  // Initialize WebRTC only when admitted or if host
  useEffect(() => {
    if ((roomState?.is_host || isAdmitted) && localStream && !pc.current) {
      initializePeerConnection(localStream);
    }
    
    // Close PC if no longer active candidate
    if (!roomState?.is_host && !isAdmitted && pc.current) {
        pc.current.close();
        pc.current = null;
        setRemoteStream(null);
    }
  }, [roomState?.is_host, isAdmitted, localStream]);

  const initializeWebsocket = (stream: MediaStream) => {
    ws.current = new WebSocket(`${WS_URL}/video/ws/${interviewId}?token=${token}`);

    ws.current.onopen = () => {
      setStatus("Connected to server");
    };

    ws.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "room_state") {
        setRoomState(data);
        const amIActive = data.active_candidate_id && !data.is_host; // Simple check for now
        // A better check: find my user_id if we had it. For now, we'll rely on the server's broadcast logic
        // But since we don't know our own user_id here easily, we'll check if we receive signaling
      } else if (data.type === "offer") {
        setIsAdmitted(true);
        await pc.current?.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await pc.current?.createAnswer();
        await pc.current?.setLocalDescription(answer);
        ws.current?.send(JSON.stringify(pc.current?.localDescription));
      } else if (data.type === "answer") {
        await pc.current?.setRemoteDescription(new RTCSessionDescription(data));
      } else if (data.type === "candidate") {
        await pc.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error:", err);
      setStatus("Connection error");
    };
  };

  const initializePeerConnection = (stream: MediaStream) => {
    const config = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    };
    pc.current = new RTCPeerConnection(config);

    stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        ws.current?.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
      }
    };

    pc.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      setStatus("Connected");
    };

    // If host, we wait for candidate to join and then we might need to re-offer
    // The employer admits and then we start signaling
  };

  const admitCandidate = (candidateId: string) => {
      ws.current?.send(JSON.stringify({
          type: "admit_candidate",
          candidate_id: candidateId
      }));
      setIsAdmitted(true);
      
      // Start signaling as host
      setTimeout(async () => {
        if (pc.current && pc.current.signalingState === "stable") {
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);
            ws.current?.send(JSON.stringify(pc.current.localDescription));
        }
      }, 500);
  };

  const toggleMic = () => {
    localStream?.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    localStream?.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
    setIsVideoOff(!isVideoOff);
  };

  // Participant View: Waiting Room
  if (roomState && !roomState.is_host && roomState.active_candidate_id !== null && !isAdmitted) {
      return (
        <div className="flex flex-col h-screen bg-zinc-950 text-white items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-6">
                <div className="h-24 w-24 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto border border-violet-500/30">
                    <Clock className="h-12 w-12 text-violet-500 animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Interview in Progress</h1>
                    <p className="text-zinc-400">The employer is currently interviewing another candidate. Please stay on this page; you will be joined automatically when they are ready.</p>
                </div>
                
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">Your Status</p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-4xl font-black text-violet-500">#{roomState.queue_position}</span>
                        <span className="text-zinc-300 font-semibold text-lg">in the queue</span>
                    </div>
                </div>

                <Button variant="outline" onClick={onLeave} className="border-zinc-800 hover:bg-zinc-900 text-zinc-400">
                    Leave Waiting Room
                </Button>
            </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
            Live Interview
          </Badge>
          <span className="text-zinc-400 text-sm">ID: {interviewId.slice(0, 8)}...</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="h-8 w-8 rounded-full border-2 border-zinc-950 bg-violet-600 flex items-center justify-center text-xs font-bold shadow-lg">ME</div>
            {remoteStream && (
                <div className="h-8 w-8 rounded-full border-2 border-zinc-950 bg-emerald-600 flex items-center justify-center text-xs font-bold shadow-lg">OP</div>
            )}
          </div>
          <span className="text-zinc-400 text-sm hidden sm:inline">{status}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 relative p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 bg-zinc-950">
          {/* Remote Video */}
          <Card className="relative overflow-hidden bg-zinc-900 border-zinc-800 flex items-center justify-center h-full shadow-2xl">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-zinc-500">
                <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                  <Users className="h-10 w-10" />
                </div>
                <div className="text-center">
                    <p className="font-bold text-zinc-300">Waiting for candidate...</p>
                    <p className="text-xs text-zinc-600">They will appear here once you admit them.</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4">
               <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border-white/10 text-white font-bold">Candidate</Badge>
            </div>
          </Card>

          {/* Local Video */}
          <Card className="relative overflow-hidden bg-zinc-900 border-zinc-800 flex items-center justify-center h-full shadow-2xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
            />
            {isVideoOff && (
              <div className="flex flex-col items-center gap-4 text-zinc-500">
                <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                  <CameraOff className="h-10 w-10" />
                </div>
                <p className="font-medium">Your camera is off</p>
              </div>
            )}
            <div className="absolute bottom-4 left-4">
               <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border-white/10 text-white font-bold">You</Badge>
            </div>
          </Card>
        </div>

        {/* Employer Waiting Room Sidebar */}
        {roomState?.is_host && (
            <div className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col hidden xl:flex">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                        <Users className="h-4 w-4 text-violet-500" />
                        Waiting Room
                    </h3>
                    <Badge className="bg-violet-600/20 text-violet-400 border-violet-500/20">
                        {roomState.queue.length}
                    </Badge>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {roomState.queue.length === 0 ? (
                        <div className="text-center py-10 text-zinc-600">
                            <p className="text-sm">No one is waiting yet.</p>
                        </div>
                    ) : (
                        roomState.queue.map((c, i) => (
                            <div key={c.user_id} className={`p-4 rounded-xl border transition-all ${roomState.active_candidate_id === c.user_id ? 'bg-violet-600/10 border-violet-500/50' : 'bg-zinc-800/50 border-zinc-700'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold uppercase">
                                        {c.name.slice(0, 2)}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-bold truncate text-sm">{c.name}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase font-black">Position: #{i + 1}</p>
                                    </div>
                                </div>
                                {roomState.active_candidate_id === c.user_id ? (
                                    <Badge className="w-full justify-center bg-emerald-500/20 text-emerald-400 border-emerald-500/20 py-1">
                                        Currently In Call
                                    </Badge>
                                ) : (
                                    <Button 
                                        size="sm" 
                                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-8 text-xs"
                                        onClick={() => admitCandidate(c.user_id)}
                                    >
                                        Admit to Interview
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 bg-zinc-900/50 text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-800">
                    <p>Admitting a new candidate will automatically disconnect the previous one from the video pool.</p>
                </div>
            </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 py-6 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800 flex items-center justify-center gap-4 sm:gap-6 shadow-2xl">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMic}
          className={`h-12 w-12 rounded-full border-zinc-700 transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600 border-red-400 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleVideo}
          className={`h-12 w-12 rounded-full border-zinc-700 transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600 border-red-400 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
        >
          {isVideoOff ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
        </Button>
        
        <div className="h-8 w-px bg-zinc-800 mx-2" />
        
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white hidden sm:flex"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white hidden sm:flex"
        >
          <Settings className="h-5 w-5" />
        </Button>

        <Button
          variant="destructive"
          onClick={onLeave}
          className="h-12 px-6 rounded-full font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
        >
          <PhoneOff className="h-5 w-5 mr-2" />
          Leave Meeting
        </Button>
      </div>
    </div>
  );
}
