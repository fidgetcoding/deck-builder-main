"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type WorkPlayerVideo = {
  src: string;
  label: string;
  thumbSrc?: string;
};

type Props = {
  videos: WorkPlayerVideo[];
};

function VolumeOnIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function VolumeOffIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

export default function WorkPlayer({ videos }: Props) {
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [thumbs, setThumbs] = useState<Map<number, string>>(new Map());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const thumbsInFlight = useRef<Set<number>>(new Set());

  const setCardRef = useCallback(
    (idx: number, el: HTMLButtonElement | null) => {
      if (el) cardRefs.current.set(idx, el);
      else cardRefs.current.delete(idx);
    },
    []
  );

  const generateThumb = useCallback(
    (idx: number, src: string) => {
      if (thumbs.has(idx) || thumbsInFlight.current.has(idx)) return;
      thumbsInFlight.current.add(idx);

      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.src = src;

      const onSeeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 320;
          canvas.height = Math.round(
            (320 * (video.videoHeight || 180)) / (video.videoWidth || 320)
          );
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            setThumbs((prev) => new Map(prev).set(idx, dataUrl));
          }
        } catch {
          // CORS or other error: leave as placeholder
        }
        thumbsInFlight.current.delete(idx);
        video.removeEventListener("seeked", onSeeked);
        video.removeAttribute("src");
        video.load();
      };

      video.addEventListener("loadedmetadata", () => {
        video.currentTime = Math.min(1, (video.duration || 2) / 2);
      });
      video.addEventListener("seeked", onSeeked);
    },
    [thumbs]
  );

  // Lazy thumbnail generation: skip when an explicit thumbSrc is provided
  useEffect(() => {
    if (!stripRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-idx"));
            const v = videos[idx];
            if (!v || v.thumbSrc) return;
            if (!thumbs.has(idx)) {
              generateThumb(idx, v.src);
            }
          }
        });
      },
      {
        root: stripRef.current,
        rootMargin: "0px 400px 0px 400px",
        threshold: 0,
      }
    );
    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos.length, generateThumb]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setCurrentTime(v.currentTime);
      if (v.duration && isFinite(v.duration)) setDuration(v.duration);
    };
    const onMeta = () => {
      if (v.duration && isFinite(v.duration)) setDuration(v.duration);
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
    };
  }, [active]);

  const onThumbClick = (idx: number) => {
    if (idx === active) return;
    setActive(idx);
    setCurrentTime(0);
    setDuration(0);
  };

  const goPrev = () => {
    setActive((a) => (a - 1 + videos.length) % videos.length);
    setCurrentTime(0);
    setDuration(0);
  };
  const goNext = () => {
    setActive((a) => (a + 1) % videos.length);
    setCurrentTime(0);
    setDuration(0);
  };

  const toggleMute = () => setMuted((m) => !m);

  const formatTime = (secs: number) => {
    if (!secs || !isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = useMemo(
    () => (duration > 0 ? currentTime / duration : 0),
    [currentTime, duration]
  );

  const current = videos[active];
  if (!current) return null;

  const chevronBaseClasses =
    "z-20 rounded-md bg-black/80 hover:bg-black active:bg-black/95 border border-white/15 flex items-center justify-center text-white transition-colors";

  const thumbFor = (idx: number) => {
    const v = videos[idx];
    return v?.thumbSrc ?? thumbs.get(idx);
  };

  return (
    <div>
      {/* Player + chevrons (chevrons positioned relative to this hero-only wrapper) */}
      <div className="relative">
        <div className="relative bg-black rounded-2xl overflow-hidden border-t-2 border-brand-green-light">
          {/* Hero video */}
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              key={current.src}
              src={current.src}
              autoPlay
              muted={muted}
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Mobile + tablet chevrons: overlaid on hero edges (lg:hidden) */}
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous video"
              className={`${chevronBaseClasses} lg:hidden absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 text-base`}
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next video"
              className={`${chevronBaseClasses} lg:hidden absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 text-base`}
            >
              &rarr;
            </button>

            {/* Bottom control bar: timecode + progress + mute toggle */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-8 sm:pt-10 pb-2 sm:pb-3 px-3 sm:px-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <p className="text-[10px] sm:text-[11px] text-white/70 tabular-nums font-semibold pointer-events-none">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </p>
                <div className="flex-1 h-0.5 bg-white/20 overflow-hidden pointer-events-none">
                  <div
                    className="h-full bg-white"
                    style={{
                      width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="text-white/80 hover:text-white transition-colors -mr-1 p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                >
                  {muted ? <VolumeOffIcon /> : <VolumeOnIcon />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop chevrons: OUTSIDE the hero, vertically centered on the hero only (lg+) */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous video"
          className={`${chevronBaseClasses} hidden lg:flex absolute right-full mr-4 xl:mr-6 top-1/2 -translate-y-1/2 w-12 h-12 text-lg`}
        >
          &larr;
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next video"
          className={`${chevronBaseClasses} hidden lg:flex absolute left-full ml-4 xl:ml-6 top-1/2 -translate-y-1/2 w-12 h-12 text-lg`}
        >
          &rarr;
        </button>
      </div>

      {/* Carousel: separated from the player by a gap, its own container */}
      <div className="mt-4 sm:mt-5 rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div
          ref={stripRef}
          className="flex gap-1.5 sm:gap-2 overflow-x-auto scroll-smooth py-2 sm:py-3 px-3 sm:px-4"
          style={{ scrollbarWidth: "none" }}
        >
          {videos.map((video, idx) => {
            const t = thumbFor(idx);
            return (
              <button
                key={video.src}
                ref={(el) => setCardRef(idx, el)}
                data-idx={idx}
                onClick={() => onThumbClick(idx)}
                className={`flex-shrink-0 flex items-center gap-2 sm:gap-3 p-2 sm:p-2 min-w-[200px] sm:min-w-[240px] min-h-[44px] rounded transition-colors text-left ${
                  idx === active ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <div className="w-16 h-10 sm:w-20 sm:h-12 bg-white/5 overflow-hidden rounded-sm flex-shrink-0">
                  {t && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={t}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.2em] font-semibold text-white truncate">
                    {video.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
