/**
 * 3D ENVELOPE & IN-PLACE UNFOLDING LETTER MODULE
 * ============================================================
 * - Mektup sayfanın altında ayrı bir bölümde açık beklemez.
 * - Kullanıcı zarfa tıkladığında zarf açılır, içindeki kağıt yükselir,
 *   konfetiler patlar ve zarf olduğu yerde tam boy okunabilir mektuba dönüşür.
 */

import { SITE_CONFIG } from "./config.js";
import { prefersReducedMotion } from "./effects.js";

export function initEnvelopeSection({ confetti, sound }) {
    const envelopeStage = document.getElementById("envelope-stage");
    const envelopeBtn = document.getElementById("envelope-trigger");
    const envelopeLabel = document.getElementById("envelope-label-text");
    const instructionText = document.getElementById("envelope-instruction");

    const openedLetterContainer = document.getElementById("envelope-opened-letter");
    const closeLetterBtn = document.getElementById("close-letter-btn");
    const letterPaper = document.getElementById("letter-paper");
    const letterRecipientTag = document.getElementById("letter-recipient-tag");
    const letterHeading = document.getElementById("letter-heading");
    const letterBody = document.getElementById("letter-body");
    const letterSignature = document.getElementById("letter-signature");
    const scrollToGalleryBtn = document.getElementById("scroll-to-gallery-btn");

    // Populate Configurable Content
    if (envelopeLabel) {
        envelopeLabel.textContent = SITE_CONFIG.envelopeLabel || "SANA ÖZEL";
    }

    if (letterRecipientTag) {
        letterRecipientTag.textContent = SITE_CONFIG.recipientName || "";
    }

    if (letterHeading) {
        letterHeading.textContent = SITE_CONFIG.letterTitle || "";
    }

    if (letterBody) {
        letterBody.innerHTML = "";
        const paragraphs = Array.isArray(SITE_CONFIG.letterParagraphs)
            ? SITE_CONFIG.letterParagraphs
            : [];

        paragraphs.forEach((text) => {
            if (typeof text === "string" && text.trim().length > 0) {
                const p = document.createElement("p");
                p.textContent = text;
                letterBody.appendChild(p);
            }
        });
    }

    if (letterSignature) {
        letterSignature.textContent = SITE_CONFIG.letterSignature || "";
    }

    // Smooth scroll to gallery from end of letter
    if (scrollToGalleryBtn) {
        scrollToGalleryBtn.addEventListener("click", (e) => {
            const galleryEl = document.getElementById("section-gallery");
            if (!galleryEl) return;
            e.preventDefault();
            galleryEl.scrollIntoView({
                behavior: prefersReducedMotion() ? "auto" : "smooth",
                block: "start"
            });
        });
    }

    if (!envelopeBtn) return;

    let isAnimating = false;

    envelopeBtn.addEventListener("click", () => {
        if (isAnimating) return;
        isAnimating = true;
        envelopeBtn.disabled = true;
        envelopeBtn.setAttribute("aria-expanded", "true");

        const reduced = prefersReducedMotion();
        const flapDelay = reduced ? 60 : 480;
        const confettiDelay = reduced ? 120 : 820;
        const unfoldDelay = reduced ? 260 : 1550;

        if (instructionText) {
            instructionText.textContent = "Mektup açılıyor...";
        }

        // Step 1: Flap opens & optional sound starts
        envelopeBtn.classList.add("is-opening");
        if (sound) sound.playEffect("envelopeConfetti", 0.65);

        // Step 2: Letter physically rises out of the envelope pocket
        window.setTimeout(() => {
            envelopeBtn.classList.add("is-letter-rising");
        }, flapDelay);

        // Step 3: Confetti burst as letter emerges
        window.setTimeout(() => {
            if (confetti) {
                const rect = envelopeBtn.getBoundingClientRect();
                confetti.triggerEnvelopeBurst(rect);
            }
        }, confettiDelay);

        // Step 4: Envelope fades out and full letter unfolds right in its place
        window.setTimeout(() => {
            if (envelopeStage) {
                envelopeStage.classList.add("is-hiding");
            }

            window.setTimeout(() => {
                if (envelopeStage) {
                    envelopeStage.hidden = true;
                    envelopeStage.classList.remove("is-hiding");
                }

                if (openedLetterContainer) {
                    openedLetterContainer.hidden = false;
                    // Force reflow for smooth entrance animation
                    void openedLetterContainer.offsetWidth;
                    openedLetterContainer.classList.add("is-visible");
                }

                if (letterPaper) {
                    letterPaper.classList.add("is-freshly-opened");
                }

                isAnimating = false;
            }, 320);
        }, unfoldDelay);
    });

    // Optional: Close letter and return to closed envelope
    if (closeLetterBtn) {
        closeLetterBtn.addEventListener("click", () => {
            if (isAnimating) return;

            if (openedLetterContainer) {
                openedLetterContainer.classList.remove("is-visible");
                openedLetterContainer.hidden = true;
            }

            envelopeBtn.classList.remove("is-opening", "is-letter-rising", "is-opened");
            envelopeBtn.disabled = false;
            envelopeBtn.setAttribute("aria-expanded", "false");

            if (instructionText) {
                instructionText.textContent = "Mektubu açmak için zarfa dokun.";
            }

            if (envelopeStage) {
                envelopeStage.hidden = false;
            }
        });
    }
}