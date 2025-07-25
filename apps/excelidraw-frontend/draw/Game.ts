
import { getExistingShapes } from "./http";

type Shape={
    id: string,
    type:"rect",
    x:number,
    y:number,
    width:number,
    height:number
} |
{
    id: string,
   type:"circle",
   centerX:number,
   centerY:number,
   radius:number 
} |
{
    id: string,
    type:"pencil",
    points: { x: number, y: number }[]
} |
{
    id: string,
    type: "text",
    x: number,
    y: number,
    value: string
} |
{
    id: string,
    type: "line",
    x1: number,
    y1: number,
    x2: number,
    y2: number
} |
{
    id: string,
    type: "arrow",
    x1: number,
    y1: number,
    x2: number,
    y2: number
};


export type ToolType = 'rect' | 'circle' | 'pencil' | 'text' | 'line' | 'arrow' | 'eraser';

export class Game{
    private canvas:HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private existingShapes:Shape[]
   private roomId:number;
   private socket:WebSocket;
   private clicked:boolean;
   private startX=0;
   private startY=0;
    private selectedTool: ToolType = "circle";
    private pencilPoints: { x: number, y: number }[] = [];
    public onTextToolClick?: (x: number, y: number) => void;
    public scale: number = 1;
    public panX: number = 0;
    public panY: number = 0;
    public isPanning: boolean = false;
    private lastPanX: number = 0;
    private lastPanY: number = 0;
    public onShapesUpdated?: () => void;
    private loading: boolean = true;
   
    constructor(canvas:HTMLCanvasElement,roomId:number|string,socket:WebSocket){
     this.canvas=canvas;
    this.context=canvas.getContext("2d")!;
    this.existingShapes=[];
    this.roomId=Number(roomId);
    this.socket=socket;
    this.clicked=false;
    console.log('[Game] Constructed with roomId:', this.roomId, 'socket:', this.socket);
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
    }

    setTool(tool: ToolType){
     this.selectedTool=tool;
    }

   async init(){
        this.loading = true;
        this.existingShapes = [];
        if (this.onShapesUpdated) this.onShapesUpdated();
        this.existingShapes = await getExistingShapes(String(this.roomId));
        this.loading = false;
        this.clearCanvas();
        if (this.onShapesUpdated) this.onShapesUpdated();
    }
    


    initHandlers(){
    this.socket.onmessage=(event)=>{
        console.log('[Game] Received WebSocket message:', event.data);
        const message=JSON.parse(event.data);
        if(message.type=="chat"){
            if (message.message) {
                const parsed = JSON.parse(message.message);
                if (parsed.shape) {
                    if (parsed.shape.id && typeof parsed.shape.id === 'string') {
                        this.existingShapes.push(parsed.shape);
                    } else {
                        console.warn('Received shape without valid id:', parsed.shape);
                    }
                } else if (parsed.erase) {
                    this.existingShapes = this.existingShapes.filter(s => s.id !== parsed.erase);
                } else if (parsed.clear) {
                    this.existingShapes = [];
                    this.clearCanvas();
                    if (this.onShapesUpdated) this.onShapesUpdated();
                }
                this.clearCanvas();
                if (this.onShapesUpdated) this.onShapesUpdated();
            }
        }

        if(message.type==="history" && Array.isArray(message.shapes)){
            this.existingShapes = message.shapes.filter((s: any) => s && s.id && typeof s.id === 'string');
            this.clearCanvas();
            if (this.onShapesUpdated) this.onShapesUpdated();
        }
      }
    }

