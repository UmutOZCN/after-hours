/**
 * AFTER HOURS — FINAL BIRTHDAY SURPRISE & MIDNIGHT SKY MODULE
 * ============================================================
 */

import { SITE_CONFIG } from "./config.js";
import { prefersReducedMotion } from "./effects.js";

export function initSurpriseSection({ confetti, sound }) {
    const sectionEl = document.getElementById("section-surprise");
    const skyCanvas = document.getElementById("midnight-sky-canvas");
    const glowEl = document.getElementById("surprise-glow");

    const preStateEl = document.getElementById("surprise-pre-state");
    const introTextEl = document.getElementById("surprise-intro-text");
    const triggerBtn = document.getElementById("surprise-trigger-btn");
    const btnLabelEl = document.getElementById("surprise-btn-label");

    const postStateEl = document.getElementById("surprise-post-state");
    const birthdayTitleEl = document.getElementById("birthday-title");
    const recipientEl = document.getElementById("birthday-recipient");
    const finalMessageEl = document.getElementById("birthday-final-message");
    const replayBtn = document.getElementById("surprise-replay-btn");

    // Populate Configurable Content
    if (introTextEl) introTextEl.textContent = SITE_CONFIG.surpriseIntro || "Bir de son bir şey var.";
    if (btnLabelEl) btnLabelEl.textContent = SITE_CONFIG.surpriseButtonText || "Sürprizi aç";
    if (birthdayTitleEl) birthdayTitleEl.textContent = SITE_CONFIG.birthdayTitle || "İYİ Kİ DOĞDUN";
    if (recipientEl) recipientEl.textContent = SITE_CONFIG.recipientName || "";
    if (finalMessageEl) finalMessageEl.textContent = SITE_CONFIG.finalMessage || "";

    // Initialize Midnight Starry Sky Canvas
    initMidnightSkyCanvas(skyCanvas, sectionEl);

    if (!triggerBtn) return;

    let hasTriggered = false;

    triggerBtn.addEventListener("click", () => {
        if (hasTriggered) return;
        hasTriggered = true;
        triggerBtn.disabled = true;

        // 1. Strengthen central atmospheric glow
        if (glowEl) {
            glowEl.classList.add("is-active");
        }

        // 2. Fade out initial prompt state
        if (preStateEl) {
            preStateEl.classList.add("is-hiding");
        }

        // 3. Play optional surprise celebration sound
        if (sound) {
            sound.playEffect("surpriseConfetti", 0.75);
        }

        // 4. Trigger multi-burst confetti celebration
        if (confetti) {
            confetti.triggerGrandCelebration();
        }

        const transitionDelay = prefersReducedMotion() ? 100 : 480;

        // 5. Reveal birthday typography & final message
        window.setTimeout(() => {
            if (preStateEl) preStateEl.hidden = true;
            if (postStateEl) {
                postStateEl.hidden = false;
                // Force reflow before adding reveal class so transitions run smoothly
                void postStateEl.offsetWidth;
                postStateEl.classList.add("is-revealed");
            }
        }, transitionDelay);
    });

    // Repeat-safe celebration replay button
    if (replayBtn) {
        let replayCooldown = false;
        replayBtn.addEventListener("click", () => {
            if (replayCooldown) return;
            replayCooldown = true;
            replayBtn.disabled = true;

            if (sound) sound.playEffect("surpriseConfetti", 0.7);
            if (confetti) confetti.triggerGrandCelebration();

            window.setTimeout(() => {
                replayCooldown = false;
                replayBtn.disabled = false;
            }, 2500);
        });
    }
}

/**
 * Custom Midnight Sky Canvas
 * Twinkling stars, drifting light particles, and occasional restrained shooting stars.
 * Pauses automatically via IntersectionObserver when not in viewport.
 */
