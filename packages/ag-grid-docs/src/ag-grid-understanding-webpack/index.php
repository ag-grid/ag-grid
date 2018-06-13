<?php

$pageTitle = "ag-Grid Blog: Webpack Tutorial - Understanding How it Works";
$pageDescription = "This blog post runs through a webpack tutorial on building a simple application. You will find out how webpack works. It's the guide we wish we had found before learning webpack.";
$pageKeyboards = "Webpack Tutorial";

include('../includes/mediaHeader.php');
?>

<link rel="stylesheet" href="../documentation-main/documentation.css">
<script src="../documentation-main/documentation.js"></script>


        <h1> Webpack Tutorial: Understanding How it Works</h1>
        <p class="blog-author">Sean Landsman | 23rd January 2017</p>
<div class="row" ng-app="documentation">
    <div class="col-md-8">

        <note>A French translation of this blog can be found at
            <a href="https://github.com/forresst/ityti_fr-FR/blob/master/ag-grid.com/ag-grid-understanding-webpack/README.md" target="_blank">GitHub</a>,
        kindly provided by @forresst!</note>

        <h2>Motivation</h2>

        <p>This <a href="https://webpack.js.org/" target="_blank">Webpack</a> tutorial is my attempt to document what I learnt and is the blog I wish I'd found when I first started my
            Webpack journey,
            all those months ago.</p>

        <p>When I first started <a href="../ag-grid-jobs-board/" target="_blank">working at ag-Grid</a> (which is a great place to work!) I had to ramp up on many
            technologies
            and frameworks that I hadn't used before. One of these was <a href="https://webpack.js.org/" target="_blank">Webpack</a> - a powerful bundler used in many
            applications & frameworks.</p>

        <p>We here at ag-Grid use Webpack to bundle our own products, as well as using it with some of our framework
            examples.
            Although there are alternatives to Webpack, it is still very popular and with version 2.2 recently released
            I believe it will remain
            so for quite a while yet.</p>

        <h2>Introduction to Webpack Tutorial</h2>

        <p>
            Webpack is a module bundler. It takes disparate dependencies, creates modules for them and bundles the
            entire
            network up into manageable output files. This is especially useful for Single Page Applications (SPAs),
            which is
            the defacto standard for Web Applications today.
        </p>

        <p>All code for the blog can be found at the
            <a href="https://github.com/seanlandsman/ag-grid-understanding-webpack">Webpack Tutorial: Understanding How it Works</a> repository on
            GitHub.</p>

        <p>Let's assume we have an application that can peform two simple mathematical tasks - sum and multiply. We
            decide to split these functions into separate
            files for easier maintenance:</p>

<snippet>
// sum.js
var sum = function (a, b) {
    return a + b;
};</snippet>
<snippet>
// multiply.js
// slightly contrived here - we're going to repeatedly sum to multiply, to illustrate dependency
// interaction
var multiply = function (a, b) {
    var total = 0;
    for (var i = 0; i &lt; b; i++) {
        total = sum(a, total);
    }
    return total;
};</snippet>
<snippet>
// index.js - our application logic
var totalMultiply = multiply(5, 3);
var totalSum = sum(5, 3);

console.log('Product of 5 and 3 = ' + totalMultiply);
console.log('Sum of 5 and 3 = ' + totalSum);</snippet>
<snippet>
// index.html - our entry point to our application
&lt;html&gt;
&lt;head&gt;
    &lt;script src="src/sum.js"&gt;&lt;/script&gt;
    &lt;script src="src/multiply.js"&gt;&lt;/script&gt;
    &lt;script src="src/index.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;/html&gt;</snippet>

        <p>The output of this would be:</p>
        <snippet>
