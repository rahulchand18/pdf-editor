import { useRef, useState } from "react";
import type { ChangeEvent, RefObject, PointerEvent as ReactPointerEvent } from "react";
import {
  Check,
  Download,
  ImagePlus,
  MousePointer2,
  PenLine,
  RotateCcw,
  Trash2,
  Type,
} from "lucide-react";
import type { ActiveTool, EditorItem } from "../editorTypes";

type Props = {
  activeTool: ActiveTool;
  selectedItem?: EditorItem;
  fieldNames: string[];
  fields: Record<string, string>;
  onFieldChange: (name: string, value: string) => void;
  onTextBold: (value: boolean) => void;
  textBold: boolean;
  textSize: number;
  onTextSize: (value: number) => void;
  textColor: string;
  onTextColor: (value: string) => void;
  tickStyle: "circle" | "mark" | "box";
  onTickStyle: (value: "circle" | "mark" | "box") => void;
  tickColor: string;
  onTickColor: (value: string) => void;
  tickSize: number;
  onTickSize: (value: number) => void;
  onSignature: () => void;
  imageInput: RefObject<HTMLInputElement | null>;
  onImage: (event: ChangeEvent<HTMLInputElement>) => void;
  onPlaceSignature: () => void;
  onSetTypedSignature?: (sigText: string) => void;
  onDownload: () => void;
  message: string;
};

const swatches = ["#1C2331", "#6366f1", "#ef4444", "#10b981", "#f59e0b"];

