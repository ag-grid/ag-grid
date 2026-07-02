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

    var STORAGE_KEY = 'documentation:announcement-banner-dismissed';
    var banner = document.querySelector('[data-announcement-banner]');
    var button = banner && banner.querySelector('[data-announcement-dismiss]');

    if (!button) {
        return;
    }

    button.addEventListener('click', function () {
        try {
            localStorage.setItem(STORAGE_KEY, 'true');
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
