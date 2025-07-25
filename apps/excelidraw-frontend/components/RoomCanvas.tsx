"use client";

import { useEffect, useRef, useState } from "react"
import { Canvas } from "./Canvas";
import { WS_URL } from "@/config";
import { useSearchParams } from "next/navigation";

export default function RoomCanvas({roomId}:{roomId:string}){
    const searchParams = useSearchParams();
    const isReadOnly = searchParams.get('readonly') === '1';
    const [socket,setSocket]=useState<WebSocket | null>(null);
    const [wsError, setWsError] = useState<string>("");
    const everConnected = useRef(false);
    const errorTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      let ws: WebSocket | null = null;
      let cancelled = false;
      function tryConnect() {
        if (cancelled) return;
        // No need to get token from localStorage; backend will use cookie
        let wsUrl = `${WS_URL}`;
        if (isReadOnly) {
          wsUrl += '?readonly=1';
        }
        setWsError("");
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          console.log("[RoomCanvas] WebSocket opened");
          setSocket(ws!);
          ws!.send(JSON.stringify({
            type: "join_room",
            roomId: Number(roomId)
          }));
        };
        ws.onmessage = (event) => {
          console.log("[RoomCanvas] WebSocket message:", event.data);
        };
        ws.onclose = (event) => {
          console.log("[RoomCanvas] WebSocket closed", event);
          // Only show error if never connected, and not a normal close (1001)
          if (!everConnected.current && event.code !== 1001) {
            if (errorTimeout.current) clearTimeout(errorTimeout.current);
            errorTimeout.current = setTimeout(() => {
              setWsError(`WebSocket connection was closed. Please ensure you are signed in and have access to this room. ${event.reason}`);
            }, 200); // debounce to avoid flicker
          }
        };
        ws.onerror = (err) => {
          console.log("[RoomCanvas] WebSocket error", err);
          // Only show error if never connected
          if (!everConnected.current) {
            if (errorTimeout.current) clearTimeout(errorTimeout.current);
            errorTimeout.current = setTimeout(() => {
              setWsError("WebSocket connection error. Please try again or sign in.");
            }, 200);
          }
        };
      }
      tryConnect();
      return () => {
        cancelled = true;
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        if (errorTimeout.current) clearTimeout(errorTimeout.current);
      };
    }, [roomId, isReadOnly]);

    if (wsError) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-red-600 font-semibold mb-4">{wsError}</div>
          <button onClick={() => window.location.href = '/signin'} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Sign In</button>
        </div>
      );
    }

    if(!socket){
        return (
            <div>connecting to server...</div>
        )
    }
    return(
        <div>
            <Canvas roomId={Number(roomId)} socket={socket} readOnly={isReadOnly}/>
        </div>
    )
}