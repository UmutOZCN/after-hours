/**
 * 3D GLASSMORPHISM PHOTO ARCHIVE & INTERACTIVE 3D TILT CAROUSEL
 * ============================================================
 */

import { SITE_CONFIG, GALLERY_IMAGES } from "./config.js";

export function initGallerySection() {
    const titleEl = document.getElementById("gallery-title");
    const subtitleEl = document.getElementById("gallery-subtitle");

    const currentIdxEl = document.getElementById("gallery-current-index");
    const totalCountEl = document.getElementById("gallery-total-count");

    const prevBtn = document.getElementById("gallery-prev-btn");
    const nextBtn = document.getElementById("gallery-next-btn");
    const viewportEl = document.getElementById("gallery-carousel-viewport");
    const trackEl = document.getElementById("gallery-carousel-track");

    const photoTitleEl = document.getElementById("gallery-photo-title");
    const photoDescEl = document.getElementById("gallery-photo-desc");
    const fullscreenBtn = document.getElementById("gallery-fullscreen-btn");
    const thumbsContainer = document.getElementById("gallery-thumbnails");

    // Lightbox elements
    const lightboxModal = document.getElementById("lightbox-modal");
    const lightboxBackdrop = document.getElementById("lightbox-backdrop");
    const lightboxCloseBtn = document.getElementById("lightbox-close-btn");
    const lightboxPrevBtn = document.getElementById("lightbox-prev-btn");
    const lightboxNextBtn = document.getElementById("lightbox-next-btn");
    const lightboxStage = document.getElementById("lightbox-stage");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxFallback = document.getElementById("lightbox-fallback");
    const lightboxFallbackIdx = document.getElementById("lightbox-fallback-index");
    const lightboxFallbackTitle = document.getElementById("lightbox-fallback-title");
    const lightboxFallbackPath = document.getElementById("lightbox-fallback-path");
    const lightboxCurrent = document.getElementById("lightbox-current");
    const lightboxTotal = document.getElementById("lightbox-total");
    const lightboxCaptionTitle = document.getElementById("lightbox-caption-title");
    const lightboxCaptionDesc = document.getElementById("lightbox-caption-desc");

    if (titleEl) titleEl.textContent = SITE_CONFIG.galleryTitle || "Anılar arşivi";
    if (subtitleEl) subtitleEl.textContent = SITE_CONFIG.gallerySubtitle || "";

    const images = Array.isArray(GALLERY_IMAGES) && GALLERY_IMAGES.length > 0
        ? GALLERY_IMAGES
        : [{ src: "./assets/images/photo-01.jpg", title: "Anı 01", description: "" }];

    const total = images.length;
    let currentIndex = 0;
    let isLightboxOpen = false;
    let lastFocusedElement = null;

    const cardEntries = [];
    const thumbButtons = [];

    function formatNumber(num) {
        return String(num).padStart(2, "0");
    }

    if (totalCountEl) totalCountEl.textContent = formatNumber(total);
    if (lightboxTotal) lightboxTotal.textContent = formatNumber(total);

    if (total <= 1) {
        if (prevBtn) prevBtn.hidden = true;
        if (nextBtn) nextBtn.hidden = true;
        if (lightboxPrevBtn) lightboxPrevBtn.hidden = true;
        if (lightboxNextBtn) lightboxNextBtn.hidden = true;
    }

    function getCircularOffset(itemIndex, activeIndex, length) {
        let diff = itemIndex - activeIndex;
        const half = Math.floor(length / 2);
        if (diff > half) diff -= length;
        if (diff < -half) diff += length;
        return diff;
    }

    // ==========================================
    // SMOOTH 3D MOUSE TILT / LEAN PHYSICS ENGINE
    // ==========================================
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    let targetImgX = 0;
    let targetImgY = 0;
    let currentImgX = 0;
    let currentImgY = 0;

    let targetGlareX = 50;
    let targetGlareY = 50;
    let currentGlareX = 50;
    let currentGlareY = 50;

    let isHoveringActiveCard = false;
    let tiltRafId = null;

    function startTiltLoop() {
        if (tiltRafId) return;
        tiltRafId = window.requestAnimationFrame(updateTiltPhysics);
    }

    function updateTiltPhysics() {
        const activeEntry = cardEntries[currentIndex];
        if (!activeEntry) {
            tiltRafId = null;
            return;
        }

        // Smooth physical interpolation (lerp)
        const ease = isHoveringActiveCard ? 0.16 : 0.11;
        currentTiltX += (targetTiltX - currentTiltX) * ease;
        currentTiltY += (targetTiltY - currentTiltY) * ease;
        currentImgX += (targetImgX - currentImgX) * ease;
        currentImgY += (targetImgY - currentImgY) * ease;
        currentGlareX += (targetGlareX - currentGlareX) * ease;
        currentGlareY += (targetGlareY - currentGlareY) * ease;

        const shell = activeEntry.tiltShell;
        const scale = isHoveringActiveCard ? 1.035 : 1;
        const liftZ = isHoveringActiveCard ? 22 : 0;

        // Dynamic shadow shifts opposite to the tilt angle
        const shadowX = (-currentTiltY * 1.6).toFixed(1);
        const shadowY = (28 + currentTiltX * 1.4).toFixed(1);

        shell.style.setProperty("--tilt-x", `${currentTiltX.toFixed(2)}deg`);
        shell.style.setProperty("--tilt-y", `${currentTiltY.toFixed(2)}deg`);
        shell.style.setProperty("--tilt-z", `${liftZ}px`);
        shell.style.setProperty("--tilt-scale", String(scale));
        shell.style.setProperty("--img-x", `${currentImgX.toFixed(1)}px`);
        shell.style.setProperty("--img-y", `${currentImgY.toFixed(1)}px`);
        shell.style.setProperty("--shadow-x", `${shadowX}px`);
        shell.style.setProperty("--shadow-y", `${shadowY}px`);
        shell.style.setProperty("--glare-x", `${currentGlareX.toFixed(1)}%`);
        shell.style.setProperty("--glare-y", `${currentGlareY.toFixed(1)}%`);
        shell.style.setProperty("--glare-alpha", isHoveringActiveCard ? "1" : "0");

        const settled =
            !isHoveringActiveCard &&
            Math.abs(currentTiltX) < 0.05 &&
            Math.abs(currentTiltY) < 0.05 &&
            Math.abs(currentImgX) < 0.1 &&
            Math.abs(currentImgY) < 0.1;

        if (!settled) {
            tiltRafId = window.requestAnimationFrame(updateTiltPhysics);
        } else {
            resetTiltOnCard(activeEntry);
            tiltRafId = null;
        }
    }

    function resetTiltOnCard(entry) {
        if (!entry || !entry.tiltShell) return;
        const shell = entry.tiltShell;
        shell.style.setProperty("--tilt-x", "0deg");
        shell.style.setProperty("--tilt-y", "0deg");
        shell.style.setProperty("--tilt-z", "0px");
        shell.style.setProperty("--tilt-scale", "1");
        shell.style.setProperty("--img-x", "0px");
        shell.style.setProperty("--img-y", "0px");
        shell.style.setProperty("--shadow-x", "0px");
        shell.style.setProperty("--shadow-y", "30px");
        shell.style.setProperty("--glare-alpha", "0");
    }

    function handleCardPointerMove(e, cardElement) {
        // Only disable on small touch-only phones
        if (e.pointerType === "touch") return;

        const rect = cardElement.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        // Normalized coordinates from 0 to 1
        const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const relY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        // Centered coordinates from -0.5 to +0.5
        const normX = relX - 0.5;
        const normY = relY - 0.5;

        // Strong, unmistakable 3D lean angles (-18deg to +18deg Y, -15deg to +15deg X)
        targetTiltY = normX * 36;
        targetTiltX = -normY * 30;

        // Inner photo parallax shift
        targetImgX = normX * 18;
        targetImgY = normY * 14;

        // Specular light reflection position
        targetGlareX = relX * 100;
        targetGlareY = relY * 100;

        isHoveringActiveCard = true;
        startTiltLoop();
    }

    function handleCardPointerLeave() {
        isHoveringActiveCard = false;
        targetTiltX = 0;
        targetTiltY = 0;
        targetImgX = 0;
        targetImgY = 0;
        startTiltLoop();
    }

    // ==========================================
    // BUILD 3D GLASSMORPHISM CARDS & THUMBNAILS
    // ==========================================
    if (trackEl) {
        trackEl.innerHTML = "";

        images.forEach((item, index) => {
            const formattedIdx = formatNumber(index + 1);

            const card = document.createElement("article");
            card.className = "gallery-card";
            card.dataset.index = String(index);
            card.dataset.offset = "far-right";
            card.setAttribute("aria-label", item.title || `Fotoğraf ${formattedIdx}`);

            // Inner Tilt Shell
            const tiltShell = document.createElement("div");
            tiltShell.className = "gallery-card__tilt-shell";

            const glare = document.createElement("div");
            glare.className = "gallery-card__glare";
            glare.setAttribute("aria-hidden", "true");

            const rim = document.createElement("div");
            rim.className = "gallery-card__rim";
            rim.setAttribute("aria-hidden", "true");

            const badge = document.createElement("span");
            badge.className = "gallery-card__badge";
            badge.textContent = `${formattedIdx} / ${formatNumber(total)}`;

            const zoomPill = document.createElement("span");
            zoomPill.className = "gallery-card__zoom-pill";
            zoomPill.setAttribute("aria-hidden", "true");
            zoomPill.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>BÜYÜT</span>
            `;

            const mediaWrap = document.createElement("div");
            mediaWrap.className = "gallery-card__media";

            const img = document.createElement("img");
            img.className = "gallery-card__img";
            img.alt = item.title || `Anı ${formattedIdx}`;
            img.decoding = "async";
            img.hidden = true;

            const fallback = document.createElement("div");
            fallback.className = "media-fallback";
            fallback.hidden = false;
            fallback.innerHTML = `
                <div class="media-fallback__inner">
                    <svg class="media-fallback__icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="16" rx="1"/>
                        <circle cx="8.5" cy="9.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 20"/>
                    </svg>
                    <span class="media-fallback__badge">FOTOĞRAF ${formattedIdx}</span>
                    <p class="media-fallback__title">${item.title || `Anı \${formattedIdx}`}</p>
                    <code class="media-fallback__path">${item.src}</code>
                </div>
            `;

            mediaWrap.appendChild(img);
            mediaWrap.appendChild(fallback);

            tiltShell.appendChild(mediaWrap);
            tiltShell.appendChild(glare);
            tiltShell.appendChild(rim);
            tiltShell.appendChild(badge);
            tiltShell.appendChild(zoomPill);
            card.appendChild(tiltShell);

            // Direct mouse/pointer tilt listeners on the card
            card.addEventListener("pointermove", (e) => {
                if (index !== currentIndex) return;
                handleCardPointerMove(e, card);
            });

            card.addEventListener("pointerleave", () => {
                if (index !== currentIndex) return;
                handleCardPointerLeave();
            });

            // Click behavior: side card -> bring to center | center card -> left/right edge or fullscreen
            card.addEventListener("click", (e) => {
                e.stopPropagation();
                if (index !== currentIndex) {
                    goToSlide(index);
                    return;
                }

                if (window.innerWidth > 700) {
                    const rect = card.getBoundingClientRect();
                    const relX = (e.clientX - rect.left) / rect.width;
                    if (relX < 0.25) {
                        prevSlide();
                        return;
                    } else if (relX > 0.75) {
                        nextSlide();
                        return;
                    }
                }
                openLightbox();
            });

            trackEl.appendChild(card);

            cardEntries.push({
                index,
                item,
                card,
                tiltShell,
                img,
                fallback,
                loaded: false
            });
        });
    }

    // Build Thumbnail Strip
    if (thumbsContainer) {
        thumbsContainer.innerHTML = "";
        images.forEach((item, index) => {
            const formattedIdx = formatNumber(index + 1);
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "gallery-thumb-btn";
            btn.setAttribute(
                "aria-label",
                item.title ? `${index + 1}. fotoğraf: ${item.title}` : `${index + 1}. fotoğrafı göster`
            );

            const thumbImg = document.createElement("img");
            thumbImg.className = "gallery-thumb-btn__img";
            thumbImg.src = item.src;
            thumbImg.alt = item.title || `Anı ${formattedIdx}`;
            thumbImg.loading = "lazy";
            thumbImg.decoding = "async";

            thumbImg.addEventListener("error", () => {
                thumbImg.remove();
                const fallbackBadge = document.createElement("span");
                fallbackBadge.className = "gallery-thumb-btn__fallback";
                fallbackBadge.textContent = formattedIdx;
                btn.appendChild(fallbackBadge);
            });

            btn.appendChild(thumbImg);
            btn.addEventListener("click", () => {
                goToSlide(index);
            });

            thumbsContainer.appendChild(btn);
            thumbButtons.push(btn);
        });
    }

    function ensureCardMediaLoaded(entry) {
        if (!entry || entry.loaded) return;
        entry.loaded = true;

        const probe = new Image();
        probe.onload = () => {
            entry.img.src = entry.item.src;
            entry.img.hidden = false;
            entry.fallback.hidden = true;
        };
        probe.onerror = () => {
            entry.img.hidden = true;
            entry.fallback.hidden = false;
        };
        probe.src = entry.item.src;
    }

    function updateCaptions(item) {
        const hasTitle = Boolean(item.title && item.title.trim().length > 0);
        const hasDesc = Boolean(item.description && item.description.trim().length > 0);

        if (photoTitleEl) {
            photoTitleEl.textContent = hasTitle ? item.title : "";
            photoTitleEl.hidden = !hasTitle;
        }

        if (photoDescEl) {
            photoDescEl.textContent = hasDesc ? item.description : "";
            photoDescEl.hidden = !hasDesc;
        }

        if (lightboxCaptionTitle) {
            lightboxCaptionTitle.textContent = hasTitle ? item.title : "";
            lightboxCaptionTitle.hidden = !hasTitle;
        }

        if (lightboxCaptionDesc) {
            lightboxCaptionDesc.textContent = hasDesc ? item.description : "";
            lightboxCaptionDesc.hidden = !hasDesc;
        }
    }

    // ==========================================
    // UPDATE 3D CAROUSEL POSITIONS & DEPTH
    // ==========================================
    function updateCarouselLayout() {
        const formattedIdx = formatNumber(currentIndex + 1);
        const activeItem = images[currentIndex];

        if (currentIdxEl) currentIdxEl.textContent = formattedIdx;
        if (lightboxCurrent) lightboxCurrent.textContent = formattedIdx;

        updateCaptions(activeItem);

        cardEntries.forEach((entry) => {
            const offset = getCircularOffset(entry.index, currentIndex, total);

            if (entry.index !== currentIndex) {
                resetTiltOnCard(entry);
            }

            if (Math.abs(offset) <= 4) {
                ensureCardMediaLoaded(entry);
            }

            if (offset >= -3 && offset <= 3) {
                entry.card.dataset.offset = String(offset);
                entry.card.setAttribute("aria-hidden", offset === 0 ? "false" : "true");
            } else if (offset < -3) {
                entry.card.dataset.offset = "far-left";
                entry.card.setAttribute("aria-hidden", "true");
            } else {
                entry.card.dataset.offset = "far-right";
                entry.card.setAttribute("aria-hidden", "true");
            }
        });

        thumbButtons.forEach((btn, idx) => {
            const active = idx === currentIndex;
            btn.classList.toggle("is-active", active);
            btn.setAttribute("aria-current", active ? "true" : "false");
        });

        const activeThumb = thumbButtons[currentIndex];
        if (activeThumb && thumbsContainer) {
            const containerLeft = thumbsContainer.scrollLeft;
            const containerWidth = thumbsContainer.clientWidth;
            const thumbLeft = activeThumb.offsetLeft;
            const thumbWidth = activeThumb.offsetWidth;
            const targetScroll = thumbLeft - containerWidth / 2 + thumbWidth / 2;

            if (Math.abs(targetScroll - containerLeft) > 10) {
                thumbsContainer.scrollTo({
                    left: Math.max(0, targetScroll),
                    behavior: "smooth"
                });
            }
        }

        if (isLightboxOpen) {
            renderLightboxImage(currentIndex);
        }
    }

    function goToSlide(targetIndex) {
        if (total === 0) return;
        const normalizedIndex = ((targetIndex % total) + total) % total;
        if (normalizedIndex === currentIndex) return;

        isHoveringActiveCard = false;
        targetTiltX = 0;
        targetTiltY = 0;
        currentTiltX = 0;
        currentTiltY = 0;
        targetImgX = 0;
        targetImgY = 0;
        currentImgX = 0;
        currentImgY = 0;
        resetTiltOnCard(cardEntries[currentIndex]);

        currentIndex = normalizedIndex;
        updateCarouselLayout();
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    // ==========================================
    // LIGHTBOX FULLSCREEN VIEWER
    // ==========================================
    function renderLightboxImage(index) {
        const item = images[index];
        const formattedIdx = formatNumber(index + 1);
        if (!lightboxImg || !lightboxFallback) return;

        const probe = new Image();
        probe.onload = () => {
            lightboxImg.src = item.src;
            lightboxImg.alt = item.title || `Anı ${formattedIdx}`;
            lightboxImg.hidden = false;
            lightboxFallback.hidden = true;
        };
        probe.onerror = () => {
            lightboxImg.hidden = true;
            lightboxFallback.hidden = false;
            if (lightboxFallbackIdx) lightboxFallbackIdx.textContent = `FOTOĞRAF ${formattedIdx}`;
            if (lightboxFallbackTitle) lightboxFallbackTitle.textContent = item.title || `Anı ${formattedIdx}`;
            if (lightboxFallbackPath) lightboxFallbackPath.textContent = item.src;
        };
        probe.src = item.src;
    }

    function openLightbox() {
        if (!lightboxModal) return;
        lastFocusedElement = document.activeElement;
        isLightboxOpen = true;
        lightboxModal.hidden = false;
        lightboxModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        renderLightboxImage(currentIndex);
        if (lightboxCloseBtn) lightboxCloseBtn.focus();
    }

    function closeLightbox() {
        if (!lightboxModal || !isLightboxOpen) return;
        isLightboxOpen = false;
        lightboxModal.hidden = true;
        lightboxModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus();
        }
    }

    if (prevBtn) prevBtn.addEventListener("click", prevSlide);
    if (nextBtn) nextBtn.addEventListener("click", nextSlide);

    if (lightboxPrevBtn) {
        lightboxPrevBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            prevSlide();
        });
    }
    if (lightboxNextBtn) {
        lightboxNextBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            nextSlide();
        });
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", openLightbox);
    }

    if (lightboxCloseBtn) {
        lightboxCloseBtn.addEventListener("click", closeLightbox);
    }

    if (lightboxBackdrop) {
        lightboxBackdrop.addEventListener("click", closeLightbox);
    }

    if (lightboxStage) {
        lightboxStage.addEventListener("click", (e) => {
            if (e.target === lightboxStage) {
                closeLightbox();
            }
        });
    }

    if (viewportEl) {
        viewportEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLightbox();
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        const tag = document.activeElement ? document.activeElement.tagName : "";
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "VIDEO") {
            return;
        }

        const videoModal = document.getElementById("video-modal");
        if (videoModal && !videoModal.hidden) return;

        if (isLightboxOpen) {
            if (e.key === "Escape") {
                e.preventDefault();
                closeLightbox();
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                prevSlide();
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                nextSlide();
            }
            return;
        }

        const gallerySection = document.getElementById("section-gallery");
        if (!gallerySection) return;
        const rect = gallerySection.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;

        if (isInView) {
            if (e.key === "ArrowLeft") {
                prevSlide();
            } else if (e.key === "ArrowRight") {
                nextSlide();
            }
        }
    });

    function attachSwipeSupport(element) {
        if (!element) return;
        let startX = 0;
        let startY = 0;
        let tracking = false;

        element.addEventListener(
            "touchstart",
            (e) => {
                if (e.touches.length !== 1) return;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                tracking = true;
            },
            { passive: true }
        );

        element.addEventListener(
            "touchend",
            (e) => {
                if (!tracking || e.changedTouches.length !== 1) return;
                tracking = false;

                const deltaX = e.changedTouches[0].clientX - startX;
                const deltaY = e.changedTouches[0].clientY - startY;

                if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
                    if (deltaX < 0) {
                        nextSlide();
                    } else {
                        prevSlide();
                    }
                }
            },
            { passive: true }
        );
    }

    attachSwipeSupport(viewportEl);
    attachSwipeSupport(lightboxStage);

    // Initialize 3D Carousel at Photo 01
    updateCarouselLayout();
}