// Shared bootstrap for every Bryntum "Try it yourself!" demo on the campaign
// pages. Each per-product script calls `bryntumDemoInit(namespace, mountId,
// factory)`; this helper handles mount lookup, loading the product's ES module,
// the dataset re-init guard, and DOM readiness — keeping the per-product files
// focused on demo configuration only.

window.bryntumDemoInit = function (namespace, mountId, factory) {
    function init() {
        var mount = document.getElementById(mountId);
        if (!mount) {
            return;
        }

        if (mount.dataset.bryntumInitialized === '1') {
            return;
        }

        // BryntumCampaign.astro emits a modulepreload link per product. Importing
        // its URL (rather than relying on script execution order) also holds up
        // after a ClientRouter soft navigation, where `defer` is not honoured.
        var link = document.querySelector('link[rel="modulepreload"][data-bryntum-module="' + namespace + '"]');
        if (!link) {
            console.warn(
                '[bryntum-demo] no ' + namespace + ' module on the page; skipping live demo for #' + mountId + '.'
            );
            return;
        }

        mount.dataset.bryntumInitialized = '1';

        import(link.href).then(
            function (api) {
                factory(api, mount);
            },
            function (error) {
                // Bryntum module did not load (CDN failure, CSP block, or
                // upstream rename). Warn so the empty demo frame doesn't look
                // like an unexplained bug to anyone inspecting the page.
                delete mount.dataset.bryntumInitialized;
                console.warn(
                    '[bryntum-demo] ' + namespace + ' module failed to load; skipping live demo for #' + mountId + '.',
                    error
                );
            }
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
};
