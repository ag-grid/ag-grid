/*
 * Records a Plausible "404" event for the current path on the 404 page.
 * Externalised from an inline <script> so the site Content-Security-Policy can drop
 * script-src 'unsafe-inline'. Static, served from 'self'.
 */
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        if (!window.plausible) {
            return;
        }
        window.plausible('404', { props: { path: document.location.pathname } });
    });
})();
