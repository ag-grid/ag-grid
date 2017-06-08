<?php
$key = "Getting Started TypeScript & Webpack 2";
$pageTitle = "TypeScript Datagrid using Webpack 2";
$pageDescription = "Demonstrate the best TypeScript datagrid using Webpack 2.";
$pageKeyboards = "TypeScript Grid Webpack 2";
$pageGroup = "basics";

include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 id="typescript-building-with-webpack"><img src="../images/typescript.png" height="50px"/>
        <img src="../images/webpack_large.png" height="50px"/> TypeScript - Building with Webpack 2</h1>

    <p>We walk through the main steps required when using ag-Grid, TypeScript and Webpack below, but for more
        information about
        either TypeScript or Webpack please refer to those sites for more in depth information around these tools.</p>

    <note>You can either create the project by hand, or check it out from our QuickStart/Seed Repo in <a
                href="https://github.com/ceolter/ag-grid-seed">GitHub.</a></note>

    <h3>Initialise Project</h3>

    <pre>
mkdir ag-grid-ts-webpack
cd ag-grid-ts-webpack
npm init
<span class="codeComment">// accept defaults</span>
</pre>

    <h3>Install Dependencies</h3>

    <pre>
npm i --save ag-grid
npm i --save-dev typescript ts-loader webpack webpack-dev-server extract-text-webpack-plugin
npm i --save-dev css-loader style-loader html-loader html-webpack-plugin

<span class="codeComment">// optional - only necessary if you're using any of the Enterprise features</span>
npm i --save ag-grid-enterprise
</pre>

    <h3>Create Application</h3>

    <p>Our application will be a very simple one, consisting of a single class that will render a simple grid:</p>

    <pre>
<span class="codeComment">// src/SimpleGrid.ts </span>
import {Grid, GridOptions} from "ag-grid/main";

// for ag-grid-enterprise users only
//import 'ag-grid-enterprise/main';

import "ag-grid/dist/styles/ag-grid.css";
import "ag-grid/dist/styles/theme-fresh.css";

class SimpleGrid {
    private gridOptions: GridOptions = &lt;GridOptions&gt;{};

    constructor() {
        this.gridOptions = {
            columnDefs: this.createColumnDefs(),
            rowData: this.createRowData()
        };

        let eGridDiv:HTMLElement = &lt;HTMLElement&gt;document.querySelector('#myGrid');
        new Grid(eGridDiv, this.gridOptions);
    }

    // specify the columns
    private createColumnDefs() {
        return [
            {headerName: "Make", field: "make"},
            {headerName: "Model", field: "model"},
            {headerName: "Price", field: "price"}
        ];
    }

    // specify the data
    private createRowData() {
        return [
            {make: "Toyota", model: "Celica", price: 35000},
            {make: "Ford", model: "Mondeo", price: 32000},
            {make: "Porsche", model: "Boxter", price: 72000}
        ];
    }
}

new SimpleGrid();
</pre>
<pre>
<span class="codeComment">// config/index.html </span>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;div id="myGrid" style="height: 150px;width: 600px" class="ag-fresh"&gt;&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;
</pre>
    <h2>TypeScript Configuration</h2>

    <p>Our <code>tsconfig.json</code> is very simple in this example:</p>

    <pre>
<span class="codeComment">// tsconfig.json</span>
{
  "compilerOptions": {
    "sourceMap":  true
  }
}
</pre>

    <h2>Webpack Configuration</h2>

    <p>We have 2 Webpack Configurations in the example project - a dev configuration and a production configuration. In
        both
        of these configurations we make use of an html file where our generated bundle(s) will be inserted and will
        serve as our application
        starting point, as well as a helper file for within use of the webpack configurations:</p>

    <h3 id="webpack-dev-configuration">Webpack Development Configuration</h3>

    <pre>
<span class="codeComment">// config/webpack.dev.js</span>
var webpack = require('webpack');
var path = require('path');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: 'cheap-module-eval-source-map',

    entry: './src/SimpleGrid.ts',

    output: {
        path: path.resolve('dist'),
        publicPath: 'http://localhost:8080/',
        filename: 'bundle.js'
    },

    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader?sourceMap'})
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin({filename: '[name].css'}),

        new HtmlWebpackPlugin({
            template: 'config/index.html'
        })
    ]
};
</pre>

    <p>
        <code>entry</code>
    </p>
    <p>This serves as our entry point for our application.</p>

    <p>
        <code>resolve</code>
    </p>
    <p>As our imports done specify what file extension to use, we need to specify what file types we want to match on -
        in this case
        we're looking at TypeScript and JavaScript files, but you could also add CSS & HTML files too.</p>

    <p>
        <code>module.loaders</code>
    </p>
    <p>Loaders tell Webpack how & what to do with certain types of file - we have specified a few here to deal with
        Typescript, HTML, CSS and Images:</p>
    <ul>
        <li>ts-loader: transpile Typescript to ES5</li>
        <li>html</li>
        <li>css: extract and bundle imported CSS into chunked files</li>
    </ul>

    <p>
        <code>plugins</code>
    </p>
    <ul>
        <li>ExtractTextPlugin: processes and extracts the imported CSS</li>
        <li>HtmlWebpackPlugin: takes our supplied template index.html and inserts the generates JS & CSS files for us
        </li>
    </ul>

    <p>The dev configuration doesn't generate any files - it keeps all bundles in memory, so you won't find any
        artifacts in the dist directory (from this configuration).</p>

    <h3 id="webpack-production-configuration">Webpack Production Configuration</h3>
    <pre><span class="codeComment">// config/webpack.prod.js</span>
var webpack = require('webpack');
var path = require('path');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: 'source-map',

    entry: './src/SimpleGrid.ts',

    output: {
        path: path.resolve('dist'),
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
                loader: 'ts-loader'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader?sourceMap'})
            }
        ]
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({}),

        new ExtractTextPlugin({filename: '[name].css'}),

        new webpack.optimize.CommonsChunkPlugin({
            name: 'app'
        }),

        new HtmlWebpackPlugin({
            template: 'config/index.html'
        })
    ]
};
</pre>
    <p>We don't use a development server with this configuration - we generate the final artifacts in the dist/ folder
        and expect this to be deploy to a server.</p>
    <p>We use the plugins to remove duplicates and minify and extract the CSS into cache busting hash named files.</p>

    <p>With all this in place, we can now add the following npm scripts to our package.json:</p>

    <pre>
"scripts": {
    "start": "webpack-dev-server --config config/webpack.dev.js --inline --progress --port 8080",
    "build": "webpack --config config/webpack.prod.js --progress --profile --bail"
},
    </pre>

    <p>Now we can either run <code>npm start</code> to run the development setup, or <code>npm run build</code> for the
        production build.
        In the case of the production build the generated files will be under the <code>dist/</code> folder.</p>

    <p>If we now run our application with the above code we will see this:</p>

    <img src="../images/ts_webpack_app.png" style="width: 100%">
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
