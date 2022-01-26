---
title: "Angular - Building with SystemJS"
frameworks: ["angular"]
---

We document the main steps required when using SystemJS and SystemJS-Builder below, but please
refer to [ag-grid-angular-example](https://github.com/ag-grid/ag-grid-angular-example) on GitHub
for a full working example of this.

## Initialise Project

```bash
mkdir ag-grid-systemjs
cd ag-grid-systemjs
npm init --yes
```

## Install Dependencies

```bash
npm i --save @ag-grid-community/all-modules @ag-grid-community/angular
npm i --save @angular/common @angular/compiler @angular/compiler-cli @angular/core @angular/platform-browser @angular/platform-browser-dynamic @angular/router typescript rxjs core-js zone.js
npm i --save-dev systemjs@0.19.x systemjs-builder@0.15.33 concurrently@2.2.0 lite-server@2.2.2 gulp@3.9.1 gulp-ngc@0.1.x @types/node@6.0.45

# if you're using any of the Enterprise features then replace @ag-grid-community/all-modules with
npm i --save @ag-grid-enterprise/all-modules
```

Our application will be a very simple one, consisting of a single Module, a single Component and a
bootstrap file, as well a few utility & configuration files.

The resulting project structure will look like this:

```bash
ag-grid-systemjs
├── aot
│   ├── ag-grid.css
│   ├── bs-config.json
│   ├── index.html
│   ├── shim.min.js
│   ├── systemjs.config.js
│   ├── theme-fresh.css
│   └── zone.min.js
├── app
│   ├── app.component.html
│   ├── app.component.ts
│   ├── app.module.ts
│   ├── boot-aot.ts
│   └── boot.ts
├── gulpfile.js
├── index.html
├── node_modules
├── package.json
├── systemjs.config.js
├── tsconfig-aot.json
└── tsconfig.json
```

```ts
// app/app.module.ts
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
// ag-grid
import { AgGridModule } from "@ag-grid-community/angular";
// application
import { AppComponent } from "./app.component";

@NgModule({
    imports: [
        BrowserModule,
        AgGridModule.withComponents([]
        )
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
```

```ts
// app/app.component.ts
import { Component } from "@angular/core";
import { GridOptions } from "@ag-grid-community/all-modules";

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    public gridOptions:GridOptions;
    public rowData:any[];
    public columnDefs:any[];

    constructor() {
        this.gridOptions = <GridOptions>{
            onGridReady: () => {
                this.gridOptions.api.sizeColumnsToFit();
            }
        };
        this.columnDefs = [
            { field: "make" },
            { field: "model" },
            { field: "price" }
        ];
        this.rowData = [
            { make: "Toyota", model: "Celica", price: 35000 },
            { make: "Ford", model: "Mondeo", price: 32000 },
            { make: "Porsche", model: "Boxter", price: 72000 }
        ];
    }
}
```

```html
<!-- app/app.component.html -->

<ag-grid-angular
    #agGrid
    style="width: 500px; height: 150px;"
    class="ag-theme-alpine"
    [gridOptions]="gridOptions"
    [columnDefs]="columnDefs"
    [rowData]="rowData">
</ag-grid-angular>
```

## Just in Time (JIT) Compilation

Our boot file for Just in Time (JIT) looks like this:

```ts
// app/boot.ts
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./app.module";

// for enterprise customers
// import {LicenseManager} from "@ag-grid-enterprise/all-modules";
// LicenseManager.setLicenseKey("your license key");

platformBrowserDynamic().bootstrapModule(AppModule);
```

Our tsconfig.json file looks like this - note we're excluding the AOT related files
(see [AOT](#for-ahead-of-time-aot-compilation) below) here:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "moduleResolution": "node",
    "sourceMap": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "removeComments": false,
    "noImplicitAny": false,
    "lib": ["dom","es2015"]
  },
  "compileOnSave": true,
  "exclude": [
    "node_modules/*",
    "aot/*",
    "docs/*",
    "**/*-aot.ts"
  ]
}
```

For Just in Time (JIT) compilation our SystemJS Configuration file looks like this:

```js
// systemjs.config.js
(function (global) {
    System.config({
            defaultJSExtensions: true,
            map: {
                'app': 'app',
                // angular bundles
                '@angular/core': 'node_modules/@angular/core/bundles/core.umd.js',
                '@angular/common': 'node_modules/@angular/common/bundles/common.umd.js',
                '@angular/compiler': 'node_modules/@angular/compiler/bundles/compiler.umd.js',
                '@angular/platform-browser': 'node_modules/@angular/platform-browser/bundles/platform-browser.umd.js',
                '@angular/platform-browser-dynamic': 'node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
                '@angular/router': 'node_modules/@angular/router/bundles/router.umd.js',
                '@angular/forms': 'node_modules/@angular/forms/bundles/forms.umd.js',
                // other libraries
                'rxjs': 'node_modules/rxjs',
                'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',
                // ag libraries
                '@ag-grid-community/angular': 'node_modules/@ag-grid-community/angular',
                '@ag-grid-community/all-modules': 'node_modules/@ag-grid-community/all-modules',
                '@ag-grid-enterprise/all-modules': 'node_modules/@ag-grid-enterprise/all-modules'
            },
            packages: {
                app: {
                    main: './boot.js'
                }
            }
        }
    );
})(this);
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html>

<head>
    <title>AG Grid Angular JIT Example</title>

    <!-- polyfills -->
    <script src="node_modules/core-js/client/shim.min.js"></script>

    <script src="node_modules/zone.js/dist/zone.js"></script>
    <script src="node_modules/reflect-metadata/Reflect.js"></script>
    <script src="node_modules/systemjs/dist/system.src.js"></script>

    <!-- ag-grid CSS -->
    <!-- In your build, you will probably want to include the css in your bundle. -->
    <!-- To do this you will use a CSS Loader. How to do this is not an AG Grid -->
    <!-- problem, so I've not included how to do it here. For simplicity, and -->
    <!-- explicitness, the CSS files are loaded in directly here. -->
    <link href="node_modules/@ag-grid-community/all-modules/dist/styles/ag-grid.css" rel="stylesheet"/>
    <link href="node_modules/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css" rel="stylesheet"/>

    <!-- Configure SystemJS -->
    <script src="systemjs.config.js"></script>
    <script>
        System.import('app').catch(function (err) {
            console.error(err);
        });
    </script>

</head>

<!-- 3. Display the application -->
<body>
<my-app>Loading...</my-app>
</body>

</html>
```

Finally, we can add the following utility scrips to our package.json file to run our app:

```js
"scripts": {
    "lite": "lite-server",
    "tsc:w": "tsc -p tsconfig.json -w",
    "start": "concurrently \"npm run tsc:w\" \"npm run lite\" "
},
```

We can now run `npm start` to run the development setup.

<img src="../webpack/resources/seed.png" alt="Grid Example" />

### For Ahead-of-Time (AOT) Compilation

Our boot file for Ahead-of-Time (AOT) is a bit different this time - this time
we'll make use of the compiled factories:

```ts
// app/boot-aot.ts
import { platformBrowser } from "@angular/platform-browser";
import { AppModuleNgFactory } from "../aot/app/app.module.ngfactory";

// for enterprise customers
// import {LicenseManager} from "@ag-grid-enterprise/all-modules";
// LicenseManager.setLicenseKey("your license key");

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);</snippet>

    We have a separate tsconfig file (tsconfig-aot.json) for AOT mode::
    <snippet>
