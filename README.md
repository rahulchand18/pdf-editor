# 📄 PDF Form Studio

> A sleek, privacy-focused, client-side PDF form editor and filler built with React, TypeScript, Vite, and `pdf-lib`.

---

## ✨ Features

- 🔒 **100% Private & Local**: All PDF parsing, canvas rendering, and file exports run strictly inside your browser. No files are ever uploaded to an external server.
- 🎯 **Cursor Ghost Placement**: Move your mouse over any PDF page to preview real-time font styles, checkmarks, or signatures attached directly to your cursor before placing them with 1-click.
- ✍️ **Text Annotations**: Add custom text entries with options for font family, size, color, bold, italic, underline, and alignment.
- ✒️ **Interactive Signature Studio**:
  - **Draw**: Freehand mouse/touch signature drawing pad.
  - **Type**: Cursive text signature generator.
  - **Upload**: Import PNG/JPEG signature images.
- ☑️ **Compact Form Ticks**: Place crisp checkmark ticks, circles, or checkbox outlines sized perfectly to fit standard document form fields.
- 📥 **Instant Export**: Download your finished PDF with embedded vector text, checkmarks, and high-resolution signatures.

---

## 🐳 Quick Start with Docker

### Using Docker Compose (Recommended)

Run the containerized application on port `8080`:

```bash
docker compose up -d --build
```

Open your browser and navigate to: **[http://localhost:8080](http://localhost:8080)**

To stop the app:

```bash
docker compose down
```

### Using Docker CLI

```bash
# Build Docker image
docker build -t pdf-form-studio .

# Run container
docker run -d -p 8080:80 --name pdf-editor pdf-form-studio
```

---

## 💻 Local Development Setup

Prerequisites: **Node.js 18+** & **npm**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📖 User Manual

### 1. Uploading a PDF Document
1. Drag and drop any `.pdf` file onto the upload zone on the landing page, or click **"Drop your PDF here"** to browse your computer.
2. The editor workspace will display your document pages with a navigation bar on the top and a tool dock on the left.

### 2. Adding Text
1. Click the **Text** tool icon (`T`) in the left tool rail.
2. Move your cursor over the PDF page. A ghost preview box will follow your pointer.
3. Click anywhere on the page to place the text box.
4. Type your text. Use the floating formatting popover right above the box to adjust **Font Family**, **Size**, **Weight (Bold/Italic/Underline)**, **Alignment**, or **Color**.

### 3. Checking Form Boxes (Ticks)
1. Click the **Tick** tool icon (`✓`) in the tool rail.
2. Choose your preferred style (**Checkmark**, **Circle**, or **Box**) and color in the right side panel.
3. Move your cursor over any PDF checkbox. Click once to place a compact checkmark.
4. Click and drag the corner handle to resize the checkmark if needed.

### 4. Adding a Signature
1. Click the **Signature** tool icon (`PenTool`) in the tool rail.
2. In the right options panel, choose your method:
   - **Draw**: Freehand draw your signature on the white canvas pad, then click **"Place Signature"**.
   - **Type**: Type your name into the text field and click **"Place Text Signature"**.
   - **Upload**: Click **"Choose Signature Image"** to import a signature PNG/JPEG.
3. Move your cursor over the document signature line and click to place it.

### 5. Moving & Resizing Elements
- Click any element (text, tick, or signature) to select it.
- **Move**: Click and drag the element anywhere across the page.
- **Resize**: Click and drag the blue bottom-right handle.
- **Delete**: Click the red `X` button on the top-right corner of the element, or click **"Remove selected"** in the side panel.

### 6. Exporting Your Edited PDF
1. When you're ready, click the blue **"Export PDF"** button in the top right header (or in the side panel).
2. Your browser will download the finalized PDF containing all your annotations embedded directly into the document.

---

## 🛠️ Built With

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [pdf-lib](https://pdf-lib.js.org/)
- [pdfjs-dist](https://mozilla.github.io/pdf.js/)
- [Lucide Icons](https://lucide.dev/)
- [Nginx & Docker](https://www.nginx.com/)
