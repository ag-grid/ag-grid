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

        // Resolve the Bryntum API surface. The published UMD currently leaves
        // window.bryntum.<namespace> empty and registers public classes on the
        // internal window.bryntum._classes registry; prefer that when present
        // and fall back to the public namespace (which is the documented path
        // and may be restored in a future build).
        var publicNs = window.bryntum && window.bryntum[namespace];
        var classes = window.bryntum && window.bryntum._classes;
        var publicHasContents = publicNs && Object.keys(publicNs).length > 0;
        var api = publicHasContents ? publicNs : classes;

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
