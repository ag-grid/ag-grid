(function (global) {
    var ANGULAR_VERSION = "14.2.6";

    System.addImportMap({
        imports: {
            '@angular/animations': `${NPM_REGISTRY}/@angular/animations@${ANGULAR_VERSION}/fesm2015/animations.mjs`,
            '@angular/animations/browser': `${NPM_REGISTRY}/@angular/animations@${ANGULAR_VERSION}/fesm2015/browser.mjs`,
            '@angular/common': `${NPM_REGISTRY}/@angular/common@${ANGULAR_VERSION}/fesm2015/common.mjs`,
            '@angular/common/http': `${NPM_REGISTRY}/@angular/common@${ANGULAR_VERSION}/fesm2015/http.mjs`,
            '@angular/compiler': `${NPM_REGISTRY}/@angular/compiler@${ANGULAR_VERSION}/fesm2015/compiler.mjs`,
            '@angular/core': `${NPM_REGISTRY}/@angular/core@${ANGULAR_VERSION}/fesm2015/core.mjs`,
            '@angular/forms': `${NPM_REGISTRY}/@angular/forms@${ANGULAR_VERSION}/fesm2015/forms.mjs`,
            '@angular/platform-browser-dynamic': `${NPM_REGISTRY}/@angular/platform-browser-dynamic@${ANGULAR_VERSION}/fesm2015/platform-browser-dynamic.mjs`,
            '@angular/platform-browser': `${NPM_REGISTRY}/@angular/platform-browser@${ANGULAR_VERSION}/fesm2015/platform-browser.mjs`,
            '@angular/platform-browser/animations': `${NPM_REGISTRY}/@angular/platform-browser@${ANGULAR_VERSION}/fesm2015/animations.mjs`,
            'rxjs': `${NPM_REGISTRY}/rxjs@7.8.1/dist/bundles/rxjs.umd.min.js`,
            'rxjs/operators': `${NPM_REGISTRY}/rxjs@7.8.1/dist/bundles/rxjs.umd.min.js`,
            // systemJsMap comes from index.html
            ...systemJsMap,
        },
    });
})(this);

window.addEventListener('error', e => {
    console.error('ERROR', e.message, e.filename)
});