export function ContextualPanel(props: Props) {
  const { activeTool } = props;
  const [sigMode, setSigMode] = useState<"draw" | "type" | "upload">("draw");
  const [typedSig, setTypedSig] = useState("John Doe");
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  const startDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1C2331";
  };

  const draw = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const exportDrawnSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "signature.png", { type: "image/png" });
      const syntheticEvent = {
        target: { files: [file] },
      } as unknown as ChangeEvent<HTMLInputElement>;
      props.onImage(syntheticEvent);
    });
  };

  return (
    <aside className="context-panel">
      <div className="panel-heading">
        <span className="panel-eyebrow">
          {activeTool === "pages" ? "DOCUMENT" : "TOOL OPTIONS"}
        </span>
        <h2>
          {activeTool === "select"
            ? "Select"
            : activeTool === "text"
              ? "Add Text"
              : activeTool === "signature"
                ? "Add Signature"
                : activeTool === "tick"
                  ? "Add Tick"
                  : "Pages"}
        </h2>
      </div>

      {activeTool === "select" && (
        <div className="empty-panel">
          <MousePointer2 size={24} color="#818cf8" />
          <p>Select an element to edit</p>
          <span>
            Click any text or tick box on the PDF canvas to customize style, size, or placement.
          </span>
        </div>
      )}

      {activeTool === "text" && (
        <div className="panel-content">
          <p className="panel-hint">
            Click anywhere on the document page to place a new text entry box.
          </p>

          <label className="field-label">Style</label>
          <div className="segmented">
            <button
              className={!props.textBold ? "selected" : ""}
              onClick={() => props.onTextBold(false)}
            >
              Normal
            </button>
            <button
              className={props.textBold ? "selected" : ""}
              onClick={() => props.onTextBold(true)}
            >
              Bold
            </button>
          </div>

          <label className="field-label">
            Size <output>{props.textSize}px</output>
          </label>
          <input
            className="range"
            type="range"
            min="10"
            max="36"
            value={props.textSize}
            onChange={(event) => props.onTextSize(Number(event.target.value))}
          />

          <label className="field-label">Color</label>
          <div className="swatches">
            {swatches.map((color) => (
              <button
                key={color}
                className={
                  props.textColor === color ? "swatch selected" : "swatch"
                }
                style={{ background: color }}
                aria-label={color}
                onClick={() => props.onTextColor(color)}
              />
            ))}
          </div>
        </div>
      )}

      {activeTool === "signature" && (
        <div className="panel-content">
          <div className="segmented">
            <button
              className={sigMode === "draw" ? "selected" : ""}
              onClick={() => setSigMode("draw")}
            >
              <PenLine size={13} /> Draw
            </button>
            <button
              className={sigMode === "type" ? "selected" : ""}
              onClick={() => setSigMode("type")}
            >
              <Type size={13} /> Type
            </button>
            <button
              className={sigMode === "upload" ? "selected" : ""}
              onClick={() => setSigMode("upload")}
            >
              <ImagePlus size={13} /> Upload
            </button>
          </div>

          {sigMode === "draw" && (
            <div>
              <div className="signature-box">
                <canvas
                  ref={sigCanvasRef}
                  width={270}
                  height={120}
                  className="signature-canvas"
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerLeave={stopDrawing}
                />
                <div className="signature-actions">
                  <button className="clear-btn" onClick={clearCanvas}>
                    <RotateCcw size={11} /> Clear
                  </button>
                </div>
              </div>
              <button className="panel-primary" onClick={exportDrawnSignature}>
                <Check size={16} /> Place Signature
              </button>
            </div>
          )}

          {sigMode === "type" && (
            <div>
              <div className="form-fields" style={{ padding: 0, border: 0 }}>
                <label>Signature Text</label>
                <input
                  value={typedSig}
                  onChange={(e) => setTypedSig(e.target.value)}
                  placeholder="Type your name"
                />
              </div>
              <div
                style={{
                  margin: "14px 0",
                  padding: "16px",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#1C2331",
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "22px",
                  textAlign: "center",
                }}
              >
                {typedSig || "Your Signature"}
              </div>
              <button
                className="panel-primary"
                onClick={() => props.onSetTypedSignature?.(typedSig)}
              >
                <Check size={16} /> Place Text Signature
              </button>
            </div>
          )}

          {sigMode === "upload" && (
            <div>
              <button className="secondary-action" onClick={props.onSignature}>
                <ImagePlus size={15} /> Choose Signature Image
              </button>
              <input
                ref={props.imageInput}
                type="file"
                accept="image/png,image/jpeg"
                onChange={props.onImage}
                hidden
              />
            </div>
          )}
        </div>
      )}

      {activeTool === "tick" && (
        <div className="panel-content">
          <p className="panel-hint">
            Click anywhere on the document to place checkmarks or boxes.
          </p>

          <label className="field-label">Style</label>
          <div className="tick-styles">
            {(
              [
                ["mark", "✓", "Checkmark"],
                ["circle", "◉", "Circle"],
                ["box", "□", "Checkbox"],
              ] as const
            ).map(([value, icon, label]) => (
              <button
                key={value}
                className={
                  props.tickStyle === value ? "tick-tile selected" : "tick-tile"
                }
                onClick={() => props.onTickStyle(value)}
              >
                <strong style={{ fontSize: 18 }}>{icon}</strong>
                <span>{label}</span>
              </button>
            ))}
          </div>

          <label className="field-label">Color</label>
          <div className="swatches">
            {["#10b981", "#6366f1", "#ef4444", "#1C2331"].map((color) => (
              <button
                key={color}
                className={
                  props.tickColor === color ? "swatch selected" : "swatch"
                }
                style={{ background: color }}
                aria-label={color}
                onClick={() => props.onTickColor(color)}
              />
            ))}
          </div>

          <label className="field-label">
            Size <output>{props.tickSize}px</output>
          </label>
          <input
            className="range"
            type="range"
            min="10"
            max="36"
            value={props.tickSize}
            onChange={(event) => props.onTickSize(Number(event.target.value))}
          />
        </div>
      )}

      {props.fieldNames.length > 0 && (
        <div className="form-fields">
          <span className="panel-eyebrow">DETECTED FORM FIELDS</span>
          {props.fieldNames.map((name) => (
            <label key={name}>
              {name}
              <input
                value={props.fields[name]}
                onChange={(event) =>
                  props.onFieldChange(name, event.target.value)
                }
                placeholder="Type here"
              />
            </label>
          ))}
        </div>
      )}

      <div className="panel-footer">
        <p>{props.message}</p>
        <button className="download-button" onClick={props.onDownload}>
          <Download size={15} /> Export PDF Document
        </button>
        {props.selectedItem && (
          <button className="delete-action">
            <Trash2 size={13} /> Delete selected item
          </button>
        )}
      </div>
    </aside>
  );
}

