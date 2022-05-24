/**
 * WEB ANGULAR VERSION
 * (based on systemjs.config.js from the angular tutorial - https://angular.io/tutorial)
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
    var ANGULAR_VERSION = "13.3.5";
    var ANGULAR_CDK_VERSION = "13.3.5";
    var ANGULAR_MATERIAL_VERSION = "13.3.5";

    function assign() {
        var result = {};
        for (var i = 0, len = arguments.length; i < len; i++) {
            var arg = arguments[i];
            for (var prop in arg) {
                result[prop] = arg[prop];
            }
        }
        return result;
    }

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
        paths:
            assign(
                {
                    // paths serve as alias
                    "npm:": "https://unpkg.com/",
                }, systemJsPaths)
        ,
        // RxJS makes a lot of requests to unpkg. This guy addressed it:
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
        map: assign(
            {
                // css plugin
                'css': 'npm:systemjs-plugin-css@0.1.37/css.js',

                // angular bundles
                // Cell renderers only work with the esm-bundle version
                '@angular/compiler': 'https://cdn.jsdelivr.net/npm/@esm-bundle/angular__compiler@' + ANGULAR_VERSION + '/system/es2015/ivy/angular-compiler.js',
                //'@angular/compiler':'https://cdn.jsdelivr.net/npm/@angular/compiler@' + ANGULAR_VERSION + '/fesm2015/compiler.mjs',
                '@angular/core':
                    'https://cdn.jsdelivr.net/npm/@angular/core@' + ANGULAR_VERSION + '/fesm2015/core.mjs',
                '@angular/common':
                    'https://cdn.jsdelivr.net/npm/@angular/common@' + ANGULAR_VERSION + '/fesm2015/common.mjs',
                '@angular/common/http':
                    'https://cdn.jsdelivr.net/npm/@angular/common@' + ANGULAR_VERSION + '/fesm2015/http.mjs',

                '@angular/platform-browser-dynamic':
                    'https://cdn.jsdelivr.net/npm/@angular/platform-browser-dynamic@' + ANGULAR_VERSION + '/fesm2015/platform-browser-dynamic.mjs',
                '@angular/platform-browser':
                    'https://cdn.jsdelivr.net/npm/@angular/platform-browser@' + ANGULAR_VERSION + '/fesm2015/platform-browser.mjs',
                '@angular/platform-browser/animations':
                    'https://cdn.jsdelivr.net/npm/@angular/platform-browser@' + ANGULAR_VERSION + '/fesm2015/animations.mjs',

                '@angular/forms':
                    'https://cdn.jsdelivr.net/npm/@angular/forms@' + ANGULAR_VERSION + '/fesm2015/forms.mjs',
                '@angular/router':
                    'https://cdn.jsdelivr.net/npm/@angular/router@' + ANGULAR_VERSION + '/fesm2015/router.mjs',
                '@angular/animations':
                    'https://cdn.jsdelivr.net/npm/@angular/animations@' + ANGULAR_VERSION + '/fesm2015/animations.mjs',
                '@angular/animations/browser':
                    'https://cdn.jsdelivr.net/npm/@angular/animations@' + ANGULAR_VERSION + '/fesm2015/browser.mjs',

                // material design
                "@angular/material/core": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/fesm2015/core.mjs",
                "@angular/material/radio": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/fesm2015/radio.mjs",
                "@angular/material/card": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/fesm2015/card.mjs",
                "@angular/material/slider": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/fesm2015/slider.mjs",
                "@angular/material/select": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/fesm2015/select.mjs",
                "@angular/material/progress-spinner": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/fesm2015/progress-spinner.mjs",
                "@angular/material/input": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/fesm2015/input.mjs",
                "@angular/material/icon": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/fesm2015/icon.mjs",
                "@angular/material/form-field": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/fesm2015/form-field.mjs",
                "@angular/material/checkbox": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/fesm2015/checkbox.mjs",
                "@angular/material/button-toggle": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/fesm2015/button-toggle.mjs",

                "@angular/cdk": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/fesm2015/cdk.mjs",
                "@angular/cdk/platform": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/fesm2015/platform.mjs",
                "@angular/cdk/bidi": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/fesm2015/bidi.mjs",
                "@angular/cdk/coercion": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/fesm2015/coercion.mjs",
                "@angular/cdk/keycodes": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/fesm2015/keycodes.mjs",
                "@angular/cdk/a11y": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/fesm2015/a11y.mjs",
                "@angular/cdk/overlay": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/fesm2015/overlay.mjs",
                "@angular/cdk/portal": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/fesm2015/portal.mjs",
                "@angular/cdk/observers": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/fesm2015/observers.mjs",
                "@angular/cdk/collections": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/fesm2015/collections.mjs",
                "@angular/cdk/scrolling": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/fesm2015/scrolling.mjs",
                "@angular/cdk/text-field": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/fesm2015/text-field.mjs",

                ts: "npm:plugin-typescript@8.0.0/lib/plugin.js",
                tslib: "npm:tslib@2.3.1/tslib.js",
                typescript: "npm:typescript@3.7.7/lib/typescript.js",

                // our app is within the app folder, appLocation comes from index.html
                app: appLocation + "app",

                rxjs: "npm:rxjs@6.5.3/bundles/rxjs.umd.min.js"
            },
            systemJsMap
        ),
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
            'ag-grid-angular': {
                main: './bundles/ag-grid-angular.umd.min.js',
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
            "@ag-grid-community/angular": {
                main: "./bundles/ag-grid-community-angular.umd.min.js",
                defaultExtension: "js"
            },
            rxjs: {
                defaultExtension: false
            }
        }
    });
})(this);

