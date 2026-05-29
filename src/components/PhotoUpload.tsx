import React, { useRef, useState } from "react";
import { PhotoUpload } from "../types";
import { 
  Camera, 
  Trash2, 
  Car, 
  Gauge, 
  Compass, 
  FileText, 
  Binary, 
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface PhotoUploadProps {
  photos: PhotoUpload[];
  onChange: (updatedPhotos: PhotoUpload[]) => void;
}

const CATEGORIES = [
  { id: "front", label: "Front View", desc: "Front angle in clear light", icon: Car },
  { id: "rear", label: "Rear View", desc: "Rear angle showing tailgate", icon: Car },
  { id: "left", label: "Left Side View", desc: "Entire left flank profile", icon: Car },
  { id: "right", label: "Right Side View", desc: "Entire right flank profile", icon: Car },
  { id: "interior", label: "Cabin / Interior", desc: "Seat condition & front cabin", icon: Compass },
  { id: "dashboard", label: "Instrument Cluster", desc: "Dashboard showing live mileage", icon: Gauge },
  { id: "engine", label: "Engine Bay", desc: "Open engine bay compartment", icon: Camera },
  { id: "licence", label: "Licence Disc Holder", desc: "Circular disc block on screen", icon: FileText },
];

export default function PhotoUploadGrid({ photos, onChange }: PhotoUploadProps) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // File to base64 converter
  const handleFileProcess = (file: File, id: string, label: string) => {
    if (!file.type.startsWith("image/")) {
      alert("Invalid format. Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        // filter out old if exists or replace
        const filtered = photos.filter((p) => p.id !== id);
        const updated = [
          ...filtered,
          {
            id,
            label,
            base64,
            fileName: file.name,
          },
        ];
        onChange(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, id: string, label: string) => {
    e.preventDefault();
    setDragOverId(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0], id, label);
    }
  };

  const removePhoto = (id: string) => {
    const updated = photos.filter((p) => p.id !== id);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-black tracking-tighter uppercase text-white flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-red-600"></span>
            Vehicle Showcase Photos
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Drag files directly on blocks or click to select/capture with your mobile phone.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start bg-white/5 border border-white/10 px-3 py-1 rounded text-[10px] font-mono text-red-500 font-bold uppercase tracking-wider">
          <span>Captured:</span>
          <span>{photos.length} / 8</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => {
          const photo = photos.find((p) => p.id === cat.id);
          const IconComponent = cat.icon;
          const isDragging = dragOverId === cat.id;

          return (
            <div
              key={cat.id}
              id={`photo-box-${cat.id}`}
              onDragOver={(e) => handleDragOver(e, cat.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, cat.id, cat.label)}
              className={`relative h-28 rounded overflow-hidden border transition-all flex flex-col items-center justify-center p-2 text-center select-none ${
                photo 
                  ? "border-white/20 bg-black" 
                  : isDragging
                  ? "border-red-600 bg-red-600/10 scale-[0.98]"
                  : "border-white/10 hover:border-red-600 bg-white/5 hover:bg-white/10"
              }`}
            >
              {photo ? (
                <>
                  {/* Photo Preview Mode */}
                  <img
                    referrerPolicy="no-referrer"
                    src={photo.base64}
                    alt={cat.label}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Category Chip Overlays */}
                  <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-md text-[9px] font-black text-white px-2 py-0.5 rounded uppercase border border-white/10">
                    {cat.label}
                  </div>

                  <button
                    onClick={() => removePhoto(cat.id)}
                    className="absolute bottom-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-all hover:scale-110 shadow-lg cursor-pointer"
                    title="Remove Image"
                    type="button"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  {/* Upload Prompt Mode */}
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-1">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileProcess(e.target.files[0], cat.id, cat.label);
                        }
                      }}
                      className="hidden"
                    />

                    <IconComponent className={`w-4 h-4 mb-2 ${isDragging ? "text-red-500 animate-bounce" : "text-gray-400"}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                      {cat.label}
                    </span>
                    <span className="text-[9px] text-gray-500 mt-0.5 max-w-full truncate">
                      {cat.desc}
                    </span>
                  </label>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
