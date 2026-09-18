/*
 * Dismiss handler for the announcement banner. Externalised from an inline <script>
 * so the site Content-Security-Policy can drop script-src 'unsafe-inline'. Static,
 * served from 'self'. Guarded so it is safe to load once per page.
 */
(function () {
    if (window.__agAnnouncementBannerInit) {
        return;
    }
    window.__agAnnouncementBannerInit = true;

    function onDismissClick(event) {
        var banner = event.currentTarget.closest('[data-announcement-banner]');

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
    }

    function bindDismissButton() {
        var button = document.querySelector('[data-announcement-dismiss]');

        // Always the same function reference, so re-binding the same button is a no-op.
        if (button) {
            button.addEventListener('click', onDismissClick);
        }
    }

    bindDismissButton();

    // A client-side navigation swaps <body>, so the incoming page's banner is a brand-new
    // element with no listener, while this script — already in the document — is not
    // re-executed. Re-bind after every swap; astro:page-load covers the initial load too.
    document.addEventListener('astro:page-load', bindDismissButton);
})();
