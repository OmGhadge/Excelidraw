import { useEffect, useRef, useState } from "react";
import { Circle, Pencil, RectangleHorizontalIcon, Type, Share2, Minus, ArrowUpRight, Eraser, Trash2, LogOut } from "lucide-react";
import { Game } from "@/draw/Game";
import { HTTP_BACKEND } from "@/config";

const TOOL_LABELS: Record<string, string> = {
  pencil: "Pencil",
  rect: "Rectangle",
  circle: "Circle",
  line: "Line",
  arrow: "Arrow",
  text: "Text",
  eraser: "Eraser",
};

export function Canvas({roomId,socket,readOnly}:{roomId:number|string,socket:WebSocket,readOnly?:boolean}){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool,setSelectedTool]=useState<'rect' | 'circle' | 'pencil' | 'text' | 'line' | 'arrow' | 'eraser'>('circle');
    const [game,setGame]=useState<Game|undefined>();
    const [textInput, setTextInput] = useState("");
    // Update textInputPos to store both canvas and screen coordinates
    const [textInputPos, setTextInputPos] = useState<{canvas: {x: number, y: number}, screen: {x: number, y: number}} | null>(null);
    const [showTextInput, setShowTextInput] = useState(false);
    const [shareMsg, setShareMsg] = useState("");
    const [shapesVersion, setShapesVersion] = useState(0);
    const [user, setUser] = useState<{name: string, photo?: string} | null>(null);
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
    const [collaborators, setCollaborators] = useState<Array<{id: string, name?: string, photo?: string}>>([]);

    // Fetch user profile after login
    useEffect(() => {
      async function fetchUser() {
        const res = await fetch(`${HTTP_BACKEND}/api/auth/me`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      }
      fetchUser();
    }, []);

    useEffect(()=>{
        if (game && !readOnly) {
            game.setTool(selectedTool);
        }
    },[selectedTool,game,readOnly])

    useEffect(()=>{
    if(canvasRef.current){
       const g=new Game(canvasRef.current, Number(roomId), socket);
       g.onTextToolClick = (x: number, y: number) => {
           setTextInput("");
                // Convert canvas coordinates to screen coordinates
                const rect = canvasRef.current!.getBoundingClientRect();
                const screenX = x * (g.scale ?? 1) + (g.panX ?? 0) + rect.left;
                const screenY = y * (g.scale ?? 1) + (g.panY ?? 0) + rect.top;
                setTextInputPos({canvas: {x, y}, screen: {x: screenX, y: screenY}});
           setShowTextInput(true);
       };
            g.onShapesUpdated = () => setShapesVersion(v => v + 1);
       setGame(g);
            setTimeout(() => g.clearCanvas(), 0);
       return()=>{
        g.destroy();
       }
    }
    },[canvasRef, roomId, socket])
    
    useEffect(() => {
        if (game) {
            game.clearCanvas();
        }
    }, [shapesVersion, game]);

    useEffect(() => {
      if (!socket) return;
      function handlePresence(event: MessageEvent) {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'presence' && Array.isArray(msg.users)) {
            setCollaborators(msg.users);
          }
        } catch {}
      }
      socket.addEventListener('message', handlePresence);
      return () => socket.removeEventListener('message', handlePresence);
    }, [socket]);

    const handleClear = () => {
      if (window.confirm("Are you sure you want to clear the canvas? This cannot be undone.")) {
        if (game) {
          game.clearAllShapes?.();
        }
      }
    };

    // Pan handlers removed since 'hand' tool is not supported

    // Adjust text input position to follow transform (not needed, handled above)
    // let transformedTextInputPos = textInputPos;
    // if (textInputPos && game) {
    //     const scale = game.scale ?? 1;
    //     const panX = game.panX ?? 0;
    //     const panY = game.panY ?? 0;
    //     transformedTextInputPos = {
    //         x: textInputPos.x * scale + panX,
    //         y: textInputPos.y * scale + panY,
    //     };
    // }

    return (
      <div className="relative min-h-screen flex bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        {/* Collaborator avatars at top center */}
        {collaborators.length > 0 && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 flex gap-2 items-center bg-white/80 rounded-full px-4 py-2 shadow border border-gray-200">
            {collaborators.map(u => (
              <div key={u.id} className="w-9 h-9 rounded-full border-2 border-purple-400 bg-white flex items-center justify-center overflow-hidden">
                {u.photo ? (
                  <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-purple-600 font-bold text-lg">{u.name?.[0]?.toUpperCase() || '?'}</span>
                )}
              </div>
            ))}
            <span className="ml-2 text-xs text-gray-500 font-medium">{collaborators.length} editing</span>
          </div>
        )}
        {/* User avatar at top right */}
        {user && (
          <div className="fixed top-6 right-8 z-40">
            <button
              className="w-12 h-12 rounded-full border-2 border-purple-400 shadow-lg bg-white flex items-center justify-center overflow-hidden focus:outline-none"
              onClick={() => setAvatarMenuOpen(v => !v)}
              title={user.name}
            >
              {user.photo ? (
                <img src={user.photo} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-purple-600 bg-purple-100">
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
            </button>
            {avatarMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 text-gray-700 font-semibold border-b">{user.name}</div>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 font-medium"
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/signin";
                  }}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        )}
        {/* Vertical Toolbar */}
        <aside className="fixed top-1/2 left-8 -translate-y-1/2 z-30 flex flex-col items-center bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-4 gap-2 border border-gray-200">
          <div className="mb-2 text-xs font-semibold text-gray-500">{readOnly ? "Read-only" : "Tool"}</div>
          {!readOnly && (
            <div className="flex flex-col gap-2">
              {(["pencil","rect","circle","line","arrow","text","eraser"] as const).map(tool => (
                <button
                  key={tool}
                  className={`group w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-150 ${selectedTool===tool ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg" : "hover:bg-gray-100"}`}
                  onClick={() => setSelectedTool(tool)}
                  title={TOOL_LABELS[tool]}
                >
                  {tool==="pencil" && <Pencil className="w-6 h-6" />}
                  {tool==="rect" && <RectangleHorizontalIcon className="w-6 h-6" />}
                  {tool==="circle" && <Circle className="w-6 h-6" />}
                  {tool==="line" && <Minus className="w-6 h-6" />}
                  {tool==="arrow" && <ArrowUpRight className="w-6 h-6" />}
                  {tool==="text" && <Type className="w-6 h-6" />}
                  {tool==="eraser" && <Eraser className="w-6 h-6" />}
                  <span className="absolute left-14 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{TOOL_LABELS[tool]}</span>
                </button>
              ))}
            </div>
          )}
          <div className="my-2 border-t border-gray-200 w-8" />
          <button
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white shadow hover:from-red-600 hover:to-pink-600 transition-all duration-200"
            onClick={handleClear}
            title="Clear Canvas"
            disabled={readOnly}
          >
            <Trash2 className="w-6 h-6" />
          </button>
          {/* Remove the div that displays the current selected tool label in the toolbar */}
          <div className="mt-2 flex flex-col gap-2">
            <button
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              onClick={async () => {
                if (readOnly) return;
                try {
                  await navigator.clipboard.writeText(window.location.origin + `/canvas/${roomId}`);
                  setShareMsg("Editable link copied to clipboard!");
                  setTimeout(() => setShareMsg(""), 2000);
                } catch {
                  setShareMsg("Failed to copy link");
                  setTimeout(() => setShareMsg(""), 2000);
                }
              }}
              title="Share Edit Link"
              disabled={readOnly}
            >
              <Share2 className="w-6 h-6" />
            </button>
            <button
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 text-white shadow hover:from-gray-600 hover:to-gray-800 transition-all duration-200"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.origin + `/canvas/${roomId}?readonly=1`);
                  setShareMsg("Read-only link copied to clipboard!");
                  setTimeout(() => setShareMsg(""), 2000);
                } catch {
                  setShareMsg("Failed to copy link");
                  setTimeout(() => setShareMsg(""), 2000);
                }
              }}
              title="Share Read-only Link"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
          {shareMsg && (
            <div className="fixed left-32 top-10 bg-black text-white px-4 py-2 rounded shadow-lg z-50">{shareMsg}</div>
          )}
        </aside>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white/80" style={{width: 'calc(100vw - 160px)', height: '80vh', maxWidth: 1200, maxHeight: 800}}>
            {/* Canvas element */}
            <canvas
              ref={canvasRef}
              width={1200}
              height={800}
              style={{ position: 'relative', zIndex: 1, background: 'transparent', borderRadius: '1rem', boxShadow: 'none' }}
              onClick={event => {
                if (readOnly) return;
                if (selectedTool === "text" && game) {
                  const rect = canvasRef.current!.getBoundingClientRect();
                  const x = (event.clientX - rect.left - (game.panX ?? 0)) / (game.scale ?? 1);
                  const y = (event.clientY - rect.top - (game.panY ?? 0)) / (game.scale ?? 1);
                  game.onTextToolClick?.(x, y);
                }
              }}
              onWheel={e => {
        if (game) {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 1.1 : 0.9;
            const newScale = (game.scale ?? 1) * delta;
            const rect = canvasRef.current!.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const wx = (mouseX - (game.panX ?? 0)) / (game.scale ?? 1);
            const wy = (mouseY - (game.panY ?? 0)) / (game.scale ?? 1);
            game.setZoom(newScale);
            const newPanX = mouseX - wx * newScale;
            const newPanY = mouseY - wy * newScale;
            game.setPan(newPanX, newPanY);
        }
              }}
              style={{ cursor: readOnly ? 'grab' : 'crosshair' }}
              onMouseDown={readOnly ? (event => {
                if (game) {
                  game.startPan(event.clientX, event.clientY);
                }
              }) : undefined}
              onMouseMove={readOnly ? (event => {
                if (game && typeof (game as Game).isPanning === 'boolean' && (game as Game).isPanning) {
                  game.movePan(event.clientX, event.clientY);
                }
              }) : undefined}
              onMouseUp={readOnly ? (() => {
                if (game) {
            game.endPan();
                }
              }) : undefined}
        ></canvas>
            {/* Text input overlay */}
            {showTextInput && textInputPos && (
            <input
                autoFocus
                style={{
                    position: "fixed",
                  left: textInputPos.screen.x,
                  top: textInputPos.screen.y,
                    zIndex: 10,
                    fontSize: 20,
                    padding: 2,
                  color: '#000',
                    background: 'transparent',
                    outline: 'none',
                }}
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onBlur={() => {
                  if (game && textInputPos && textInput.trim() !== "") {
                    game.addTextShape(textInputPos.canvas.x, textInputPos.canvas.y, textInput.trim());
                  }
                  setShowTextInput(false);
                  setTextInput("");
                  setTextInputPos(null);
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (game && textInputPos && textInput.trim() !== "") {
                      game.addTextShape(textInputPos.canvas.x, textInputPos.canvas.y, textInput.trim());
                    }
                    setShowTextInput(false);
                    setTextInput("");
                    setTextInputPos(null);
                  }
                }}
            />
        )}
            {/* Read-only banner */}
            {readOnly && (
              <div className="absolute top-0 left-0 w-full bg-yellow-300/90 text-gray-900 text-center py-2 font-semibold z-20 rounded-t-2xl shadow">
                Read-only mode: You are viewing this canvas as a guest. Editing is disabled.
              </div>
            )}
    </div>
   </div>
    </div>
    );
}