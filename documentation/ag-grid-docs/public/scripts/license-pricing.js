/*
 * Licence & pricing page behaviour: smooth-scroll the page's in-page links (Explore products,
 * Contact sales) to their sections. Externalised from an inline <script> so the site
 * Content-Security-Policy can drop script-src 'unsafe-inline'. Static, served from 'self'.
 * Wrapped in an IIFE to avoid leaking into global scope. Without it the links still jump.
 */
(function () {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        const hash = link.getAttribute('href');
        const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
        if (!target) {
            return;
        }

        link.addEventListener('click', (event) => {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
            // Preserve the existing state: Astro's ClientRouter keeps its history index and
            // scroll offsets there, and replacing them breaks back/forward for the whole page.
            // Classic script served verbatim from public/, so the shared replaceHistoryUrl()
            // helper is not importable here.
            // eslint-disable-next-line no-restricted-syntax -- no module system in a public/ script
            history.replaceState(history.state, '', hash);
        });
    });
})();
