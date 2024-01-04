(function (global) {
    System.addImportMap({
        imports: {
            'vue': `${NPM_REGISTRY}/vue@3.2.29/dist/vue.esm-browser.js`,
            '@vue/reactivity': `${NPM_REGISTRY}/@vue/reactivity@3.0.0/dist/reactivity.esm-browser.prod.js`,
            'vue-class-component': `${NPM_REGISTRY}/vue-class-component@^8.0.0-beta.3/dist/vue-class-component.cjs.js`,
            // systemJsMap comes from index.html
            ...systemJsMap,
        },
    });
})(this);

window.addEventListener('error', e => {
    console.error('ERROR', e.message, e.filename)
});
