/*
 * Dark-mode image swapping for <ImageCaption>. Externalised from a per-instance
 * inline `define:vars` script so the site Content-Security-Policy can drop
 * script-src 'unsafe-inline'. Each image's light/dark sources arrive via data-
 * attributes, so this file is static and served from 'self'.
 *
 * The dark-mode listener re-queries the document on every call rather than closing over
 * the images it found at registration time: a client-side navigation adopts a fresh set of
 * server-rendered images — each back on its light src — and Astro will not re-execute a
 * script it has already run, so images swapped in by the second and later navigations would
 * otherwise stay in light mode on a dark page.
 */
(function () {
    function applyImage(image, darkMode) {
        var lightSrc = image.dataset.lightSrc;
        if (!lightSrc) {
            return;
        }

        var darkSrc = image.dataset.darkSrc;
        var src = darkSrc && darkMode ? darkSrc : lightSrc;

        if (image.getAttribute('src') !== src) {
            image.src = src;
        }
    }

    function applyAll(darkMode) {
        var images = document.querySelectorAll('img[data-darkmode-img]');
        for (var i = 0, len = images.length; i < len; ++i) {
            applyImage(images[i], darkMode);
        }
    }

    function currentDarkMode() {
        return document.documentElement.dataset.darkMode === 'true';
    }

    // One listener for the whole document, registered by whichever instance of this script
    // runs first. addDarkmodeOnChange also invokes it immediately, applying the theme to the
    // images parsed so far; each subsequent instance applies it to its own.
    if (!window.__agImageCaptionDarkModeInit) {
        if (!window.addDarkmodeOnChange) {
            return;
        }

        window.__agImageCaptionDarkModeInit = true;
        window.addDarkmodeOnChange(applyAll);
    } else {
        applyAll(currentDarkMode());
    }
})();
