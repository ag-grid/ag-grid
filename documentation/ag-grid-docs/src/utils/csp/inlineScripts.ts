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

    // <html> survives a view-transition swap, so the attributes and the listeners below
    // only need establishing once, on a hard load.
    if (!globalThis.addDarkmodeOnChange) {
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
    }

    // Show the announcement banner only when it has not been dismissed AND the current date
    // falls within its scheduled window. Dismissal is tracked per-banner: the storage key is
    // suffixed with the banner id (derived from its title + dates) so dismissing one banner
    // does not hide future ones. Evaluated here (at request time) rather than in the Astro
    // build so the window applies to a static deployment without a redeploy. Dates are read
    // from <html> data attributes (YYYY-MM-DD); absent bounds are open-ended.
    const applyAnnouncementVisibility = () => {
        const announcementId = htmlEl.dataset.announcementId || '';
        if (localStorage.getItem('documentation:announcement-banner-dismissed:' + announcementId) === 'true') {
            return;
        }

        const today = new Date().toISOString().slice(0, 10);
        const showDate = htmlEl.dataset.announcementShowDate;
        const untilDate = htmlEl.dataset.announcementUntilDate;
        const withinWindow = (!showDate || today >= showDate) && (!untilDate || today <= untilDate);

        if (withinWindow) {
            htmlEl.dataset.showAnnouncement = 'true';
        }
    };

    applyAnnouncementVisibility();

    // A client-side navigation restores <html> to its server-rendered attributes and never
    // re-executes a <body> script, so the flag has to be re-derived after every swap.
    document.addEventListener('astro:after-swap', applyAnnouncementVisibility);
`;

// Sets html[data-os="mac"] so the CSS in _inline.scss can show "⌘ Command" instead of
// "^ Ctrl" in {% kbd %} tags, and the search bar can show "⌘ K" instead of "Ctrl K".
// There's no build-time (nor pure-CSS) way to know the visitor's OS, so this runs
// render-blocking at the top of <body> — same spot as the dark-mode script — to avoid a
// flash of the wrong label. Feature-detects the Chromium-only User-Agent Client Hints
// API first, then falls back to the older (deprecated but universally supported)
// navigator.platform. iOS is matched too: those devices report "iPhone"/"iPad" rather
// than "MacIntel" on older versions, and an attached Apple keyboard still uses Command.
export const KBD_PLATFORM_INIT_SCRIPT = `
    const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    if (/(mac|iphone|ipod|ipad)/i.test(platform)) {
        const applyMacPlatform = () => {
            document.documentElement.dataset.os = 'mac';
        };

        applyMacPlatform();

        // A client-side navigation restores <html> to its server-rendered attributes and never
        // re-executes a <body> script, so the flag has to be re-applied after every swap.
        document.addEventListener('astro:after-swap', applyMacPlatform);
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

// Pageview per client-side navigation. astro:page-load also fires on a hard load, where
// the tagged-events script has already sent one — hence skipping the first event.
export const PLAUSIBLE_PAGE_LOAD_SCRIPT = `
    if (!globalThis.plausiblePageViewRegistered) {
        let firstLoad = true;
        globalThis.plausiblePageViewRegistered = true;
        document.addEventListener('astro:page-load', function () {
            if (firstLoad) {
                firstLoad = false;
                return;
            }
            window.plausible?.('pageview');
        });
    }
`;