function initMidnightSkyCanvas(canvas, section) {
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let rafId = null;
    let isVisible = false;

    const isMobile = window.innerWidth < 700;
    const starCount = isMobile ? 65 : 130;
    const drifterCount = isMobile ? 12 : 22;

    const stars = [];
    const drifters = [];
    let shootingStar = null;
    let lastShootingStarTime = performance.now();

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = section.clientWidth || window.innerWidth;
        height = section.clientHeight || window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Populate static/twinkling stars
    for (let i = 0; i < starCount; i++) {
        const isWarm = Math.random() < 0.25;
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: 0.45 + Math.random() * 1.25,
            baseAlpha: 0.18 + Math.random() * 0.58,
            phase: Math.random() * Math.PI * 2,
            speed: 0.008 + Math.random() * 0.02,
            color: isWarm ? "183, 160, 120" : "241, 240, 234"
        });
    }

    // Populate slowly drifting ambient particles
    for (let i = 0; i < drifterCount; i++) {
        drifters.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: 1 + Math.random() * 1.6,
            vx: (Math.random() - 0.5) * 0.16,
            vy: -0.06 - Math.random() * 0.12,
            alpha: 0.12 + Math.random() * 0.24
        });
    }

    function spawnShootingStar() {
        shootingStar = {
            x: width * (0.2 + Math.random() * 0.65),
            y: height * (0.08 + Math.random() * 0.35),
            vx: -6.5 - Math.random() * 3.5,
            vy: 2.8 + Math.random() * 2,
            length: 65 + Math.random() * 45,
            alpha: 0.85
        };
    }

    function render(now = performance.now()) {
        ctx.clearRect(0, 0, width, height);
        const reduced = prefersReducedMotion();

        // Draw twinkling stars
        for (const s of stars) {
            if (!reduced) {
                s.phase += s.speed;
            }
            const twinkle = reduced ? s.baseAlpha : s.baseAlpha + Math.sin(s.phase) * 0.18;
            const alpha = Math.max(0.06, Math.min(0.9, twinkle));

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${s.color}, ${alpha})`;
            ctx.fill();
        }

        // Draw drifting particles
        for (const d of drifters) {
            if (!reduced) {
                d.x += d.vx;
                d.y += d.vy;
                if (d.y < -10) d.y = height + 10;
                if (d.x < -10) d.x = width + 10;
                if (d.x > width + 10) d.x = -10;
            }

            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(183, 160, 120, ${d.alpha})`;
            ctx.fill();
        }

        // Occasional shooting star (every ~7.5 seconds)
        if (!reduced) {
            if (!shootingStar && now - lastShootingStarTime > 7200 + Math.random() * 4500) {
                spawnShootingStar();
                lastShootingStarTime = now;
            }

            if (shootingStar) {
                const st = shootingStar;
                const speed = Math.hypot(st.vx, st.vy);
                const tailX = st.x - (st.vx / speed) * st.length;
                const tailY = st.y - (st.vy / speed) * st.length;

                const grad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
                grad.addColorStop(0, `rgba(241, 240, 234, ${st.alpha})`);
                grad.addColorStop(0.4, `rgba(183, 160, 120, ${st.alpha * 0.45})`);
                grad.addColorStop(1, "rgba(183, 160, 120, 0)");

                ctx.beginPath();
                ctx.moveTo(st.x, st.y);
                ctx.lineTo(tailX, tailY);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.3;
                ctx.stroke();

                st.x += st.vx;
                st.y += st.vy;
                st.alpha -= 0.018;

                if (st.alpha <= 0 || st.x < -100 || st.y > height + 100) {
                    shootingStar = null;
                }
            }
        }

        if (isVisible && !reduced) {
            rafId = window.requestAnimationFrame(render);
        } else {
            rafId = null;
        }
    }

    // Draw initial static frame
    render();

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    isVisible = entry.isIntersecting;
                    if (isVisible && !rafId && !prefersReducedMotion()) {
                        lastShootingStarTime = performance.now();
                        rafId = window.requestAnimationFrame(render);
                    } else if (!isVisible && rafId) {
                        window.cancelAnimationFrame(rafId);
                        rafId = null;
                    }
                });
            },
            { threshold: 0.05 }
        );
        observer.observe(section);
    }
}