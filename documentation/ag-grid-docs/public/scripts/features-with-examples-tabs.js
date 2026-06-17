/*
 * Toggles the active landing-page example panel in response to tab changes from the
 * React component. Externalised from an inline <script> so the site
 * Content-Security-Policy can drop script-src 'unsafe-inline'. Static, served from
 * 'self'; guarded so it only binds once per page.
 */
(function () {
    if (window.__agFeaturesWithExamplesTabsInit) {
        return;
    }
    window.__agFeaturesWithExamplesTabsInit = true;

    document.addEventListener('landing-page-feature-tab-change', function (event) {
        var index = event.detail.index;

        // Hide all panels
        var panels = document.querySelectorAll('.landing-page-example-panel');
        for (var i = 0, len = panels.length; i < len; ++i) {
            panels[i].classList.remove('active');
        }

        // Show the selected panel
        var activePanel = document.querySelector('.landing-page-example-panel[data-index="' + index + '"]');
        if (activePanel) {
            activePanel.classList.add('active');
        }
    });
})();
