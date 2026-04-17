"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import Image from 'next/image';

interface UploadBoxProps {
  onImageSelect: (base64: string | null) => void;
}

const UploadBox: React.FC<UploadBoxProps> = ({ onImageSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        // Strip the prefix for the API
        const rawBase64 = base64String.split(',')[1];
        onImageSelect(rawBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      className={`relative w-full h-48 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden
        ${preview ? 'border-primary' : 'border-secondary/20 bg-secondary/5 hover:bg-secondary/10'}`}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <>
          <img src={preview} alt="Crop preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
          <button 
            onClick={clearImage}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-xl text-alert hover:bg-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white font-semibold text-sm">
            <Camera size={18} />
            Keep this photo?
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 text-secondary/60">
          <div className="p-4 bg-white rounded-2xl shadow-sm">
            <Upload size={32} strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="font-bold text-primary">Upload Field Photo</p>
            <p className="text-xs">Identifies diseases & pests instantly</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadBox;
