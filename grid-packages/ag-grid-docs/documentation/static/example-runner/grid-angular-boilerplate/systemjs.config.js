/**
 * WEB ANGULAR VERSION
 * (based on systemjs.config.js from the angular tutorial - https://angular.io/tutorial)
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function(global) {
    var ANGULAR_VERSION = "10.0.0";
    var ANGULAR_CDK_VERSION = "10.0.0";
    var ANGULAR_MATERIAL_VERSION = "10.0.0";

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
                'css': 'npm:systemjs-plugin-css/css.js',

                // angular bundles
                "@angular/animations": "npm:@angular/animations@" + ANGULAR_VERSION + "/bundles/animations.umd.js",
                "@angular/animations/browser": "npm:@angular/animations@" + ANGULAR_VERSION + "/bundles/animations-browser.umd.js",
                "@angular/core": "npm:@angular/core@" + ANGULAR_VERSION + "/bundles/core.umd.js",
                "@angular/common": "npm:@angular/common@" + ANGULAR_VERSION + "/bundles/common.umd.js",
                "@angular/common/http": "npm:@angular/common@" + ANGULAR_VERSION + "/bundles/common-http.umd.js",
                "@angular/compiler": "npm:@angular/compiler@" + ANGULAR_VERSION + "/bundles/compiler.umd.js",
                "@angular/platform-browser": "npm:@angular/platform-browser@" + ANGULAR_VERSION + "/bundles/platform-browser.umd.js",
                "@angular/platform-browser/animations": "npm:@angular/platform-browser@" + ANGULAR_VERSION + "/bundles/platform-browser-animations.umd.js",
                "@angular/platform-browser-dynamic": "npm:@angular/platform-browser-dynamic@" + ANGULAR_VERSION + "/bundles/platform-browser-dynamic.umd.js",
                "@angular/http": "npm:@angular/http@7.2.16/bundles/http.umd.js",
                "@angular/router": "npm:@angular/router@" + ANGULAR_VERSION + "/bundles/router.umd.js",
                "@angular/router/upgrade": "npm:@angular/router@" + ANGULAR_VERSION + "/bundles/router-upgrade.umd.js",
                "@angular/forms": "npm:@angular/forms@" + ANGULAR_VERSION + "/bundles/forms.umd.js",
                "@angular/upgrade": "npm:@angular/upgrade@" + ANGULAR_VERSION + "/bundles/upgrade.umd.js",
                "@angular/upgrade/static": "npm:@angular/upgrade@" + ANGULAR_VERSION + "/bundles/upgrade-static.umd.js",
                "angular-in-memory-web-api": "npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js",
                // material design
                "@angular/material/core": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/bundles/material-core.umd.js",
                "@angular/material/radio": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/bundles/material-radio.umd.min.js",
                "@angular/material/card": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/bundles/material-card.umd.min.js",
                "@angular/material/slider": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/bundles/material-slider.umd.min.js",
                "@angular/material/select": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/bundles/material-select.umd.min.js",
                "@angular/material/progress-spinner": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/bundles/material-progress-spinner.umd.min.js",
                "@angular/material/input": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/bundles/material-input.umd.min.js",
                "@angular/material/icon": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/bundles/material-icon.umd.min.js",
                "@angular/material/form-field": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/bundles/material-form-field.umd.min.js",
                "@angular/material/checkbox": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/bundles/material-checkbox.umd.min.js",
                "@angular/material/button-toggle": "npm:@angular/material@" + ANGULAR_MATERIAL_VERSION + "/bundles/material-button-toggle.umd.min.js",
                "@angular/cdk": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk.umd.js",
                "@angular/cdk/platform": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-platform.umd.js",
                "@angular/cdk/bidi": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-bidi.umd.js",
                "@angular/cdk/coercion": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-coercion.umd.js",
                "@angular/cdk/keycodes": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-keycodes.umd.js",
                "@angular/cdk/a11y": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-a11y.umd.js",
                "@angular/cdk/overlay": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-overlay.umd.js",
                "@angular/cdk/portal": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-portal.umd.js",
                "@angular/cdk/observers": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-observers.umd.js",
                "@angular/cdk/collections": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-collections.umd.js",
                "@angular/cdk/scrolling": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-scrolling.umd.js",
                "@angular/cdk/text-field": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-text-field.umd.js",
                // "@angular/cdk/accordion": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-accordion.umd.js",
                // "@angular/cdk/layout": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-layout.umd.js",
                // "@angular/cdk/table": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-table.umd.js",
                // "@angular/cdk/tree": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-tree.umd.js",
                // "@angular/cdk/stepper": "npm:@angular/cdk@" + ANGULAR_CDK_VERSION + "/bundles/cdk-stepper.umd.js",

                // ngx bootstrap
                "ngx-bootstrap": "npm:ngx-bootstrap@2.0.0-rc.0",
                // ng2 typeahead
                "ng2-typeahead": "npm:ng2-typeahead@1.2.0",

                ts: "npm:plugin-typescript@5.2.7/lib/plugin.js",
                tslib: "npm:tslib@1.7.1/tslib.js",
                typescript: "npm:typescript@2.3.2/lib/typescript.js",

                // for some of the examples
                lodash: "npm:lodash@4.17.4/lodash.js",

                // our app is within the app folder, appLocation comes from index.html
                app: appLocation + "app",

                rxjs: "npm:rxjs@6.3.3/bundles/rxjs.umd.min.js"
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
                main: './bundles/ag-grid-angular.umd.js',
                defaultExtension: 'js'
            },
            'ag-grid-community': {
                main: './dist/ag-grid-community.cjs.js',
                defaultExtension: 'js'
            },
            'ag-grid-enterprise': {
                main: './dist/ag-grid-enterprise.cjs.js',
                defaultExtension: 'js'
            },
            "@ag-grid-community/angular": {
                main: "./bundles/ag-grid-community-angular.umd.js",
                defaultExtension: "js"
            },
            rxjs: {
                defaultExtension: false
            }
        }
    });
})(this);