Product of 5 and 3 = 15
index.js:17 Sum of 5 and 3 = 8</snippet>

        <h2>How can Webpack help us?</h2>

        <h2>Dependencies - Modules To the Rescue!</h2>

        <p>From the above code you can see that both multiply.js and index.js depend on sum.js. We can show the
            dependency hierarachy in a simple diagram here:</p>
        <img src="../images/webpack_dependencies.png" style="width: 100%">
        <p></p>

        <p>If we get the order wrong in index.html our application won't work.
            If index.js is included before <span style="font-style: italic;font-weight: bold">either</span> of the
            other dependencies, or if sum.js is included <span style="font-style: italic;font-weight: bold">after</span>
            multiply.js we will get errors.</p>

        <p>Now imagine that we scale this up
            to an actual fully blown Web Application - we may have dozens of dependencies, some of which depend on each
            other. Maintaining order would become a nightmare!</p>

        <p>Finally, by using global variables, we risk other code overwriting our variables, causing hard to find
            bugs.</p>

        <p>Webpack can convert these dependencies into modules - they will have a much tighter scope (which is safer).
            Additionally by converting our dependencies into Modules, Webpack can manage our dependencies for us -
            Webpack will pull in the dependant Modules at the right time, in the correct scope (we'll see this in more
            detail later).</p>

        <h2>Death by a Thousand Cuts - Reducing Traffic</h2>

        <p>If we take a look at index.html, we can see that we'll need to pull down 3 separate files. This is fine but
            now imagine again that we have many dependencies - the end user would have to wait until all of the
            dependencies had been downloaded before the main application could run.</p>

        <p>The other main feature Webpack offers is bundling. That is, Webpack can pull all of our dependencies into a
            single file, meaning
            that only one dependency would need to be downloaded.</p>

        <img src="../images/webpack_bundling.png" style="width: 100%">

        <p></p>
        <p>Bundling and Modularisation are Webpack's main features. Through plugins & loaders we can further extend
            this (we'll see this later)
            but primarily this is what Webpack is for.</p>

        <h2>Making Dependencies Available, And Linking Them</h2>

        <p>For our initial setup, we'll use the CommonJS module syntax. There are other options (AMD, ES2015) but for
            now we'll use CommonJS and later move to ES2015.</p>

        <p>CommonJS uses <code>module.exports</code> to export - or make available - functions or variables to other
            code.
            It uses <code>require</code> to then pull in these exported values.</p>

<snippet>
// sum.js
var sum = function (a, b) {
    return a + b;
};
module.exports = sum;</snippet>
<snippet>
// multiply.js
var sum = require('./sum');

var multiply = function (a, b) {
    var total = 0;
    for (var i = 0; i &lt; b; i++) {
        total = sum(a, total);
    }
    return total;
};
module.exports = multiply;</snippet>
<snippet>
// index.js - our application logic
var multiply = require('./multiply');
var sum = require('./sum');

var totalMultiply = multiply(5, 3);
var totalSum = sum(5, 3);

console.log('Product of 5 and 3 = ' + totalMultiply);
console.log('Sum of 5 and 3 = ' + totalSum);</snippet>
<snippet>
// index.html - our entry point to our application
&lt;html&gt;
&lt;head&gt;
    &lt;script src="./dist/bundle.js""&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;/html&gt;</snippet>

        <p>Notice that we've made both <code>sum</code> and <code>multiply</code> available to other code and we've
            pulled
            in these exported functions in both multiple.js and index.js. </p>
        <p>Notice too that our index.html now only needs to pull in a single file - bundle.js.</p>
        <p>This is great! We now no longer have to worry about dependency order. We can expose what we want and keep
            other code
            effectively private. We also reduce web calls from 3 (sum.js, multiply.js and index.js) to a single call -
            this will help speed loading times.</p>

        <h2>Webpack - Initial Configuration</h2>

        <p>For the above to work, we need to do some initial Webpack configuration:</p>
        <snippet>
var path = require('path');
module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './dist/),
        filename: 'bundle.js
    }
}</snippet>

        <p>At a minimum, we need to tell Webpack what our application entry point is and what the resulting output
            should be.</p>

        <p><code>entry</code>: This is the main entry point of our application. This is where our initial loading and
            application logic will be. Webpack uses this as a starting point for its dependency tree walking. It will
            build
            up a dependency graph and create modules as necessary.</p>
        <p><code>output.path</code>: An absolute path for the resulting bundle. To make this cross platform and easy to
            use, we use a built-in Node.js
            function (<code>path</code>). This will help us to dynamically create an absolute path, relative to where we
            are.
        </p>
        <p><code>output.filename</code>: The filename of the resulting bundle. This can be anything, but by convention
            it's called 'bundle.js'
        </p>

        <p><strong>Note:</strong> <code>__dirname</code> is a Node.js utility variable - it is the directory name of the
            current file.</p>

        <h2>Looking at bundle.js</h2>

        <p>Looking at the resulting bundle.js can be very instructional (prettified and commented for easier
            navigation):</p>
