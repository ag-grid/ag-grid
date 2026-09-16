/*
 * Astro's client-side router builds the incoming page with DOMParser and then adopts that
 * document's <body> into the live one. A <video>/<audio> parsed in there has already begun the
 * HTML resource selection algorithm — far enough to leave networkState at NETWORK_NO_SOURCE —
 * but the algorithm can never finish, because an inert document never runs the tasks it waits
 * on.
 *
 * On insertion the spec only restarts resource selection when networkState is NETWORK_EMPTY, so
 * an element already sitting at NETWORK_NO_SOURCE is never retried: the media stays blank (a bare
 * 300x150 box) until a hard reload. Calling load() restarts the algorithm in the live document.
 *
 * Only dark mode hid this on docs pages. Video.tsx swaps src to the `-dark` file after hydration,
 * and re-setting src restarts resource selection as a side effect, so the stall was visible in
 * light mode alone.
 *
 * Externalised to a 'self' script (rather than inlined) so the site Content-Security-Policy can
 * keep script-src free of 'unsafe-inline' without needing a per-build hash.
 */
(function () {
    document.addEventListener('astro:after-swap', function () {
        var media = document.querySelectorAll('video, audio');

        for (var i = 0, len = media.length; i < len; ++i) {
            var element = media[i];

            // Media carried across the swap by transition:persist keeps its own loading state and
            // must not be restarted; only the freshly adopted, permanently stalled ones qualify.
            if (
                element.networkState === HTMLMediaElement.NETWORK_NO_SOURCE &&
                element.readyState === HTMLMediaElement.HAVE_NOTHING
            ) {
                element.load();
            }
        }
    });
})();
