/*
 * Dismiss handler for the announcement banner. Externalised from an inline <script>
 * so the site Content-Security-Policy can drop script-src 'unsafe-inline'. Static,
 * served from 'self'. Guarded so it is safe to load once per page.
 *
 * The click listener is delegated from `document` rather than bound to the button
 * itself: a client-side navigation swaps <body>, so the banner on the incoming page
 * is a brand-new element with no listeners, while this script — already in the
 * document — is not re-executed (and the guard below would short-circuit it anyway).
 * `document` survives every swap, so a single listener covers every page.
 */
(function () {
    if (window.__agAnnouncementBannerInit) {
        return;
    }
    window.__agAnnouncementBannerInit = true;

    document.addEventListener('click', function (event) {
        var target = event.target;
        var button = target && target.closest && target.closest('[data-announcement-dismiss]');
        var banner = button && button.closest('[data-announcement-banner]');

        if (!banner) {
            return;
        }

        // Read the id per click rather than once at load: a client-side navigation
        // restores <html> to the incoming page's server-rendered attributes.
        var announcementId = document.documentElement.dataset.announcementId || '';

        try {
            localStorage.setItem('documentation:announcement-banner-dismissed:' + announcementId, 'true');
        } catch (_) {
            // localStorage unavailable (private mode, quota); dismiss for this session only.
        }

        banner.classList.add('is-dismissing');

        banner.addEventListener(
            'transitionend',
            function () {
                banner.remove();
            },
            { once: true }
        );
    });
})();