<snippet>
// the webpack bootstrap
(function (modules) {
    // The module cache
    var installedModules = {};

    // The require function
    function __webpack_require__(moduleId) {
        // Check if module is in cache
        // Create a new module (and put it into the cache)
        // Execute the module function
        // Flag the module as loaded
        // Return the exports of the module
    }


    // expose the modules object (__webpack_modules__)
    // expose the module cache
    // Load entry module and return exports
    return __webpack_require__(0);
})
/************************************************************************/
([
    // index.js - our application logic
    /* 0 */
    function (module, exports, __webpack_require__) {

        var multiply = __webpack_require__(1);
        var sum = __webpack_require__(2);

        var totalMultiply = multiply(5, 3);
        var totalSum = sum(5, 3);

        console.log('Product of 5 and 3 = ' + totalMultiply);
        console.log('Sum of 5 and 3 = ' + totalSum);
    },
    // multiply.js
    /* 1 */
    function (module, exports, __webpack_require__) {

        var sum = __webpack_require__(2);

        var multiply = function (a, b) {
            var total = 0;
            for (var i = 0; i &lt; b; i++) {
                total = sum(a, total);
            }
            return total;
        };
        module.exports = multiply;
    },
    // sum.js
    /* 2 */
    function (module, exports) {

        var sum = function (a, b) {
            return a + b;
        };
        module.exports = sum;
    }
]);</snippet>

        <p>From this you can see that Webpack wraps each of our files into a module and passes them into the Webpack
            bootstrap as an array of Modules.
            For each module, it adds them to the Webpack, executes them and makes them available to other modules.</p>
        <p>It executes <code>__webpack_require__(0)</code> which looking at the array of modules is our index.js.
            The result is the output we started with, but with far easier dependency management and less web traffic!
            Brilliant!</p>


        <h2>Loaders - Making Webpack Smarter</h2>

        <p>Webpack understands JavaScript. It can create modules and bundle JavaScript out of the box, but if you want
            to use something other than JavaScript, or want to write in something like ES2015/ES6, then
            you'll need to tell Webpack how to process this.</p>

        <p>More accurately, we need to pre-process these other languages/versions into JavaScript ES5 - the version that
            Webpack can understand.</p>

        <p>Here at ag-Grid, we're big fans of TypeScript, but for the purposes of this example we're going to convert our
            example code into ES2015 and use Babel to convert - or <span style="font-style: italic">transpile</span> -
            our ES2015 code into s=ES5 compatible JavaScript.</p>

        <p>Babel can do a great deal other than simply transpiling ES2015 code into ES5, but covering that is beyond the
            scope of this blog. Please refer to the <a href="https://babeljs.io/" target="_blank">Babel</a> site for
            more information about Babel.</p>

        <p>First, let's convert our ES5 code into ES2015:</p>
<snippet>
// sum.js
const sum = (a, b) =&gt; a + b;

export default sum;</snippet>
<snippet>
// multiply.js
import sum from './sum';

const multiply = (a, b) =&gt; {
    let total = 0;
    for(let i=0;i&lt;b;i++) {
        total = sum(a, total);
    }
    return total;
};

export default multiply;</snippet>
<snippet>
// index.js - our application logic
import multiply from './multiply';
import sum from './sum';

const totalMultiply = multiply(5, 3);
const totalSum = sum(5, 3);

