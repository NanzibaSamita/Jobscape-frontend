"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Users, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InterviewReviewModal from "@/components/InterviewReviewModal";

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
  const [roomState, setRoomState] = useState<RoomState & { my_id: string } | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const lastActiveId = useRef<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  // Guard against React StrictMode double-mounting
  const isMounted = useRef(false);
  // FIX: Keep a ref to localStream so async callbacks always see the latest value
  const localStreamRef = useRef<MediaStream | null>(null);

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

  useEffect(() => {
    // Prevent StrictMode double-init
    if (isMounted.current) return;
    isMounted.current = true;

    initializeWebsocket();
    setupMedia();

    return () => {
      isMounted.current = false;
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      ws.current?.close();
      pc.current?.close();
    };
  }, []);

  async function setupMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setStatus("Connected (No Camera/Mic)");
      // Create a dummy stream so WebRTC can still initialize signaling
      const dummy = new MediaStream();
      localStreamRef.current = dummy;
      setLocalStream(dummy);
    }
  }

  // Derived state: am I the one currently in the call?
  const isCurrentlyAdmitted = roomState?.is_host || (roomState?.active_candidate_id === roomState?.my_id && roomState?.my_id !== undefined);

  // Initialize WebRTC and handle auto-offer when a candidate is admitted
  useEffect(() => {
    if (isCurrentlyAdmitted && localStream !== null) {
      // For host: If the active candidate changed, reset the connection
      if (roomState?.is_host && roomState.active_candidate_id !== lastActiveId.current) {
        if (pc.current) {
          pc.current.close();
          pc.current = null;
        }
        setRemoteStream(null);
        lastActiveId.current = roomState.active_candidate_id;
      }

      if (!pc.current) {
        const newPc = initializePeerConnection(localStream);
        
        // If we're the host and a candidate was just admitted, auto-send the offer
        if (roomState?.is_host && roomState.active_candidate_id) {
          setTimeout(async () => {
            if (newPc && newPc.signalingState === "stable") {
              try {
                const offer = await newPc.createOffer();
                await newPc.setLocalDescription(offer);
                sendWsMessage(newPc.localDescription);
              } catch (e) {
                console.error("Auto-offer failed:", e);
              }
            }
          }, 1000); // increased from 600ms
        }
      }
    }
    
    // Close PC if no longer active candidate (and not host)
    if (!isCurrentlyAdmitted && pc.current) {
        pc.current.close();
        pc.current = null;
        setRemoteStream(null);
        lastActiveId.current = null;
    }
  }, [isCurrentlyAdmitted, localStream, roomState?.active_candidate_id]);

  /** Send a message, ensuring WS is open first */
  const sendWsMessage = (data: unknown) => {
    const payload = JSON.stringify(data);
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(payload);
    } else {
      // Queue it to send once connected
      const checkAndSend = setInterval(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(payload);
          clearInterval(checkAndSend);
        }
      }, 200);
      setTimeout(() => clearInterval(checkAndSend), 5000);
    }
  };

  const initializeWebsocket = () => {
    // Don't create new socket if one is already open
    if (ws.current && ws.current.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(`${WS_URL}/video/ws/${interviewId}?token=${token}`);
    ws.current = socket;

    socket.onopen = () => {
      setStatus("Connected to server");
      console.log("WebSocket connected");
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "error") {
        // Server sent an auth error (e.g. expired token)
        setStatus(`⚠️ ${data.reason || "Server error"}`);
        // Stop reconnecting — the user needs to refresh
        isMounted.current = false;
        return;
      } else if (data.type === "room_state") {
        setRoomState(data);
      } else if (data.type === "offer") {
        // FIX: Use localStreamRef so we always have the latest stream value,
        // even if the state hasn't updated yet in this async closure.
        const stream = localStreamRef.current;

        // If stream isn't ready yet, wait for it (up to 5s)
        let resolvedStream = stream;
        if (!resolvedStream) {
          let waited = 0;
          while (!localStreamRef.current && waited < 5000) {
            await new Promise(r => setTimeout(r, 100));
            waited += 100;
          }
          resolvedStream = localStreamRef.current;
        }

        if (!pc.current && resolvedStream !== null) {
          initializePeerConnection(resolvedStream);
        }

        // Wait for pc to be initialized
        let retry = 0;
        while (!pc.current && retry < 10) {
            await new Promise(r => setTimeout(r, 100));
            retry++;
        }

        if (pc.current) {
            try {
              await pc.current.setRemoteDescription(new RTCSessionDescription(data));
              const answer = await pc.current.createAnswer();
              await pc.current.setLocalDescription(answer);
              sendWsMessage(pc.current.localDescription);
            } catch(e) {
              console.error("Error processing offer:", e);
            }
        }
      } else if (data.type === "candidate") {
        try { await pc.current?.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch(e) {}
      } else if (data.type === "interview_ended") {
        console.log("Interview ended by employer");
        setInterviewEnded(true);
        // Clean up connections
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
            setLocalStream(null);
        }
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setStatus("Connection error — retrying...");
    };

    socket.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      // Only reconnect on unexpected drops (not intentional close or after an error message)
      if (event.code !== 1000 && event.code !== 1001 && isMounted.current) {
        setStatus("Reconnecting...");
        setTimeout(() => {
          if (isMounted.current) initializeWebsocket();
        }, 2000);
      }
    };

  };

  const initializePeerConnection = (stream: MediaStream): RTCPeerConnection => {
    const config = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    };
    const newPc = new RTCPeerConnection(config);
    pc.current = newPc;

    let hasTracks = false;
    if (stream) {
      const tracks = stream.getTracks();
      if (tracks.length > 0) {
        hasTracks = true;
        tracks.forEach(track => newPc.addTrack(track, stream));
      }
    }

    // Force receiving video/audio even if we have no local tracks
    if (!hasTracks) {
      newPc.addTransceiver('video', { direction: 'recvonly' });
      newPc.addTransceiver('audio', { direction: 'recvonly' });
    }

    newPc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWsMessage({ type: "candidate", candidate: event.candidate });
      }
    };

    newPc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      setStatus("Connected");
    };

    newPc.onconnectionstatechange = () => {
      if (newPc.connectionState === "connected") setStatus("Connected");
      else if (newPc.connectionState === "failed") setStatus("Connection failed");
    };

    return newPc;
  };

  const admitCandidate = (candidateId: string) => {
    sendWsMessage({ type: "admit_candidate", candidate_id: candidateId });
    // The room_state update from the server will trigger the useEffect to send the offer
  };

  // Called after the InterviewReviewModal successfully submits
  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    // The /video/complete-interview call inside InterviewReviewModal already
    // handles auto-admitting the next candidate via the server.
    // If no more candidates remain, leave the room.
    onLeave();
  };


  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
    setIsVideoOff(!isVideoOff);
  };

  // Participant View: Waiting Room
  if (roomState && !roomState.is_host && !isCurrentlyAdmitted) {
      return (
        <div className="flex flex-col h-screen bg-zinc-950 text-white items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-6">
                <div className="h-24 w-24 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto border border-violet-500/30">
                    <Clock className="h-12 w-12 text-violet-500 animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Interview in Progress</h1>
                    <p className="text-zinc-400">The employer is currently interviewing another candidate or setting up. Please stay on this page; you will be joined automatically when they are ready.</p>
                </div>
                
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">Your Status</p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-4xl font-black text-violet-500">#{roomState.queue_position || "Queued"}</span>
                        <span className="text-zinc-300 font-semibold text-lg">in the queue</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <p className="text-xs text-zinc-500">WebSocket: <span className={ws.current?.readyState === WebSocket.OPEN ? "text-emerald-500" : "text-amber-500"}>{status}</span></p>
                    <Button variant="outline" onClick={onLeave} className="border-zinc-800 hover:bg-zinc-900 text-zinc-400">
                        Leave Waiting Room
                    </Button>
                </div>
            </div>
        </div>
      );
  }

  if (interviewEnded && !roomState?.is_host) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-6 z-50">
        <Card className="max-w-md w-full p-8 border-zinc-800 bg-zinc-900 shadow-2xl text-center flex flex-col items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
            <CheckCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Interview Completed</h2>
            <p className="text-zinc-400">
              Thank you for participating in the interview. Your session has ended, and the employer is now evaluating your performance.
            </p>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 w-full text-sm text-zinc-300">
             <Clock className="h-4 w-4 inline mr-2 text-violet-400" />
             Please wait for an update. You will be notified of the results via email and in-app notification.
          </div>
          <Button onClick={onLeave} variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            Return to Dashboard
          </Button>
        </Card>
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
          {roomState?.is_host && (
            <Button 
                variant="destructive" 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white font-bold h-9 px-4 rounded-full shadow-lg shadow-red-500/20"
                onClick={() => setShowReviewModal(true)}
            >
                End Interview Session
            </Button>
          )}
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
                <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-zinc-300">
                  {status.startsWith("Connected") ? (
                    <span className="text-2xl font-bold uppercase">
                      {roomState?.is_host 
                        ? (roomState.queue.find(c => c.user_id === roomState.active_candidate_id)?.name?.slice(0, 2) || "CA") 
                        : "EM"}
                    </span>
                  ) : (
                    <Users className="h-10 w-10" />
                  )}
                </div>
                <div className="text-center">
                  {status.startsWith("Connected") ? (
                    <>
                      <p className="font-bold text-zinc-300">
                        {roomState?.is_host ? (roomState.queue.find(c => c.user_id === roomState.active_candidate_id)?.name || "Candidate") : "Employer"}
                      </p>
                      <p className="text-xs text-zinc-600">Connected (No Video)</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-zinc-300">
                        {roomState?.is_host ? "Waiting for candidate..." : "Waiting for employer..."}
                      </p>
                      <p className="text-xs text-zinc-600">
                        {roomState?.is_host 
                          ? (roomState.active_candidate_id ? "Candidate is connecting..." : "They will appear here once you admit them.") 
                          : "Connecting to video call..."}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4">
               <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border-white/10 text-white font-bold">
                 {roomState?.is_host ? (roomState.queue.find(c => c.user_id === roomState.active_candidate_id)?.name || "Candidate") : "Employer"}
               </Badge>
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
            <div className="w-80 flex-shrink-0 bg-zinc-900 border-l border-zinc-800 flex flex-col">
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
        <Button
          variant="destructive"
          size="icon"
          onClick={onLeave}
          className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>

      {/* Interview Review Modal — shown when employer clicks "End Interview Session" */}
      {roomState?.is_host && roomState.active_candidate_id && (
        <InterviewReviewModal
          interviewId={interviewId}
          applicationId={roomState.active_candidate_id}
          candidateName={
            roomState.queue.find((c) => c.user_id === roomState.active_candidate_id)?.name ?? "Candidate"
          }
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}