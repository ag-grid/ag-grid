<?php

$pageTitle = "Understanding Webpack";
$pageDescription = "Understanding Webpack - Lessons Learnt at ag-Grid";
$pageKeyboards = "ag-Grid javascript datagrid webpack";

include('../includes/mediaHeader.php');
?>
<link inline rel="stylesheet" href="../documentation-main/documentation.css">

<div class="row">
    <div class="col-md-12" style="padding-top: 20px; padding-bottom: 20px;">
        <h2><img src="/images/webpack_large.png"/> Understanding Webpack</h2>
    </div>
</div>

<div class="row">
    <div class="col-md-9">

        <h1>Introduction</h1>

        <p>
            Webpack is a module bundler. It takes disparate dependencies, creates modules for them and bundles the entire
            network up into manageable output files. This is especially useful for Single Page Applications (SPAs), which is
            the defacto standard for Web Applications today.
        </p>

        <p>Let's assume we have an application that can peform two simple mathematical tasks - sum and multiply.  We decide to split these functions into seperate
            files for easier maintenance:</p>

<pre>
<span class="codeComment">// sum.js</span>
var sum = function (a, b) {
    return a + b;
};

<span class="codeComment">// multiply.js</span>
<span class="codeComment">// slightly contrived here - we're going to repeatedly sum to multiply, to illustrate dependency</span>
<span class="codeComment">// interaction</span>
var multiply = function (a, b) {
    var total = 0;
    for (let i = 0; i < b; i++) {
        total = sum(a, total);
    }
    return total;
};
<span class="codeComment">// index.js - our application logic</span>
var totalMultiply = multiply(5, 3);
var totalSum = sum(5, 3);

console.log('Product of 5 and 3 = ' + totalMultiply);
console.log('Sum of 5 and 3 = ' + totalSum);

<span class="codeComment">// index.html - our entry point to our application</span>
&lt;html&gt;
&lt;head&gt;
    &lt;script src="src/sum.js"&gt;&lt;/script&gt;
    &lt;script src="src/multiply.js"&gt;&lt;/script&gt;
    &lt;script src="src/index.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;/html&gt;
</pre>

        <p>The output of this would be:</p>
<pre>Product of 5 and 3 = 36
index.js:17 Sum of 5 and 3 = 8</pre>

        <h1>How can Webpack help us?</h1>

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
            other. Maintaining order woudld become a nightmare!</p>

        <p>Finally, by using global variable we risk other code overwriting our variables, causing hard to find bugs.</p>

        <p>Webpack can convert these dependencies into modules - they will have a much tighter scope (which is safer).
            Additionally by converting our dependencies into Modules Webpack can manage our dependencies for us -
            Webpack will pull in the dependant Modules at the right time, in the correct scope (we'll see this in more detail later).</p>

        <h2>Death by a Thousand Cuts - Reducing Traffic</h2>

        <p>If we take a look at index.html we can see that we'll need to pull down 3 seperate files. This is fine, but
            now imagine again that we have many dependencies - the end user would have to wait until all of the dependencies
            had been downloaded before the main application could run.</p>

        <p>The other main feature Webpack offers is bundling. That is, Webpack can pull all of our dependencies into a single file, meaning
        that only one dependency would need to be downloaded.</p>

        <img src="../images/webpack_bundling.png" style="width: 100%">

        <p></p>
        <p>Bundling, and Modularisation, are Webpack's main features. Through plugins & loaders we can further extend this (we'll see this later),
        but primarily this is what Webpack is for.</p>

        <h1>Making Dependencies Available, And Linking Them</h1>

        <p>For our initial setup we'll use the CommonJS module syntax. There are other options (AMD, ES2015), but for
            now we'll use CommonJS and later move to ES2015.</p>

        <p>CommonJS uses <code>module.exports</code> to exports - or make available - functions or variables to other code.
            It users <code>require</code> to then pull in these exported values.</p>

<pre>
<span class="codeComment">// sum.js</span>
var sum = function (a, b) {
    return a + b;
};
module.exports = sum;

<span class="codeComment">// multiply.js</span>
<span class="codeComment">// slightly contrived here - we're going to repeatedly sum to multiply, to illustrate dependency</span>
<span class="codeComment">// interaction</span>
var multiply = function (a, b) {
    var total = 0;
    for (let i = 0; i < b; i++) {
        total = sum(a, total);
    }
    return total;
};
module.exports = multiply;

<span class="codeComment">// index.js - our application logic</span>
var multiply = require('./multiply');
var sum = require('./sum');

var totalMultiply = multiply(5, 3);
var totalSum = sum(5, 3);

console.log('Product of 5 and 3 = ' + totalMultiply);
console.log('Sum of 5 and 3 = ' + totalSum);

<span class="codeComment">// index.html - our entry point to our application</span>
&lt;html&gt;
&lt;head&gt;
    &lt;script src="./dist/bundle.js""&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;/html&gt;
