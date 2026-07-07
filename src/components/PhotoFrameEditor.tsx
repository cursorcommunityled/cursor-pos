"use client";

import { Move } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  clampPhotoFrameOffset,
  computePhotoCoverLayout,
  getPhotoPreviewAspectClass,
  loadImageFromDataUrl,
  type PhotoFrameOffset,
} from "@/lib/photo-image";
import { useLocale } from "@/lib/i18n/locale-context";

interface PhotoFrameEditorProps {
  sourceDataUrl: string;
  offset: PhotoFrameOffset;
  onOffsetChange: (offset: PhotoFrameOffset) => void;
}

export function PhotoFrameEditor({
  sourceDataUrl,
  offset,
  onOffsetChange,
}: PhotoFrameEditorProps) {
  const { t } = useLocale();
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffset: PhotoFrameOffset;
    rangeX: number;
    rangeY: number;
    canPanX: boolean;
    canPanY: boolean;
  } | null>(null);

  const [frameSize, setFrameSize] = useState(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setFrameSize(entry.contentRect.width);
    });

    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    void loadImageFromDataUrl(sourceDataUrl)
      .then((image) => {
        if (!cancelled) {
          setImageSize({
            width: image.naturalWidth,
            height: image.naturalHeight,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setImageSize({ width: 0, height: 0 });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sourceDataUrl]);

  const layout = computePhotoCoverLayout(
    imageSize.width,
    imageSize.height,
    frameSize,
    offset,
  );

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!layout.canPanX && !layout.canPanY) {
      return;
    }

    const maxPanX = Math.max(0, layout.width - frameSize);
    const maxPanY = Math.max(0, layout.height - frameSize);

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: offset,
      rangeX: maxPanX,
      rangeY: maxPanY,
      canPanX: layout.canPanX,
      canPanY: layout.canPanY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    onOffsetChange(
      clampPhotoFrameOffset({
        x:
          drag.canPanX && drag.rangeX > 0
            ? drag.startOffset.x - deltaX / drag.rangeX
            : drag.startOffset.x,
        y:
          drag.canPanY && drag.rangeY > 0
            ? drag.startOffset.y - deltaY / drag.rangeY
            : drag.startOffset.y,
      }),
    );
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const photoFrameClass = getPhotoPreviewAspectClass();
  const canPan = layout.canPanX || layout.canPanY;

  return (
    <div className="space-y-2">
      <div
        ref={frameRef}
        className={`relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-900 dark:border-zinc-700 ${photoFrameClass} ${
          canPan ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
        } touch-none`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sourceDataUrl}
          alt=""
          draggable={false}
          className="absolute max-w-none select-none"
          style={{
            width: layout.width || "100%",
            height: layout.height || "100%",
            left: layout.width ? layout.left : 0,
            top: layout.height ? layout.top : 0,
          }}
        />

        {canPan ? (
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/55 to-transparent px-3 py-2 text-xs font-medium text-white transition-opacity ${
              isDragging ? "opacity-100" : "opacity-90"
            }`}
          >
            <Move className="h-3.5 w-3.5" />
            {t.camera.hintPan}
          </div>
        ) : null}
      </div>
    </div>
  );
}
