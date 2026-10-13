import {
  FilePlus2,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Zap,
} from "lucide-react";
import type { ChangeEvent, RefObject } from "react";

type Props = {
  message: string;
  onChoose: () => void;
  fileInput: RefObject<HTMLInputElement | null>;
  onFile: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function UploadScreen({ message, onChoose, fileInput, onFile }: Props) {
  return (
    <div className="landing-content">
      <section className="intro">
        <span className="eyebrow">
          <Sparkles size={13} /> PDF Form Studio
        </span>
        <h1>
          Edit & fill PDFs
          <br />
          <em>effortlessly. v2.0</em>
        </h1>
        <p className="lede">
          Add crisp text, signatures, and interactive form fields directly in
          your browser with zero cloud tracking.
        </p>
        <div className="landing-features">
          <span className="feature-tag">
            <ShieldCheck size={16} color="#10b981" /> 100% Client-side
          </span>
          <span className="feature-tag">
            <Zap size={16} color="#818cf8" /> Instant Export
          </span>
        </div>
      </section>

      <div>
        <button className="drop-zone" type="button" onClick={onChoose}>
          <span className="upload-icon">
            <UploadCloud size={28} />
          </span>
          <strong>Drop your PDF here</strong>
          <span>or click to browse from your computer</span>
          <small>PDF files only · Max 25 MB</small>
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf,.pdf"
            onChange={onFile}
            hidden
          />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p className="status-line">
            <LockKeyhole size={14} /> {message}
          </p>
          <button className="new-doc" onClick={onChoose}>
            <FilePlus2 size={15} /> Select File
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppHeader() {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">
          <FileText size={18} />
        </span>
        <span>PDF Form Studio</span>
      </div>
      <div className="privacy">
        <LockKeyhole size={13} color="#10b981" /> Private & Local
      </div>
    </header>
  );
}
