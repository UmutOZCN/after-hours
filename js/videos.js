/**
 * AKILLI HİBRİT VİDEO ARŞİVİ MODÜLÜ (PC + ANDROID + iOS SAFARI)
 * ============================================================
 * - Her kartta .jpg kapak görseli sabit olarak bulunur (asla siyah ekran olmaz).
 * - Masaüstünde: Mouse ile kartın üzerine gelindiğinde sadece o kart için
 *   dinamik video önizlemesi oynatılır, mouse çekilince bellekten temizlenir.
 * - Mobilde (iPhone / Android): Sayfada kaydırırken ekranın ortasında duran
 *   tek bir video kartı otomatik sessiz önizleme oynatır (Safari 20 video sınırına takılmaz).
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

    if (sectionEl) {
        sectionEl.classList.add("is-visible");
    }

    if (titleEl) titleEl.textContent = SITE_CONFIG.videoTitle || "Hareketli anılar";
    if (subtitleEl) subtitleEl.textContent = SITE_CONFIG.videoSubtitle || "";
    if (!gridEl) return;

    const videos = Array.isArray(VIDEO_ITEMS) ? VIDEO_ITEMS : [];
    let lastFocusedCard = null;
    let activePreview = null; // Aynı anda sadece 1 önizleme videosu çalışmasını garanti eder

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

    /**
     * Aktif çalışan önizleme videosunu durdurur ve RAM/Safari çözücüsünü serbest bırakır
     */
    function stopActivePreview() {
        if (!activePreview) return;
        const { videoEl } = activePreview;
        activePreview = null;

        if (videoEl) {
            videoEl.style.opacity = "0";
            window.setTimeout(() => {
                try {
                    videoEl.pause();
                    videoEl.removeAttribute("src");
                    videoEl.load();
                    videoEl.remove();
                } catch {
                    // Ignore cleanup errors
                }
            }, 220);
        }
    }

    /**
     * Sadece seçilen kartın üzerinde sessiz önizleme videosu başlatır.
     * Video gerçekten oynamaya başlayana kadar (.playing) kapak resmi altta görünmeye devam eder.
     */
    function startCardPreview(mediaWrap, videoSrc) {
        if (!mediaWrap || !videoSrc) return;
        if (modalEl && !modalEl.hidden) return;

        if (activePreview && activePreview.mediaWrap === mediaWrap) {
            return;
        }

        stopActivePreview();

        const previewVideo = document.createElement("video");
        previewVideo.className = "video-card__poster";
        previewVideo.style.position = "absolute";
        previewVideo.style.inset = "0";
        previewVideo.style.zIndex = "2";
        previewVideo.style.opacity = "0";
        previewVideo.style.transition = "opacity 0.3s ease";
        previewVideo.style.pointerEvents = "none";

        previewVideo.muted = true;
        previewVideo.defaultMuted = true;
        previewVideo.loop = true;
        previewVideo.playsInline = true;
        previewVideo.setAttribute("muted", "");
        previewVideo.setAttribute("playsinline", "");
        previewVideo.setAttribute("webkit-playsinline", "");
        previewVideo.preload = "auto";
        previewVideo.src = videoSrc;

        // Sadece video fiilen kare oynatmaya başladığında görünür yap (Siyah ekranı %100 önler)
        previewVideo.addEventListener("playing", () => {
            if (activePreview && activePreview.videoEl === previewVideo) {
                previewVideo.style.opacity = "1";
            }
        });

        previewVideo.addEventListener("error", () => {
            if (activePreview && activePreview.videoEl === previewVideo) {
                stopActivePreview();
            }
        });

        mediaWrap.appendChild(previewVideo);
        activePreview = { mediaWrap, videoEl: previewVideo };

        const playPromise = previewVideo.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                // Düşük güç modu veya codec engeli varsa sessizce .jpg kapakta kal
                if (activePreview && activePreview.videoEl === previewVideo) {
                    stopActivePreview();
                }
            });
        }
    }

    // Mobil cihazlarda (iPhone / Android) ekranın ortasına gelen tek kartı otomatik önizleten gözlemci
    const isTouchDevice =
        "ontouchstart" in window ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

    const mobileScrollObserver =
        isTouchDevice && "IntersectionObserver" in window
            ? new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        const mediaWrap = entry.target.querySelector(".video-card__media");
                        const videoSrc = entry.target.dataset.videoSrc;
                        if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
                            startCardPreview(mediaWrap, videoSrc);
                        } else if (
                            activePreview &&
                            activePreview.mediaWrap === mediaWrap
                        ) {
                            stopActivePreview();
                        }
                    });
                },
                {
                    threshold: [0, 0.65, 0.9],
                    rootMargin: "-15% 0px -15% 0px"
                }
            )
            : null;

    videos.forEach((videoItem, index) => {
        const formattedIdx = String(index + 1).padStart(2, "0");

        const card = document.createElement("article");
        card.className = "video-card";
        card.dataset.videoSrc = videoItem.src;
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `${videoItem.title || `Video \${formattedIdx}`} oynat`);

        const mediaWrap = document.createElement("div");
        mediaWrap.className = "video-card__media";

        // Yedek katman
        const posterFallback = document.createElement("div");
        posterFallback.className = "video-card__poster-fallback";
        posterFallback.style.alignItems = "flex-start";
        posterFallback.style.justifyContent = "flex-start";
        posterFallback.style.padding = "1rem 1.15rem";
        posterFallback.innerHTML = `
            <span class="video-card__poster-fallback-index">ANI VİDEOSU ${formattedIdx}</span>
        `;

        // Sabit .jpg Kapak Görseli (Her zaman altta hazır durur)
        const posterSrc =
            videoItem.poster && videoItem.poster.trim().length > 0
                ? videoItem.poster
                : `./assets/images/video-cover-${formattedIdx}.jpg`;

        const posterImg = document.createElement("img");
        posterImg.className = "video-card__poster";
        posterImg.style.position = "relative";
        posterImg.style.zIndex = "1";
        posterImg.src = posterSrc;
        posterImg.alt = videoItem.title || `Video ${formattedIdx}`;
        posterImg.loading = "lazy";
        posterImg.decoding = "async";

        posterImg.addEventListener("error", () => {
            posterImg.replaceWith(posterFallback);
        });

        mediaWrap.appendChild(posterImg);

        // Masaüstünde mouse ile üzerine gelince anlık video önizleme başlat
        card.addEventListener("pointerenter", (e) => {
            if (e.pointerType === "touch") return;
            startCardPreview(mediaWrap, videoItem.src);
        });

        card.addEventListener("pointerleave", (e) => {
            if (e.pointerType === "touch") return;
            stopActivePreview();
        });

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
            stopActivePreview();
            lastFocusedCard = card;
            openVideoModal(videoItem, formattedIdx, posterSrc);
        };

        card.addEventListener("click", triggerOpen);
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                triggerOpen();
            }
        });

        gridEl.appendChild(card);

        if (mobileScrollObserver) {
            mobileScrollObserver.observe(card);
        }
    });

    function openVideoModal(item, formattedIdx, posterSrc) {
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

        if (posterSrc) {
            playerEl.setAttribute("poster", posterSrc);
        } else {
            playerEl.removeAttribute("poster");
        }

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