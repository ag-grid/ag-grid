<?php
$key = "Angular ngtools Webpack";
$pageTitle = "Angular Datagrid using @ngtools/webpack";
$pageDescription = "Demonstrate the best Angular datagrid using @ngtools/webpack.";
$pageKeyboards = "Angular Grid ngtools webpack 2";
$pageGroup = "basics";

$framework = $_GET['framework'];
if(is_null($framework)) {
    ?>
    <script>
        window.location.href = '?framework=angular';
    </script>
    <?php
}

include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 id="angular-building-with-webpack">Angular - Building with @ngtools/webpack 2</h1>

    <p>We document the main steps required when using @ngtools/Webpack 2 below, but please refer to
        <a href="https://github.com/ceolter/ag-grid-angular-example">ag-grid-angular-example</a> on GitHub for a full working example of this.</p>

    <p>We have 2 Webpack Configurations in the example project - dev configuration and and AOT ready prod configuration.</p>

    <h3 id="dev-configuration">Development Configuration</h3>
    <h4 id="dev-tsconfig">tsconfig Configuration</h4>

    <p>For development purposes we have a simple configuration:</p>
<pre>
<span class="codeComment">// tsconfig.json</span>
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
    "app/boot-aot.ts"
  ]
}
</pre>

    <p>Note that here we exclude the AOT bootstrap file as the AOT bootstrap file will have references to Angular Factories that
        won't exist yet.</p>

    <h4 id="dev-vendor">Vendor Entry File</h4>

    <p>Here we add any vendor (or third-party) related libraries - note that we've included the ag-Grid CSS and
        chosen theme ("Fresh" in this case), as well as included the <code>ag-grid-enterprise</code> dependency.</p>

    <p>The <code>ag-grid-enterprise</code> inclusion is only necessary it you're using Enterprise features - it can be ommitted if not.</p>

    <p>Note too that we've included <code>@angular/platform-browser-dynamic</code> - this is necessary for JIT (Just-In-Time)/Development mode,
        but can be dropped for production/AOT builds (see later for more on this).</p>

<pre>
<span class="codeComment">// vendor.ts </span>
// Angular
import '@angular/platform-browser';
import '@angular/platform-browser-dynamic';
import '@angular/core';
import '@angular/common';
import '@angular/http';
import '@angular/router';
import '@angular/forms';

// RxJS
import 'rxjs';

// ag-grid
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/theme-fresh.css';
import 'ag-grid-angular/main'
import 'ag-grid-enterprise/main';
</pre>

    <h4 id="dev-webpack">Webpack Dev Configuration</h4>
<pre>
<span class="codeComment">// webpack.dev.js</span>
var webpack = require('webpack');
var helpers = require('./helpers');
var path = require('path');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

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
    },
};</pre>

    <p>
        <code>entry</code>
    </p>
    <p>We could generate one large bundle, but it's better to break the bundle up into the fairly "static" dependencies
        and the more fluid application code. Using the <code>entry</code> property we can specify the entry points we
        want to use - we have specified 3 here:
    </p>
    <ul>
        <li>polyfills: polyfills we require to run Angular / ES6 applications in current browsers.</li>
        <li>vendor: the vendor (or 3rd party) libraries we need - ag-Grid, Angular etc.</li>
        <li>app: our application code.</li>
    </ul>

    <p>
        <code>resolve</code>
    </p>
    <p>As our imports done specify what file extension to use, we need to specify what file types we want to match on - in this case
    we're looking at TypeScript and JavaScript files, but you could also add CSS & HTML files too.</p>

    <p>
        <code>module.loaders</code>
    </p>
    <p>Loaders tell Webpack how & what to do with certain types of file - we have specified a few here to deal with Typescript, HTML, CSS and Images:</p>
    <ul>
        <li>awesome-typescript-loader: transpile Typescript to ES5</li>
        <li>angular2-template-loader: processes Angular components' template/styles</li>
        <li>html</li>
        <li>images & fonts</li>
        <li>css: the first phe pattern matches application-wide styles, and the
            second handles component-scoped styles (ie with styleUrls)</li>
    </ul>

    <p>
        <code>plugins</code>
    </p>
    <ul>
        <li>CommonsChunkPlugin: separates our entry points into distinct files (one each for polyfills, vendor and application)</li>
        <li>HtmlWebpackPlugin: takes our supplied template index.html and inserts the generates JS & CSS files for us</li>
    </ul>

    <p>The dev configuration doesn't generate any files - it keeps all bundles in memory, so you won't find any artifacts in the dist directory (from this configuration).</p>

    <h3 id="prod-configuration">Production Configuration</h3>

    <h4 id="prod-tsconfig">tsconfig Configuration</h4>

    <pre>
