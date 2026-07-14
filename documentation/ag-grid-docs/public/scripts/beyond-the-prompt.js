/*
 * Beyond the Prompt page behaviour. Externalised from an inline <script> so the
 * site Content-Security-Policy can drop script-src 'unsafe-inline'. Static,
 * served from 'self'. Wrapped in an IIFE to avoid leaking into global scope.
 */
(function () {
    const tabs = Array.from(document.querySelectorAll('[role="tab"][data-tab]'));
    const panels = Array.from(document.querySelectorAll('[data-panel]'));

    const activate = (name, focusTab = false) => {
        for (const tab of tabs) {
            const selected = tab.dataset.tab === name;
            tab.setAttribute('aria-selected', selected ? 'true' : 'false');
            tab.tabIndex = selected ? 0 : -1;
            if (selected && focusTab) {
                tab.focus();
            }
        }
        for (const panel of panels) {
            panel.hidden = panel.dataset.panel !== name;
        }
    };

    // Roving tabindex: only the selected tab is in the tab order on load.
    for (const tab of tabs) {
        tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
    }

    for (let i = 0, len = tabs.length; i < len; ++i) {
        const tab = tabs[i];
        tab.addEventListener('click', () => activate(tab.dataset.tab ?? 'talks'));
        // Arrow / Home / End move between tabs (the ARIA tablist keyboard pattern).
        tab.addEventListener('keydown', (event) => {
            let next = -1;
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                next = (i + 1) % len;
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                next = (i - 1 + len) % len;
            } else if (event.key === 'Home') {
                next = 0;
            } else if (event.key === 'End') {
                next = len - 1;
            }
            if (next === -1) {
                return;
            }
            event.preventDefault();
            activate(tabs[next].dataset.tab ?? 'talks', true);
        });
    }

    // Hero keynote: clicking the custom thumbnail swaps in the autoplay embed.
    for (const frame of document.querySelectorAll('[data-hero-video]')) {
        const playBtn = frame.querySelector('[data-hero-video-play]');
        playBtn?.addEventListener('click', () => {
            const videoId = frame.dataset.youtubeId;
            if (!videoId) {
                return;
            }
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            iframe.title = 'Opening Keynote';
            iframe.allow = 'autoplay; encrypted-media; picture-in-picture; web-share';
            iframe.allowFullscreen = true;
            frame.replaceChildren(iframe);
        });
    }

    // Rotating speaker heads: play on row hover, reset on leave. preload="none"
    // means the webms only download the first time a row is hovered.
    for (const row of document.querySelectorAll('[data-session-row]')) {
        const videos = Array.from(row.querySelectorAll('video'));
        if (videos.length === 0) {
            continue;
        }
        row.addEventListener('mouseenter', () => {
            for (const video of videos) {
                void video.play().catch(() => {});
            }
        });
        row.addEventListener('mouseleave', () => {
            for (const video of videos) {
                video.pause();
                video.currentTime = 0;
            }
        });
    }

    // Photo gallery marquee: the slides are loading="lazy" and the strip scrolls
    // horizontally, so images off to the right only fetch as they scroll into
    // view and visibly pop in. Eagerly load the whole set once the section is
    // approaching the viewport (600px early), so every slide is ready by the
    // time it scrolls across.
    const gallery = document.querySelector('[data-gallery]');
    if (gallery && 'IntersectionObserver' in window) {
        const galleryObserver = new IntersectionObserver(
            (entries) => {
                if (!entries.some((entry) => entry.isIntersecting)) {
                    return;
                }
                for (const img of gallery.querySelectorAll('img[loading="lazy"]')) {
                    img.loading = 'eager';
                }
                galleryObserver.disconnect();
            },
            { rootMargin: '600px 0px' }
        );
        galleryObserver.observe(gallery);
    }

    // Session recording modal. Session titles with a recording link to a real
    // /session/<slug> page; here we intercept the click, play the video in a
    // modal, and sync the URL so it stays shareable and back-button friendly.
    const sessionModal = document.querySelector('[data-session-modal-root]');
    const sessionFrame = document.querySelector('[data-session-modal-iframe]');

    // Remember what was focused before opening so focus can be restored on close.
    let sessionTrigger = null;

    const openSession = (videoId) => {
        if (!sessionModal || !sessionFrame || !videoId) {
            return;
        }
        sessionTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        sessionFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        sessionModal.hidden = false;
        document.body.style.overflow = 'hidden';
        // Move focus into the dialog so keyboard / screen-reader users land on it.
        sessionModal.querySelector('[data-session-modal-close]')?.focus();
    };
    const closeSession = () => {
        if (!sessionModal || !sessionFrame) {
            return;
        }
        sessionModal.hidden = true;
        sessionFrame.src = '';
        document.body.style.overflow = '';
        // Restore focus to the session link that opened the modal.
        sessionTrigger?.focus();
        sessionTrigger = null;
    };

    // Guards the popstate that our own history.back() fires on close, so the act
    // of closing the modal can never re-open it.
    let closingModal = false;

    const closeAndReturn = () => {
        // Hide the modal immediately so closing always works, whatever the entry
        // we land on carries. We still call history.back() to restore the previous
        // URL (keeping the /session/<slug> entry in forward history), but
        // `closingModal` stops the resulting popstate from re-opening the modal —
        // otherwise backing onto another session entry re-opens it with a blank
        // iframe and the modal appears stuck open.
        closeSession();
        if (history.state && history.state.btpSession) {
            closingModal = true;
            history.back();
        }
    };

    // The recording plays in a cross-origin YouTube iframe. Once that iframe
    // takes keyboard focus (autoplay, or the viewer clicking the video), the
    // page stops receiving keydown — so the first Escape is swallowed by the
    // player — and the next click on the page is spent handing focus back to the
    // window rather than activating the close button. Either way it takes two
    // presses to close. While the modal is open, pull focus back out of the
    // iframe so a single Escape or click always closes it. We leave focus alone
    // while the video is fullscreen, where the browser's own Escape exits
    // fullscreen and focus should stay with the player.
    const guardModalFocus = () => {
        if (!sessionModal || sessionModal.hidden || document.fullscreenElement) {
            return;
        }
        if (document.activeElement === sessionFrame) {
            sessionModal.querySelector('[data-session-modal-close]')?.focus();
        }
    };
    window.addEventListener('blur', () => {
        // Defer so document.activeElement has settled on the iframe before we check.
        setTimeout(guardModalFocus, 0);
    });

    for (const link of document.querySelectorAll('[data-session-modal]')) {
        link.addEventListener('click', (event) => {
            const videoId = link.dataset.youtubeId;
            if (!videoId) {
                return;
            }
            event.preventDefault();
            openSession(videoId);
            // Agenda session links carry a shareable /session/<slug> URL to push
            // into history. The hero recap trigger is a plain <button> with no
            // href, so fall back to the current URL rather than pushing null
            // (which would corrupt the address bar and back/forward behaviour).
            const sessionUrl = link.getAttribute('href') || location.href;
            history.pushState({ btpSession: videoId }, '', sessionUrl);
        });
    }
    for (const closer of document.querySelectorAll('[data-session-modal-close]')) {
        closer.addEventListener('click', closeAndReturn);
    }
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sessionModal && !sessionModal.hidden) {
            closeAndReturn();
        }
    });
    // Browser back/forward has already moved the URL, so just sync the modal.
    window.addEventListener('popstate', (event) => {
        // If this popstate came from closing the modal, keep it closed rather than
        // re-opening whatever session the landed-on entry points at.
        if (closingModal) {
            closingModal = false;
            closeSession();
            return;
        }
        const state = event.state;
        if (state && state.btpSession) {
            openSession(state.btpSession);
        } else {
            closeSession();
        }
    });

    // Trap Tab focus within the modal while it is open.
    sessionModal?.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab' || sessionModal.hidden) {
            return;
        }
        const focusable = Array.from(
            sessionModal.querySelectorAll('button, a[href], iframe, [tabindex]:not([tabindex="-1"])')
        ).filter((el) => el.offsetParent !== null);
        if (focusable.length === 0) {
            return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });
})();
