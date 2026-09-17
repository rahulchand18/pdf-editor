import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Trash2,
  Underline,
} from "lucide-react";
import type { EditorItem, TextFont, UpdateItem } from "../editorTypes";

type Props = {
  item: EditorItem;
  pages: number[];
  update: UpdateItem;
  onDelete: (id: number) => void;
};

const fonts: TextFont[] = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
];

export function FormatToolbar({ item, update, onDelete }: Props) {
  const change = (values: Partial<EditorItem>) => update(item.id, values);

  return (
    <div className="inline-format-popover">
      <select
        aria-label="Font family"
        value={item.fontFamily || "Arial"}
        onChange={(event) =>
          change({ fontFamily: event.target.value as TextFont })
        }
      >
        {fonts.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>

      <select
        aria-label="Font size"
        value={item.fontSize || 16}
        onChange={(event) => change({ fontSize: Number(event.target.value) })}
      >
        {[10, 12, 14, 16, 18, 24, 32, 48].map((size) => (
          <option key={size} value={size}>
            {size}px
          </option>
        ))}
      </select>

      <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />

      <button
        type="button"
        className={item.bold ? "active" : ""}
        title="Bold"
        onClick={() => change({ bold: !item.bold })}
      >
        <Bold size={13} />
      </button>

      <button
        type="button"
        className={item.italic ? "active" : ""}
        title="Italic"
        onClick={() => change({ italic: !item.italic })}
      >
        <Italic size={13} />
      </button>

      <button
        type="button"
        className={item.underline ? "active" : ""}
        title="Underline"
        onClick={() => change({ underline: !item.underline })}
      >
        <Underline size={13} />
      </button>

      <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />

      <button
        type="button"
        className={item.align === "left" || !item.align ? "active" : ""}
        title="Align left"
        onClick={() => change({ align: "left" })}
      >
        <AlignLeft size={13} />
      </button>

      <button
        type="button"
        className={item.align === "center" ? "active" : ""}
        title="Align center"
        onClick={() => change({ align: "center" })}
      >
        <AlignCenter size={13} />
      </button>

      <button
        type="button"
        className={item.align === "right" ? "active" : ""}
        title="Align right"
        onClick={() => change({ align: "right" })}
      >
        <AlignRight size={13} />
      </button>

      <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />

      <input
        type="color"
        value={item.color || "#1C2331"}
        onChange={(event) => change({ color: event.target.value })}
        style={{
          width: 20,
          height: 20,
          padding: 0,
          border: "0",
          borderRadius: "50%",
          cursor: "pointer",
          background: "transparent",
        }}
        title="Text color"
      />

      <button
        type="button"
        title="Delete item"
        onClick={() => onDelete(item.id)}
        style={{ color: "#ef4444", marginLeft: 4 }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