// tsconfig-aot.json
{
  "compilerOptions": {
    "target": "es5",
    "module": "es2015",
    "moduleResolution": "node",
    "sourceMap": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    /* with ts 2.1 commnents seem to trip systemjs-builder up */
    "removeComments": true,
    "noImplicitAny": false,
    "lib": ["dom","es2015"],
    "outDir": "aot"
  },
  "exclude": [
    "node_modules/",
    "docs"
  ],
  "angularCompilerOptions": {
    "genDir": "aot",
    "skipMetadataEmit": true
  }
}
```

Our SystemJS config file is different for AOT:

```js
// aot/systemjs.config.js
(function (global) {
    System.config({
            defaultJSExtensions: true,
            map: {
                // angular bundles
                '@angular/core': 'node_modules/@angular/core',
                '@angular/common': 'node_modules/@angular/common',
                '@angular/compiler': 'node_modules/@angular/compiler/index.js',
                '@angular/platform-browser': 'node_modules/@angular/platform-browser',
                '@angular/forms': 'node_modules/@angular/forms',
                '@angular/router': 'node_modules/@angular/router',
                // other libraries
                'rxjs': 'node_modules/rxjs',
                // 'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',
                // ag libraries
                '@ag-grid-community/angular' : 'node_modules/@ag-grid-community/angular',
                '@ag-grid-community/all-modules' : 'node_modules/@ag-grid-community/all-modules',
                '@ag-grid-enterprise/all-modules' : 'node_modules/@ag-grid-enterprise/all-modules'
            },
            packages: {
                '@angular/core': {
                    main: 'index.js'
                },
                '@angular/common': {
                    main: 'index.js'
                },
                '@angular/platform-browser': {
                    main: 'index.js'
                },
                '@angular/forms': {
                    main: 'index.js'
                },
                '@angular/router': {
                    main: 'index.js'
                }
            }
        }
    );
})(this);
```

Our AOT index.html file - this time we'll be using a bundled AOT version of the code. This
will result is quicker startup and runtime behaviour, as well as less network traffic:

```html
<!DOCTYPE html>
<html>

