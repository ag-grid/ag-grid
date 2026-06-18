/*
 * Google Tag Manager bootstrap. Externalised from an inline `define:vars` script
 * (see GoogleTagManager.astro) so the site Content-Security-Policy can drop
 * script-src 'unsafe-inline'. Configuration arrives via data- attributes on the
 * loading <script> tag, so this file is static and served from 'self'.
 *
 * Must be loaded as a classic, non-deferred script: it reads
 * document.currentScript, which is only set during synchronous execution.
 */
(function () {
    var el = document.currentScript;
    var id = el && el.dataset.gtmId;
    if (!id) {
        return;
    }
    var extraParams = el.dataset.gtmExtra || '';
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var firstScript = document.getElementsByTagName('script')[0];
    var gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=' + id + extraParams + '&gtm_cookies_win=x';
    firstScript.parentNode.insertBefore(gtmScript, firstScript);
})();