console.log(`Product of 5 and 3 = ${totalMultiply}`);
console.log(`Sum of 5 and 3 = ${totalSum}`);</snippet>
<snippet>
// index.html is unchanged</snippet>
        <p>Here we're using Arrow Functions, the const keyword, Template Strings and the es2015 import/export module
            format, all of which are ES2015 features.</p>

        <p>In order to use Babel, we need to use the Babel Loader. Loaders are how Webpack can process content other
            than JavaScript.
            With Loaders we can get Webpack to process many types of files - CSS, Images, TypeScript and ES2015 code and
            so on.</p>

        <p>We need 3 Babel dependencies in order to use it with Webpack: </p>
        <ul class="content">
        <li><code>babel-loader</code>: The interface between Babel and Webpack</li>
        <li><code>babel-core</code>: Understands how to read & parse code, and generate corresponding output</li>
        <li><code>babel-preset-es2015</code>: Rules for Babel on how to process ES2015 code and convert it into ES5</li>
        </ul>

        <p>The webpack configuration with the Babel Loader in place looks like this:</p>
        <snippet>
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './dist/'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};</snippet>

        <p>As we can have a number of Loaders in Webpack, the values provided are in an array - in our case we're only
            providing one
            Loader initially.</p>

        <ul class="content">
            <li><code>test</code>: We need to tell the Loader that we only want it to process JavaScript files. We don't
                want it to look for
                CSS, HTML, images and so on - only JavaScript (.js) files. In order to do so, we provide a regex
                expression that will match .js files
            </li>
            <li><code>loader</code>: The loader to use - in this case the Babel Loader</li>
            <li><code>exclude</code>: We don't want Babel to process any files under node_modules</li>
            <li><code>query.presets</code>: which Babel Preset (or rules) we want to apply - in our case we're looking
                for Babel to convert ES2015 code
            </li>
        </ul>


        <p>Looking at our bundle.js again (and this time only looking at the part that contains sum.js) we can see the
            following:</p>
        <snippet>
/* 2 */
function(module, exports) {
    var sum = function sum(a, b) {
        return a + b;
    };

    module.exports = sum;
}</snippet>

        <p>So the Babel Loader has converted our ES2015 code back into ES5 code - great! The best of both worlds.</p>

        <h2>Making Webpack Look Good - CSS & Styling</h2>

        <p>Let's expand our example to actually output the results of our calculations. We'll create a body on the page,
            and then add the results of the product and sum to spans, which we'll add to the body:</p>
<snippet>
// index.js - our application logic
import multiply from './multiply';
import sum from './sum';

const totalMultiply = multiply(5, 3);
const totalSum = sum(5, 3);

// create the body
const body = document.createElement("body");
document.documentElement.appendChild(body);

// calculate the product and add it to a span
const multiplyResultsSpan = document.createElement('span');
multiplyResultsSpan.appendChild(document.createTextNode(`Product of 5 and 3 = ${totalMultiply}`));

// calculate the sum and add it to a span
const sumResultSpan = document.createElement('span');
sumResultSpan.appendChild(document.createTextNode(`Sum of 5 and 3 = ${totalSum}`));

// add the results to the page
document.body.appendChild(multiplyResultsSpan);
document.body.appendChild(sumResultSpan);</snippet>
        <p>The output would be the same as before, but on a page:</p>
        <snippet>
Product of 5 and 3 = 15Sum of 5 and 3 = 8</snippet>

        <p>We can improve this with CSS - let's ensure each result is on a new line, and add a border around each
            result.</p>

        <p>Our CSS will look like this:</p>