<head>
    <title>AG Grid Angular AOT Example</title>
    <base href="/">

    <script src="shim.min.js"></script>
    <script src="zone.min.js"></script>

    <!-- ag-grid CSS -->
    <!-- In your build, you will probably want to include the css in your bundle. -->
    <!-- To do this you will use a CSS Loader. How to do this is not an AG Grid -->
    <!-- problem, so I've not included how to do it here. For simplicity, and -->
    <!-- explicitness, the CSS files are loaded in directly here. -->
    <link href="ag-grid.css" rel="stylesheet" />
    <link href="theme-fresh.css" rel="stylesheet" />

    <script>window.module = 'aot';</script>
</head>

<!-- 3. Display the application -->
<body>
<my-app>Loading...</my-app>
</body>
<script src="./dist/bundle.js"></script>

</html>
```

We'll use SystemJS Builder for rollup, and ngc to compile:

```js
// gulpfile.js
const gulp = require('gulp');
const ngc = require('gulp-ngc');
const SystemBuilder = require('systemjs-builder');

gulp.task('ngc', () => {
    return ngc('./tsconfig-aot.json');
});

gulp.task('aot-bundle', function () {
    const builder = new SystemBuilder();

    return builder.loadConfig('./aot/systemjs.config.js')
        .then(function () {
            return builder.buildStatic('aot/app/boot-aot.js', './aot/dist/bundle.js', {
                encodeNames: false,
                mangle: false,
                minify: true,
                rollup: true,
                sourceMaps: true
            });
        })
});
```

There are a few shim & polyfill files we need too:

```bash
cp ./node_modules/core-js/client/shim.min.js aot/
cp ./node_modules/zone.js/dist/zone.min.js aot/
cp ./node_modules/@ag-grid-community/all-modules/dist/styles/ag-grid.css aot/
cp ./node_modules/@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css aot/
```

We make use of lite-server to test the application, so let's create a AOT friendly config file for it:

```json
// aot/bs-config.json
{
  "port": 8000,
  "files": ["./dist/**/*.{html,htm,css,js}"],
  "server": { "baseDir": "./aot" }
}
```

Finally, we can add the following utlity scripts to our package.json:

```json
"build:aot": "gulp ngc && gulp aot-bundle",
"lite:aot": "lite-server -c aot/bs-config.json"
```

<img src="../webpack/resources/seed.png" alt="Grid Example" />

All the above items are specific to either Angular, SystemJS or SystemJS Builder. The above
is intended to point you in the right direction. If you need more information on this, please
see the documentation for those projects.

##  Angular Grid Resources


- Get started with Angular Grid in 5 minutes in our [guide](/getting-started/).

- Please take a look at the [components](/components/) section next for more detailed information on using Angular with AG Grid.

