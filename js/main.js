/**
 * MAIN APPLICATION ENTRY POINT
 * ============================================================
 */

import { SITE_CONFIG } from "./config.js";
import {
    SoundController,
    ConfettiController,
    initAmbientDust,
    initScrollReveals
} from "./effects.js";
import { initEnvelopeSection } from "./envelope.js";
import { initGallerySection } from "./gallery.js";
import { initVideoSection } from "./videos.js";
import { initSurpriseSection } from "./surprise.js";

function bootstrapApplication() {
    if ("scrollRestoration" in history && !window.location.hash) {
        history.scrollRestoration = "manual";
        window.scrollTo(0, 0);
    }

    if (
        SITE_CONFIG.recipientName &&
        SITE_CONFIG.recipientName !== "ISIM_BURAYA"
    ) {
        document.title = `İyi Ki Doğdun — ${SITE_CONFIG.recipientName}`;
    }

    const sound = new SoundController(SITE_CONFIG.showMusicControl);
    const confetti = new ConfettiController("confetti-canvas");

    try {
        initAmbientDust("ambient-dust-canvas", "section-envelope");
    } catch (err) {
        console.error("Ambient dust init error:", err);
    }

    try {
        initScrollReveals();
    } catch (err) {
        console.error("Scroll reveals init error:", err);
    }

    try {
        initEnvelopeSection({ confetti, sound });
    } catch (err) {
        console.error("Envelope init error:", err);
    }

    try {
        initGallerySection();
    } catch (err) {
        console.error("Gallery init error:", err);
    }

    try {
        initVideoSection();
    } catch (err) {
        console.error("Video init error:", err);
    }

    try {
        initSurpriseSection({ confetti, sound });
    } catch (err) {
        console.error("Surprise init error:", err);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrapApplication);
} else {
    bootstrapApplication();
}