<span class="codeComment">// tsconfig-aot.json</span>
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
    "aot/",
    "app/boot-aot.ts"
  ],
  "angularCompilerOptions": {
    "genDir": "aot/",
    "skipMetadataEmit": true
  },
  "atom": {
    "rewriteTsconfig": false
  }
}
    </pre>

    <p>We exclude the aot output directory and the AOT bootstrap file (again, as the AOT bootstrap file will have references to Angular Factories that
        won't exist yet).</p>

    <h4 id="prod-vendor">Vendor AOT Entry File</h4>

    <p>Here we add any vendor (or third-party) related libraries - note that we've included the ag-Grid CSS and
        chosen theme ("Fresh" in this case), as well as included the <code>ag-grid-enterprise</code> dependency.</p>

    <p>The <code>ag-grid-enterprise</code> inclusion is only necessary it you're using Enterprise features - it can be ommitted if not.</p>

    <p>This time we've dropped <code>@angular/platform-browser-dynamic</code> as we won't be compiling anything at
        runtime in the browser.</p>

    <pre>
<span class="codeComment">// vendor-aot.ts </span>
// Angular
import '@angular/platform-browser';
import '@angular/core';
import '@angular/common';
import '@angular/http';
import '@angular/router';
import '@angular/forms';

// RxJS
import 'rxjs';

// ag-grid
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/theme-fresh.css';
import 'ag-grid-angular/main'
import 'ag-grid-enterprise/main';
</pre>

    <h3 id="production-configuration">AOT/Production Configuration</h3>
    <pre><span class="codeComment">// webpack.prod.js</span>
const path = require('path');
const webpack = require('webpack');

const helpers = require('./helpers');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AotPlugin = require('@ngtools/webpack').AotPlugin;

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = {
    devtool: 'source-map',

    entry: {
        polyfills: './app/polyfills.ts',
        vendor: './app/vendor-aot.ts',
        app: './app/boot-aot.ts'
    },

    output: {
        path: helpers.root('dist/aot'),
        publicPath: '/',
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].chunk.js'
    },

    resolve: {
        extensions: ['.js', '.ts']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
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

        new AotPlugin({
            tsConfigPath: './tsconfig.aot.json',
            entryModule: helpers.root('app/app.module#AppModule')
        }),

        new HtmlWebpackPlugin({
            template: 'config/index.html'
        }),

        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            comments: false,
            compress: {
                screw_ie8: true,
                warnings: false
            },
            mangle: {
                keep_fnames: true,
                screw_i8: true
            }
        }),

        new ExtractTextPlugin({filename: '[name].[hash].css'}),

        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(ENV)
            }
        })
    ]
};
</pre>
    <p>We don't use a development server with this configuration - we generate the final artifacts in the dist/ folder and expect this to be deploy to a server.</p>
    <p>We use the <code>@ngtools/webpack</code> plugin to transpile our Angular code, including the AOT step</p>
    <p>Finally, we use the DefinePlugin to provide an environment variable that we can use in our application code to <code>enableProdMode()</code></p>
    <pre>
if (process.env.ENV === 'production') {
    enableProdMode();
}
</pre>

    <h3>Override ag-Grid CSS</h3>
    <p>There are many ways to override the CSS with Webpack, but if you use the configuration above then you can override ag-Grid CSS as follows:</p>
    <ul>
        <li>Place your application-wide CSS file(s) in a directory other than <code>./app</code> - for example <code>./css/</code>.
            Remember that CSS under <code>./app</code> is treated differently - it is used for component-scoped styles.</li>
        <li>In a suitable component - we suggest <code>boot.ts</code> import the CSS you want to include:</li>
        <pre>import '../css/app.css';</pre>
    </ul>

    <p>And that's it - you can now override ag-Grid CSS with your own in <code>./css/app.css</code>. For example, the following
        would set the cell background to green across the board.</p>
    <pre>
.ag-cell {
    background-color: green;
}</pre></div>

<?php include '../documentation-main/documentation_footer.php'; ?>
