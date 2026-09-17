import { useState } from "react";
import type {
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
} from "react";
import { Check, CircleCheck, Square, X } from "lucide-react";
import type { EditorItem, UpdateItem } from "../editorTypes";
import { FormatToolbar } from "./FormatToolbar";

type PendingSignature = {
  bytes?: ArrayBuffer;
  url?: string;
  name?: string;
  type?: "image" | "typed";
  text?: string;
} | null;

type Props = {
  pages: number[];
  items: EditorItem[];
  selectedId: number | null;
  editingId: number | null;
  zoom: number;
  activeTool: "select" | "text" | "signature" | "tick" | "pages";
  pendingSignature: PendingSignature;
  textSize: number;
  textColor: string;
  textBold: boolean;
  tickStyle: "circle" | "mark" | "box";
  tickColor: string;
  tickSize: number;
  canvasRefs: MutableRefObject<Record<number, HTMLCanvasElement | null>>;
  pageRefs: MutableRefObject<Record<number, HTMLDivElement | null>>;
  inputRefs: MutableRefObject<Record<number, HTMLInputElement | null>>;
  setSelectedId: (id: number | null) => void;
  setEditingId: (id: number | null) => void;
  addTextAt: (page: number, x: number, y: number) => void;
  addTickAt: (page: number, x: number, y: number) => void;
  addSignatureAt: (page: number, x: number, y: number) => void;
  updateItem: UpdateItem;
  removeItem: (id: number) => void;
  resizeItem: (
    event: ReactPointerEvent<HTMLButtonElement>,
    item: EditorItem,
  ) => void;
};