<snippet>
// math_output.css
span {
    border: 5px solid brown;
    display:block;
}</snippet>
        <p>We need to pull this CSS into our application. We could of course simply add a <code>link</code> tag to our
            html,
            but if we import it and then use Webpack to process it, we'll benefit from what Webpack can offer.</p>

        <p>An additional benefit of importing the CSS in our code is that we (developers) can see where the association
            between the CSS and its usage is. It's worth noting that the CSS is not scoped to the module it's imported
            to (it's still global),
            but from a developers perspective the relationship is clearer.</p>

<snippet>
// index.js - our application logic
import multiply from './multiply';
import sum from './sum';

// import the CSS we want to use here
import './math_output.css';

const totalMultiply = multiply(5, 3);
const totalSum = sum(5, 3);

// create the body
const body = document.createElement("body");
document.documentElement.appendChild(body);

// calculate the product and add it to a span
const multiplyResultsSpan = document.createElement('span');
multiplyResultsSpan.appendChild(document.createTextNode(`Product of 5 and 3 = ${totalMultiply}`));

// calculate the sum and add it to a span
const sumResultSpan = document.createElement('span');
sumResultSpan.appendChild(document.createTextNode(`Sum of 5 and 3 = ${totalSum}`));

// add the results to the page
document.body.appendChild(multiplyResultsSpan);
document.body.appendChild(sumResultSpan);</snippet>
        <p>The only change from before is that we're now importing the CSS.</p>

        <p>We need two Loaders to process our CSS:
        </p>
        <ul class="content">
            <li><code>css-loader</code>: Knows how to process CSS imports - takes the imported CSS and loads the file
                contents
            </li>
            <li><code>style-loader</code>: Takes CSS data(from imports) and adds them to the HTML document</li>
        </ul>

        <p>Our Webpack config now looks like this:</p>
        <snippet>
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './dist/'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader']
            }
        ]
    }
};</snippet>

        <ul class="content">
            <li><code>test</code>: as before, we need to tell the Loaders that we only want it to process CSS files -
                this regex will only process .css files
            </li>
            <li><code>loaders</code>: the loaders to use. Note that this time it's plural as we're supplying an array of
                Loaders. Also note that Webpack processes Loaders
                from <strong>right to left</strong>, so the results of <code>css-loader</code> (the file contents) are
                passed to <code>style-loader</code> (adding the styles
                to the HTML document)
            </li>
        </ul>

        <p>If we now run Webpack and reload our application the results will look like this:</p>
        <img src="../images/css_results.png" style="height: 50px; width: 100%">

        <p>Behind the scenes these two Loaders have dynamically added the styles to the HTML document. If we inspect
            the resulting HTML in Chrome we can see the following:</p>
        <img src="../images/css_html.png" style="height: 200px;width: 100%">

        <p>This is clever, but there are other ways for us to process the CSS. We can split the CSS in cache busting
            (files with unique hashes) and then include these files into our resulting bundle.
        </p>

        <p>For now, let's just extract the CSS and output it into a file that we can then import. To do this, we're
            going to make use of a Plugin: <code>ExtractTextPlugin</code>.</p>

        <p>Loaders are used for pre-processing data before it's output into our bundle. Plugins however can keep output
            from appearing in our bundle.</p>

        <p>Our Webpack config now looks like this:</p>
        <snippet>
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './dist/'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('css-loader')
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('style.css')
    ]
};</snippet>

        <p>At the top we're importing the ExtractTextPlugin. We've also changed the loader for CSS to use this
            plugin: </p>
        <snippet>
{
    test: /\.css$/,
    loader: ExtractTextPlugin.extract('css-loader')
}</snippet>

        <p>This tells Webpack to pass the results off the css-loader to the ExtractTextPlugin. At the bottom we
            configure the plugin:</p>
        <snippet>
plugins: [
    new ExtractTextPlugin('style.css')
]</snippet>
        <p>What this does is tell the plugin that for all data passed to it, save it down to a file called style.css.
            This may not seem immediately useful, but as before with many separate JavaScript files, imagine we had many
            CSS files. By doing the above, we can combine many separate CSS files into one file, reducing the number of
            web calls required at load time.</p>

        <p>Looking at dist/style.css we can see:</p>
        <snippet>
span {
    border: 5px solid brown;
    display:block;
}</snippet>

        <p>Which of course is the content of our CSS. To make use of this we need to modify our index.html to import
            this CSS:</p>
        <snippet>
// index.html - our entry point to our application
&lt;html&gt;
&lt;head&gt;
    &lt;link rel="stylesheet" href="dist/style.css"/&gt;
    &lt;script src="./dist/bundle.js""&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;/html&gt;</snippet>
        <p>The output will be the same as before.</p>

        <h2>A Picture Is Worth A Thousand Words</h2>

        <p>Let's add some images to our application - and get Webpack (together with a suitable loader) to process them
            for us.</p>

        <p>Let's add two new images to our project a small one and a large one - one for summing and one for
            multiplication,
            just to add a little colour to our output.</p>

        <p>In order to process these images we're going to make use of two Loaders:
        </p>
        <ul class="content">
            <li><code>image-webpack-loader</code>: will try to automatically compress large images for us</li>
            <li><code>url-loader</code>: will inline the results from <code>image-webpack-loader</code> if the results
                are small, and include
                the image in the output directory if they are large
            </li>
        </ul>

        <p>We have two new images we want to add - multiply.png which is relatively large (about 32kb) and sum.png which
            is relatively small (about 13kb).</p>

        <p>First, let's add a new image utility class - this will create a new image for us and add it to the
            document:</p>
        <snippet>
// image_util.js
const addImageToPage = (imageSrc) =&gt; {
    const image = document.createElement('img');
    image.src = imageSrc;
    image.style.height = '100px';
    image.style.width = '100px';
    document.body.appendChild(image);
};

export default addImageToPage;</snippet>

        <p>Let's import both the new image utility as well as the images we want to add to our application:</p>
        <snippet>
// index.js - our application logic
import multiply from './multiply';
import sum from './sum';

