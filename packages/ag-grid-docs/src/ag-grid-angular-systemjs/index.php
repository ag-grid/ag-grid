<?php
$pageTitle = "ag-Grid Reference: Building with Angular with SystemJS";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. This reference guide demonstrates building the Angular datagrid using SystemJS and SystemJS Builder.";
$pageKeyboards = "Angular Grid SystemJS";
$pageGroup = "basics";
$angularParent = "checked";

include '../documentation-main/documentation_header.php';
?>

<div>

    <h1>Angular - Building with SystemJS</h1>

    <p class="lead">We document the main steps required when using SystemJS and SystemJS-Builder below, but please refer to
        <a href="https://github.com/ag-grid/ag-grid-angular-example">ag-grid-angular-example</a> on GitHub for a full working example of this.</p>

    <h2>Initialise Project</h2>

    <snippet language="sh">
mkdir ag-grid-systemjs
cd ag-grid-systemjs
npm init --yes
</snippet>

    <h2>Install Dependencies</h2>

    <snippet language="sh">
npm i --save ag-grid-community ag-grid-angular
npm i --save @angular/common @angular/compiler @angular/compiler-cli @angular/core @angular/platform-browser @angular/platform-browser-dynamic @angular/router typescript rxjs core-js zone.js
npm i --save-dev systemjs@0.19.x systemjs-builder@0.15.33 concurrently@2.2.0 lite-server@2.2.2 gulp@3.9.1 gulp-ngc@0.1.x @types/node@6.0.45

# optional - only necessary if you're using any of the Enterprise features
npm i --save ag-grid-enterprise</snippet>

    <p>Our application will be a very simple one, consisting of a single Module, a single Component and a bootstrap file, as well a few utility & configuration files.</p>

    <p>The resulting project structure will look like this:</p>
<snippet>
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
└── tsconfig.json</snippet>

<snippet>
// app/app.module.ts 
import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
// ag-grid
import {AgGridModule} from "ag-grid-angular";
// application
import {AppComponent} from "./app.component";

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
}</snippet>

<snippet>
// app/app.component.ts 
import {Component} from "@angular/core";

import {GridOptions} from "ag-grid-community";

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
        this.gridOptions = &lt;GridOptions&gt;{
            onGridReady: () =&gt; {
                this.gridOptions.api.sizeColumnsToFit();
            }
        };
        this.columnDefs = [
            {headerName: "Make", field: "make"},
            {headerName: "Model", field: "model"},
            {headerName: "Price", field: "price"}
        ];
        this.rowData = [
            {make: "Toyota", model: "Celica", price: 35000},
            {make: "Ford", model: "Mondeo", price: 32000},
            {make: "Porsche", model: "Boxter", price: 72000}
        ];
    }
}</snippet>
<snippet language="html">
&lt;!-- app/app.component.html --> 

&lt;ag-grid-angular #agGrid style="width: 500px; height: 150px;" class="ag-theme-balham"
                 [gridOptions]="gridOptions"
                 [columnDefs]="columnDefs"
                 [rowData]="rowData"&gt;
&lt;/ag-grid-angular&gt;</snippet>
    <h2 id="for-just-in-time-jit-compilation">Just in Time (JIT) Compilation</h2>

    <p>Our boot file for Just in Time (JIT) looks like this:</p>

    <snippet>
// app/boot.ts 
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./app.module";

// for enterprise customers
// import {LicenseManager} from "ag-grid-enterprise";
// LicenseManager.setLicenseKey("your license key");

platformBrowserDynamic().bootstrapModule(AppModule);</snippet>

    <p>Our tsconfig.json file looks like this - note we're excluding the AOT related files (see <a href="#aotCompilation">AOT</a> below) here:</p>

    <snippet>
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
}</snippet>

    <p>For Just in Time (JIT) compilation our SystemJS Configuration file looks like this:</p>
    <snippet>
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
                '@angular/http': 'node_modules/@angular/http/bundles/http.umd.js',
                '@angular/router': 'node_modules/@angular/router/bundles/router.umd.js',
                '@angular/forms': 'node_modules/@angular/forms/bundles/forms.umd.js',
                // other libraries
                'rxjs': 'node_modules/rxjs',
                'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',
                // ag libraries
                'ag-grid-angular': 'node_modules/ag-grid-angular',
                'ag-grid-community': 'node_modules/ag-grid-community',
                'ag-grid-enterprise': 'node_modules/ag-grid-enterprise'
            },
            packages: {
                app: {
                    main: './boot.js'
                },
                'ag-grid-community': {
                    main: 'main.js'
                }
            }
        }
    );
})(this);
   </snippet>

<snippet language="html">
&lt;!-- index.html --> 
&lt;!DOCTYPE html&gt;
&lt;html&gt;

&lt;head&gt;
    &lt;title&gt;ag-Grid Angular JIT Example&lt;/title&gt;

    &lt;!-- polyfills --&gt;
    &lt;script src="node_modules/core-js/client/shim.min.js"&gt;&lt;/script&gt;

    &lt;script src="node_modules/zone.js/dist/zone.js"&gt;&lt;/script&gt;
    &lt;script src="node_modules/reflect-metadata/Reflect.js"&gt;&lt;/script&gt;
    &lt;script src="node_modules/systemjs/dist/system.src.js"&gt;&lt;/script&gt;

    &lt;!-- ag-grid CSS --&gt;
    &lt;!-- In your build, you will probably want to include the css in your bundle. --&gt;
    &lt;!-- To do this you will use a CSS Loader. How to do this is not an ag-Grid --&gt;
    &lt;!-- problem, so I've not included how to do it here. For simplicity, and --&gt;
    &lt;!-- explicitness, the CSS files are loaded in directly here. --&gt;
    &lt;link href="node_modules/ag-grid-community/dist/styles/ag-grid.css" rel="stylesheet"/&gt;
    &lt;link href="node_modules/ag-grid-community/dist/styles/ag-theme-balham.css" rel="stylesheet"/&gt;

    &lt;!-- Configure SystemJS --&gt;
    &lt;script src="systemjs.config.js"&gt;&lt;/script&gt;
    &lt;script&gt;
        System.import('app').catch(function (err) {
            console.error(err);
        });
    &lt;/script&gt;

