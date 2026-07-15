/**
 * Exact source of the main-page inline `<script>`s that are authorised by SHA-256
 * hash in the Content-Security-Policy (instead of `'unsafe-inline'`).
 *
 * Single source of truth: these strings are rendered verbatim via
 * `<script is:inline set:html={…} />` AND hashed for `script-src` in cspRules.ts.
 * The browser hashes the exact bytes between `<script>` and `</script>`, so the
 * rendered content and the hashed content MUST be identical — keep them flowing
 * from this one constant and never edit the inline markup directly.
 *
 * Dependency-free (plain strings) so cspRules.ts can import it without pulling in
 * the Astro/Vite build graph.
 */

// Dark-mode bootstrap. Runs render-blocking at the top of <body> so the first
// paint is already in the correct theme (no flash); kept inline (not externalised)
// to avoid adding a fetch before first paint. No server-injected values.
export const DARK_MODE_INIT_SCRIPT = `
    const htmlEl = document.querySelector('html');
    const localDarkmode = localStorage['documentation:darkmode'];
    const isOSDarkmode = (
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ).toString();

    if (localDarkmode === undefined) {
        localStorage.setItem('documentation:darkmode', isOSDarkmode);
    }

    htmlEl.classList.add('no-transitions');
    htmlEl.dataset.darkMode = localDarkmode !== undefined ? localDarkmode : isOSDarkmode;

    const getDarkmode = () => htmlEl.dataset.darkMode === 'true';
    htmlEl.dataset.agThemeMode = getDarkmode() ? 'dark-blue' : 'light';
    htmlEl.offsetHeight; // Trigger a reflow, flushing the CSS changes
    htmlEl.classList.remove('no-transitions');

    // Set up dark mode on change listeners
    const darkModeListeners = [];
    globalThis.addDarkmodeOnChange = (onChange) => {
        darkModeListeners.push(onChange);

        // Run once on initialisation
        onChange(getDarkmode());
    };

    // Listen to changes to html[data-dark-mode] attribute and notify listeners
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-dark-mode') {
                const newDarkmode = getDarkmode();
                darkModeListeners.forEach((listener) => {
                    listener(newDarkmode);
                });
            }
        });
    });
    observer.observe(htmlEl, { attributes: true });

    if (localStorage.getItem('documentation:announcement-banner-dismissed') !== 'true') {
        document.documentElement.dataset.showAnnouncement = 'true';
    }
`;

// Sets html[data-os="mac"] so the CSS in _inline.scss can show "⌘ Command" instead of
// "^ Ctrl" in {% kbd %} tags for Mac visitors. There's no build-time (nor pure-CSS) way
// to know the visitor's OS, so this runs render-blocking at the top of <body> — same
// spot as the dark-mode script — to avoid a flash of the wrong label. Feature-detects
// the Chromium-only User-Agent Client Hints API first, then falls back to the older
// (deprecated but universally supported) navigator.platform.
export const KBD_PLATFORM_INIT_SCRIPT = `
    const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    if (/mac/i.test(platform)) {
        document.documentElement.dataset.os = 'mac';
    }
`;

// Plausible analytics queue stub. The tagged-events script itself loads externally
// (plausible.io, allow-listed); this only sets up window.plausible before it arrives.
export const PLAUSIBLE_INIT_SCRIPT = `
    window.plausible =
        window.plausible ||
        function () {
            (window.plausible.q = window.plausible.q || []).push(arguments);
        };
`;
