/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

interface WishItem {
  id: string;
  name: string;
  status?: string;
  time: string;
  message: string;
  isNew?: boolean;
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  destroy: () => void;
}

interface YTPlayerEvent {
  target: YTPlayer;
  data?: number;
}

interface YTNamespace {
  Player: new (
    element: HTMLElement | string,
    options: {
      height?: string | number;
      width?: string | number;
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: YTPlayerEvent) => void;
        onStateChange?: (event: YTPlayerEvent) => void;
      };
    }
  ) => YTPlayer;
  PlayerState?: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YOUTUBE_VIDEO_ID = 'OOO4ROO_sPM';

const INITIAL_WISHES: WishItem[] = [
  {
    id: 'wish-1',
    name: 'Bagas & Riana',
    time: 'Baru saja',
    message:
      'Selamat Mutiara & Daffa! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah selamanya.',
  },
  {
    id: 'wish-2',
    name: 'Fadhil Ramadhan',
    time: '1 jam lalu',
    message:
      'Barakallah bro Daffa & Mutiara! Lancar terus sampai hari H ya, selamat berbahagia.',
  },
  {
    id: 'wish-3',
    name: 'Nadia Safitri',
    time: '3 jam lalu',
    message:
      'Mutiara cantik sekali! Happy wedding yaa, langgeng sampai kakek nenek!',
  },
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const ytReadyRef = useRef(false);
  const shouldPlayRef = useRef(false);

  const [countdown, setCountdown] = useState({
    days: '25',
    hours: '20',
    minutes: '27',
    seconds: '12',
  });
  const [secFlash, setSecFlash] = useState(false);

  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState('Nomor rekening berhasil disalin!');
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  const [guestName, setGuestName] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('Hadir');
  const [guestMessage, setGuestMessage] = useState('');
  const [wishes, setWishes] = useState<WishItem[]>(INITIAL_WISHES);
  const [countPop, setCountPop] = useState(false);

  // Initialize YouTube IFrame Player for background music
  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!isMounted || !ytContainerRef.current || ytPlayerRef.current || !window.YT?.Player) {
        return;
      }

      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        height: '200',
        width: '200',
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          loop: 1,
          modestbranding: 1,
          playlist: YOUTUBE_VIDEO_ID,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            ytReadyRef.current = true;
            event.target.setVolume(80);
            if (shouldPlayRef.current) {
              event.target.unMute();
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            const playingState = window.YT?.PlayerState?.PLAYING ?? 1;
            const pausedState = window.YT?.PlayerState?.PAUSED ?? 2;
            const endedState = window.YT?.PlayerState?.ENDED ?? 0;

            if (event.data === playingState) {
              setIsPlaying(true);
            } else if (event.data === pausedState) {
              setIsPlaying(false);
            } else if (event.data === endedState) {
              event.target.playVideo();
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReady === 'function') {
          previousReady();
        }
        initPlayer();
      };

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
      }
    }

    return () => {
      isMounted = false;
      ytReadyRef.current = false;
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
    };
  }, []);

  // Lock scroll on View 1 (Cover), unlock & reset scroll to top on View 2 (Invitation)
  useEffect(() => {
    if (!isInvitationOpen) {
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isInvitationOpen]);

  const startMusicPlayback = () => {
    shouldPlayRef.current = true;
    setIsPlaying(true);
    if (ytReadyRef.current && ytPlayerRef.current) {
      ytPlayerRef.current.unMute();
      ytPlayerRef.current.playVideo();
    }
  };

  const toggleMusicPlayback = () => {
    if (isPlaying) {
      shouldPlayRef.current = false;
      setIsPlaying(false);
      if (ytReadyRef.current && ytPlayerRef.current) {
        ytPlayerRef.current.pauseVideo();
      }
    } else {
      startMusicPlayback();
    }
  };

  const handleOpenInvitation = () => {
    if (isOpening || isInvitationOpen) return;
    startMusicPlayback();
    setIsOpening(true);
    window.setTimeout(() => {
      setIsInvitationOpen(true);
      setIsOpening(false);
    }, 420);
  };

  // Falling Petals & Fairy Sparkles Continuous Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.vx = (e.clientX - mouse.lastX) * 0.15;
      mouse.vy = (e.clientY - mouse.lastY) * 0.15;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    const petalColors = [
      { r: 251, g: 207, b: 232, type: 'pink' },
      { r: 244, g: 182, b: 209, type: 'pink' },
      { r: 162, g: 190, b: 226, type: 'blue' },
      { r: 143, g: 168, b: 207, type: 'periwinkle' },
      { r: 219, g: 234, b: 254, type: 'iceBlue' },
      { r: 255, g: 255, b: 255, type: 'white' },
    ];

    const TOTAL_PETALS = Math.min(80, Math.floor(window.innerWidth / 18));
    const TOTAL_SPARKLES = 45;

    class Petal {
      x = 0;
      y = 0;
      depth = 0;
      size = 0;
      color = petalColors[0];
      opacity = 0;
      speedY = 0;
      speedX = 0;
      swayAngle = 0;
      swaySpeed = 0;
      swayDistance = 0;
      rotation = 0;
      rotationSpeed = 0;
      flip = 0;
      flipSpeed = 0;
      curvature = 0;
      extraVx = 0;
      extraVy = 0;

      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * (width + 120) - 60;
        this.y = initial ? Math.random() * height : -40;
        this.depth = Math.random();
        this.size = (Math.random() * 14 + 10) * (0.65 + this.depth * 0.6);
        this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
        this.opacity = (Math.random() * 0.45 + 0.45) * (0.65 + this.depth * 0.35);
        this.speedY = (Math.random() * 1.3 + 0.75) * (0.7 + this.depth * 0.5);
        this.speedX = Math.random() * 0.8 - 0.4;
        this.swayAngle = Math.random() * Math.PI * 2;
        this.swaySpeed = Math.random() * 0.02 + 0.012;
        this.swayDistance = Math.random() * 2.4 + 1.0;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 1.8;
        this.flip = Math.random() * Math.PI;
        this.flipSpeed = Math.random() * 0.035 + 0.01;
        this.curvature = Math.random() * 0.35 + 0.75;
        this.extraVx = 0;
        this.extraVy = 0;
      }

      update() {
        this.swayAngle += this.swaySpeed;
        this.flip += this.flipSpeed;
        this.rotation += this.rotationSpeed;

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 0) {
          const force = (140 - dist) / 140;
          this.extraVx += (dx / dist) * force * 2.0 + mouse.vx * 0.25;
          this.extraVy += (dy / dist) * force * 1.4 + mouse.vy * 0.25;
        }

        this.extraVx *= 0.94;
        this.extraVy *= 0.94;

        this.x += Math.sin(this.swayAngle) * this.swayDistance + this.speedX + this.extraVx;
        this.y += this.speedY + this.extraVy;

        if (this.y > height + 40 || this.x < -70 || this.x > width + 70) {
          this.reset(false);
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate((this.rotation * Math.PI) / 180);
        context.scale(Math.cos(this.flip), 1);

        context.beginPath();
        context.moveTo(0, 0);
        context.bezierCurveTo(
          -this.size * 0.55 * this.curvature,
          -this.size * 0.35,
          -this.size * 0.65,
          this.size * 0.8,
          0,
          this.size
        );
        context.bezierCurveTo(
          this.size * 0.65,
          this.size * 0.8,
          this.size * 0.55 * this.curvature,
          -this.size * 0.35,
          0,
          0
        );
        context.closePath();

        const gradient = context.createLinearGradient(0, -this.size * 0.2, 0, this.size);
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`);
        gradient.addColorStop(0.75, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.8})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity * 0.4})`);

        context.fillStyle = gradient;
        context.fill();

        context.beginPath();
        context.moveTo(0, this.size * 0.1);
        context.quadraticCurveTo(this.size * 0.05, this.size * 0.5, 0, this.size * 0.85);
        context.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.65})`;
        context.lineWidth = 0.8;
        context.stroke();

        context.restore();
      }
    }

    class Sparkle {
      x = 0;
      y = 0;
      size = 0;
      speedY = 0;
      speedX = 0;
      alpha = 0;
      twinkleSpeed = 0;
      twinkleVal = 0;
      goldToned = false;

      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -10;
        this.size = Math.random() * 2.5 + 0.8;
        this.speedY = Math.random() * 0.4 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.7 + 0.3;
        this.twinkleSpeed = Math.random() * 0.04 + 0.02;
        this.twinkleVal = Math.random() * Math.PI;
        this.goldToned = Math.random() > 0.4;
      }

      update() {
        this.twinkleVal += this.twinkleSpeed;
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.twinkleVal * 0.5) * 0.3;
        if (this.y > height + 10) {
          this.reset(false);
        }
      }

      draw(context: CanvasRenderingContext2D) {
        const dynamicAlpha = (Math.sin(this.twinkleVal) * 0.5 + 0.5) * this.alpha;
        context.save();
        context.translate(this.x, this.y);
        context.fillStyle = this.goldToned
          ? `rgba(227, 190, 119, ${dynamicAlpha})`
          : `rgba(162, 190, 226, ${dynamicAlpha})`;

        context.beginPath();
        context.moveTo(0, -this.size * 2);
        context.lineTo(this.size * 0.5, -this.size * 0.5);
        context.lineTo(this.size * 2, 0);
        context.lineTo(this.size * 0.5, this.size * 0.5);
        context.lineTo(0, this.size * 2);
        context.lineTo(-this.size * 0.5, this.size * 0.5);
        context.lineTo(-this.size * 2, 0);
        context.lineTo(-this.size * 0.5, -this.size * 0.5);
        context.closePath();
        context.fill();
        context.restore();
      }
    }

    const petals = Array.from({ length: TOTAL_PETALS }, () => new Petal());
    const sparkles = Array.from({ length: TOTAL_SPARKLES }, () => new Sparkle());
    let animationFrameId = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < sparkles.length; i++) {
        sparkles[i].update();
        sparkles[i].draw(ctx);
      }

      for (let i = 0; i < petals.length; i++) {
        petals[i].update();
        petals[i].draw(ctx);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Intersection Observer Scroll Reveal
  useEffect(() => {
    if (!isInvitationOpen) return;
    const revealElements = document.querySelectorAll('.reveal-item');

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [isInvitationOpen]);

  // Wedding Countdown Timer (December 13, 2026 10:00:00)
  useEffect(() => {
    const weddingDate = new Date('December 13, 2026 10:00:00').getTime();
    let prevSec = '';
    let flashTimeout: number | undefined;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance < 0) {
        setCountdown({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
        });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const secStr = String(seconds).padStart(2, '0');
      if (prevSec !== secStr) {
        prevSec = secStr;
        setSecFlash(true);
        window.clearTimeout(flashTimeout);
        flashTimeout = window.setTimeout(() => setSecFlash(false), 300);
      }

      setCountdown({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: secStr,
      });
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(flashTimeout);
    };
  }, []);

  const copyToClipboard = (text: string, accountName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setToastMessage(`Nomor rekening ${accountName} berhasil disalin! ✨`);
      setShowToast(true);
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = window.setTimeout(() => {
        setShowToast(false);
      }, 3200);
    });
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = guestName.trim();
    const message = guestMessage.trim();
    if (!name || !message) return;

    const newWish: WishItem = {
      id: `wish-${Date.now()}`,
      name,
      status: attendanceStatus,
      time: 'Baru saja',
      message,
      isNew: true,
    };

    setWishes((prev) => [newWish, ...prev]);
    setCountPop(true);
    window.setTimeout(() => setCountPop(false), 350);

    setGuestName('');
    setAttendanceStatus('Hadir');
    setGuestMessage('');
  };

  return (
    <div className="font-body text-slate-800 bg-[#f4f8fc] overflow-x-hidden selection:bg-powderBlue selection:text-midnight relative">
      {/* BEGIN: Ambient Romantic Falling Floral Petals & Sparkle Canvas */}
      <canvas ref={canvasRef} aria-hidden="true" id="petals-canvas" />
      {/* END: Ambient Romantic Falling Floral Petals & Sparkle Canvas */}

      {/* BEGIN: Floating Botanical Corner Accents (Fixed Ambient Overlay) */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-30 w-48 sm:w-64 md:w-80 animate-floral-left opacity-90 drop-shadow-md"
      >
        <svg className="w-full h-auto filter drop-shadow-sm" fill="none" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
          <path d="M-20 -20 C60 10, 110 70, 150 140 C120 110, 70 80, -20 60 Z" fill="#8fa8cf" fillOpacity="0.3" />
          <path d="M-10 -10 C70 40, 130 90, 180 180 C150 130, 90 90, -10 40 Z" fill="#416788" fillOpacity="0.25" />
          <path d="M20 15 C45 35, 60 70, 50 90 C35 75, 25 50, 20 15 Z" fill="#A2BEE2" fillOpacity="0.65" />
          <path d="M60 40 C95 45, 125 75, 115 105 C90 95, 75 70, 60 40 Z" fill="#fbcfe8" fillOpacity="0.65" />
          <path d="M30 65 C60 85, 80 120, 65 145 C45 125, 35 95, 30 65 Z" fill="#dbeafe" fillOpacity="0.75" />
          <circle cx="50" cy="50" fill="#e3be77" fillOpacity="0.8" r="10" />
          <circle cx="50" cy="50" fill="#ffffff" fillOpacity="0.9" r="5" />
          <path d="M0 0 Q90 50 120 160 T160 210" fill="none" stroke="#8fa8cf" strokeDasharray="2 3" strokeOpacity="0.6" strokeWidth="1.8" />
          <circle cx="120" cy="160" fill="#A2BEE2" r="4" />
          <circle cx="160" cy="210" fill="#fbcfe8" r="3" />
        </svg>
      </div>
      <div
        aria-hidden="true"
        className="fixed top-0 right-0 pointer-events-none z-30 w-48 sm:w-64 md:w-80 animate-floral-right opacity-90 drop-shadow-md"
      >
        <svg className="w-full h-auto filter drop-shadow-sm" fill="none" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
          <path d="M280 -20 C200 10, 150 70, 110 140 C140 110, 190 80, 280 60 Z" fill="#8fa8cf" fillOpacity="0.3" />
          <path d="M270 -10 C190 40, 130 90, 80 180 C110 130, 170 90, 270 40 Z" fill="#416788" fillOpacity="0.25" />
          <path d="M240 15 C215 35, 200 70, 210 90 C225 75, 235 50, 240 15 Z" fill="#A2BEE2" fillOpacity="0.65" />
          <path d="M200 40 C165 45, 135 75, 145 105 C170 95, 185 70, 200 40 Z" fill="#fbcfe8" fillOpacity="0.65" />
          <path d="M230 65 C200 85, 180 120, 195 145 C215 125, 225 95, 230 65 Z" fill="#dbeafe" fillOpacity="0.75" />
          <circle cx="210" cy="50" fill="#e3be77" fillOpacity="0.8" r="10" />
          <circle cx="210" cy="50" fill="#ffffff" fillOpacity="0.9" r="5" />
          <path d="M260 0 Q170 50 140 160 T100 210" fill="none" stroke="#8fa8cf" strokeDasharray="2 3" strokeOpacity="0.6" strokeWidth="1.8" />
          <circle cx="140" cy="160" fill="#A2BEE2" r="4" />
          <circle cx="100" cy="210" fill="#fbcfe8" r="3" />
        </svg>
      </div>
      {/* END: Floating Botanical Corner Accents */}

      {/* Hidden YouTube Background Music Player */}
      <div
        aria-hidden="true"
        className="fixed bottom-0 right-0 w-px h-px opacity-0 pointer-events-none overflow-hidden"
      >
        <div ref={ytContainerRef} />
      </div>

      {/* BEGIN: Audio Controller Widget */}
      <aside className="fixed bottom-6 right-6 z-50 flex items-center gap-3" data-purpose="audio-controller">
        <button
          aria-label={isPlaying ? 'Jeda Musik Undangan' : 'Putar Musik Undangan'}
          className={`relative group p-3.5 bg-midnight/90 text-powderBlue rounded-full shadow-2xl border border-powderBlue/50 hover:bg-steelBlue transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer ${
            isPlaying ? 'card-aura-glow' : ''
          }`}
          id="musicToggleBtn"
          onClick={toggleMusicPlayback}
          type="button"
        >
          <div
            className="absolute inset-1 rounded-full border border-dashed border-powderBlue/40 animate-spin-slow pointer-events-none"
            id="musicVinylRing"
            style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
          />
          <div
            className="flex items-end gap-0.5 mr-2 h-4"
            id="audioEqualizer"
            style={{ opacity: isPlaying ? 1 : 0.3 }}
          >
            <span className="w-1 bg-powderBlue rounded-full eq-bar-1 inline-block" />
            <span className="w-1 bg-white rounded-full eq-bar-2 inline-block" />
            <span className="w-1 bg-powderBlue rounded-full eq-bar-3 inline-block" />
          </div>
          <svg
            className="w-5 h-5 fill-current block relative z-10 transition-transform group-hover:scale-110"
            id="musicIconPlay"
            viewBox="0 0 24 24"
          >
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </button>
      </aside>
      {/* END: Audio Controller Widget */}

      {/* TAMPILAN 1: Hero Cover Section */}
      {!isInvitationOpen && (
      <header
        className={`relative min-h-dvh flex items-center justify-center text-center px-4 overflow-hidden bg-gradient-to-b from-midnight via-[#183a66] to-steelBlue text-white transition-all duration-500 ease-out ${
          isOpening ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        }`}
        id="cover"
        style={{
          backgroundImage:
            'linear-gradient(rgba(17, 36, 68, 0.78), rgba(17, 47, 88, 0.72), rgba(15, 23, 42, 0.88)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuC46r7rxCUNSMdVXC24XhhjxXNilDumZZ3RuFkZi3A8ImjyxUzWsa9GdxREIS7d0QXSY2cRrv6EW8xlOTXGjZHrCSzv4__z4jNEchYJlTmMsqOBGn4fQpZhwD-DCY2hG1zr1hWtXfXN_1aUkovBMKobnFtLipgwMbd7jxMtcv5dI_QTlt2WT-Zq32aLcztrT4yyX_N3RpCnTVkJuNmtvF9QhyEkRR6XC5xBth1BliklenayEEhSRByl-w")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 25%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-powderBlue/25 via-transparent to-black/50" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-powderBlue/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cornflower/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-[500px] h-[500px] rounded-full border border-powderBlue/20 border-dashed animate-spin-slow pointer-events-none hidden md:block" />
        <div className="absolute w-[620px] h-[620px] rounded-full border border-white/10 pointer-events-none hidden md:block" />
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center py-10 sm:py-16 animate-soft-float">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-powderBlue/50 bg-midnight/70 backdrop-blur-md text-powderBlue text-xs uppercase tracking-widest mb-4 sm:mb-6 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-powderBlue animate-ping" />
            <span>The Wedding Celebration</span>
          </div>
          <p className="font-serifHeading tracking-[0.3em] text-sm uppercase text-iceBlue mb-2 sm:mb-3 drop-shadow">
            Walimatul &apos;Ursy
          </p>
          <h1 className="font-script text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-white via-powderBlue to-white my-2 sm:my-3 drop-shadow-lg tracking-wide hover:scale-105 transition-transform duration-700">
            Mutiara &amp; Daffa
          </h1>
          <p className="font-light text-slate-200 max-w-xl mx-auto text-sm md:text-base leading-relaxed my-3 sm:my-4 italic drop-shadow-sm">
            &quot;Dan diantara tanda-tanda kekuasaan-Nya adalah diciptakannya untukmu pasangan hidup dari jenismu sendiri supaya kamu merasa tentram disampingnya dan dijadikannya kasih sayang diantara kamu. Sesungguhnya yang demikian itu menjadi tanda kebesaran Allah bagi orang yang berpikir&quot;
            <span className="block text-xs not-italic text-powderBlue mt-2 font-serifHeading tracking-wider">
              (QS. Ar Ruum : 21)
            </span>
          </p>

          {/* Countdown Component with Neon Aura */}
          <div className="grid grid-cols-4 gap-2.5 md:gap-4 my-5 sm:my-8 text-center w-full max-w-md" data-purpose="countdown-container">
            <div className="glass-card-dark p-3.5 rounded-2xl border border-powderBlue/40 shadow-lg hover:border-powderBlue transition">
              <span className="block text-2xl md:text-3xl font-bold font-serifHeading text-powderBlue transition-all duration-300 drop-shadow" id="days">
                {countdown.days}
              </span>
              <span className="text-[10px] md:text-xs tracking-wider uppercase text-iceBlue font-medium">Hari</span>
            </div>
            <div className="glass-card-dark p-3.5 rounded-2xl border border-powderBlue/40 shadow-lg hover:border-powderBlue transition">
              <span className="block text-2xl md:text-3xl font-bold font-serifHeading text-powderBlue transition-all duration-300 drop-shadow" id="hours">
                {countdown.hours}
              </span>
              <span className="text-[10px] md:text-xs tracking-wider uppercase text-iceBlue font-medium">Jam</span>
            </div>
            <div className="glass-card-dark p-3.5 rounded-2xl border border-powderBlue/40 shadow-lg hover:border-powderBlue transition">
              <span className="block text-2xl md:text-3xl font-bold font-serifHeading text-powderBlue transition-all duration-300 drop-shadow" id="minutes">
                {countdown.minutes}
              </span>
              <span className="text-[10px] md:text-xs tracking-wider uppercase text-iceBlue font-medium">Menit</span>
            </div>
            <div className="glass-card-dark p-3.5 rounded-2xl border border-powderBlue/40 shadow-lg hover:border-powderBlue transition">
              <span
                className={`block text-2xl md:text-3xl font-bold font-serifHeading transition-all duration-300 drop-shadow ${
                  secFlash ? 'text-white scale-110' : 'text-powderBlue'
                }`}
                id="seconds"
              >
                {countdown.seconds}
              </span>
              <span className="text-[10px] md:text-xs tracking-wider uppercase text-iceBlue font-medium">Detik</span>
            </div>
          </div>

          {/* Action Button to enter View 2 */}
          <button
            className="btn-interactive pulse-glow mt-4 inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-steelBlue to-midnight border border-powderBlue/70 text-white rounded-full font-medium tracking-wide shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
            onClick={handleOpenInvitation}
            type="button"
          >
            <svg className="w-5 h-5 fill-current text-powderBlue animate-bounce" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="tracking-wider">Buka Undangan</span>
          </button>
        </div>
      </header>
      )}
      {/* END: Hero Cover Section */}

      {/* TAMPILAN 2: Isi Undangan */}
      {isInvitationOpen && (
      <div className="animate-fade-in-view">
      <main className="relative z-10">
        {/* BEGIN: Couple Profile Section */}
        <section className="py-24 px-4 max-w-6xl mx-auto relative overflow-hidden" id="couple">
          {/* Section Wind Breeze Botanical Ornaments (Left & Right) */}
          <div aria-hidden="true" className="absolute -left-12 top-16 w-36 md:w-48 opacity-45 pointer-events-none animate-floral-left">
            <svg className="w-full h-auto text-steelBlue" fill="none" viewBox="0 0 100 100">
              <path d="M10 90 Q30 40 85 20 Q50 65 10 90" fill="#A2BEE2" fillOpacity="0.3" />
              <path d="M15 85 C35 60 65 50 80 25 C60 50 40 75 15 85 Z" fill="#fbcfe8" fillOpacity="0.4" />
              <circle cx="85" cy="20" fill="#e3be77" r="4" />
            </svg>
          </div>
          <div aria-hidden="true" className="absolute -right-12 bottom-12 w-36 md:w-48 opacity-45 pointer-events-none animate-floral-right">
            <svg className="w-full h-auto text-steelBlue" fill="none" viewBox="0 0 100 100">
              <path d="M90 90 Q70 40 15 20 Q50 65 90 90" fill="#8fa8cf" fillOpacity="0.3" />
              <path d="M85 85 C65 60 35 50 20 25 C40 50 60 75 85 85 Z" fill="#fbcfe8" fillOpacity="0.4" />
              <circle cx="15" cy="20" fill="#A2BEE2" r="4" />
            </svg>
          </div>

          <div className="text-center mb-16 reveal-item">
            <p className="text-xs md:text-sm font-semibold tracking-widest text-steelBlue uppercase">
              Maha suci Allah SWT, yang telah menciptakan makhluk-Nya berpasang-pasangan
            </p>
            <h2 className="font-serifHeading text-3xl md:text-4xl text-midnight font-bold mt-2">
              Mempelai Bahagia
            </h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-powderBlue to-transparent mx-auto mt-4 rounded-full" />
            <p className="max-w-xl mx-auto text-slate-600 text-sm mt-3">
              Ya Allah, perkenankanlah pernikahan putra-putri kami:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Bride Card (Mutiara) with Shimmer Border Wrapper & Pulsing Rings */}
            <div className="reveal-item">
              <div className="p-[1.5px] rounded-3xl shimmer-border-box shadow-xl animate-card-float">
                <article className="glass-card card-aura-glow rounded-3xl p-8 text-center relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-powderBlue/25 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-all duration-700" />
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    {/* Dual Glowing Dynamic Aura Rings */}
                    <div className="absolute -inset-3 rounded-full avatar-glow-ring pointer-events-none" />
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-steelBlue animate-spin-slow" />
                    <div className="absolute -inset-1 rounded-full border border-powderBlue/60 animate-spin-reverse" />
                    <img
                      alt="Mutiara Afdelani"
                      className="relative z-10 w-full h-full object-cover rounded-full p-2.5 shadow-md group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuABCQhCvTIjgWwA4BlyDBc7wzMC9hEQcLs45mx-D_0uVK4NLTSMDtm1-b_QXJSQG69Qf1JNKpoX9lmiywxscrItveLKdmKLVaia0R0Y-RpRXkSM5pkSv5jMK_uTR1kl4_lUtieXkAC-HAe8H2w9Q4ynHuK7yMYdiFR_32pYd7mbQ32-deR0QAB3oq3pphUQ7hczOfnH3m8E4tq9GnfH3VeGHLy1NyzfxlAfWgxdxbWL0H0fIyN6YYcAyw"
                      style={{ objectFit: 'cover', objectPosition: 'center center' }}
                    />
                  </div>
                  <h3 className="font-serifHeading text-2xl font-bold text-midnight group-hover:text-steelBlue transition-colors">
                    Mutiara Afdelani
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-steelBlue font-semibold mt-1">
                    Putri Kedua dari
                  </p>
                  <p className="text-sm font-medium text-slate-700 mt-1">Bpk. Syafridel &amp; Ibu Nofrianetis</p>
                  <p className="text-xs text-slate-500 mt-2 italic">Perum Parahiyangan Kencana Blok E26 No.9</p>
                  <div className="flex justify-center gap-3 mt-6">
                    <a
                      aria-label="Instagram Mutiara"
                      className="btn-interactive p-2.5 rounded-full bg-softSky text-steelBlue hover:bg-midnight hover:text-white transition duration-300 shadow-sm"
                      href="#"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  </div>
                </article>
              </div>
            </div>

            {/* Groom Card (Daffa) with Shimmer Border Wrapper & Pulsing Rings */}
            <div className="reveal-item">
              <div
                className="p-[1.5px] rounded-3xl shimmer-border-box shadow-xl animate-card-float"
                style={{ animationDelay: '1.5s' }}
              >
                <article className="glass-card card-aura-glow rounded-3xl p-8 text-center relative overflow-hidden group">
                  <div className="absolute -top-12 -left-12 w-32 h-32 bg-steelBlue/25 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-all duration-700" />
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    {/* Dual Glowing Dynamic Aura Rings */}
                    <div
                      className="absolute -inset-3 rounded-full avatar-glow-ring pointer-events-none"
                      style={{ animationDelay: '1s' }}
                    />
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-cornflower animate-spin-slow" />
                    <div className="absolute -inset-1 rounded-full border border-steelBlue/60 animate-spin-reverse" />
                    <img
                      alt="Foto Daffa Aria Gunawan"
                      className="relative z-10 w-full h-full object-cover rounded-full p-2.5 shadow-md group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYQRBYQo2djIeByydCGNk9r5K2jOAamzl6hpwZUN2dtW5jlU-WJ_NH_5MVIxbnwdKfxM5jmNg4yIfTd5qtkYPTgNWnEDnY9vKE2y2B7S6PpnqOaTBfHGKJMAniE1U1ezGnqMKVVWubKN7YNBDmL4Glr61EWDxeo-UWqhIY4eaEocDmoQ3HWbKBSmgblNUkyXULyApUiyquYVtH6RDrSBZ57DSBdUKmdVTJHN8xEji6mAwaf0XiLib4Rw"
                    />
                  </div>
                  <h3 className="font-serifHeading text-2xl font-bold text-midnight group-hover:text-steelBlue transition-colors">
                    Daffa Aria Gunawan
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-steelBlue font-semibold mt-1">
                    Putra Pertama dari
                  </p>
                  <p className="text-sm font-medium text-slate-700 mt-1">Bpk. Iwan Gunawan &amp; Ibu Aneu Anggraeni</p>
                  <p className="text-xs text-slate-500 mt-2 italic">
                    Kp. Gantungan No.7, RT.002 RW.022, Cimenyan, Kec. Cimenyan
                  </p>
                  <div className="flex justify-center gap-3 mt-6">
                    <a
                      aria-label="Instagram Daffa"
                      className="btn-interactive p-2.5 rounded-full bg-softSky text-steelBlue hover:bg-midnight hover:text-white transition duration-300 shadow-sm"
                      href="#"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>
        {/* END: Couple Profile Section */}

        {/* BEGIN: Love Story Timeline Section */}
        <section className="py-20 bg-gradient-to-b from-[#f4f8fc] via-softSky/60 to-[#f4f8fc] px-4 relative overflow-hidden">
          {/* Swaying Botanical Vector Overlay on Edges */}
          <div aria-hidden="true" className="absolute -left-8 top-1/4 w-32 md:w-44 opacity-40 pointer-events-none animate-floral-left">
            <svg className="w-full h-auto" fill="none" viewBox="0 0 120 120">
              <path d="M0 60 C30 20 70 30 110 10 C80 50 60 90 0 60 Z" fill="#A2BEE2" fillOpacity="0.35" />
              <circle cx="110" cy="10" fill="#fbcfe8" r="5" />
            </svg>
          </div>
          <div aria-hidden="true" className="absolute -right-8 top-1/2 w-32 md:w-44 opacity-40 pointer-events-none animate-floral-right">
            <svg className="w-full h-auto" fill="none" viewBox="0 0 120 120">
              <path d="M120 60 C90 20 50 30 10 10 C40 50 60 90 120 60 Z" fill="#8fa8cf" fillOpacity="0.35" />
              <circle cx="10" cy="10" fill="#e3be77" r="5" />
            </svg>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 reveal-item">
              <p className="text-sm font-semibold tracking-widest text-steelBlue uppercase">Perjalanan Kasih</p>
              <h2 className="font-serifHeading text-3xl font-bold text-midnight">Kisah Cinta Kami</h2>
              <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-powderBlue to-transparent mx-auto mt-3" />
            </div>
            {/* Timeline with Flowing Shimmer Light Beam */}
            <div className="relative border-l-2 border-powderBlue/70 ml-4 md:ml-32 space-y-12">
              <div className="timeline-shimmer-beam" />
              {/* Story Event 1 */}
              <div className="relative pl-8 group reveal-item">
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-steelBlue border-4 border-white shadow group-hover:scale-125 transition-transform duration-300 animate-ping opacity-75" />
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-steelBlue border-4 border-white shadow group-hover:scale-125 transition-transform duration-300" />
                <div className="glass-card card-aura-glow p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                  <span className="text-xs font-semibold text-cornflower uppercase tracking-wider">Awal Bertemu</span>
                  <h4 className="font-serifHeading text-lg font-bold text-midnight mt-1">Pertemuan Pertama</h4>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                    Pertemuan berharga yang membuka lembaran persahabatan hangat, berbagi cerita, impian, dan saling mengenal satu sama lain dengan penuh kebaikan.
                  </p>
                </div>
              </div>
              {/* Story Event 2 */}
              <div className="relative pl-8 group reveal-item">
                <span
                  className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-powderBlue border-4 border-white shadow group-hover:scale-125 transition-transform duration-300 animate-ping opacity-75"
                  style={{ animationDelay: '1.2s' }}
                />
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-powderBlue border-4 border-white shadow group-hover:scale-125 transition-transform duration-300" />
                <div className="glass-card card-aura-glow p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                  <span className="text-xs font-semibold text-cornflower uppercase tracking-wider">Komitmen Hati</span>
                  <h4 className="font-serifHeading text-lg font-bold text-midnight mt-1">Menjalin Hubungan</h4>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                    Dengan restu keluarga dan ketetapan hati, kami meyakinkan diri untuk melangkah ke jenjang yang lebih serius dalam ikatan suci pernikahan.
                  </p>
                </div>
              </div>
              {/* Story Event 3 */}
              <div className="relative pl-8 group reveal-item">
                <span
                  className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-midnight border-4 border-white shadow group-hover:scale-125 transition-transform duration-300 animate-ping opacity-75"
                  style={{ animationDelay: '2s' }}
                />
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-midnight border-4 border-white shadow group-hover:scale-125 transition-transform duration-300" />
                <div className="glass-card card-aura-glow p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                  <span className="text-xs font-semibold text-cornflower uppercase tracking-wider">Menuju Halal</span>
                  <h4 className="font-serifHeading text-lg font-bold text-midnight mt-1">Menuju Hari Bahagia</h4>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                    Menyatukan dua keluarga besar dalam doa dan harapan agar bahtera rumah tangga kami senantiasa diberkahi sakinah, mawaddah, warahmah.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: Love Story Timeline Section */}

        {/* BEGIN: Events Schedule Section */}
        <section className="py-24 px-4 max-w-5xl mx-auto relative overflow-hidden" id="events">
          {/* Swaying Botanical Vector Side Accents */}
          <div aria-hidden="true" className="absolute -left-12 top-20 w-40 opacity-40 pointer-events-none animate-floral-left">
            <svg fill="none" viewBox="0 0 100 100">
              <path d="M0 20 Q40 40 70 90 Q30 70 0 20" fill="#fbcfe8" fillOpacity="0.45" />
              <path d="M10 10 Q60 30 80 80" stroke="#8fa8cf" strokeDasharray="2 3" strokeWidth="1.5" />
            </svg>
          </div>
          <div aria-hidden="true" className="absolute -right-12 bottom-20 w-40 opacity-40 pointer-events-none animate-floral-right">
            <svg fill="none" viewBox="0 0 100 100">
              <path d="M100 20 Q60 40 30 90 Q70 70 100 20" fill="#A2BEE2" fillOpacity="0.45" />
              <path d="M90 10 Q40 30 20 80" stroke="#416788" strokeDasharray="2 3" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="text-center mb-16 reveal-item">
            <p className="text-sm font-semibold tracking-widest text-steelBlue uppercase">
              Assalamualaikum Warahmatullahi Wabarakatuh
            </p>
            <h2 className="font-serifHeading text-3xl md:text-4xl font-bold text-midnight mt-1">
              Waktu &amp; Tempat Acara
            </h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-powderBlue to-transparent mx-auto mt-3" />
            <p className="max-w-2xl mx-auto text-slate-600 text-sm mt-4 leading-relaxed">
              Dengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan Resepsi Pernikahan putra-putri kami yang Insya Allah akan dilaksanakan pada :
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Akad Nikah Card */}
            <div className="reveal-item">
              <div className="p-[1.5px] rounded-3xl shimmer-border-box shadow-lg h-full">
                <div className="glass-card card-aura-glow rounded-3xl p-8 text-center flex flex-col justify-between h-full group">
                  <div>
                    <div className="w-16 h-16 bg-softSky rounded-full flex items-center justify-center mx-auto mb-4 text-midnight group-hover:scale-110 transition-transform duration-300 shadow-inner animate-soft-float">
                      <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                      </svg>
                    </div>
                    <h3 className="font-serifHeading text-2xl font-bold text-midnight mb-2">Akad Nikah</h3>
                    <p className="text-steelBlue font-bold text-base mb-4 tracking-wide uppercase">MINGGU, 13 Desember 2026</p>
                    <div className="text-slate-600 text-sm space-y-2 mb-6 border-y border-powderBlue/40 py-4">
                      <p>
                        <strong>Pukul:</strong> 10.00 WIB s/d selesai
                      </p>
                      <p>
                        <strong>Tempat:</strong> Wisma Karya RW 06
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        Jl. Ibu Inggit Garnasih Gg. Tegallega No.44a, Bandung Kota, 40252, Jawa Barat
                      </p>
                    </div>
                  </div>
                  <a
                    className="btn-interactive inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-midnight text-white text-xs font-semibold shadow-md w-full"
                    href="https://maps.google.com/?q=Wisma+Karya+RW+06+Jl.+Ibu+Inggit+Garnasih+Gg.+Tegallega+No.44a+Bandung"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <svg className="w-4 h-4 fill-current text-powderBlue" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>Buka Google Maps</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Resepsi Card */}
            <div className="reveal-item">
              <div className="p-[1.5px] rounded-3xl shimmer-border-box shadow-lg h-full">
                <div className="glass-card card-aura-glow rounded-3xl p-8 text-center flex flex-col justify-between h-full group">
                  <div>
                    <div
                      className="w-16 h-16 bg-softSky rounded-full flex items-center justify-center mx-auto mb-4 text-steelBlue group-hover:scale-110 transition-transform duration-300 shadow-inner animate-soft-float"
                      style={{ animationDelay: '1.5s' }}
                    >
                      <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <h3 className="font-serifHeading text-2xl font-bold text-midnight mb-2">Resepsi Pernikahan</h3>
                    <p className="text-steelBlue font-bold text-base mb-4 tracking-wide uppercase">MINGGU, 13 Desember 2026</p>
                    <div className="text-slate-600 text-sm space-y-2 mb-6 border-y border-powderBlue/40 py-4">
                      <p>
                        <strong>Pukul:</strong> 11.00 WIB s/d 19.00 WIB
                      </p>
                      <p>
                        <strong>Tempat:</strong> Wisma Karya RW 06
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        Jl. Ibu Inggit Garnasih Gg. Tegallega No.44a, Bandung Kota, 40252, Jawa Barat
                      </p>
                    </div>
                  </div>
                  <a
                    className="btn-interactive inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-steelBlue text-white text-xs font-semibold shadow-md w-full"
                    href="https://maps.google.com/?q=Wisma+Karya+RW+06+Jl.+Ibu+Inggit+Garnasih+Gg.+Tegallega+No.44a+Bandung"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <svg className="w-4 h-4 fill-current text-powderBlue" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>Buka Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Denah Lokasi & Map with Radar Sonar Pulse Pin */}
          <div className="reveal-item">
            <div className="glass-card card-aura-glow rounded-3xl p-6 md:p-8 border border-powderBlue/50 text-center max-w-2xl mx-auto shadow-md">
              <div className="w-14 h-14 bg-midnight/10 text-midnight rounded-full flex items-center justify-center mx-auto mb-3 animate-soft-float">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 2h2v3h-2v-3zm3 3h3v3h-3v-3zm-5 1h2v2h-2v-2zm3-3h2v2h-2v-2z" />
                </svg>
              </div>
              <h4 className="font-serifHeading text-lg font-bold text-midnight mb-1">
                Denah &amp; Panduan Navigasi Lokasi
              </h4>
              <p className="text-xs md:text-sm text-slate-600 mb-4 max-w-md mx-auto">
                Gunakan Google Maps untuk mendapatkan arahan rute langsung menuju lokasi acara di Wisma Karya RW 06 Bandung.
              </p>
              {/* Map Container with Sonar Pulsing Pin Indicator */}
              <div className="w-full h-72 md:h-80 rounded-2xl overflow-hidden shadow-inner border border-powderBlue/40 my-4 relative">
                {/* Radar Sonar Pulse Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center justify-center">
                  <span className="absolute w-12 h-12 rounded-full bg-steelBlue/30 sonar-radar-ring" />
                  <span
                    className="absolute w-20 h-20 rounded-full bg-powderBlue/25 sonar-radar-ring"
                    style={{ animationDelay: '0.8s' }}
                  />
                  <span className="w-5 h-5 rounded-full bg-midnight border-2 border-white shadow-lg flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-powderBlue animate-ping" />
                  </span>
                </div>
                <iframe
                  allowFullScreen
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://maps.google.com/maps?q=-6.93239335,107.60615168&hl=id&z=16&output=embed"
                  style={{ border: 0 }}
                  title="Peta Lokasi Wisma Karya RW 06 Bandung"
                  width="100%"
                />
              </div>
              <div className="inline-flex flex-wrap items-center justify-center gap-3">
                <a
                  className="btn-interactive inline-flex items-center gap-2 px-6 py-3 bg-midnight text-white text-xs font-semibold rounded-full shadow-md"
                  href="https://maps.google.com/?q=Wisma+Karya+RW+06+Jl.+Ibu+Inggit+Garnasih+Gg.+Tegallega+No.44a+Bandung"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <svg className="w-4 h-4 fill-current text-powderBlue" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>Buka Google Maps - Wisma Karya RW 06 Bandung</span>
                </a>
              </div>
            </div>
          </div>
        </section>
        {/* END: Events Schedule Section */}

        {/* BEGIN: Digital Envelope / Wedding Gift Section */}
        <section className="py-24 px-4 max-w-4xl mx-auto relative overflow-hidden">
          {/* Swaying Botanical Side Element */}
          <div aria-hidden="true" className="absolute -right-6 top-16 w-32 opacity-40 pointer-events-none animate-floral-right">
            <svg fill="none" viewBox="0 0 100 100">
              <path d="M10 10 Q80 40 80 90 Q30 60 10 10" fill="#fbcfe8" fillOpacity="0.4" />
              <circle cx="80" cy="90" fill="#e3be77" r="4" />
            </svg>
          </div>
          <div className="text-center mb-16 reveal-item">
            <p className="text-sm font-semibold tracking-widest text-steelBlue uppercase">Tanda Kasih</p>
            <h2 className="font-serifHeading text-3xl font-bold text-midnight">Amplop Digital</h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-powderBlue to-transparent mx-auto mt-3" />
            <p className="max-w-lg mx-auto text-slate-600 text-sm mt-3">
              Doa restu Anda merupakan hadiah terindah bagi kami. Namun jika berkenan memberikan tanda kasih, Anda dapat menyalurkannya melalui rekening berikut:
            </p>
          </div>
          <div className="gap-6 max-w-md mx-auto flex justify-center reveal-item">
            {/* Bank Card with Shimmer Border and Floating Ambient */}
            <div className="w-full p-[1.5px] rounded-3xl shimmer-border-box shadow-xl animate-card-float">
              <div className="glass-card card-aura-glow p-8 rounded-3xl text-center w-full relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-powderBlue/25 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all" />
                <div className="h-10 flex items-center justify-center font-bold text-xl text-midnight tracking-wider">
                  Sea Bank
                </div>
                <p className="text-xs text-slate-500 mt-2">Nomor Rekening:</p>
                <div className="relative inline-block my-2">
                  <p className="font-serifHeading text-2xl font-bold text-midnight tracking-wider" id="rekeningMandiri">
                    901410146994
                  </p>
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-powderBlue to-transparent" />
                </div>
                <p className="text-xs text-slate-600 mb-5 font-medium">a.n. Daffa Aria Gunawan</p>
                <button
                  className="btn-interactive inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-softSky via-white to-softSky text-steelBlue border border-powderBlue/50 rounded-full text-xs font-semibold hover:text-midnight transition shadow-md hover:scale-105 cursor-pointer"
                  onClick={() => copyToClipboard('901410146994', 'Sea Bank Daffa')}
                  type="button"
                >
                  <svg className="w-4 h-4 fill-current text-steelBlue" viewBox="0 0 24 24">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                  </svg>
                  <span>Salin No. Rekening</span>
                </button>
              </div>
            </div>
          </div>
          {/* Toast Feedback Notification */}
          <div
            className={`fixed bottom-20 left-1/2 -translate-x-1/2 bg-midnight text-white text-xs px-6 py-3 rounded-full shadow-2xl transition-all duration-300 z-50 border border-powderBlue/40 ${
              showToast ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            id="copyToast"
          >
            {toastMessage}
          </div>
        </section>
        {/* END: Digital Envelope / Wedding Gift Section */}

        {/* BEGIN: RSVP & Wishes Section */}
        <section className="py-24 bg-gradient-to-b from-[#f4f8fc] to-softSky px-4 relative overflow-hidden">
          {/* Swaying Botanical Side Element */}
          <div aria-hidden="true" className="absolute -left-10 bottom-16 w-36 opacity-35 pointer-events-none animate-floral-left">
            <svg fill="none" viewBox="0 0 100 100">
              <path d="M0 50 Q50 20 80 80 Q30 90 0 50" fill="#A2BEE2" fillOpacity="0.4" />
            </svg>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 reveal-item">
              <p className="text-sm font-semibold tracking-widest text-steelBlue uppercase">Konfirmasi &amp; Harapan</p>
              <h2 className="font-serifHeading text-3xl font-bold text-midnight">RSVP &amp; Doa Restu</h2>
              <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-powderBlue to-transparent mx-auto mt-3" />
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* RSVP Form with Shimmer Border */}
              <div className="reveal-item">
                <div className="p-[1px] rounded-3xl shimmer-border-box shadow-md">
                  <div className="glass-card card-aura-glow p-6 md:p-8 rounded-3xl shadow-sm">
                    <h3 className="font-serifHeading text-lg font-bold text-midnight mb-4 flex items-center gap-2">
                      <span>Konfirmasi Kehadiran</span>
                      <span className="w-2 h-2 rounded-full bg-powderBlue animate-ping" />
                    </h3>
                    <form className="space-y-4" id="rsvpForm" onSubmit={handleRsvpSubmit}>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="guestName">
                          Nama Lengkap
                        </label>
                        <input
                          className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 focus:border-steelBlue focus:ring-1 focus:ring-steelBlue outline-none transition bg-white/90"
                          id="guestName"
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Contoh: Dimas Aditya"
                          required
                          type="text"
                          value={guestName}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="attendanceStatus">
                          Status Kehadiran
                        </label>
                        <select
                          className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 focus:border-steelBlue focus:ring-1 focus:ring-steelBlue outline-none transition bg-white/90"
                          id="attendanceStatus"
                          onChange={(e) => setAttendanceStatus(e.target.value)}
                          value={attendanceStatus}
                        >
                          <option value="Hadir">Saya akan Hadir</option>
                          <option value="Tidak Hadir">Mohon Maaf Tidak Dapat Hadir</option>
                          <option value="Ragu-ragu">Masih Belum Pasti</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="guestMessage">
                          Ucapan &amp; Doa Restu
                        </label>
                        <textarea
                          className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 focus:border-steelBlue focus:ring-1 focus:ring-steelBlue outline-none transition bg-white/90"
                          id="guestMessage"
                          onChange={(e) => setGuestMessage(e.target.value)}
                          placeholder="Tuliskan pesan &amp; doa hangat..."
                          required
                          rows={3}
                          value={guestMessage}
                        />
                      </div>
                      <button
                        className="btn-interactive w-full py-3 bg-midnight text-white text-sm font-semibold rounded-xl shadow-md cursor-pointer"
                        type="submit"
                      >
                        Kirim Konfirmasi
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Dynamic Wishes Feed with Live Counter */}
              <div className="reveal-item">
                <div className="p-[1px] rounded-3xl shimmer-border-box shadow-md">
                  <div className="glass-card card-aura-glow p-6 md:p-8 rounded-3xl shadow-sm flex flex-col h-[480px]">
                    <h3 className="font-serifHeading text-lg font-bold text-midnight mb-4 flex items-center justify-between">
                      <span>Doa dari Sahabat</span>
                      <span
                        className={`text-xs text-midnight px-3 py-1 rounded-full font-sans font-semibold transition-all duration-300 ${
                          countPop ? 'scale-110 bg-powderBlue' : 'bg-powderBlue/40'
                        }`}
                        id="wishesCount"
                      >
                        {wishes.length} Ucapan
                      </span>
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-powderBlue" id="wishesContainer">
                      {wishes.map((wish) => (
                        <div
                          key={wish.id}
                          className={`p-3.5 rounded-2xl border transition transform hover:translate-x-1 duration-300 shadow-sm ${
                            wish.isNew
                              ? 'bg-white/90 border-powderBlue/40'
                              : 'bg-white/85 border-powderBlue/30 hover:border-powderBlue'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-midnight">
                              {wish.name}{' '}
                              {wish.status && (
                                <span className="font-normal text-[10px] text-steelBlue">({wish.status})</span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400">{wish.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{wish.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: RSVP & Wishes Section */}
      </main>

      {/* BEGIN: Footer Section */}
      <footer className="bg-midnight text-white text-center py-12 px-4 border-t border-powderBlue/20 relative z-10">
        <div className="max-w-lg mx-auto">
          <h4 className="font-script text-4xl text-powderBlue mb-3 drop-shadow">Mutiara &amp; Daffa</h4>
          <p className="text-xs text-iceBlue/90 mb-3 font-light leading-relaxed">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan do&apos;a restu kepada kedua mempelai.
          </p>
          <p className="text-xs text-powderBlue font-semibold uppercase tracking-wider mb-2">
            Wassalamualaikum Warahmatullahi Wabarakatuh
          </p>
          <p className="text-[11px] text-slate-400 italic mb-6">
            Mohon maaf apabila ada kesalahan dalam penulisan nama/gelar
          </p>
          <div className="w-16 h-px bg-powderBlue/30 mx-auto mb-6" />
          <p className="text-[11px] text-slate-400 tracking-wider uppercase">
            © 2026 Mutiara &amp; Daffa Wedding. All Rights Reserved.
          </p>
        </div>
      </footer>
      {/* END: Footer Section */}
      </div>
      )}
    </div>
  );
}