&lt;/head&gt;

&lt;!-- 3. Display the application --&gt;
&lt;body&gt;
&lt;my-app&gt;Loading...&lt;/my-app&gt;
&lt;/body&gt;

&lt;/html&gt;
   </snippet>

    <p>Finally, we can add the following utility scrips to our package.json file to run our app:</p>
    <snippet>
"scripts": {
  "lite": "lite-server",
  "tsc:w": "tsc -p tsconfig.json -w",
  "start": "concurrently \"npm run tsc:w\" \"npm run lite\" "
},
   </snippet>

    <p>We can now run <code>npm start</code> to run the development setup.</p>

    <img src="../images/seed.png" style="width: 100%" alt="Grid Example">

    <h3 id="aotCompilation">For Ahead-of-Time (AOT) Compilation</h3>

    <p>Our boot file for Ahead-of-Time (AOT) is a bit different this time - this time we'll make use of the compiled factories:</p>

<snippet>
// app/boot-aot.ts 
import {platformBrowser} from "@angular/platform-browser";
import {AppModuleNgFactory} from "../aot/app/app.module.ngfactory";

// for enterprise customers
// import {LicenseManager} from "ag-grid-enterprise";
// LicenseManager.setLicenseKey("your license key");

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);</snippet>

    <p>We have a separate tsconfig file (tsconfig-aot.json) for AOT mode::</p>
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
}</snippet>

    <p>Our SystemJS config file is different for AOT:</p>

    <snippet>
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
                '@angular/http': 'node_modules/@angular/http',
                // other libraries
                'rxjs': 'node_modules/rxjs',
                // 'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',
                // ag libraries
                'ag-grid-angular' : 'node_modules/ag-grid-angular',
                'ag-grid-community' : 'node_modules/ag-grid-community',
                'ag-grid-enterprise' : 'node_modules/ag-grid-enterprise'
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
                },
                '@angular/http': {
                    main: 'index.js'
                },
                'ag-grid-community': {
                    main: 'main.js'
                }
            }
        }
    );
})(this);</snippet>


<p>Our AOT index.html file - this time we'll be using a bundled AOT version of the code. This will result is quicker startup and runtime behaviour, as well as less network traffic:</p>

<snippet language="html">
&lt;!DOCTYPE html&gt;
&lt;html&gt;

&lt;head&gt;
    &lt;title&gt;ag-Grid Angular 2 AOT Example&lt;/title&gt;
    &lt;base href="/"&gt;

    &lt;script src="shim.min.js"&gt;&lt;/script&gt;
    &lt;script src="zone.min.js"&gt;&lt;/script&gt;

    &lt;!-- ag-grid CSS --&gt;
    &lt;!-- In your build, you will probably want to include the css in your bundle. --&gt;
    &lt;!-- To do this you will use a CSS Loader. How to do this is not an ag-Grid --&gt;
    &lt;!-- problem, so I've not included how to do it here. For simplicity, and --&gt;
    &lt;!-- explicitness, the CSS files are loaded in directly here. --&gt;
    &lt;link href="ag-grid.css" rel="stylesheet" /&gt;
    &lt;link href="theme-fresh.css" rel="stylesheet" /&gt;

    &lt;script&gt;window.module = 'aot';&lt;/script&gt;
&lt;/head&gt;

&lt;!-- 3. Display the application --&gt;
&lt;body&gt;
&lt;my-app&gt;Loading...&lt;/my-app&gt;
&lt;/body&gt;
&lt;script src="./dist/bundle.js"&gt;&lt;/script&gt;

&lt;/html&gt;
   </snippet>

    <p>
        We'll use SystemJS Builder for rollup, and ngc to compile:
    </p>

<snippet>
// gulpfile.js
const gulp = require('gulp');
const ngc = require('gulp-ngc');
const SystemBuilder = require('systemjs-builder');

gulp.task('ngc', () =&gt; {
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
});</snippet>

    <p>There are a few shim & polyfill files we need too:</p>

<snippet>
cp ./node_modules/core-js/client/shim.min.js aot/
cp ./node_modules/zone.js/dist/zone.min.js aot/
cp ./node_modules/ag-grid-community/dist/styles/ag-grid.css aot/
cp ./node_modules/ag-grid-community/dist/styles/ag-theme-balham.css aot/</snippet>

    <p>We make use of lite-server to test the application, so let's create a AOT friendly config file for it:</p>

    <snippet>
// aot/bs-config.json
{
  "port": 8000,
  "files": ["./dist/**/*.{html,htm,css,js}"],
  "server": { "baseDir": "./aot" }
}
   </snippet>

    <p>Finally, we can add the following utlity scripts to our package.json:</p>

    <snippet>
"build:aot": "gulp ngc && gulp aot-bundle",
"lite:aot": "lite-server -c aot/bs-config.json",</snippet>

    <img src="../images/seed.png" style="width: 100%" alt="Grid Example">

    <p>
        All the above items are specific to either Angular, SystemJS or SystemJS Builder. The above is intended to point
        you in the right direction. If you need more information on this, please see the documentation
        for those projects.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
