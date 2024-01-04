(function (global) {
    System.register('react/jsx-runtime', ['react'], function (_export, _context) {
        var React;
        return {
            setters: [
              function (_react) { React = _react; },
            ],
            execute: function () {
              _export({
                jsx: React.createElement,
                jsxs: React.createElement,
                Fragment: React.Fragment,
              });
            },
        };
    });
    System.addImportMap({
        imports: {
            react: `${NPM_REGISTRY}/react@18.2.0/umd/react.development.js`,
            'react-dom': `${NPM_REGISTRY}/react-dom@18.2.0/umd/react-dom.development.js`,
            'react-dom/client': `${NPM_REGISTRY}/react-dom@18.2.0/umd/react-dom.development.js`,
            'react-dom/server': `${NPM_REGISTRY}/react-dom@18.2.0/umd/react-dom-server.browser.development.min.js`,
            'prop-types': `${NPM_REGISTRY}/prop-types@15.8.1/prop-types.min.js`,
            redux: `${NPM_REGISTRY}/redux@4.2.1/dist/redux.min.js`,
            'react-redux': `${NPM_REGISTRY}/react-redux@8.0.5/dist/react-redux.min.js`,
            // systemJsMap comes from index.html
            ...systemJsMap,
        },
    });
})(this);

window.addEventListener('error', e => {
    console.error('ERROR', e.message, e.filename)
});
