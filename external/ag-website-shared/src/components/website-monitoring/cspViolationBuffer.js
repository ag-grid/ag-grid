/*
 * Holds the page's CSP violations from the start of the page, until the website monitoring module
 * takes them over (see ./cspViolationReporter.ts). That module is deferred, so without this it
 * would miss whatever is blocked first, such as Google Tag Manager's inline tags.
 *
 * Loaded as a classic script ahead of Google Tag Manager. Nothing is sent from here.
 */
(function () {
    window.agCspViolations = window.agCspViolations || [];
    document.addEventListener('securitypolicyviolation', function (event) {
        // Taken over by the reporter, which then listens for itself
        if (Array.isArray(window.agCspViolations)) {
            window.agCspViolations.push(event);
        }
    });
})();
