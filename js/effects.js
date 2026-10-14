/**
 * EFEKTLER, YOĞUN KONFETİ MOTORU VE SES YÖNETİCİSİ
 * ============================================================
 */

import { AUDIO_PATHS } from "./config.js";

export function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export class SoundController {
    constructor(showMusicControl = false) {
        this.showMusicControl = Boolean(showMusicControl);
        this.activeEffects = new Map();
        this.bgAudio = null;
        this.isBgPlaying = false;

        this.musicBtn = document.getElementById("music-toggle-btn");
        this.musicLabel = document.getElementById("music-toggle-label");

        this.initMusicControl();
    }

    initMusicControl() {
        if (!this.musicBtn) return;

        if (!this.showMusicControl) {
            this.musicBtn.hidden = true;
            return;
        }

        this.musicBtn.hidden = false;
        this.musicBtn.addEventListener("click", () => {
            this.toggleBackgroundMusic();
        });
    }

    playEffect(key, volume = 0.65) {
        const path = AUDIO_PATHS[key];
        if (!path) return;

        try {
            let audio = this.activeEffects.get(key);
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            } else {
                audio = new Audio();
                audio.preload = "none";
                audio.src = path;
                this.activeEffects.set(key, audio);
            }

            audio.volume = Math.min(1, Math.max(0, volume));
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {});
            }
        } catch {
            // Ses dosyası henüz eklenmemişse sessizce devam et
        }
    }

    toggleBackgroundMusic() {
        if (!this.bgAudio) {
            try {
                this.bgAudio = new Audio(AUDIO_PATHS.backgroundMusic);
                this.bgAudio.loop = true;
                this.bgAudio.volume = 0.35;
                this.bgAudio.addEventListener("error", () => {
                    this.updateMusicUI(false);
                });
            } catch {
                return;
            }
        }

        if (this.isBgPlaying) {
            this.bgAudio.pause();
            this.updateMusicUI(false);
        } else {
            const promise = this.bgAudio.play();
            if (promise && typeof promise.then === "function") {
                promise
                    .then(() => this.updateMusicUI(true))
                    .catch(() => this.updateMusicUI(false));
            }
        }
    }

    updateMusicUI(playing) {
        this.isBgPlaying = playing;
        if (!this.musicBtn || !this.musicLabel) return;
        this.musicBtn.classList.toggle("is-playing", playing);
        this.musicBtn.setAttribute("aria-pressed", String(playing));
        this.musicLabel.textContent = playing ? "SES AÇIK" : "SES KAPALI";
    }
}

/**
 * Yüksek Yoğunluklu Özel Canvas Konfeti Sistemi
 */
export class ConfettiController {
    constructor(canvasId = "confetti-canvas") {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
        this.particles = [];
        this.rafId = null;
        this.scheduledTimeouts = [];
        this.dpr = 1;

        this.palette = [
            "#F1F0EA", // Fildişi
            "#D8C093", // Parlak Şampanya Altını
            "#B7A078", // Bronz Altın
            "#748DA8", // Çelik Mavisi
            "#E2E6EC", // Gümüş
            "#9C8253"  // Antik Altın
        ];

        if (this.canvas) {
            this.resize();
            window.addEventListener("resize", () => this.resize(), { passive: true });
        }
    }

