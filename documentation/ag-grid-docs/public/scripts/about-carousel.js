/*
 * Auto-scrolling "Life at AG Grid" carousel on the About page. Externalised from an
 * inline <script> so the site Content-Security-Policy can drop script-src
 * 'unsafe-inline'. Static, served from 'self'; guarded so it only starts once.
 */
(function () {
    if (window.__agAboutCarouselInit) {
        return;
    }
    window.__agAboutCarouselInit = true;

    document.addEventListener('DOMContentLoaded', function () {
        var track = document.getElementById('carousel-track');
        if (!track) {
            return;
        }
        var animationFrame;
        var scrollLeft = 0;
        var speed = 1.5; // px per ms

        var animate = function () {
            scrollLeft += speed;
            if (scrollLeft >= track.scrollWidth / 2) {
                scrollLeft = 0;
            }
            track.scrollLeft = scrollLeft;
            animationFrame = requestAnimationFrame(animate);
        };
        animationFrame = requestAnimationFrame(animate);

        // Cleanup when the user navigates away
        window.addEventListener('beforeunload', function () {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        });
    });
})();
