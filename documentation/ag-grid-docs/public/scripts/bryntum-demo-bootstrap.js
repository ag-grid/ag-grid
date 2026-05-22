// Shared bootstrap for every Bryntum "Try it yourself!" demo on the campaign
// pages. Each per-product script calls `bryntumDemoInit(namespace, mountId,
// factory)`; this helper handles mount lookup, the `window.bryntum[namespace]`
// presence check, the dataset re-init guard, and DOM readiness — keeping the
// per-product files focused on demo configuration only.

window.bryntumDemoInit = function (namespace, mountId, factory) {
    function init() {
        var mount = document.getElementById(mountId);
        if (!mount) {
            return;
        }

        var api = window.bryntum && window.bryntum[namespace];
        if (!api) {
            // Bryntum UMD bundle did not load (CDN failure, CSP block, or
            // upstream rename). Warn so the empty demo frame doesn't look like
            // an unexplained bug to anyone inspecting the page.
            console.warn(
                '[bryntum-demo] window.bryntum.' + namespace + ' not loaded; skipping live demo for #' + mountId + '.'
            );
            return;
        }

        if (mount.dataset.bryntumInitialized === '1') {
            return;
        }
        mount.dataset.bryntumInitialized = '1';

        factory(api, mount);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
};