    resize() {
        if (!this.canvas || !this.ctx) return;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.canvas.width = width * this.dpr;
        this.canvas.height = height * this.dpr;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    isMobile() {
        return window.innerWidth < 700;
    }

    burst({
        originX = 0.5,
        originY = 0.5,
        count = 120,
        spread = 85,
        startVelocity = 16,
        angle = -90
    } = {}) {
        if (!this.canvas || !this.ctx) return;

        const reduced = prefersReducedMotion();
        const scaleFactor = reduced ? 0.35 : this.isMobile() ? 0.72 : 1;
        const finalCount = Math.max(20, Math.round(count * scaleFactor));

        const x = window.innerWidth * originX;
        const y = window.innerHeight * originY;
        const radSpread = (spread * Math.PI) / 180;
        const baseAngle = (angle * Math.PI) / 180;

        for (let i = 0; i < finalCount; i++) {
            const theta = baseAngle + (Math.random() - 0.5) * radSpread;
            const speed = startVelocity * (0.45 + Math.random() * 0.85);
            const shapeTypes = ["rect", "ribbon", "diamond", "circle"];
            const shape = shapeTypes[i % shapeTypes.length];

            this.particles.push({
                x,
                y,
                vx: Math.cos(theta) * speed,
                vy: Math.sin(theta) * speed,
                gravity: 0.19 + Math.random() * 0.1,
                drag: 0.984,
                w: shape === "ribbon" ? 13 + Math.random() * 6 : 6.5 + Math.random() * 5,
                h: shape === "ribbon" ? 3.8 : 6 + Math.random() * 4.5,
                shape,
                color: this.palette[Math.floor(Math.random() * this.palette.length)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.16,
                tilt: Math.random() * Math.PI * 2,
                tiltSpeed: 0.06 + Math.random() * 0.09,
                wobble: Math.random() * 10,
                wobbleSpeed: 0.05 + Math.random() * 0.06,
                alpha: 1,
                decay: 0.0028 + Math.random() * 0.0035
            });
        }

        if (!this.rafId) {
            this.animate();
        }
    }

    triggerEnvelopeBurst(rect) {
        let originX = 0.5;
        let originY = 0.48;

        if (rect && window.innerWidth > 0 && window.innerHeight > 0) {
            originX = (rect.left + rect.width / 2) / window.innerWidth;
            originY = (rect.top + rect.height * 0.35) / window.innerHeight;
        }

        this.burst({
            originX,
            originY,
            count: 140,
            spread: 100,
            startVelocity: 15,
            angle: -90
        });

        window.setTimeout(() => {
            this.burst({
                originX,
                originY: originY - 0.05,
                count: 90,
                spread: 130,
                startVelocity: 12,
                angle: -90
            });
        }, 240);
    }

    triggerGrandCelebration() {
        this.clearScheduledBursts();

        this.burst({
            originX: 0.5,
            originY: 0.58,
            count: 210,
            spread: 115,
            startVelocity: 19,
            angle: -90
        });

        if (prefersReducedMotion()) return;

        this.scheduledTimeouts.push(
            window.setTimeout(() => {
                this.burst({
                    originX: 0.08,
                    originY: 0.78,
                    count: 145,
                    spread: 72,
                    startVelocity: 21,
                    angle: -58
                });
            }, 300)
        );

        this.scheduledTimeouts.push(
            window.setTimeout(() => {
                this.burst({
                    originX: 0.92,
                    originY: 0.78,
                    count: 145,
                    spread: 72,
                    startVelocity: 21,
                    angle: -122
                });
            }, 600)
        );

        this.scheduledTimeouts.push(
            window.setTimeout(() => {
                this.burst({
                    originX: 0.22,
                    originY: 0.55,
                    count: 120,
                    spread: 95,
                    startVelocity: 16,
                    angle: -75
                });
                this.burst({
                    originX: 0.78,
                    originY: 0.55,
                    count: 120,
                    spread: 95,
                    startVelocity: 16,
                    angle: -105
                });
            }, 1150)
        );

        this.scheduledTimeouts.push(
            window.setTimeout(() => {
                this.burst({
                    originX: 0.3,
                    originY: 0.25,
                    count: 110,
                    spread: 150,
                    startVelocity: 13,
                    angle: -90
                });
                this.burst({
                    originX: 0.7,
                    originY: 0.25,
                    count: 110,
                    spread: 150,
                    startVelocity: 13,
                    angle: -90
                });
            }, 1800)
        );

        this.scheduledTimeouts.push(
            window.setTimeout(() => {
                this.burst({
                    originX: 0.5,
                    originY: 0.42,
                    count: 180,
                    spread: 160,
                    startVelocity: 16,
                    angle: -90
                });
            }, 2550)
        );
    }

    clearScheduledBursts() {
        this.scheduledTimeouts.forEach((id) => window.clearTimeout(id));
        this.scheduledTimeouts = [];
    }

    animate() {
        if (!this.ctx || !this.canvas) return;

        const width = window.innerWidth;
        const height = window.innerHeight;
        this.ctx.clearRect(0, 0, width, height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.vx *= p.drag;
            p.vy = p.vy * p.drag + p.gravity;
            p.wobble += p.wobbleSpeed;
            p.x += p.vx + Math.sin(p.wobble) * 0.55;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.tilt += p.tiltSpeed;
            p.alpha -= p.decay;

            if (p.alpha <= 0 || p.y > height + 50) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.scale(1, Math.cos(p.tilt));
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.fillStyle = p.color;

            if (p.shape === "diamond") {
                this.ctx.beginPath();
                this.ctx.moveTo(0, -p.h);
                this.ctx.lineTo(p.w, 0);
                this.ctx.lineTo(0, p.h);
                this.ctx.lineTo(-p.w, 0);
                this.ctx.closePath();
                this.ctx.fill();
            } else if (p.shape === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.w * 0.45, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            }

            this.ctx.restore();
        }

        if (this.particles.length > 0) {
            this.rafId = window.requestAnimationFrame(() => this.animate());
        } else {
            this.ctx.clearRect(0, 0, width, height);
            this.rafId = null;
        }
    }
}

export function initAmbientDust(canvasId = "ambient-dust-canvas", sectionId = "section-envelope") {
    const canvas = document.getElementById(canvasId);
    const section = document.getElementById(sectionId);
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let rafId = null;
    let isVisible = true;
    const dustCount = window.innerWidth < 700 ? 18 : 28;
    const particles = [];

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = section.clientWidth;
        height = section.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    for (let i = 0; i < dustCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: 0.6 + Math.random() * 1.3,
            vx: (Math.random() - 0.5) * 0.14,
            vy: -0.08 - Math.random() * 0.15,
            alpha: 0.12 + Math.random() * 0.28
        });
    }

    function drawFrame() {
        ctx.clearRect(0, 0, width, height);

        for (const p of particles) {
            if (!prefersReducedMotion()) {
                p.x += p.vx;
                p.y += p.vy;

                if (p.y < -10) p.y = height + 10;
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(241, 240, 234, ${p.alpha})`;
            ctx.fill();
        }

        if (isVisible && !prefersReducedMotion()) {
            rafId = window.requestAnimationFrame(drawFrame);
        } else {
            rafId = null;
        }
    }

    drawFrame();

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    isVisible = entry.isIntersecting;
                    if (isVisible && !rafId && !prefersReducedMotion()) {
                        rafId = window.requestAnimationFrame(drawFrame);
                    } else if (!isVisible && rafId) {
                        window.cancelAnimationFrame(rafId);
                        rafId = null;
                    }
                });
            },
            { threshold: 0.01 }
        );
        observer.observe(section);
    }
}

/**
 * Scroll Reveal Observer (iOS Safari uzun bölüm uyumlu: threshold 0.01)
 */
export function initScrollReveals() {
    document.documentElement.classList.add("js-enabled");
    const elements = document.querySelectorAll(".reveal-on-scroll");

    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
        elements.forEach((el) => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    obs.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.01,
            rootMargin: "0px 0px -10px 0px"
        }
    );

    elements.forEach((el) => observer.observe(el));
}