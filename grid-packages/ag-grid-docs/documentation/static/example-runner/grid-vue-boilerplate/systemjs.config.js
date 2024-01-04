(function (global) {
    System.addImportMap({
        imports: {
            'vue': `${NPM_REGISTRY}/vue@2.6.12/dist/vue.min.js`,
            'vue-class-component': `${NPM_REGISTRY}/vue-class-component@6.3.2/dist/vue-class-component.min.js`,
            'vue-property-decorator': `${NPM_REGISTRY}:vue-property-decorator@7.2.0/lib/vue-property-decorator.umd.js`,
            // systemJsMap comes from index.html
            ...systemJsMap,
        },
    });
})(this);

window.addEventListener('error', e => {
    console.error('ERROR', e.message, e.filename)
});
