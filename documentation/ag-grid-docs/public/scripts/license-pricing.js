/*
 * Licence & pricing page behaviour. Externalised from an inline <script> so the
 * site Content-Security-Policy can drop script-src 'unsafe-inline'. Static,
 * served from 'self'. Wrapped in an IIFE to avoid leaking into global scope.
 */
(function () {
    const cta = document.querySelector('a.button[href="#pricing"]');
    if (!cta) {
        return;
    }

    cta.addEventListener('click', (event) => {
        const target = document.getElementById('pricing');
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
            // Preserve the existing state: Astro's ClientRouter keeps its history index and
            // scroll offsets there, and replacing them breaks back/forward for the whole page.
            // Classic script served verbatim from public/, so the shared replaceHistoryUrl()
            // helper is not importable here.
            // eslint-disable-next-line no-restricted-syntax -- no module system in a public/ script
            history.replaceState(history.state, '', '#pricing');
        }
    });
})();
