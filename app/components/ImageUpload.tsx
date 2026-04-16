"use client";

import { useRef, useState, useCallback } from "react";

interface ImageUploadProps {
  onImageChange: (base64: string | null, mimeType: string | null) => void;
}

export default function ImageUpload({ onImageChange }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file (JPG, PNG, WEBP)");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("Image must be under 10MB");
        return;
      }

      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        // Extract base64 data (remove data:image/...;base64, prefix)
        const base64 = result.split(",")[1] ?? "";
        onImageChange(base64, file.type);
      };
      reader.readAsDataURL(file);
    },
    [onImageChange]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    onImageChange(null, null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.sectionIcon}>📸</span>
        <div>
          <h3 style={styles.sectionTitle}>Crop Image (Optional)</h3>
          <p style={styles.sectionSub}>
            Upload a photo of your crop for AI visual analysis
          </p>
        </div>
      </div>

      {!preview ? (
        <div
          style={{
            ...styles.dropzone,
            borderColor: dragOver ? "#059669" : "#334155",
            backgroundColor: dragOver ? "rgba(5,150,105,0.08)" : "#0f172a",
          }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <span style={styles.uploadIcon}>📤</span>
          <p style={styles.dropText}>
            Drop image here or <span style={styles.link}>browse</span>
          </p>
          <p style={styles.dropHint}>JPG, PNG, WEBP • Max 10MB</p>
        </div>
      ) : (
        <div style={styles.previewCard}>
          <img
            src={preview}
            alt="Crop preview"
            style={styles.previewImg}
          />
          <div style={styles.previewInfo}>
            <span style={styles.fileName}>{fileName}</span>
            <button onClick={handleRemove} style={styles.removeBtn}>
              ✕ Remove
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    marginTop: 8,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 28,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#f1f5f9",
  },
  sectionSub: {
    margin: "2px 0 0",
    fontSize: 13,
    color: "#64748b",
  },
  dropzone: {
    border: "2px dashed #334155",
    borderRadius: 12,
    padding: "32px 24px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  uploadIcon: {
    fontSize: 36,
    display: "block",
    marginBottom: 12,
  },
  dropText: {
    margin: 0,
    fontSize: 14,
    color: "#94a3b8",
  },
  link: {
    color: "#5eead4",
    fontWeight: 600,
    textDecoration: "underline",
    cursor: "pointer",
  },
  dropHint: {
    margin: "8px 0 0",
    fontSize: 12,
    color: "#475569",
  },
  previewCard: {
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #1e293b",
    backgroundColor: "#0f172a",
  },
  previewImg: {
    width: "100%",
    maxHeight: 240,
    objectFit: "cover",
    display: "block",
  },
  previewInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
  },
  fileName: {
    fontSize: 13,
    color: "#94a3b8",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  removeBtn: {
    background: "none",
    border: "1px solid #475569",
    borderRadius: 8,
    color: "#f87171",
    fontSize: 12,
    fontWeight: 600,
    padding: "6px 12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};