// import our image utility
import addImageToPage from './image_util';

// import the images we want to use
import multiplyImg from '../images/multiply.png';
import sumImg from '../images/sum.png';

// import the CSS we want to use here
import './math_output.css';

const totalMultiply = multiply(5, 3);
const totalSum = sum(5, 3);

// create the body
const body = document.createElement("body");
document.documentElement.appendChild(body);

// calculate the product and add it to a span
const multiplyResultsSpan = document.createElement('span');
multiplyResultsSpan.appendChild(document.createTextNode(`Product of 5 and 3 = ${totalMultiply}`));

// calculate the sum and add it to a span
const sumResultSpan = document.createElement('span');
sumResultSpan.appendChild(document.createTextNode(`Sum of 5 and 3 = ${totalSum}`));

// add the results to the page
addImageToPage(multiplyImg);
document.body.appendChild(multiplyResultsSpan);

addImageToPage(sumImg);
document.body.appendChild(sumResultSpan);</snippet>
        <p>Finally, let's configure Webpack to process these images with the two new Loaders:</p>
        <snippet>
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './dist/'),
        filename: 'bundle.js',
        publicPath: 'dist/'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('css-loader')
            },
            {
                test: /\.png$/,
                loaders: [
                    'url-loader?limit=5000',
                    'image-webpack-loader'
                ]
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('style.css')
    ]
};</snippet>

        <ul class="content">
            <li><code>output.publicPath</code>Allows the url-loader to know what prefix to add for files that will be
                saved to disk. For example, a resulting
                img.src would be img.src='dist/output_file.png'
            </li>
            <li><code>test</code>: as before, we need to tell the Loaders that we only want it to process image files -
                this regex will only process .png files. We can make this
                more complicated by adding support for other image formats, for our purposes this simple regex will
                do
            </li>
            <li><code>loaders</code>: our loaders to use - remember that Webpack processes Loaders from <strong>right to left</strong>, so the results of <code>image-webpack-loader</code>
                will be passed to <code>url-loader</code></li>
        </ul>

        <p>If we now run Webpack we will see something like the following:</p>
        <snippet>
38ba485a2e2306d9ad96d479e36d2e7b.png
bundle.js
style.css</snippet>

        <p>If we open 38ba485a2e2306d9ad96d479e36d2e7b.png we should find that it is our large image - multiply.png. The
            smaller image, sum.png, has been inlined in bundle.js as follows:</p>
        <snippet>
module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAHgCAMAAAACDyzWAAAC6FBMVEUAuv8AgL...."</snippet>

        <p>Which would be equivalent to having:</p>
        <snippet>
img.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAHgCAMAAAACDyzWAAAC6FBMVEUAuv8AgL...'</snippet>

        <p>When we run our application output is:</p>

        <img src="../images/final_webpack_output.png" style="width: 100%">

        <p>From this Webpack Tutorial, you can see what Webpack can offer us as application developers. With a fairly small
            amount
            of configuration we've been able to process ES2015 code, bundle it, handle CSS and process both large and
            small images, all
            in an easy to understand method.</p>

        <p>We've achieved all this and we've only just scratched the surface of what Webpack can do. We can minify &
            uglify code, split code
            into cache busting filename, process TypeScript and Angular - there are so many options!</p>

        <p>Give Webpack a go - I'm sure you'll find it an indispensable tool in your developer toolkit.</p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button"
               data-url="https://www.ag-grid.com/ag-grid-understanding-webpack/"
               data-text="Webpack Tutorial: Understanding How it Works" data-via="seanlandsman"
               data-size="large">Tweet</a>
            <script>!function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
                    if (!d.getElementById(id)) {
                        js = d.createElement(s);
                        js.id = id;
                        js.src = p + '://platform.twitter.com/widgets.js';
                        fjs.parentNode.insertBefore(js, fjs);
                    }
                }(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
<?php include '../blog-authors/sean.php'; ?>
</div>


<hr/>

<div id="disqus_thread"></div>
<script type="text/javascript">
    /* * * CONFIGURATION VARIABLES * * */
    var disqus_shortname = 'aggrid';

    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function () {
        var dsq = document.createElement('script');
        dsq.type = 'text/javascript';
        dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments
        powered by Disqus.</a></noscript>
<hr/>


<?php
include('../includes/mediaFooter.php');
?>
