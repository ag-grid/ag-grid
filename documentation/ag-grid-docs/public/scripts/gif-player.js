/*
 * Player for <Gif>: the still first frame is shown with a play button over it, and the
 * multi-megabyte animated GIF is only requested once the user clicks.
 *
 * Each player's four sources (still and animated, light and dark) arrive via data-attributes,
 * so this file is static and served from 'self' — the site Content-Security-Policy needs no
 * 'unsafe-inline' nor a per-build hash for it.
 *
 * This replaced a `client:load` React island. An island's markup is server-rendered, so it can
 * only ever carry the light source, and `useDarkmode()` does not report the real theme until
 * after hydration — a dark page painted the light still and swapped it out half a second later.
 * Running here, parser-blocking and immediately after the markup, the correct theme is the only
 * one that is ever painted.
 */
(function () {
    function applyPlayer(player, darkMode) {
        var image = player.querySelector('img');
        if (!image) {
            return;
        }

        var sources = image.dataset;
        var src = player.hasAttribute('data-playing')
            ? (darkMode && sources.darkGif) || sources.lightGif
            : (darkMode && sources.darkStill) || sources.lightStill;

        if (src && image.getAttribute('src') !== src) {
            image.src = src;
        }
    }

    function applyAll(darkMode) {
        var players = document.querySelectorAll('[data-gif-player]');
        for (var i = 0, len = players.length; i < len; ++i) {
            applyPlayer(players[i], darkMode);
        }
    }

    function currentDarkMode() {
        return document.documentElement.dataset.darkMode === 'true';
    }

    function onClick(event) {
        var player = event.target.closest && event.target.closest('[data-gif-player]');
        if (!player) {
            return;
        }

        player.toggleAttribute('data-playing');
        applyPlayer(player, currentDarkMode());
    }

    // Registered by whichever instance of this script runs first. Both the click handler and the
    // dark-mode listener find their players by querying the document at call time rather than
    // closing over the ones present at registration: a client-side navigation adopts a fresh set
    // of server-rendered players — each back on its light still — and Astro will not re-execute a
    // script it has already run, so anything captured here would go stale on the first navigation.
    if (!window.__agGifPlayerInit) {
        if (!window.addDarkmodeOnChange) {
            return;
        }

        window.__agGifPlayerInit = true;
        document.addEventListener('click', onClick);
        // addDarkmodeOnChange also invokes the listener immediately, applying the theme to the
        // players parsed so far; each subsequent instance applies it to its own.
        window.addDarkmodeOnChange(applyAll);
    } else {
        applyAll(currentDarkMode());
    }
})();
