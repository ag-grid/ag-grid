---
title: "Angular Webpack 2"
frameworks: ["angular"]
---

This article walks through the main steps involved when using AG Grid, Angular and Webpack 2 together.
Please refer to [ag-grid-angular-example](https://github.com/ag-grid/ag-grid-angular-example) on
GitHub for a full working example of this. This can be used in conjunction with this article.

## Initialise the Project

```bash
mkdir ag-grid-webpack2
cd ag-grid-webpack2
npm init --yes
```

## Install Dependencies

```bash
npm i --save @ag-grid-community/all-modules @ag-grid-community/angular

// or, if using Enterprise features
npm i --save @ag-grid-enterprise/all-modules @ag-grid-community/angular

npm i --save @angular/common @angular/compiler @angular/compiler-cli @angular/core @angular/platform-browser @angular/platform-browser-dynamic typescript rxjs core-js zone.js
npm i --save-dev webpack webpack-dev-server angular2-template-loader awesome-typescript-loader extract-text-webpack-plugin file-loader canonical-path @types/node
npm i --save-dev css-loader style-loader html-loader html-webpack-plugin raw-loader url-loader
```

## Create Application

The application in the example is a very simple one, consisting of a single Module, a single
Component and a bootstrap file, as well a few utility files for vendor & polyfills.

The resulting project structure will look like this:

```bash
└── ag-grid-webpack2
    ├── app
    │   ├── app.component.html
    │   ├── app.component.ts
    │   ├── app.module.ts
    │   ├── boot.ts
    │   ├── polyfills.ts
    │   └── vendor.ts
    ├── config
    │   ├── helpers.js
    │   ├── index.html
    │   ├── webpack.dev.js
    │   └── webpack.prod.js
    ├── node_modules
    ├── package.json
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

// or, if using Enterprise features
// import {GridOptions} from "@ag-grid-enterprise/all-modules";

@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    private gridOptions:GridOptions;
    public rowData:any[];
    private columnDefs:any[];

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
<!-- app/app.component.html  -->

<ag-grid-angular
    #agGrid
    style="width: 500px; height: 150px;"
    class="ag-theme-alpine"
    [gridOptions]="gridOptions"
    [columnDefs]="columnDefs"
    [rowData]="rowData">
</ag-grid-angular>
```

```ts
// app/boot.ts
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./app.module";

// for enterprise customers
// import {LicenseManager} from "@ag-grid-enterprise/all-modules";
// LicenseManager.setLicenseKey("your license key");

platformBrowserDynamic().bootstrapModule(AppModule);
```

```ts
// app/polyfills.ts
import "core-js/es6";
import "core-js/es7/reflect";
require('zone.js/dist/zone');
if (process.env.ENV === 'production') {
    // Production
} else {
    // Development
    Error['stackTraceLimit'] = Infinity;
    require('zone.js/dist/long-stack-trace-zone');
}
```

```ts
// app/vendor.ts
// Angular
import '@angular/platform-browser';
import '@angular/platform-browser-dynamic';
import '@angular/core';
import '@angular/common';

// RxJS
import 'rxjs';

// ag-grid
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import '@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css';

// or, if using Enterprise features
// import '@ag-grid-enterprise/all-modules/dist/styles/ag-grid.css';
// import '@ag-grid-enterprise/all-modules/dist/styles/ag-theme-alpine.css';

import '@ag-grid-community/angular'
```

## tsconfig.json

We use this to let the TypeScript compiler know what our target is (es5), what libraries we
depend on (dom and es2015) and so on:

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
    "node_modules/*"
  ]
}
```

## Webpack Configuration

We have 2 Webpack Configurations in the example project - a dev configuration and a production
configuration. In both of these configurations we make use of an html file where our generated
bundle(s) will be inserted and will serve as our application starting point, as well as a
helper file for within use of the webpack configurations:

```js
// config/helpers.js
var path = require('path');
var _root = path.resolve(__dirname, '..');
function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [_root].concat(args));
}
exports.root = root;
```

```html
<!-- config/index.html -->
<!DOCTYPE html>
<html>
<head>
    <base href="/">
    <title>AG Grid & Angular With Webpack</title>
