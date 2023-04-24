(function (global) {

    var ANGULAR_VERSION = "14.2.6";

    System.config({
        // DEMO ONLY! REAL CODE SHOULD NOT TRANSPILE IN THE BROWSER
        transpiler: "ts",
        typescriptOptions: {
            // Copy of compiler options in standard tsconfig.json
            target: "es5",
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
        paths: {
            // paths serve as alias
            "npm:": "https://cdn.jsdelivr.net/npm/"
        },
        // RxJS makes a lot of requests to jsdelivr. This guy addressed it:
        // https://github.com/OasisDigital/rxjs-system-bundle.
        bundles: {
            "npm:rxjs-system-bundle@6.3.3/Rx.system.min.js": [
                "rxjs",
                "rxjs/*",
                "rxjs/operator/*",
                "rxjs/operators/*",
                "rxjs/observable/*",
                "rxjs/scheduler/*",
                "rxjs/symbol/*",
                "rxjs/add/operator/*",
                "rxjs/add/observable/*",
                "rxjs/util/*"
            ]
        },
        // map tells the System loader where to look for things
        map:
        {
            // Angular bundles in System.register format via esm-bundle
            // Cell renderers only work with the esm-bundle version
            // TemplateUrls only works with platform-browser-dynamic from esm-bundle
            '@angular/compiler': 'npm:@esm-bundle/angular__compiler@' + ANGULAR_VERSION + '/system/es2015/ivy/angular-compiler.min.js',
            '@angular/platform-browser-dynamic': 'npm:@esm-bundle/angular__platform-browser-dynamic@' + ANGULAR_VERSION + '/system/es2015/ivy/angular-platform-browser-dynamic.min.js',

            '@angular/core': 'npm:@angular/core@' + ANGULAR_VERSION + '/fesm2015/core.mjs',
            '@angular/common': 'npm:@angular/common@' + ANGULAR_VERSION + '/fesm2015/common.mjs',
            '@angular/common/http': 'npm:@angular/common@' + ANGULAR_VERSION + '/fesm2015/http.mjs',

            '@angular/platform-browser': 'npm:@angular/platform-browser@' + ANGULAR_VERSION + '/fesm2015/platform-browser.mjs',
            '@angular/platform-browser/animations': 'npm:@angular/platform-browser@' + ANGULAR_VERSION + '/fesm2015/animations.mjs',

            '@angular/forms': 'npm:@angular/forms@' + ANGULAR_VERSION + '/fesm2015/forms.mjs',
            '@angular/router': 'npm:@angular/router@' + ANGULAR_VERSION + '/fesm2015/router.mjs',
            '@angular/animations': 'npm:@angular/animations@' + ANGULAR_VERSION + '/fesm2015/animations.mjs',
            '@angular/animations/browser': 'npm:@angular/animations@' + ANGULAR_VERSION + '/fesm2015/browser.mjs',

            css: boilerplatePath + "css.js",
            ts: "npm:plugin-typescript@8.0.0/lib/plugin.js",
            tslib: "npm:tslib@2.3.1/tslib.js",
            typescript: "npm:typescript@4.0.8/lib/typescript.min.js",

            // our app is within the app folder, appLocation comes from index.html
            app: appLocation + "app",
            ...systemJsMap
        },
        // packages tells the System loader how to load when no filename and/or no extension
        packages: {
            app: {
                main: "./main.ts",
                defaultExtension: "ts",
                meta: {
                    "./*.ts": {
                        loader: boilerplatePath + "systemjs-angular-loader.js"
                    }
                }
            },
            'ag-charts-angular': {
                main: './dist/ag-charts-angular/fesm2015/ag-charts-angular.js',
                defaultExtension: 'js'
            },
            'ag-charts-community': {
                main: './dist/cjs/es5/main.js',
                defaultExtension: 'js'
            },
            rxjs: {
                defaultExtension: false
            }
        }
    });
})(this);

