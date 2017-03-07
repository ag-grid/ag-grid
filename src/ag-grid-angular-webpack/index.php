<?php
$key = "Angular Webpack";
$pageTitle = "Angular Datagrid using Webpack";
$pageDescription = "Demonstrate the best Angular  datagrid using Webpack.";
$pageKeyboards = "Angular  Grid Webpack";
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

    <h1 id="angular-building-with-webpack">Angular - Building with Webpack</h1>

    <p>We document the main steps required when using Webpack below, but please refer to
        <a href="https://github.com/ceolter/ag-grid-angular-example">ag-grid-angular-example</a> on GitHub for a full working example of this.</p>

    <p>Refer to the <a href="https://angular.io/docs/ts/latest/guide/webpack.html">Angular Site</a> on this topic for more information - it was used as the basis for our offering below.</p>

    <p>We have 3 Webpack Configurations in the example project - a common configuration, and then a dev and prod configuration that both use the common one.</p>

    <h3 id="webpack-common-shared-configuration">Webpack Common (Shared) Configuration</h3>
    <pre><span class="codeComment">// webpack.common.js</span>
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var helpers = require('./helpers');

module.exports = {
    entry: {
        'polyfills': './app/polyfills.ts',
        'vendor': './app/vendor.ts',
        'app': './app/boot.ts'
    },

    resolve: {
        extensions: ['', '.ts', '.js']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader']
            },
            {
                test: /\.html$/,
                loader: 'html'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file?name=[path]/[name].[ext]'
            },
            {
                test: /\.css$/,
                exclude: helpers.root('src', 'app'),
                loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
            },
            {
                test: /\.css$/,
                include: helpers.root('src', 'app'),
                loader: 'raw'
            }
        ]
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor', 'polyfills']
        }),

        new HtmlWebpackPlugin({
            template: 'config/index.html'
        })
    ]
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

    <h3 id="webpack-development-configuration">Webpack Development Configuration</h3>
    <pre><span class="codeComment">// webpack.dev.js</span>
var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {
    devtool: 'cheap-module-eval-source-map',

    output: {
        path: helpers.root('dist'),
        publicPath: 'http://localhost:8080/',
        filename: '[name].js',
        chunkFilename: '[id].chunk.js'
    },

    plugins: [
        new ExtractTextPlugin('[name].css')
    ],

    devServer: {
        historyApiFallback: true,
        stats: 'minimal'
    }
});</pre>

    <p>The dev configuration doesn't generate any files - it keeps all bundles in memory, so you won't find any artifacts in the dist directory (from this configuration).</p>

    <h3 id="webpack-production-configuration">Webpack Production Configuration</h3>
    <pre><span class="codeComment">// webpack.prod.js</span>
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = webpackMerge(commonConfig, {
    devtool: 'source-map',

    output: {
        path: helpers.root('dist'),
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: '[id].chunk.js'
    },

    htmlLoader: {
        minimize: false // workaround for ng2
    },

    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({ // https://github.com/angular/angular/issues/10618
            mangle: {
                keep_fnames: true
            }
        }),
        new ExtractTextPlugin('[name].[hash].css'),
        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(ENV)
            }
        })
    ]
});
</pre>
    <p>We don't use a development server with this configuration - we generate the final artifacts in the dist/ folder and expect this to be deploy to a server.</p>
    <p>We use the plugins to stop the build on an error, remove duplicates and minify and extract the CSS into cache busting hash named files.</p>
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
}</pre>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