</head>
<body>
<my-app>Loading...</my-app>
</body>
</html>
```

`helpers.js` helps us to resolve path easily, and `index.html` will be used by the `HtmlWebpackPlugin`
plugin to ensure the generated bundles are inserted dynamically, instead of us needing to manage this ourselves.

### Webpack Development Configuration

```js
// config/webpack.dev.js
var webpack = require('webpack');
var helpers = require('./helpers');
var path = require('path');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: 'cheap-module-eval-source-map',

    entry: {
        'polyfills': './app/polyfills.ts',
        'vendor': './app/vendor.ts',
        'app': './app/boot.ts'
    },

    output: {
        path: helpers.root('dist'),
        publicPath: 'http://localhost:8080/',
        filename: '[name].js',
        chunkFilename: '[id].chunk.js'
    },

    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                exclude: path.resolve(__dirname, "node_modules"),
                loaders: ['awesome-typescript-loader', 'angular2-template-loader']
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                query: {
                    minimize: false // workaround for ng2
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader?name=[path]/[name].[ext]'
            },
            {
                // site wide css (excluding all css under the app dir)
                test: /\.css$/,
                exclude: helpers.root('app'),
                loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader?sourceMap'})
            },
            {
                // included styles under the app directory - these are for styles included
                // with styleUrls
                test: /\.css$/,
                include: helpers.root('app'),
                loader: 'raw-loader'
            }
        ]
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor', 'polyfills']
        }),

        new ExtractTextPlugin({filename: '[name].css'}),

        new HtmlWebpackPlugin({
            template: 'config/index.html'
        })
    ],

    devServer: {
        historyApiFallback: true,
        stats: 'minimal'
    }
};
```


### entry

We could generate one large bundle, but it's better to break the bundle up into the fairly "static"
dependencies and the more fluid application code. Using the `entry` property we can specify the
entry points we want to use - we have specified 3 here:

- polyfills: polyfills we require to run Angular / ES6 applications in current browsers.
- vendor: the vendor (or 3rd party) libraries we need - AG Grid, Angular etc.
- app: our application code.

### resolve

As our imports done specify what file extension to use, we need to specify what file types we want
to match on - in this case we're looking at TypeScript and JavaScript files, but you could also add
CSS & HTML files too.

### module.loaders

Loaders tell Webpack how & what to do with certain types of file - we have specified a few here to
deal with Typescript, HTML, CSS and Images:

- awesome-typescript-loader: transpile Typescript to ES5
- angular2-template-loader: processes Angular components' template/styles
- html
- images & fonts
- css: the first phe pattern matches application-wide styles, and the second handles component-scoped styles (ie with styleUrls)

### plugins

- CommonsChunkPlugin: separates our entry points into distinct files (one each for polyfills, vendor and application)
- HtmlWebpackPlugin: takes our supplied template index.html and inserts the generates JS & CSS files for us

The dev configuration doesn't generate any files - it keeps all bundles in memory, so you won't
find any artifacts in the dist directory (from this configuration).

### Webpack Production Configuration

```js
// webpack.prod.js
var webpack = require('webpack');
var path = require('path');
var helpers = require('./helpers');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = {
    devtool: 'source-map',

    entry: {
        'polyfills': './app/polyfills.ts',
        'vendor': './app/vendor.ts',
        'app': './app/boot.ts'
    },

    output: {
        path: helpers.root('dist'),
        publicPath: '/',
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].chunk.js'
    },

    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                exclude: path.resolve(__dirname, "node_modules"),
                loaders: ['awesome-typescript-loader', 'angular2-template-loader']
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                query: {
                    minimize: false // workaround for ng2
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader?name=[path]/[name].[ext]'
            },
            {
                // site wide css (excluding all css under the app dir)
                test: /\.css$/,
                exclude: helpers.root('app'),
                loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader?sourceMap'})
            },
            {
                // included styles under the app directory - these are for styles included
                // with styleUrls
                test: /\.css$/,
                include: helpers.root('app'),
                loader: 'raw-loader'
            }
        ]
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({ // https://github.com/angular/angular/issues/10618
            mangle: {
                keep_fnames: true
            }
        }),

        new ExtractTextPlugin({filename: '[name].[hash].css'}),

        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(ENV)
            }
        }),

        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor', 'polyfills']
        }),

        new HtmlWebpackPlugin({
            template: 'config/index.html'
        })
    ]
};
```

We don't use a development server with this configuration - we generate the final artifacts in the
dist/ folder and expect this to be deploy to a server. We use the plugins to remove duplicates and
minify and extract the CSS into cache busting hash named files. Finally, we use the DefinePlugin
to provide an environment variable that we can use in our application code to `enableProdMode()`

```js
if (process.env.ENV === 'production') {
    enableProdMode();
}
```

With all this in place, we can now add the following npm scripts to our package.json:

```js
"scripts": {
    "start": "webpack-dev-server --config config/webpack.dev.js --inline --progress --port 8080",
    "build": "webpack --config config/webpack.prod.js --progress --profile --bail"
},
```

Now we can either run `npm start` to run the development setup, or `npm run build` for the production
build. In the case of the production build the generated files will be under the `dist/` folder.

If we now run our application with the above code we will see this:

<img src="../webpack/resources/seed.png" alt="Grid Example" />

### Override AG Grid CSS

There are many ways to override the CSS with Webpack, but if you use the configuration above then
you can override AG Grid CSS as follows:

- Place your application-wide CSS file(s) in a directory other than `./app` - for example
`./css/`. Remember that CSS under `./app` is treated differently - it is used for component-scoped styles.

- In a suitable component - we suggest `boot.ts` import the CSS you want to include:

```js
import '../css/app.css';
```

And that's it - you can now override AG Grid CSS with your own in `./css/app.css`. For example,
the following would set the cell background to green across the board.

```css
.ag-cell {
    background-color: green;
}
```
