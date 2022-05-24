/**
 * WEB ANGULAR VERSION
 * (based on systemjs.config.js from the angular tutorial - https://angular.io/tutorial)
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
    // simplified version of Object.assign for es3
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

    var ANGULAR_VERSION = "13.3.5";

    var sjsPaths = {};
    if (typeof systemJsPaths !== "undefined") {
        sjsPaths = systemJsPaths;
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
        paths: assign({
            // paths serve as alias
            "npm:": "https://unpkg.com/",
        }, sjsPaths),
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

                '@angular/animations':
                    'https://cdn.jsdelivr.net/npm/@angular/animations@' + ANGULAR_VERSION + '/fesm2015/animations.mjs',
                '@angular/animations/browser':
                    'https://cdn.jsdelivr.net/npm/@angular/animations@' + ANGULAR_VERSION + '/fesm2015/browser.mjs',


                ts: "npm:plugin-typescript@8.0.0/lib/plugin.js",
                tslib: "npm:tslib@2.3.1/tslib.js",
                typescript: "npm:typescript@3.7.7/lib/typescript.js",

                // our app is within the app folder, appLocation comes from index.html
                app: appLocation + "app",
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
            'ag-charts-angular': {
                main: './bundles/ag-charts-angular.umd.min.js',
                defaultExtension: 'js'
            },
            rxjs: {
                defaultExtension: false
            }
        }
    });
})(this);