</pre>

        <p>Notice that we've made both <code>sum</code> and <code>multiply</code> available to other code, and we've pulled
        in these exported functions in both multiple.js and index.js. </p>
        <p>Notice too that our index.html now only needs to pull in a single file - bundle.js.</p>
        <p>This is great! We now no longer have to worry about dependency order. We can expose what we want to, and keep other code
        effectively private. We also reduce web calls from 3 (sum.js, multiply.js and index.js) to a single call -
            this will help speed loading times.</p>

        <h1>Webpack - Initial Configuration</h1>

        <p>For the above to work, we need to do some initial Webpack configuration:</p>
<pre>
var path = require('path');
module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './dist/),
        filename: 'bundle.js
    }
}
</pre>

        <p>At a minimum we need to tell Webpack what our application entry point is, and what the resulting output should be.</p>

        <p><code>entry</code>: This is the main entry point of our application. This is where our initial loading and
            application logic will be - Webpack uses this as a starting point for it's dependency tree walking. It will build
        up a dependency graph and create modules as necessary.</p>
        <p><code>output.path</code>: An absolute path for the resulting bundle. To make this cross platform and easy to use we a built in Node.js
            function (<code>path</code>). This will help us to dynamically create an absolute path, relative to where we are.
        </p>
        <p><code>output.filename</code>: The filename of the resulting bundle. This can be anything, but by convention it's called 'bundle.js'
        </p>

        <p><strong>Note:</strong> <code>__dirname</code> is a Node.js utility variable - it is the directory name of the current file.</p>

        <h1>Looking at bundle.js</h1>

        <p>Looking at the resulting bundle.js can be very instructional (prettified and commented for easier navigation):</p>
<pre>
<span class="codeComment">// the webpack bootstrap</span>
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
    <span class="codeComment">// index.js - our application logic</span>
    /* 0 */
    function (module, exports, __webpack_require__) {

        var multiply = __webpack_require__(1);
        var sum = __webpack_require__(2);

        var totalMultiply = multiply(5, 3);
        var totalSum = sum(5, 3);

        console.log('Product of 5 and 3 = ' + totalMultiply);
        console.log('Sum of 5 and 3 = ' + totalSum);
    },
    <span class="codeComment">// multiply.js</span>
    /* 1 */
    function (module, exports, __webpack_require__) {

        var sum = __webpack_require__(2);

        var multiply = function (a, b) {
            var total = 0;
            for (let i = 0; i < b; i++) {
                total = sum(a, total);
            }
            return total;
        };
        module.exports = multiply;
    },
    <span class="codeComment">// sum.js</span>
    /* 2 */
    function (module, exports) {

        var sum = function (a, b) {
            return a + b;
        };
        module.exports = sum;
    }
]);
</pre>

        <p>From this you can see that Webpack wraps each of our files into a modules and passes them into the Webpack boostrap as an array of Modules.
            For each module it adds them to the Webpack, executes them and makes them available to other modules.</p>
        <p>It executes <code>__webpack_require__(0)</code> which looking at the array of modules is our index.js.
            The result is the output we started with, but with far easier dependency management and less web traffic! Brilliant!</p>


        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-angular-aot-dynamic-components/" data-text="Understanding AOT and Dynamic Components in Angular 2" data-via="seanlandsman" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
    <div class="col-md-3">

        <div>
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-angular-aot-dynamic-components/" data-text="Understanding AOT and Dynamic Components in Angular 2" data-via="seanlandsman" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

        <div style="font-size: 14px; background-color: #dddddd; padding: 15px;">

            <p>
                <img src="/images/sean.png"/>
            </p>
            <p style="font-weight: bold;">
                Sean Landsman
            </p>
            <p>
                I'm an experienced full stack technical lead with an extensive background in enterprise solutions. Over
                19 years in the industry has taught me the value of quality code and good team collaboration. The bulk
                of my background is on the server side, but like Niall am increasingly switching focus to include front end
                technologies.
            </p>
            <p>
                Currently work on ag-Grid full time.
            </p>

            <div>
                <br/>
                <a href="https://www.linkedin.com/in/sean-landsman-9780092"><img src="/images/linked-in.png"/></a>
                <br/>
                <br/>
                <a href="https://twitter.com/seanlandsman" class="twitter-follow-button" data-show-count="false" data-size="large">@seanlandsman</a>
                <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
            </div>

        </div>

    </div>
</div>


<hr/>

<div id="disqus_thread"></div>
<script type="text/javascript">
    /* * * CONFIGURATION VARIABLES * * */
    var disqus_shortname = 'aggrid';

    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>
<hr/>

<footer class="license">
    © ag-Grid Ltd 2015-2016
</footer>

<?php
include('../includes/mediaFooter.php');
?>
