/**
 * VİDEO ARŞİVİ MODÜLÜ (iOS SAFARI + TÜM CİHAZLAR UYUMLU)
 * ============================================================
 * - iOS Safari'nin 20 videoyu aynı anda yükleme kilidini aşmak için
 *   videolar ekrana yaklaştıkça (Lazy IntersectionObserver) yüklenir.
 * - Her kartın arkasında her zaman şık kapak katmanı hazır bekler;
 *   video karesi yüklendiğinde üstüne yumuşakça oturur.
 */

import { SITE_CONFIG, VIDEO_ITEMS } from "./config.js";

export function initVideoSection() {
    const sectionEl = document.getElementById("section-videos");
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

    // iOS Safari'de uzun bölümün görünmez kalmasını kesin olarak engelle
    if (sectionEl) {
        sectionEl.classList.add("is-visible");
    }

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

    // Ekrana giren videoların kapak karesini sırayla yükleyen gözlemci (Safari bellek koruması)
    const videoCardObserver = "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const vid = entry.target.querySelector("video[data-src]");
                    if (vid && !vid.getAttribute("src")) {
                        vid.src = vid.dataset.src;
                        vid.load();
                    }
                    obs.unobserve(entry.target);
                });
            },
            { rootMargin: "250px 0px" }
        )
        : null;

    videos.forEach((videoItem, index) => {
        const formattedIdx = String(index + 1).padStart(2, "0");

        // Safari'de <button> içindeki aspect-ratio çökmesini önlemek için <article role="button">
        const card = document.createElement("article");
        card.className = "video-card";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `${videoItem.title || `Video \${formattedIdx}`} oynat`);

        const mediaWrap = document.createElement("div");
        mediaWrap.className = "video-card__media";

        // Alt katmanda her zaman şık bir sinematik kapak bulunur (iOS Düşük Güç Modunda bile boş kalmaz)
        const posterFallback = document.createElement("div");
        posterFallback.className = "video-card__poster-fallback";
        posterFallback.style.position = "absolute";
        posterFallback.style.inset = "0";
        posterFallback.style.zIndex = "1";
        posterFallback.innerHTML = `
            <span class="video-card__poster-fallback-index">ANI VİDEOSU ${formattedIdx}</span>
        `;
        mediaWrap.appendChild(posterFallback);

        // Videonun kendi karesini (0.2. saniye) kapak olarak kullanan video elementi
        const previewVideo = document.createElement("video");
        previewVideo.className = "video-card__poster";
        previewVideo.style.position = "relative";
        previewVideo.style.zIndex = "2";
        previewVideo.dataset.src = `${videoItem.src}#t=0.2`;
        previewVideo.muted = true;
        previewVideo.defaultMuted = true;
        previewVideo.playsInline = true;
        previewVideo.setAttribute("playsinline", "");
        previewVideo.setAttribute("webkit-playsinline", "");
        previewVideo.setAttribute("muted", "");
        previewVideo.preload = "metadata";
        previewVideo.setAttribute("aria-hidden", "true");

        previewVideo.addEventListener("loadedmetadata", () => {
            try {
                previewVideo.currentTime = 0.2;
            } catch {
                // Ignore seek restriction
            }
        });

        previewVideo.addEventListener("error", () => {
            previewVideo.remove();
        });

        // Masaüstünde mouse ile üzerine gelince sessiz önizleme oynat
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
                    previewVideo.currentTime = 0.2;
                } catch {
                    // Ignore
                }
            }
        });

        mediaWrap.appendChild(previewVideo);

        const overlay = document.createElement("div");
        overlay.className = "video-card__overlay";
        overlay.style.zIndex = "3";
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

        const triggerOpen = () => {
            if (previewVideo.isConnected) {
                previewVideo.pause();
            }
            lastFocusedCard = card;
            openVideoModal(videoItem, formattedIdx);
        };

        card.addEventListener("click", triggerOpen);
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                triggerOpen();
            }
        });

        gridEl.appendChild(card);

        if (videoCardObserver) {
            videoCardObserver.observe(card);
        } else {
            previewVideo.src = previewVideo.dataset.src;
        }
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
        playerEl.setAttribute("playsinline", "");
        playerEl.setAttribute("webkit-playsinline", "");

        playerEl.src = item.src;
        playerEl.load();

        modalEl.hidden = false;
        modalEl.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        const playPromise = playerEl.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
        }

        if (modalCloseBtn) modalCloseBtn.focus();
    }

    function closeVideoModal() {
        if (!modalEl || modalEl.hidden) return;

        if (playerEl) {
            playerEl.pause();
            playerEl.removeAttribute("src");
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