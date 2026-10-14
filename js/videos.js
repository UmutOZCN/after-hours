/**
 * VİDEO ARŞİVİ MODÜLÜ (OTOMATİK VİDEO ÖNİZLEME KAPAKLI)
 * ============================================================
 * - Ayrı bir kapak fotoğrafı (poster) yoksa videonun 0.5. saniyesindeki
 *   kareyi otomatik olarak kapak görseli yapar.
 * - Mouse ile kartın üzerine gelindiğinde sessiz önizleme oynatır.
 */

import { SITE_CONFIG, VIDEO_ITEMS } from "./config.js";

export function initVideoSection() {
    const titleEl = document.getElementById("video-title");
    const subtitleEl = document.getElementById("video-subtitle");
    const gridEl = document.getElementById("video-grid");

    const modalEl = document.getElementById("video-modal");
    const modalBackdrop = document.getElementById("video-modal-backdrop");
    const modalCloseBtn = document.getElementById("video-modal-close-btn");
    const modalTitleEl = document.getElementById("video-modal-title");
    const modalDescEl = document.getElementById("video-modal-desc");
    const playerEl = document.getElementById("video-modal-player");
    const fallbackEl = document.getElementById("video-modal-fallback");
    const fallbackPathEl = document.getElementById("video-modal-fallback-path");

    if (titleEl) titleEl.textContent = SITE_CONFIG.videoTitle || "Hareketli anılar";
    if (subtitleEl) subtitleEl.textContent = SITE_CONFIG.videoSubtitle || "";
    if (!gridEl) return;

    const videos = Array.isArray(VIDEO_ITEMS) ? VIDEO_ITEMS : [];
    let lastFocusedCard = null;

    gridEl.classList.remove("video-grid--count-1", "video-grid--count-2", "video-grid--count-many");
    if (videos.length === 1) {
        gridEl.classList.add("video-grid--count-1");
    } else if (videos.length === 2) {
        gridEl.classList.add("video-grid--count-2");
    } else {
        gridEl.classList.add("video-grid--count-many");
    }

    gridEl.innerHTML = "";

    if (videos.length === 0) {
        const empty = document.createElement("div");
        empty.className = "video-empty-state";
        empty.innerHTML = `
            <span class="editorial-tag">VİDEO ARŞİVİ</span>
            <p class="media-fallback__title" style="margin-top:0.5rem;">Henüz video eklenmedi</p>
            <p class="media-fallback__sub" style="margin-top:0.35rem;">
                Videolarınızı <code>./assets/videos/</code> klasörüne ekleyip <code>js/config.js</code> içerisinden tanımlayabilirsiniz.
            </p>
        `;
        gridEl.appendChild(empty);
        return;
    }

    videos.forEach((videoItem, index) => {
        const formattedIdx = String(index + 1).padStart(2, "0");
        const card = document.createElement("button");
        card.type = "button";
        card.className = "video-card";
        card.setAttribute("aria-label", `${videoItem.title || `Video \${formattedIdx}`} oynat`);

        const mediaWrap = document.createElement("div");
        mediaWrap.className = "video-card__media";

        // Video dosyası da henüz klasöre atılmamışsa görünecek şık yedek ekran
        const posterFallback = document.createElement("div");
        posterFallback.className = "video-card__poster-fallback";
        posterFallback.innerHTML = `
            <span class="video-card__poster-fallback-index">VİDEO ${formattedIdx}</span>
        `;

        // Videonun kendi karesini (0.5. saniye) kapak olarak kullanan sessiz önizleme elementi
        const previewVideo = document.createElement("video");
        previewVideo.className = "video-card__poster";
        previewVideo.src = `${videoItem.src}#t=0.5`;
        previewVideo.muted = true;
        previewVideo.playsInline = true;
        previewVideo.preload = "metadata";
        previewVideo.setAttribute("aria-hidden", "true");

        previewVideo.addEventListener("loadeddata", () => {
            // İlk kare yüklendiğinde eğer 0. saniyedeyse 0.5'e çek (siyah ekranı önler)
            if (previewVideo.currentTime === 0) {
                try {
                    previewVideo.currentTime = 0.5;
                } catch {
                    // Ignore seek errors
                }
            }
        });

        // Eğer video dosyası henüz klasörde yoksa yedek etiketi göster
        previewVideo.addEventListener("error", () => {
            previewVideo.replaceWith(posterFallback);
        });

        // Mouse ile üzerine gelince sessiz önizleme oynat, çekince durdurup kapak karesine dön
        card.addEventListener("pointerenter", (e) => {
            if (e.pointerType === "touch") return;
            if (previewVideo.isConnected && previewVideo.readyState >= 2) {
                const p = previewVideo.play();
                if (p && typeof p.catch === "function") p.catch(() => {});
            }
        });

        card.addEventListener("pointerleave", (e) => {
            if (e.pointerType === "touch") return;
            if (previewVideo.isConnected) {
                previewVideo.pause();
                try {
                    previewVideo.currentTime = 0.5;
                } catch {
                    // Ignore
                }
            }
        });

        mediaWrap.appendChild(previewVideo);

        const overlay = document.createElement("div");
        overlay.className = "video-card__overlay";
        overlay.innerHTML = `
            <span class="video-card__play-badge" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="8 5 19 12 8 19 8 5"/>
                </svg>
            </span>
        `;
        mediaWrap.appendChild(overlay);

        const body = document.createElement("div");
        body.className = "video-card__body";

        const textWrap = document.createElement("div");
        const h3 = document.createElement("h3");
        h3.className = "video-card__title";
        h3.textContent = videoItem.title || `Anı Videosu ${formattedIdx}`;
        textWrap.appendChild(h3);

        if (videoItem.description && videoItem.description.trim().length > 0) {
            const p = document.createElement("p");
            p.className = "video-card__desc";
            p.textContent = videoItem.description;
            textWrap.appendChild(p);
        }

        const idxTag = document.createElement("span");
        idxTag.className = "video-card__index";
        idxTag.textContent = `#${formattedIdx}`;

        body.appendChild(textWrap);
        body.appendChild(idxTag);

        card.appendChild(mediaWrap);
        card.appendChild(body);

        card.addEventListener("click", () => {
            if (previewVideo.isConnected) {
                previewVideo.pause();
            }
            lastFocusedCard = card;
            openVideoModal(videoItem, formattedIdx);
        });

        gridEl.appendChild(card);
    });

    function openVideoModal(item, formattedIdx) {
        if (!modalEl || !playerEl || !fallbackEl) return;

        if (modalTitleEl) {
            modalTitleEl.textContent = item.title || `Video ${formattedIdx}`;
        }

        if (modalDescEl) {
            const hasDesc = Boolean(item.description && item.description.trim().length > 0);
            modalDescEl.textContent = hasDesc ? item.description : "";
            modalDescEl.hidden = !hasDesc;
        }

        fallbackEl.hidden = true;
        playerEl.hidden = false;
        playerEl.removeAttribute("poster");

        playerEl.src = item.src;
        playerEl.load();

        const playPromise = playerEl.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
        }

        modalEl.hidden = false;
        modalEl.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        if (modalCloseBtn) modalCloseBtn.focus();
    }

    function closeVideoModal() {
        if (!modalEl || modalEl.hidden) return;

        if (playerEl) {
            playerEl.pause();
            playerEl.removeAttribute("src");
            playerEl.removeAttribute("poster");
            playerEl.load();
        }

        modalEl.hidden = true;
        modalEl.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");

        if (lastFocusedCard && typeof lastFocusedCard.focus === "function") {
            lastFocusedCard.focus();
        }
    }

    if (playerEl) {
        playerEl.addEventListener("error", () => {
            if (modalEl && !modalEl.hidden) {
                playerEl.hidden = true;
                if (fallbackEl) fallbackEl.hidden = false;
                if (fallbackPathEl) {
                    fallbackPathEl.textContent = playerEl.getAttribute("src") || "./assets/videos/video-01.mp4";
                }
            }
        });
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeVideoModal);
    if (modalBackdrop) modalBackdrop.addEventListener("click", closeVideoModal);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalEl && !modalEl.hidden) {
            e.preventDefault();
            closeVideoModal();
        }
    });
}