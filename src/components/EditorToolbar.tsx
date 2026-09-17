import {
  ImagePlus,
  MousePointer2,
  Redo2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { ChangeEvent, RefObject } from "react";
import type { ActiveTool } from "../editorTypes";

type Props = {
  activeTool: ActiveTool;
  onTool: (tool: ActiveTool) => void;
  onSignature: () => void;
  imageInput: RefObject<HTMLInputElement | null>;
  onImage: (event: ChangeEvent<HTMLInputElement>) => void;
  zoom: number;
  onZoom: (value: number) => void;
};

export function EditorToolbar({
  activeTool,
  onTool,
  onSignature,
  imageInput,
  onImage,
  zoom,
  onZoom,
}: Props) {
  return (
    <div className="canvas-toolbar">
      <div className="tool-group">
        <button
          className={activeTool === "select" ? "active" : ""}
          onClick={() => onTool("select")}
        >
          <MousePointer2 size={15} /> Select
        </button>
        <button
          className={activeTool === "text" ? "active" : ""}
          onClick={() => onTool("text")}
        >
          <Type size={15} /> Add Text
        </button>
        <button onClick={onSignature}>
          <ImagePlus size={15} /> Signature
          <input
            ref={imageInput}
            type="file"
            accept="image/png,image/jpeg"
            onChange={onImage}
            hidden
          />
        </button>
      </div>
      <div className="view-tools">
        <button title="Undo">
          <Undo2 size={15} />
        </button>
        <button title="Redo">
          <Redo2 size={15} />
        </button>
        <button
          title="Zoom out"
          onClick={() => onZoom(Math.max(0.6, zoom - 0.1))}
        >
          <ZoomOut size={15} />
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button
          title="Zoom in"
          onClick={() => onZoom(Math.min(1.6, zoom + 0.1))}
        >
          <ZoomIn size={15} />
        </button>
      </div>
    </div>
  );
}
