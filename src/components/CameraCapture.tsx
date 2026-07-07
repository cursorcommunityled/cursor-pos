"use client";

import { Camera, Check, ImagePlus, RefreshCw, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  cropVideoFrameToPhotoAspect,
  getPhotoPreviewAspectClass,
  normalizePhotoDataUrl,
} from "@/lib/photo-image";
import { useLocale } from "@/lib/i18n/locale-context";

interface CameraCaptureProps {
  photoDataUrl: string | null;
  onPhotoChange: (dataUrl: string | null) => void;
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

async function loadCameras(defaultLabel: string): Promise<CameraDevice[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();

  return devices
    .filter((device) => device.kind === "videoinput")
    .map((device, index) => ({
      deviceId: device.deviceId,
      label: device.label.trim() || `${defaultLabel} ${index + 1}`,
    }));
}

export function CameraCapture({ photoDataUrl, onPhotoChange }: CameraCaptureProps) {
  const { t } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isActive, setIsActive] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [lastDeviceId, setLastDeviceId] = useState<string>("");
  const [photoSource, setPhotoSource] = useState<"camera" | "upload" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream || !isActive) {
      return;
    }

    video.srcObject = stream;
    void video.play().catch(() => {
      setError(t.camera.cameraPlayError);
    });
  }, [stream, isActive]);

  useEffect(() => {
    function handleDeviceChange() {
      if (!isActive) {
        return;
      }

      void loadCameras(t.camera.cameraDefault).then(setCameras);
    }

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [isActive]);

  useEffect(() => {
    if (countdown === null) {
      return;
    }

    if (countdown === 0) {
      capturePhotoNow();
      setCountdown(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [countdown]);

  function stopStreamTracks(activeStream: MediaStream | null) {
    activeStream?.getTracks().forEach((track) => track.stop());
  }

  async function openCamera(deviceId?: string) {
    setError(null);

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: "user" },
    };

    const media = await navigator.mediaDevices.getUserMedia(constraints);
    const availableCameras = await loadCameras(t.camera.cameraDefault);
    const activeDeviceId = media.getVideoTracks()[0]?.getSettings().deviceId ?? deviceId ?? "";

    setCameras(availableCameras);
    setSelectedDeviceId(activeDeviceId);
    setLastDeviceId(activeDeviceId);
    setStream(media);
    setIsActive(true);

    return media;
  }

  async function startCamera() {
    try {
      await openCamera();
    } catch {
      setError(t.camera.cameraLoadError);
    }
  }

  async function switchCamera(deviceId: string) {
    if (!deviceId || deviceId === selectedDeviceId) {
      return;
    }

    setIsSwitching(true);
    setError(null);
    stopStreamTracks(stream);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    try {
      await openCamera(deviceId);
    } catch {
      setError(t.camera.switchError);
      try {
        await openCamera(selectedDeviceId || undefined);
      } catch {
        setIsActive(false);
        setStream(null);
      }
    } finally {
      setIsSwitching(false);
    }
  }

  function cycleCamera() {
    if (cameras.length < 2) {
      return;
    }

    const currentIndex = cameras.findIndex((camera) => camera.deviceId === selectedDeviceId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % cameras.length;
    void switchCamera(cameras[nextIndex].deviceId);
  }

  function stopCamera() {
    setCountdown(null);
    stopStreamTracks(stream);
    setStream(null);
    setIsActive(false);
    setCameras([]);
    setSelectedDeviceId("");

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function capturePhotoNow() {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (width === 0 || height === 0) {
      setError(t.camera.cameraWait);
      return;
    }

    const canvas = cropVideoFrameToPhotoAspect(video);
    setPendingPhoto(canvas.toDataURL("image/jpeg", 0.92));
    setPhotoSource("camera");
    stopCamera();
  }

  function confirmPhoto() {
    if (!pendingPhoto) {
      return;
    }

    onPhotoChange(pendingPhoto);
    setPendingPhoto(null);
  }

  async function retakePhoto() {
    setPendingPhoto(null);
    onPhotoChange(null);
    setError(null);

    if (photoSource === "upload") {
      fileInputRef.current?.click();
      return;
    }

    try {
      await openCamera(lastDeviceId || selectedDeviceId || undefined);
    } catch {
      setError(t.camera.cameraLoadError);
    }
  }

  function startCaptureCountdown() {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError(t.camera.cameraWait);
      return;
    }

    setError(null);
    setCountdown(3);
  }

  function cancelCountdown() {
    setCountdown(null);
  }

  function handleCancel() {
    if (countdown !== null) {
      cancelCountdown();
      return;
    }

    stopCamera();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        return;
      }

      void normalizePhotoDataUrl(reader.result)
        .then((normalized) => {
          setPendingPhoto(normalized);
          setPhotoSource("upload");
        })
        .catch(() => {
          setError(t.camera.imageProcessError);
        });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function clearPhoto() {
    setPendingPhoto(null);
    setPhotoSource(null);
    onPhotoChange(null);
    stopCamera();
  }

  const photoFrameClass = getPhotoPreviewAspectClass();
  const displayedPhoto = pendingPhoto ?? photoDataUrl;
  const isReviewing = pendingPhoto !== null;
  const hasConfirmedPhoto = photoDataUrl !== null && !isReviewing;
  const showCameraPicker = isActive && !displayedPhoto && cameras.length > 0;
  const isCountingDown = countdown !== null;

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-800">{t.camera.title}</p>
          <p className="text-sm text-zinc-600">
            {isReviewing
              ? t.camera.hintReview
              : hasConfirmedPhoto
                ? t.camera.hintReady
                : t.camera.hintIdle}
          </p>
        </div>
        {hasConfirmedPhoto ? (
          <button
            type="button"
            onClick={clearPhoto}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100"
          >
            <RotateCcw className="h-4 w-4" />
            {t.camera.change}
          </button>
        ) : null}
      </div>

      {showCameraPicker ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700">{t.camera.cameraLabel}</span>
            <select
              value={selectedDeviceId}
              disabled={isSwitching || isCountingDown || cameras.length < 2}
              onChange={(event) => void switchCamera(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cameras.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label}
                </option>
              ))}
            </select>
          </label>
          {cameras.length > 1 ? (
            <button
              type="button"
              onClick={cycleCamera}
              disabled={isSwitching || isCountingDown}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 sm:shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isSwitching ? "animate-spin" : ""}`} />
              {t.camera.switchCamera}
            </button>
          ) : null}
        </div>
      ) : null}

      {displayedPhoto ? (
        <div className={`overflow-hidden rounded-xl border border-zinc-200 bg-white ${photoFrameClass}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displayedPhoto} alt="Foto capturada" className="h-full w-full object-cover" />
        </div>
      ) : isActive ? (
        <div className={`relative overflow-hidden rounded-xl border border-zinc-200 bg-black ${photoFrameClass}`}>
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            playsInline
            muted
          />
          {isCountingDown && countdown !== null && countdown > 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
              <span
                key={countdown}
                className="animate-pulse text-8xl font-bold tabular-nums text-white"
              >
                {countdown}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        {!displayedPhoto && !isActive ? (
          <>
            <button
              type="button"
              onClick={() => void startCamera()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              <Camera className="h-4 w-4" />
              {t.camera.open}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
            >
              <ImagePlus className="h-4 w-4" />
              {t.camera.upload}
            </button>
          </>
        ) : null}

        {isActive && !displayedPhoto ? (
          <>
            <button
              type="button"
              onClick={startCaptureCountdown}
              disabled={isSwitching || isCountingDown}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Camera className="h-4 w-4" />
              {isCountingDown ? t.camera.preparing : t.camera.capture}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSwitching}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCountingDown ? t.camera.stop : t.camera.cancel}
            </button>
          </>
        ) : null}

        {isReviewing ? (
          <>
            <button
              type="button"
              onClick={() => void retakePhoto()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
            >
              <RefreshCw className="h-4 w-4" />
              {t.camera.retake}
            </button>
            <button
              type="button"
              onClick={confirmPhoto}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              <Check className="h-4 w-4" />
              {t.camera.usePhoto}
            </button>
          </>
        ) : null}

        {hasConfirmedPhoto ? (
          <button
            type="button"
            onClick={() => void retakePhoto()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            <RefreshCw className="h-4 w-4" />
            {t.camera.retakePhoto}
          </button>
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
