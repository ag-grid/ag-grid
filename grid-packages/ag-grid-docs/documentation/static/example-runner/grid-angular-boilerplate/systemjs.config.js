(function (global) {
    var ANGULAR_VERSION = "14.2.6";
    window.ENABLE_PROD_MODE = true;

    System.config({
        // DEMO ONLY! REAL CODE SHOULD NOT TRANSPILE IN THE BROWSER
        transpiler: "ts",
        typescriptOptions: {
            // Copy of compiler options in standard tsconfig.json
            target: "es2015",
            module: "system", //gets rid of console warning
            moduleResolution: "node",
            sourceMap: true,
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
            '@angular/compiler': 'npm:@angular/compiler@' + ANGULAR_VERSION + '/fesm2015/compiler.mjs',
            '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic@' + ANGULAR_VERSION + '/fesm2015/platform-browser-dynamic.mjs',

            '@angular/core': 'npm:@angular/core@' + ANGULAR_VERSION + '/fesm2015/core.mjs',
            '@angular/common': 'npm:@angular/common@' + ANGULAR_VERSION + '/fesm2015/common.mjs',
            '@angular/common/http': 'npm:@angular/common@' + ANGULAR_VERSION + '/fesm2015/http.mjs',

            '@angular/platform-browser': 'npm:@angular/platform-browser@' + ANGULAR_VERSION + '/fesm2015/platform-browser.mjs',
            '@angular/platform-browser/animations': 'npm:@angular/platform-browser@' + ANGULAR_VERSION + '/fesm2015/animations.mjs',

            '@angular/forms': 'npm:@angular/forms@' + ANGULAR_VERSION + '/fesm2015/forms.mjs',
            '@angular/animations': 'npm:@angular/animations@' + ANGULAR_VERSION + '/fesm2015/animations.mjs',
            '@angular/animations/browser': 'npm:@angular/animations@' + ANGULAR_VERSION + '/fesm2015/browser.mjs',

            'rxjs': "npm:rxjs@7.8.1/dist/bundles/rxjs.umd.min.js",
            'rxjs/operators': "npm:rxjs@7.8.1/dist/bundles/rxjs.umd.min.js",

            css: boilerplatePath + "css.js",
            ts: "npm:plugin-typescript@8.0.0/lib/plugin.js",
            tslib: "npm:tslib@2.3.1/tslib.js",
            typescript: "npm:typescript@4.3.5/lib/typescript.min.js",

            // our app is within the app folder, appLocation comes from index.html
            app: appLocation,
            ...systemJsMap
        },
        // packages tells the System loader how to load when no filename and/or no extension
        packages: {
            css: {}, // Stop css.js from defaulting to apps .ts extension
            app: {
                main: "./main.ts",
                defaultExtension: "ts",
            },
            'ag-grid-angular': {
                main: './fesm2015/ag-grid-angular.mjs',
                defaultExtension: 'mjs'
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
            "@ag-grid-community/angular": {
                main: "./fesm2015/ag-grid-community-angular.mjs",
                defaultExtension: "mjs"
            },
            'ag-charts-community': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js'
            },
            'ag-charts-enterprise': {
                main: './dist/package/main.cjs.js',
                defaultExtension: 'js'
            },
            rxjs: {
                defaultExtension: false
            }
        }
    });
})(this);

window.addEventListener('error', e => {
    console.error('ERROR', e.message, e.filename)
});