    clearCanvas() {
        if (this.loading) return;
        this.context.setTransform(1, 0, 0, 1, 0, 0); 
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "#fff";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.setTransform(this.scale, 0, 0, this.scale, this.panX, this.panY);
        this.existingShapes.filter(Boolean).map((shape) => {
            if (shape.type === "rect") {
                this.context.strokeStyle = "#000";
                this.context.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type == "circle") {
                const centerX = shape.centerX;
                const centerY = shape.centerY;
                const radius = Math.abs(shape.radius);
                this.context.beginPath();
                this.context.strokeStyle = "#000";
                this.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.context.stroke();
                this.context.closePath();
            } else if (shape.type == "pencil") {
                this.context.beginPath();
                this.context.strokeStyle = "#000";
                for (let i = 0; i < shape.points.length - 1; i++) {
                    const p1 = shape.points[i];
                    const p2 = shape.points[i + 1];
                    this.context.moveTo(p1.x, p1.y);
                    this.context.lineTo(p2.x, p2.y);
                }
                this.context.stroke();
                this.context.closePath();
            } else if (shape.type == "text") {
                this.context.fillStyle = "#000";
                this.context.font = "20px Arial";
                
                this.context.fillText(shape.value, shape.x, shape.y + 16);
            } else if (shape.type == "line") {
                this.context.strokeStyle = "#000";
                this.context.beginPath();
                this.context.moveTo(shape.x1, shape.y1);
                this.context.lineTo(shape.x2, shape.y2);
                this.context.stroke();
                this.context.closePath();
            } else if (shape.type == "arrow") {
                this.context.strokeStyle = "#000";
                this.context.beginPath();
                this.context.moveTo(shape.x1, shape.y1);
                this.context.lineTo(shape.x2, shape.y2);
                this.context.stroke();
                
                const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
                const headlen = 16;
                this.context.beginPath();
                this.context.moveTo(shape.x2, shape.y2);
                this.context.lineTo(shape.x2 - headlen * Math.cos(angle - Math.PI / 6), shape.y2 - headlen * Math.sin(angle - Math.PI / 6));
                this.context.moveTo(shape.x2, shape.y2);
                this.context.lineTo(shape.x2 - headlen * Math.cos(angle + Math.PI / 6), shape.y2 - headlen * Math.sin(angle + Math.PI / 6));
                this.context.stroke();
                this.context.closePath();
            }
        })
        this.context.setTransform(1, 0, 0, 1, 0, 0); 
    }
    destroy(){
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }
    addTextShape(x: number, y: number, value: string) {
        const shape = { id: genId(), type: "text" as const, x, y, value };
        this.existingShapes.push(shape);
        this.socket.send(
            JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape }),
                roomId: String(this.roomId)
            })
        );
        this.clearCanvas();
        if (this.onShapesUpdated) this.onShapesUpdated();
    }
    mouseDownHandler=(e: MouseEvent)=>{
        e.preventDefault();
        console.log('mouseDown', { tool: this.selectedTool, x: e.clientX, y: e.clientY });
        this.clicked=true;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panX) / this.scale;
        const y = (e.clientY - rect.top - this.panY) / this.scale;
        this.startX = x;
        this.startY = y;
        if (this.selectedTool === "pencil") {
            this.pencilPoints = [{ x, y }];
        } else if (this.selectedTool === "text") {
            
            if (this.onTextToolClick) {
                this.onTextToolClick(x, y);
            }
            this.clicked = false;
        } else if (this.selectedTool === "eraser") {
            
            const idx = this.existingShapes.findIndex(shape => {
                if (shape.type === "rect") {
                    return x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height;
                } else if (shape.type === "circle") {
                    const dx = x - shape.centerX;
                    const dy = y - shape.centerY;
                    return Math.sqrt(dx*dx + dy*dy) <= shape.radius;
                } else if (shape.type === "line" || shape.type === "arrow") {
                    
                    const dist = pointToLineDistance(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
                    return dist < 8;
                } else if (shape.type === "pencil") {
                    return shape.points.some(p => Math.abs(p.x - x) < 6 && Math.abs(p.y - y) < 6);
                } else if (shape.type === "text") {
                    return Math.abs(shape.x - x) < 20 && Math.abs(shape.y - y) < 20;
                }
                return false;
            });
            if (idx !== -1) {
                const erasedId = this.existingShapes[idx].id;
                this.existingShapes.splice(idx, 1);
                this.socket.send(
                    JSON.stringify({
                        type: "chat",
                        message: JSON.stringify({ erase: erasedId }),
                        roomId: String(this.roomId)
                    })
                );
                this.clearCanvas();
                if (this.onShapesUpdated) this.onShapesUpdated();
            }
            this.clicked = false;
        }
    }

    mouseUpHandler=(e: MouseEvent)=>{
        if (!this.clicked) return;
        this.clicked=false;
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panX) / this.scale;
        const y = (e.clientY - rect.top - this.panY) / this.scale;
        const width = x - this.startX;
        const height = y - this.startY;
        const selectedTool=this.selectedTool;
        let shape: Shape | null=null;
        if(selectedTool=="rect"){
            shape={
                id: genId(),
                type:"rect",
                x:this.startX,
                y:this.startY,
                width,
                height
            }
        }else if(selectedTool=="circle"){
            const radius=Math.max(width,height);
            shape={
                id: genId(),
                type:"circle",
                centerX:this.startX+radius/2,
                centerY:this.startY+radius/2,
                radius:radius,
            }
        } else if (selectedTool == "pencil") {
            if (this.pencilPoints.length > 1) {
                shape = {
                    id: genId(),
                    type: "pencil",
                    points: this.pencilPoints.slice(),
                }
            }
            this.pencilPoints = [];
        } else if (selectedTool == "line") {
            shape = {
                id: genId(),
                type: "line",
                x1: this.startX,
                y1: this.startY,
                x2: x,
                y2: y
            };
        } else if (selectedTool == "arrow") {
            shape = {
                id: genId(),
                type: "arrow",
                x1: this.startX,
                y1: this.startY,
                x2: x,
                y2: y
            };
        }
        if(!shape)return;
        this.existingShapes.push(shape);
        this.socket.send(
            JSON.stringify({
                type:"chat",
                message:JSON.stringify({shape}),
                roomId: String(this.roomId)
            })
        )
        this.clearCanvas();
        if (this.onShapesUpdated) this.onShapesUpdated();
    }

    mouseMoveHandler=(e: MouseEvent)=>{
        if(this.clicked){
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.panX) / this.scale;
            const y = (e.clientY - rect.top - this.panY) / this.scale;
            const width = x - this.startX;
            const height = y - this.startY;
            
            this.clearCanvas();
            const selectedTool = this.selectedTool;
            
            this.context.save();
            this.context.strokeStyle = "#000";
            this.context.fillStyle = "#000";
            if(selectedTool=="rect"){
                this.context.strokeRect(this.startX,this.startY,width,height);
            }
            else if(selectedTool=="circle"){
                const centerX=this.startX+width/2;
                const centerY=this.startY+height/2;
                const radius =Math.max(width,height);
                this.context.beginPath();
                this.context.arc(centerX,centerY,Math.abs(radius),0,Math.PI*2);
                this.context.stroke();
                this.context.closePath();
            } else if (selectedTool == "pencil") {
                this.pencilPoints.push({ x, y });
                this.context.beginPath();
                for (let i = 0; i < this.pencilPoints.length - 1; i++) {
                    const p1 = this.pencilPoints[i];
                    const p2 = this.pencilPoints[i + 1];
                    this.context.moveTo(p1.x, p1.y);
                    this.context.lineTo(p2.x, p2.y);
                }
                this.context.stroke();
                this.context.closePath();
            } else if (selectedTool == "line") {
                this.context.beginPath();
                this.context.moveTo(this.startX, this.startY);
                this.context.lineTo(x, y);
                this.context.stroke();
                this.context.closePath();
            } else if (selectedTool == "arrow") {
                this.context.beginPath();
                this.context.moveTo(this.startX, this.startY);
                this.context.lineTo(x, y);
                this.context.stroke();
                
                const angle = Math.atan2(y - this.startY, x - this.startX);
                const headlen = 16;
                this.context.beginPath();
                this.context.moveTo(x, y);
                this.context.lineTo(x - headlen * Math.cos(angle - Math.PI / 6), y - headlen * Math.sin(angle - Math.PI / 6));
                this.context.moveTo(x, y);
                this.context.lineTo(x - headlen * Math.cos(angle + Math.PI / 6), y - headlen * Math.sin(angle + Math.PI / 6));
                this.context.stroke();
                this.context.closePath();
            }
            this.context.restore();
        }
    }
    initMouseHandlers(){
      this.canvas.addEventListener("mousedown",this.mouseDownHandler);
     
        
        this.canvas.addEventListener("mouseup",this.mouseUpHandler);

    
        this.canvas.addEventListener("mousemove",this.mouseMoveHandler) 
}
    setZoom(scale: number) {
        this.scale = Math.max(0.2, Math.min(4, scale));
        this.clearCanvas();
    }
    setPan(x: number, y: number) {
        this.panX = x;
        this.panY = y;
        this.clearCanvas();
    }
    startPan(x: number, y: number) {
        this.isPanning = true;
        this.lastPanX = x;
        this.lastPanY = y;
    }
    movePan(x: number, y: number) {
        if (this.isPanning) {
            this.panX += (x - this.lastPanX);
            this.panY += (y - this.lastPanY);
            this.lastPanX = x;
            this.lastPanY = y;
            this.clearCanvas();
        }
    }
    endPan() {
        this.isPanning = false;
    }
    clearAllShapes() {
        this.existingShapes = [];
        this.socket.send(
            JSON.stringify({
                type: "chat",
                message: JSON.stringify({ clear: true }),
                roomId: String(this.roomId)
            })
        );
        this.clearCanvas();
        if (this.onShapesUpdated) this.onShapesUpdated();
    }
}


function pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}


