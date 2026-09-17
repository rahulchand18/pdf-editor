import type { StandardFonts } from "pdf-lib";

export type TextFont =
  | "Arial"
  | "Helvetica"
  | "Times New Roman"
  | "Georgia"
  | "Courier New"
  | "Verdana"
  | "Trebuchet MS";

export type EditorItem = {
  id: number;
  page: number;
  kind: "text" | "image" | "tick";
  text?: string;
  url?: string;
  bytes?: ArrayBuffer;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily?: TextFont;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: "left" | "center" | "right";
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  background?: string;
  tickStyle?: "circle" | "mark" | "box";
};

export type PageSize = { width: number; height: number };
export type ActiveTool = "select" | "text" | "signature" | "tick" | "pages";
export type UpdateItem = (id: number, update: Partial<EditorItem>) => void;
export type FontMap = Record<TextFont, StandardFonts>;
