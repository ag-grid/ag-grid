/**
 * WEB ANGULAR VERSION
 * (based on systemjs.config.js from the angular tutorial - https://angular.io/tutorial)
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function(global) {
    System.config({
        // DEMO ONLY! REAL CODE SHOULD NOT TRANSPILE IN THE BROWSER
        transpiler: 'ts',
        typescriptOptions: {
            // Copy of compiler options in standard tsconfig.json
            target: 'es5',
            module: 'system', //gets rid of console warning
            moduleResolution: 'node',
            sourceMap: true,
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            lib: ['es2015', 'dom'],
            noImplicitAny: true,
            suppressImplicitAnyIndexErrors: true
        },
        meta: {
            typescript: {
                exports: 'ts'
            }
        },
        paths: {
            // paths serve as alias
            'npm:': 'https://unpkg.com/'
        },
        // RxJS makes a lot of requests to unpkg. This guy addressed it:
        // https://github.com/OasisDigital/rxjs-system-bundle.
        bundles: {
            'npm:rxjs-system-bundle@5.5.5/Rx.system.js': [
                'rxjs',
                'rxjs/*',
                'rxjs/operator/*',
                'rxjs/operators/*',
                'rxjs/observable/*',
                'rxjs/scheduler/*',
                'rxjs/symbol/*',
                'rxjs/add/operator/*',
                'rxjs/add/observable/*',
                'rxjs/util/*'
            ]
        },
        // map tells the System loader where to look for things
        map: Object.assign(
            {
                // angular bundles
                '@angular/animations': 'npm:@angular/animations/bundles/animations.umd.js',
                '@angular/animations/browser': 'npm:@angular/animations/bundles/animations-browser.umd.js',
                '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
                '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
                '@angular/common/http': 'npm:@angular/common/bundles/common-http.umd.js',
                '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
                '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
                '@angular/platform-browser/animations': 'npm:@angular/platform-browser/bundles/platform-browser-animations.umd.js',
                '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
                '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
                '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
                '@angular/router/upgrade': 'npm:@angular/router/bundles/router-upgrade.umd.js',
                '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
                '@angular/upgrade': 'npm:@angular/upgrade/bundles/upgrade.umd.js',
                '@angular/upgrade/static': 'npm:@angular/upgrade/bundles/upgrade-static.umd.js',
                'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',
                // material design
                '@angular/material': 'npm:@angular/material/bundles/material.umd.js',
                '@angular/cdk/platform': 'npm:@angular/cdk/bundles/cdk-platform.umd.js',
                '@angular/cdk/bidi': 'npm:@angular/cdk/bundles/cdk-bidi.umd.js',
                '@angular/cdk/coercion': 'npm:@angular/cdk/bundles/cdk-coercion.umd.js',
                '@angular/cdk/keycodes': 'npm:@angular/cdk/bundles/cdk-keycodes.umd.js',
                '@angular/cdk/a11y': 'npm:@angular/cdk/bundles/cdk-a11y.umd.js',
                '@angular/cdk/overlay': 'npm:@angular/cdk/bundles/cdk-overlay.umd.js',
                '@angular/cdk/portal': 'npm:@angular/cdk/bundles/cdk-portal.umd.js',
                '@angular/cdk/observers': 'npm:@angular/cdk/bundles/cdk-observers.umd.js',
                '@angular/cdk/collections': 'npm:@angular/cdk/bundles/cdk-collections.umd.js',
                '@angular/cdk/accordion': 'npm:@angular/cdk/bundles/cdk-accordion.umd.js',
                '@angular/cdk/scrolling': 'npm:@angular/cdk/bundles/cdk-scrolling.umd.js',
                '@angular/cdk/layout': 'npm:@angular/cdk/bundles/cdk-layout.umd.js',
                '@angular/cdk/table': 'npm:@angular/cdk/bundles/cdk-table.umd.js',
                '@angular/cdk/stepper': 'npm:@angular/cdk/bundles/cdk-stepper.umd.js',

                ts: 'npm:plugin-typescript@5.2.7/lib/plugin.js',
                tslib: 'npm:tslib@1.7.1/tslib.js',
                typescript: 'npm:typescript@2.3.2/lib/typescript.js',

                // for some of the examples
                lodash: 'npm:lodash@4.17.4/lodash.js',

                // our app is within the app folder, appLocation comes from index.html
                app: appLocation + 'app'
            },
            systemJsMap
        ),
        // packages tells the System loader how to load when no filename and/or no extension
        packages: {
            app: {
                main: './main.ts',
                defaultExtension: 'ts',
                meta: {
                    './*.ts': {
                        loader: boilerplatePath + 'systemjs-angular-loader.js'
                    }
                }
            },
            'ag-grid-angular': {
                main: './main.js',
                defaultExtension: 'js'
            },
            'ag-grid-enterprise': {
                main: './main.js',
                defaultExtension: 'js'
            },
            rxjs: {
                defaultExtension: false
            }
        }
    });
})(this);
