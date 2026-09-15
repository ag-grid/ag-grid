/*
 * Player for <Video>: the video plays muted on a loop, and hovering it reveals a button that
 * pauses and resumes it.
 *
 * Each player's two sources (light and dark) arrive via data-attributes, so this file is static
 * and served from 'self' — the site Content-Security-Policy needs no 'unsafe-inline' nor a
 * per-build hash for it.
 *
 * This replaced a `client:load` React island. An island's markup is server-rendered, so it can
 * only ever carry the light source, and `useDarkmode()` does not report the real theme until
 * after hydration — a dark page painted a light video and swapped it out ~170ms later, having
 * downloaded both. The markup names neither file, so the only source the element ever selects is
 * the one assigned here and the dark file is the only frame a dark page ever paints: on a fresh
 * load this script is parser-blocking and immediately follows the markup, and on a client-side
 * navigation it edits the incoming document while that document is still inert.
 */
(function () {
    function applyPlayer(player, darkMode) {
        var video = player.querySelector('video');
        if (!video) {
            return;
        }

        var sources = video.dataset;
        var src = (darkMode && sources.darkSrc) || sources.lightSrc;

        if (!src || video.getAttribute('src') === src) {
            return;
        }

        video.src = src;

        // Assigning src restarts playback, and the autoplay attribute would then start a video the
        // user had paused. pause() clears the element's autoplaying flag, holding it as it was.
        if (!player.hasAttribute('data-playing')) {
            video.pause();
        }
    }

    function applyIn(root, darkMode) {
        var players = root.querySelectorAll('[data-video-player]');
        for (var i = 0, len = players.length; i < len; ++i) {
            applyPlayer(players[i], darkMode);
        }
    }

    function applyAll(darkMode) {
        applyIn(document, darkMode);
    }

    function currentDarkMode() {
        return document.documentElement.dataset.darkMode === 'true';
    }

    function onClick(event) {
        var button = event.target.closest && event.target.closest('[data-video-toggle]');
        if (!button) {
            return;
        }

        var player = button.closest('[data-video-player]');
        var video = player && player.querySelector('video');
        if (!video) {
            return;
        }

        if (player.toggleAttribute('data-playing')) {
            video.play();
        } else {
            video.pause();
        }
    }

    // Registered by whichever instance of this script runs first. Both the click handler and the
    // dark-mode listener find their players by querying the document at call time rather than
    // closing over the ones present at registration: a client-side navigation adopts a fresh set
    // of server-rendered players — each back on its light source — and Astro will not re-execute a
    // script it has already run, so anything captured here would go stale on the first navigation.
    if (!window.__agVideoPlayerInit) {
        if (!window.addDarkmodeOnChange) {
            return;
        }

        window.__agVideoPlayerInit = true;
        document.addEventListener('click', onClick);

        // The incoming page is a DOMParser document, which loads nothing. Correcting the sources
        // while the videos are still in it means they are inserted already on the file the theme
        // wants, and the light one is never requested. Waiting until after the swap would be a
        // race with the resource selection each video is queued for on insertion, which the first
        // video on the page loses.
        document.addEventListener('astro:before-swap', function (event) {
            applyIn(event.newDocument, currentDarkMode());
        });

        // addDarkmodeOnChange also invokes the listener immediately, applying the theme to the
        // players parsed so far; each subsequent instance applies it to its own.
        window.addDarkmodeOnChange(applyAll);
    } else {
        applyAll(currentDarkMode());
    }
})();
