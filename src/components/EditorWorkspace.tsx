import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from "react";
import { PDFDocument, PDFTextField, StandardFonts, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  CheckSquare,
  ChevronLeft,
  Download,
  Layers,
  MousePointer2,
  PenTool,
  Redo2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { AppHeader, UploadScreen } from "./UploadScreen";
import { ContextualPanel } from "./ContextualPanel";
import { PdfCanvas } from "./PdfCanvas";
import type { ActiveTool, EditorItem, FontMap, PageSize } from "../editorTypes";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
const fontMap: FontMap = {
  Arial: StandardFonts.Helvetica,
  Helvetica: StandardFonts.Helvetica,
  "Times New Roman": StandardFonts.TimesRoman,
  Georgia: StandardFonts.TimesRoman,
  "Courier New": StandardFonts.Courier,
  Verdana: StandardFonts.Helvetica,
  "Trebuchet MS": StandardFonts.Helvetica,
};

export function EditorWorkspace() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [fieldNames, setFieldNames] = useState<string[]>([]);
  const [items, setItems] = useState<EditorItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pages, setPages] = useState<number[]>([]);
  const [pageSizes, setPageSizes] = useState<PageSize[]>([]);
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const [textBold, setTextBold] = useState(false);
  const [textSize, setTextSize] = useState(16);
  const [textColor, setTextColor] = useState("#1C2331");
  const [tickStyle, setTickStyle] = useState<"circle" | "mark" | "box">("mark");
  const [tickColor, setTickColor] = useState("#3F6B4F");
  const [tickSize, setTickSize] = useState(18);
  const [pendingSignature, setPendingSignature] = useState<{
    bytes?: ArrayBuffer;
    url?: string;
    name?: string;
    type?: "image" | "typed";
    text?: string;
  } | null>(null);
  const [message, setMessage] = useState("Your file stays in this browser.");
  const fileInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const nextId = useRef(1);

  useEffect(() => {
    if (!pdfBytes || !pages.length) return;
    let cancelled = false;
    const render = async () => {
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) })
        .promise;
      const sizes: PageSize[] = [];
      for (let index = 1; index <= pdf.numPages; index += 1) {
        const page = await pdf.getPage(index);
        const base = page.getViewport({ scale: 1 });
        sizes.push({ width: base.width, height: base.height });
        const canvas = canvasRefs.current[index - 1];
        if (!canvas || cancelled) continue;
        const availableWidth = Math.max(
          300,
          (pageRefs.current[index - 1]?.parentElement?.parentElement
            ?.clientWidth || 900) - 72,
        );
        const viewport = page.getViewport({
          scale: (availableWidth / base.width) * zoom,
        });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({
          canvas,
          canvasContext: canvas.getContext("2d")!,
          viewport,
        }).promise;
      }
      if (!cancelled) setPageSizes(sizes);
    };
    void render();
    return () => {
      cancelled = true;
    };
  }, [pdfBytes, pages, zoom]);
  useEffect(() => {
    if (editingId !== null) inputRefs.current[editingId]?.focus();
  }, [editingId]);

  const handlePdf = async (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    if (nextFile.type !== "application/pdf") {
      setMessage("PDF files only. Choose a document ending in .pdf.");
      return;
    }
    const bytes = await nextFile.arrayBuffer();
    const document = await PDFDocument.load(bytes);
    const textFields = document
      .getForm()
      .getFields()
      .filter((field) => field instanceof PDFTextField);
    const nextFields: Record<string, string> = {};
    textFields.forEach((field) => {
      nextFields[field.getName()] = "";
    });
    const pageCount = document.getPageCount();
    setFile(nextFile);
    setPdfBytes(bytes);
    setPages(Array.from({ length: pageCount }, (_, index) => index));
    setPageSizes([]);
    setFieldNames(Object.keys(nextFields));
    setFields(nextFields);
    setItems([]);
    setSelectedId(null);
    setEditingId(null);
    setActiveTool("select");
    setMessage(
      `${pageCount} page${pageCount === 1 ? "" : "s"} loaded. Choose a tool to edit.`,
    );
  };
  const addTextAt = (page: number, x: number, y: number) => {
    const id = nextId.current++;
    setItems((current) => [
      ...current,
      {
        id,
        page,
        kind: "text",
        text: "",
        x,
        y,
        width: 0.16,
        height: 0.03,
        fontFamily: "Arial",
        fontSize: textSize,
        bold: textBold,
        align: "left",
        color: textColor,
        lineHeight: 1.2,
        letterSpacing: 0,
        background: "transparent",
      },
    ]);
    setSelectedId(id);
    setEditingId(id);
    setActiveTool("select");
    setMessage("Type your text. Click outside or press Esc when finished.");
  };
  const addTickAt = (page: number, x: number, y: number) => {
    const id = nextId.current++;
    setItems((current) => [
      ...current,
      {
        id,
        page,
        kind: "tick",
        x,
        y,
        width: 0.03,
        height: 0.026,
        tickStyle,
        color: tickColor,
        fontSize: tickSize,
      },
    ]);
    setSelectedId(id);
    setActiveTool("select");
    setMessage("Tick added. Drag or resize to adjust.");
  };
  const addSignatureAt = (page: number, x: number, y: number) => {
    const id = nextId.current++;
    if (pendingSignature?.type === "typed" && pendingSignature.text) {
      setItems((current) => [
        ...current,
        {
          id,
          page,
          kind: "text",
          text: pendingSignature.text,
          x,
          y,
          width: 0.18,
          height: 0.04,
          fontFamily: "Georgia",
          fontSize: 20,
          bold: false,
          italic: true,
          color: "#1C2331",
        },
      ]);
    } else if (pendingSignature?.bytes) {
      setItems((current) => [
        ...current,
        {
          id,
          page,
          kind: "image",
          bytes: pendingSignature.bytes,
          url: pendingSignature.url,
          name: pendingSignature.name,
          x,
          y,
          width: 0.16,
          height: 0.05,
        },
      ]);
    } else {
      setItems((current) => [
        ...current,
        {
          id,
          page,
          kind: "text",
          text: "Signature",
          x,
          y,
          width: 0.16,
          height: 0.04,
          fontFamily: "Georgia",
          fontSize: 20,
          bold: false,
          italic: true,
          color: "#1C2331",
        },
      ]);
    }
    setSelectedId(id);
    setActiveTool("select");
    setMessage("Signature placed on page.");
  };
  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const nextImage = event.target.files?.[0];
    if (!nextImage || !nextImage.type.startsWith("image/")) return;
    const bytes = await nextImage.arrayBuffer();
    setPendingSignature({
      bytes,
      url: URL.createObjectURL(nextImage),
      name: nextImage.name,
      type: "image",
    });
    setActiveTool("signature");
    setMessage("Signature ready. Move cursor over page and click to place.");
  };
  const updateItem = (id: number, update: Partial<EditorItem>) =>
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...update } : item)),
    );
  const removeItem = (id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedId(null);
    setEditingId(null);
  };
  const selectedItem = items.find((item) => item.id === selectedId);
  const resizeItem = (
    event: ReactPointerEvent<HTMLButtonElement>,
    item: EditorItem,
  ) => {
    event.stopPropagation();
    const page = pageRefs.current[item.page];
    if (!page) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const initialWidth = item.width;
    const initialHeight = item.height;
    const move = (moveEvent: PointerEvent) => {
      const nextWidth = Math.max(
        0.08,
        Math.min(
          1 - item.x,
          initialWidth + (moveEvent.clientX - startX) / page.clientWidth,
        ),
      );
      const ratio = initialHeight / initialWidth;
      updateItem(item.id, {
        width: nextWidth,
        height:
          item.kind === "image"
            ? Math.min(1 - item.y, nextWidth * ratio)
            : Math.max(
                0.04,
                Math.min(
                  1 - item.y,
                  initialHeight +
                    (moveEvent.clientY - startY) / page.clientHeight,
                ),
              ),
      });
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };
  const setTool = (tool: ActiveTool) => {
    setActiveTool(tool);
    if (tool === "select") setEditingId(null);
    if (tool === "text") setMessage("Move cursor to page and click to place text.");
    if (tool === "tick") setMessage("Move cursor to page and click to place tick.");
    if (tool === "signature") setMessage("Move cursor to page and click to place signature.");
  };
  const chooseSignature = () => {
    setTool("signature");
    imageInput.current?.click();
  };
  const changeField = (name: string, value: string) =>
    setFields((current) => ({ ...current, [name]: value }));

  const downloadPdf = async () => {
    if (!pdfBytes || !pageSizes.length) return;
    const document = await PDFDocument.load(pdfBytes);
    const form = document.getForm();
    fieldNames.forEach((name) =>
      form.getTextField(name).setText(fields[name] || ""),
    );
    for (const item of items) {
      const page = document.getPages()[item.page];
      const size = pageSizes[item.page];
      if (!page || !size) continue;
      const x = item.x * size.width;
      const width = item.width * size.width;
      const height = item.height * size.height;
      const y = size.height - item.y * size.height - height;
      if (item.kind === "text") {
        const font = await document.embedFont(
          fontMap[item.fontFamily || "Arial"],
        );
        const fontSize = item.fontSize || 16;
        const spacing = item.letterSpacing || 0;
        const lineHeight = item.lineHeight || 1.2;
        const hex = item.color || "#1C2331";
        const color = rgb(
          parseInt(hex.slice(1, 3), 16) / 255,
          parseInt(hex.slice(3, 5), 16) / 255,
          parseInt(hex.slice(5, 7), 16) / 255,
        );
        const lines = (item.text || "").split("\n");
        const topY = size.height - item.y * size.height;

        lines.forEach((line, lineIndex) => {
          const textWidth = [...line].reduce(
            (total, character) =>
              total + font.widthOfTextAtSize(character, fontSize) + spacing,
            -spacing,
          );
          const textX =
            item.align === "center"
              ? x + (width - textWidth) / 2
              : item.align === "right"
                ? x + width - textWidth
                : x + 4;
          const lineY =
            topY - 4 - fontSize * 0.82 - lineIndex * fontSize * lineHeight;

          [...line].forEach((character, characterIndex) => {
            const characterX =
              textX +
              [...line]
                .slice(0, characterIndex)
                .reduce(
                  (total, previous) =>
                    total +
                    font.widthOfTextAtSize(previous, fontSize) +
                    spacing,
                  0,
                );
            page.drawText(character, {
              x: characterX,
              y: lineY,
              size: fontSize,
              font,
              color,
            });
          });

          if (item.underline)
            page.drawLine({
              start: {
                x: textX,
                y: lineY - 2,
              },
              end: {
                x: textX + textWidth,
                y: lineY - 2,
              },
              thickness: Math.max(1, fontSize / 14),
              color,
            });
        });
      } else if (item.kind === "tick") {
        const tickColorValue = item.color || "#3F6B4F";
        const color = rgb(
          parseInt(tickColorValue.slice(1, 3), 16) / 255,
          parseInt(tickColorValue.slice(3, 5), 16) / 255,
          parseInt(tickColorValue.slice(5, 7), 16) / 255,
        );
        const strokeWidth = Math.max(
          2,
          Math.min(5, (item.fontSize || 28) * 0.08),
        );

        if (item.tickStyle === "box") {
          page.drawRectangle({
            x,
            y,
            width,
            height,
            borderColor: color,
            borderWidth: 1.5,
          });
        }

        page.drawLine({
          start: { x: x + width * 0.2, y: y + height * 0.48 },
          end: { x: x + width * 0.42, y: y + height * 0.22 },
          thickness: strokeWidth,
          color,
        });
        page.drawLine({
          start: { x: x + width * 0.42, y: y + height * 0.22 },
          end: { x: x + width * 0.82, y: y + height * 0.78 },
          thickness: strokeWidth,
          color,
        });
      } else if (item.bytes) {
        const embedded = item.name?.toLowerCase().endsWith(".png")
          ? await document.embedPng(item.bytes)
          : await document.embedJpg(item.bytes);
        page.drawImage(embedded, { x, y, width, height });
      }
    }
    const output = await document.save();
    const url = URL.createObjectURL(
      new Blob([output.buffer as ArrayBuffer], { type: "application/pdf" }),
    );
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${file?.name.replace(/\.pdf$/i, "") || "filled-document"}-edited.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Download completed successfully.");
  };

  return (
    <>
      <AppHeader />
      {!file ? (
        <UploadScreen
          message={message}
          onChoose={() => fileInput.current?.click()}
          fileInput={fileInput}
          onFile={handlePdf}
        />
      ) : (
        <>
          <div className="editor-frame">
            <header className="editor-topbar">
              <div className="file-heading">
                <button
                  className="icon-button"
                  aria-label="Back"
                  onClick={() => setFile(null)}
                  title="Close document"
                >
                  <ChevronLeft size={18} />
                </button>
                <div>
                  <span className="brand-name">STUDIO</span>
                  <h1>{file.name}</h1>
                </div>
              </div>
              <div className="top-actions">
                <button className="icon-button" title="Undo">
                  <Undo2 size={16} />
                </button>
                <button className="icon-button" title="Redo">
                  <Redo2 size={16} />
                </button>
                <div className="zoom-control">
                  <button onClick={() => setZoom(Math.max(0.6, zoom - 0.1))}>
                    <ZoomOut size={14} />
                  </button>
                  <span>{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(Math.min(1.6, zoom + 0.1))}>
                    <ZoomIn size={14} />
                  </button>
                </div>
                <button className="done-button" onClick={downloadPdf}>
                  <Download size={15} /> Export PDF
                </button>
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handlePdf}
                hidden
              />
            </header>
            <section className="editor-layout">
              <nav className="tool-rail" aria-label="Annotation tools">
                <ToolButton
                  label="Select"
                  icon={<MousePointer2 size={18} />}
                  active={activeTool === "select"}
                  onClick={() => setTool("select")}
                />
                <ToolButton
                  label="Text"
                  icon={<Type size={18} />}
                  active={activeTool === "text"}
                  onClick={() => setTool("text")}
                />
                <ToolButton
                  label="Signature"
                  icon={<PenTool size={18} />}
                  active={activeTool === "signature"}
                  onClick={() => setTool("signature")}
                />
                <ToolButton
                  label="Tick"
                  icon={<CheckSquare size={18} />}
                  active={activeTool === "tick"}
                  onClick={() => setTool("tick")}
                />
                <div className="rail-divider" />
                <ToolButton
                  label="Pages"
                  icon={<Layers size={18} />}
                  active={activeTool === "pages"}
                  onClick={() => setTool("pages")}
                />
              </nav>
              <div className="canvas-panel">
                <PdfCanvas
                  pages={pages}
                  items={items}
                  selectedId={selectedId}
                  editingId={editingId}
                  zoom={zoom}
                  activeTool={activeTool}
                  pendingSignature={pendingSignature}
                  textSize={textSize}
                  textColor={textColor}
                  textBold={textBold}
                  tickStyle={tickStyle}
                  tickColor={tickColor}
                  tickSize={tickSize}
                  canvasRefs={canvasRefs}
                  pageRefs={pageRefs}
                  inputRefs={inputRefs}
                  setSelectedId={setSelectedId}
                  setEditingId={setEditingId}
                  addTextAt={addTextAt}
                  addTickAt={addTickAt}
                  addSignatureAt={addSignatureAt}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  resizeItem={resizeItem}
                />
              </div>
              <ContextualPanel
                activeTool={activeTool}
                selectedItem={selectedItem}
                fieldNames={fieldNames}
                fields={fields}
                onFieldChange={changeField}
                onTextBold={setTextBold}
                textBold={textBold}
                textSize={textSize}
                onTextSize={setTextSize}
                textColor={textColor}
                onTextColor={setTextColor}
                tickStyle={tickStyle}
                onTickStyle={setTickStyle}
                tickColor={tickColor}
                onTickColor={setTickColor}
                tickSize={tickSize}
                onTickSize={setTickSize}
                onSignature={chooseSignature}
                imageInput={imageInput}
                onImage={handleImage}
                onSetTypedSignature={(sigText) => {
                  setPendingSignature({ type: "typed", text: sigText });
                  setActiveTool("signature");
                  setMessage("Typed signature ready. Click anywhere on page to place.");
                }}
                onPlaceSignature={() => setTool("signature")}
                onDownload={downloadPdf}
                message={message}
              />
            </section>
          </div>
        </>
      )}
    </>
  );
}

function ToolButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`rail-tool ${active ? "active" : ""}`} onClick={onClick}>
      <span className="rail-icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

