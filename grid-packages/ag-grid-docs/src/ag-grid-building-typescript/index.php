<?php
$pageTitle = "ag-Grid Reference: Using TypeScript and Webpack 4";
$pageDescription = "This Getting Started guide demonstrates building ag-Grid with TypeScript and Webpack 4. Featuring step by step guide and code examples.";
$pageKeywords = "TypeScript Grid Webpack 4";
$pageGroup = "basics";

include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 id="typescript-building-with-webpack">
         TypeScript - Building with Webpack</h1>

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
npm i --save @ag-grid-community/all-modules

# or, if using Enterprise features
# npm i --save @ag-grid-enterprise/all-modules

npm i --save-dev typescript ts-loader webpack webpack-dev-server webpack-cli
npm i --save-dev sass-loader node-sass style-loader css-loader html-webpack-plugin
</snippet>

    <h3>Create Application</h3>

    <p>Our application will be a very simple one, consisting of a single class that will render a simple grid:</p>

    <snippet>
import {Grid, GridOptions, ModuleRegistry} from "@ag-grid-community/all-modules";
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";

// or, if using Enterprise features
// import {Grid, GridOptions, ModuleRegistry} from "@ag-grid-enterprise/all-modules";
// import {ClientSideRowModelModule} from "@ag-grid-enterprise/all-modules";

ModuleRegistry.register(ClientSideRowModelModule);

import './styles.scss';

class SimpleGrid {
    private gridOptions: GridOptions = &lt;GridOptions>{};

    constructor() {
        this.gridOptions = {
            columnDefs: this.createColumnDefs(),
            rowData: this.createRowData()
        };

        let eGridDiv:HTMLElement = &lt;HTMLElement>document.querySelector('#myGrid');
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

</snippet>

<snippet language="html">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;div id="myGrid" style="height: 200px;width: 600px" class="ag-theme-alpine"&gt;&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</snippet>


    <h2>Webpack Configuration</h2>

<snippet>
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/SimpleGrid.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ]
};
</snippet>

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
        <code>module.rules</code>
    </h4>
    <p>Loaders tell Webpack how & what to do with certain types of file - we have specified a few here to deal with
        Typescript, HTML, CSS and Images:</p>
    <ul class="content">
        <li>ts-loader: transpile Typescript to ES5</li>
        <li>html</li>
        <li>scss: process and bundle imported SCSS</li>
    </ul>

    <h4>
        <code>plugins</code>
    </h4>
    <ul class="content">
        <li>HtmlWebpackPlugin: takes our supplied template index.html and inserts the generates JS file for us
        </li>
    </ul>

    <h2>Typescript Configuration</h2>

    <p>We don't need to specify any Typescript configuration here, but <code>ts-loader</code> does expect a <code>tsconfig.json</code> so
    we need to create an empty file in the root of the project named <code>tsconfig.json</code>.</p>

    <p>With all this in place, we can now add the following npm scripts to our package.json:</p>

    <snippet>
"scripts": {
    "start": "webpack-dev-server --inline --progress --port 8080",
    "build": "webpack --progress --profile --bail"
},
   </snippet>

    <p>Now we can either run <code>npm start</code> to run the development setup, or <code>npm run build</code> for the
        production build.
        In the case of the production build the generated files will be under the <code>dist/</code> folder.</p>

    <p>If we now run our application with the above code we will see this:</p>

    <img src="./ts-grid.png" alt="Datagrid">

    <h2>Example Code</h2>

    <p>The code for this example can be found on <a href="https://github.com/seanlandsman/ag-grid-typescript-webpack/">GitHub</a>.</p>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
