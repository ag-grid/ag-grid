<?php
$pageTitle = "ag-Grid Reference: Using TypeScript and Webpack 2";
$pageDescription = "This Getting Started guide demonstrates building ag-Grid with TypeScript and webpack 2. Featuring step by step guide and code examples.";
$pageKeyboards = "TypeScript Grid Webpack 2";
$pageGroup = "basics";

include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 id="typescript-building-with-webpack">
         TypeScript - Building with Webpack 2</h1>

    <p class="lead">We walk through the main steps required when using ag-Grid, TypeScript and Webpack below, but for more
        information about
        either TypeScript or Webpack please refer to those sites for more in depth information around these tools.</p>

    <h3>Initialise Project</h3>

    <snippet language="sh">
mkdir ag-grid-ts-webpack
cd ag-grid-ts-webpack
npm init --yes
</snippet>

    <h3>Install Dependencies</h3>

    <snippet language="sh">
npm i --save ag-grid-community
npm i --save-dev typescript ts-loader webpack webpack-dev-server extract-text-webpack-plugin
npm i --save-dev css-loader style-loader html-loader html-webpack-plugin

# optional - only necessary if you're using any of the Enterprise features
npm i --save ag-grid-enterprise</snippet>

    <h3>Create Application</h3>

    <p>Our application will be a very simple one, consisting of a single class that will render a simple grid:</p>

    <snippet>
// src/SimpleGrid.ts 
import {Grid, GridOptions} from "ag-grid-community";

// for ag-grid-enterprise users only
//import 'ag-grid-enterprise';

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

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

new SimpleGrid();</snippet>

<snippet language="html">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;div id="myGrid" style="height: 150px;width: 600px" class="ag-theme-balham"&gt;&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</snippet>

    <h2>TypeScript Configuration</h2>

    <p>Our <code>tsconfig.json</code> is very simple in this example:</p>

    <snippet>
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap":  true
  }
}</snippet>

    <h2>Webpack Configuration</h2>

    <p>We have 2 Webpack Configurations in the example project - a dev configuration and a production configuration. In
        both
        of these configurations we make use of an html file where our generated bundle(s) will be inserted and will
        serve as our application
        starting point, as well as a helper file for within use of the webpack configurations:</p>

    <h3 id="webpack-dev-configuration">Webpack Development Configuration</h3>

    <snippet>
// config/webpack.dev.js
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
};</snippet>

    <h4>
        <code>entry</code>
    </h4>
    <p>This serves as our entry point for our application.</p>

    <h4>
        <code>resolve</code>
    </h4>
    <p>As our imports done specify what file extension to use, we need to specify what file types we want to match on -
        in this case
        we're looking at TypeScript and JavaScript files, but you could also add CSS & HTML files too.</p>

    <h4>
        <code>module.loaders</code>
    </h4>
    <p>Loaders tell Webpack how & what to do with certain types of file - we have specified a few here to deal with
        Typescript, HTML, CSS and Images:</p>
    <ul class="content">
        <li>ts-loader: transpile Typescript to ES5</li>
        <li>html</li>
        <li>css: extract and bundle imported CSS into chunked files</li>
    </ul>

    <h4>
        <code>plugins</code>
    </h4>
    <ul class="content">
        <li>ExtractTextPlugin: processes and extracts the imported CSS</li>
        <li>HtmlWebpackPlugin: takes our supplied template index.html and inserts the generates JS & CSS files for us
        </li>
    </ul>

    <p>The dev configuration doesn't generate any files - it keeps all bundles in memory, so you won't find any
        artifacts in the dist directory (from this configuration).</p>

    <h3 id="webpack-production-configuration">Webpack Production Configuration</h3>
    <snippet>
// config/webpack.prod.js
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
};</snippet>
    <p>We don't use a development server with this configuration - we generate the final artifacts in the dist/ folder
        and expect this to be deploy to a server.</p>
    <p>We use the plugins to remove duplicates and minify and extract the CSS into cache busting hash named files.</p>

    <p>With all this in place, we can now add the following npm scripts to our package.json:</p>

    <snippet>
"scripts": {
    "start": "webpack-dev-server --config config/webpack.dev.js --inline --progress --port 8080",
    "build": "webpack --config config/webpack.prod.js --progress --profile --bail"
},
   </snippet>

    <p>Now we can either run <code>npm start</code> to run the development setup, or <code>npm run build</code> for the
        production build.
        In the case of the production build the generated files will be under the <code>dist/</code> folder.</p>

    <p>If we now run our application with the above code we will see this:</p>

    <img src="../images/seed.png" style="width: 100%" alt="Datagrid">
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
