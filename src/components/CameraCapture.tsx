"use client";

import { Camera, ImagePlus, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
  photoDataUrl: string | null;
  onPhotoChange: (dataUrl: string | null) => void;
}

export function CameraCapture({ photoDataUrl, onPhotoChange }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  async function startCamera() {
    setError(null);

    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      setStream(media);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = media;
        await videoRef.current.play();
      }
    } catch {
      setError("No se pudo abrir la camara. Prueba subir una foto desde galeria.");
    }
  }

  function stopCamera() {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setIsActive(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    onPhotoChange(canvas.toDataURL("image/jpeg", 0.92));
    stopCamera();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onPhotoChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function clearPhoto() {
    onPhotoChange(null);
    stopCamera();
  }

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-800">Foto</p>
          <p className="text-sm text-zinc-600">
            {photoDataUrl ? "Foto lista para imprimir" : "Activa la camara o elige una imagen"}
          </p>
        </div>
        {photoDataUrl ? (
          <button
            type="button"
            onClick={clearPhoto}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100"
          >
            <RotateCcw className="h-4 w-4" />
            Cambiar
          </button>
        ) : null}
      </div>

      {photoDataUrl ? (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoDataUrl} alt="Foto capturada" className="w-full object-cover" />
        </div>
      ) : isActive ? (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-black">
          <video ref={videoRef} className="aspect-[3/4] w-full object-cover" playsInline muted />
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        {!photoDataUrl && !isActive ? (
          <>
            <button
              type="button"
              onClick={() => void startCamera()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              <Camera className="h-4 w-4" />
              Abrir camara
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
            >
              <ImagePlus className="h-4 w-4" />
              Subir foto
            </button>
          </>
        ) : null}

        {isActive && !photoDataUrl ? (
          <>
            <button
              type="button"
              onClick={capturePhoto}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              <Camera className="h-4 w-4" />
              Capturar
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
            >
              Cancelar
            </button>
          </>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
