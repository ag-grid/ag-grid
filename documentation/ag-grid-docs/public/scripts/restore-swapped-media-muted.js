// Swapped-in media is created via createElement(), where a `muted` attribute does not set `.muted`.
(function () {
    document.addEventListener('astro:after-swap', function () {
        var media = document.querySelectorAll('video, audio');

        for (var i = 0, len = media.length; i < len; ++i) {
            var element = media[i];

            if (!element.closest('[data-astro-transition-persist]')) {
                element.muted = element.defaultMuted;
            }
        }
    });
})();
