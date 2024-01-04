(function (global) {
    System.addImportMap({
        imports: {
            // systemJsMap comes from index.html
            ...systemJsMap,
        },
    });
})(this);

window.addEventListener('error', e => {
    console.error('ERROR', e.message, e.filename)
});
