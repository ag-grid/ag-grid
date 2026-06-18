/*
 * Dark-mode image swapping for <ImageCaption>. Externalised from a per-instance
 * inline `define:vars` script so the site Content-Security-Policy can drop
 * script-src 'unsafe-inline'. Each image's light/dark sources arrive via data-
 * attributes, so this file is static and served from 'self'. Loaded once per page
 * (guarded), it wires up every ImageCaption image.
 */
(function () {
    if (window.__agImageCaptionDarkModeInit) {
        return;
    }
    window.__agImageCaptionDarkModeInit = true;

    function init() {
        var onChange = window.addDarkmodeOnChange;
        if (!onChange) {
            return;
        }
        var images = document.querySelectorAll('img[data-darkmode-img]');
        for (var i = 0, len = images.length; i < len; ++i) {
            wireImage(onChange, images[i]);
        }
    }

    function wireImage(onChange, image) {
        var lightSrc = image.dataset.lightSrc;
        var darkSrc = image.dataset.darkSrc;
        if (!lightSrc) {
            return;
        }
        onChange(function (darkMode) {
            image.src = darkSrc && darkMode ? darkSrc : lightSrc;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
