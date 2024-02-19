(function (global) {
    System.config({
        // DEMO ONLY! REAL CODE SHOULD NOT TRANSPILE IN THE BROWSER
        transpiler: "ts",
        typescriptOptions: {
            // Copy of compiler options in standard tsconfig.json
            target: "es2015",
            module: "system", //gets rid of console warning
            moduleResolution: "node",
            sourceMap: false,
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            lib: ["es2015", "dom"],
            noImplicitAny: true,
            suppressImplicitAnyIndexErrors: true
        },
        meta: {
            typescript: {
                exports: "ts"
            },
            '*.css': { loader: 'css' }
        },
        paths:
        {
            // paths serve as alias
            "npm:": "https://cdn.jsdelivr.net/npm/",
            ...systemJsPaths
        },
        // map tells the System loader where to look for things
        map: {
            'css': 'npm:systemjs-plugin-css@0.1.37/css.js',

            ts: "npm:plugin-typescript@8.0.0/lib/plugin.js",
            tslib: "npm:tslib@2.3.1/tslib.js",
            typescript: "npm:typescript@4.3.5/lib/typescript.min.js",

            // appLocation comes from index.html
            app: appLocation,
            ...systemJsMap
        },
        // packages tells the System loader how to load when no filename and/or no extension
        packages: {
            app: {
                main: "./main.ts",
                defaultExtension: "ts"
            },
            'ag-charts-community': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js'
            },
            'ag-grid-community': {
                main: './dist/ag-grid-community.cjs.min.js',
                defaultExtension: 'js'
            },
            'ag-grid-enterprise': {
                main: './dist/ag-grid-enterprise.cjs.min.js',
                defaultExtension: 'js'
            },
            'ag-grid-charts-enterprise': {
                main: './dist/ag-grid-charts-enterprise.cjs.js',
                defaultExtension: 'js'
            },
        }
    });
})(this);

window.addEventListener('error', e => {
    console.error('ERROR', e.message, e.filename)
});
