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
            history.replaceState(null, '', '#pricing');
        }
    });
})();