export function PdfCanvas({
  pages,
  items,
  selectedId,
  editingId,
  zoom,
  activeTool,
  pendingSignature,
  textSize,
  textColor,
  textBold,
  tickStyle,
  tickColor,
  tickSize,
  canvasRefs,
  pageRefs,
  inputRefs,
  setSelectedId,
  setEditingId,
  addTextAt,
  addTickAt,
  addSignatureAt,
  updateItem,
  removeItem,
  resizeItem,
}: Props) {
  const [ghost, setGhost] = useState<{
    page: number;
    x: number;
    y: number;
    px: number;
    py: number;
  } | null>(null);

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
    page: number,
  ) => {
    if (!["text", "tick", "signature"].includes(activeTool)) {
      if (ghost) setGhost(null);
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - bounds.left;
    const py = event.clientY - bounds.top;
    const x = Math.max(0, Math.min(0.8, px / bounds.width));
    const y = Math.max(0, Math.min(0.9, py / bounds.height));
    setGhost({ page, x, y, px, py });
  };

  const handlePointerLeave = () => {
    setGhost(null);
  };

  const handlePageClick = (
    event: ReactPointerEvent<HTMLDivElement>,
    page: number,
  ) => {
    const clickedPage =
      event.target === event.currentTarget ||
      event.target instanceof HTMLCanvasElement ||
      (event.target as HTMLElement).classList.contains("cursor-ghost");
    if (!clickedPage || !["text", "tick", "signature"].includes(activeTool)) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(0.85, (event.clientX - bounds.left) / bounds.width),
    );
    const y = Math.max(
      0,
      Math.min(0.9, (event.clientY - bounds.top) / bounds.height),
    );
    if (activeTool === "text") addTextAt(page, x, y);
    if (activeTool === "tick") addTickAt(page, x, y);
    if (activeTool === "signature") addSignatureAt(page, x, y);
    setGhost(null);
  };

  const moveItem = (
    event: ReactPointerEvent<HTMLDivElement>,
    item: EditorItem,
  ) => {
    if (editingId === item.id && item.kind === "text") return;
    const page = pageRefs.current[item.page];
    if (!page) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const initialX = item.x;
    const initialY = item.y;
    event.currentTarget.setPointerCapture(event.pointerId);
    const move = (moveEvent: PointerEvent) =>
      updateItem(item.id, {
        x: Math.max(
          0,
          Math.min(
            1 - item.width,
            initialX + (moveEvent.clientX - startX) / page.clientWidth,
          ),
        ),
        y: Math.max(
          0,
          Math.min(
            1 - item.height,
            initialY + (moveEvent.clientY - startY) / page.clientHeight,
          ),
        ),
      });
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  return (
    <div className="canvas-stage">
      {pages.map((page) => (
        <div className="page-wrap" key={page}>
          <div className="page-number">PAGE {page + 1}</div>
          <div
            className="pdf-page"
            ref={(element) => {
              pageRefs.current[page] = element;
            }}
            onPointerMove={(event) => handlePointerMove(event, page)}
            onPointerLeave={handlePointerLeave}
            onPointerDown={(event) => handlePageClick(event, page)}
            style={{
              cursor: ["text", "tick", "signature"].includes(activeTool)
                ? "crosshair"
                : "default",
            }}
          >
            <canvas
              ref={(element) => {
                canvasRefs.current[page] = element;
              }}
            />

            {/* Cursor Ghost Preview attached to mouse */}
            {ghost && ghost.page === page && (
              <div
                className="cursor-ghost"
                style={{
                  left: ghost.px,
                  top: ghost.py,
                }}
              >
                {activeTool === "text" && (
                  <div
                    style={{
                      fontSize: `${textSize * zoom}px`,
                      fontWeight: textBold ? "bold" : "normal",
                      color: textColor,
                      padding: "2px 6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Text Box
                  </div>
                )}
                {activeTool === "tick" && (
                  <span style={{ color: tickColor, display: "grid", placeItems: "center" }}>
                    {tickStyle === "circle" ? (
                      <CircleCheck size={tickSize * zoom} />
                    ) : tickStyle === "box" ? (
                      <Square size={tickSize * zoom} />
                    ) : (
                      <Check size={tickSize * zoom} />
                    )}
                  </span>
                )}
                {activeTool === "signature" && (
                  <div>
                    {pendingSignature?.url ? (
                      <img
                        src={pendingSignature.url}
                        alt="Signature preview"
                        style={{ height: 40, objectFit: "contain" }}
                      />
                    ) : pendingSignature?.text ? (
                      <span
                        style={{
                          fontFamily: "Georgia, serif",
                          fontStyle: "italic",
                          fontSize: 20,
                          color: "#1C2331",
                        }}
                      >
                        {pendingSignature.text}
                      </span>
                    ) : (
                      <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 600 }}>
                        Click to place signature
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {items
              .filter((item) => item.page === page)
              .map((item) => (
                <div
                  key={item.id}
                  className={`editor-item ${item.kind} ${selectedId === item.id ? "selected" : ""}`}
                  style={{
                    left: `${item.x * 100}%`,
                    top: `${item.y * 100}%`,
                    width: `${item.width * 100}%`,
                    height: `${item.height * 100}%`,
                    background:
                      item.kind === "text" ? item.background : undefined,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedId(item.id);
                  }}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    if (item.kind === "text") setEditingId(item.id);
                  }}
                  onPointerDown={(event) => moveItem(event, item)}
                >
                  {selectedId === item.id && item.kind === "text" && (
                    <FormatToolbar
                      item={item}
                      pages={pages}
                      update={updateItem}
                      onDelete={removeItem}
                    />
                  )}

                  {item.kind === "text" ? (
                    <textarea
                      ref={(element) => {
                        inputRefs.current[item.id] =
                          element as unknown as HTMLInputElement;
                      }}
                      readOnly={editingId !== item.id}
                      style={{
                        fontFamily:
                          item.fontFamily === "Times New Roman" ||
                          item.fontFamily === "Georgia"
                            ? "Georgia, serif"
                            : item.fontFamily === "Courier New"
                              ? "monospace"
                              : item.fontFamily + ", sans-serif",
                        fontSize: `${(item.fontSize || 16) * zoom}px`,
                        fontWeight: item.bold ? "bold" : "normal",
                        fontStyle: item.italic ? "italic" : "normal",
                        textDecoration: item.underline ? "underline" : "none",
                        textAlign: item.align || "left",
                        letterSpacing: `${item.letterSpacing || 0}px`,
                        lineHeight: item.lineHeight || 1.2,
                        color: item.color || "#1C2331",
                      }}
                      value={item.text}
                      placeholder="Type here..."
                      onChange={(event) =>
                        updateItem(item.id, { text: event.target.value })
                      }
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          setEditingId(null);
                          setSelectedId(null);
                        }
                      }}
                    />
                  ) : item.kind === "image" ? (
                    <img src={item.url} alt="Imported signature" />
                  ) : (
                    <span
                      className={`tick-mark tick-${item.tickStyle || "mark"}`}
                      style={{ color: item.color || "#3F6B4F" }}
                    >
                      {item.tickStyle === "circle" ? (
                        <CircleCheck size={(item.fontSize || 28) * zoom} />
                      ) : item.tickStyle === "box" ? (
                        <Square size={(item.fontSize || 28) * zoom} />
                      ) : (
                        <Check size={(item.fontSize || 28) * zoom} />
                      )}
                    </span>
                  )}
                  {selectedId === item.id && (
                    <>
                      <button
                        className="remove-item"
                        title="Delete item"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => removeItem(item.id)}
                      >
                        <X size={12} />
                      </button>
                      <button
                        className="resize-handle"
                        title="Resize"
                        onPointerDown={(event) => resizeItem(event, item)}
                      />
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}


