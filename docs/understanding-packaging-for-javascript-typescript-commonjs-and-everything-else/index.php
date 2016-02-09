<?php

$pageTitle = "Building Components for Javascript, React, Angular and Everything Else";
$pageDescription = "ag-Grid is a reusable component that is used in many frameworks including AngularJS and JavaReact. This article describes the build process that was used.";
$pageKeyboards = "javascript build gulp typescript react angularjs";

include('../mediaHeader.php');
?>

<div class="row">
    <div class="col-md-12" style="padding-top: 20px; padding-bottom: 20px;">
        <h2>
            <h2>Understand Packaging for Javascript, TypesScript, CommonJS and Everything Else</h2>
    </div>
</div>

<div class="row">
    <div class="col-md-9">

        <p>
            <span style="font-weight: bold; font-size: 20px;">
                <span style="color: darkred; ">ag</span><span style="color: #404040">-Grid</span>
            </span>
            is an enterprise JavaScript data grid with zero library dependencies.
            The grid is intended to be used either by plain Javascript or alongside a
            JavaScript application frameworks such as React or AngularJS.
        </p>

        <p>
            Supporting all the frameworks and build systems took days of research and practicing.
            This article goes through lessons learnt and how to structure a project while supporting
            the following:
            <ul>
            <li>ECMA 6 imports</li>
            <li>CommonJS Require</li>
            <li>TypeScript and TypeScript Definitions</li>
            <li>Optional Angular 2 and React</li>
            <li>Gulp and Webpack</li>
        </ul>
        </p>

        <p>This page is based on the <a href="https://github.com/ceolter/ag-grid">ag-Grid project on Github</a>. Check the project for
        a full working example of the concepts below. The project is written in TypeScript, however you do not need TypeScript
        to use the project.</p>

        <h3>Folder Structure</h3>

        <p>
            We are going to be generating a lot of files. To make this easy to work with, we defint two
            core folders as follows:
            <ul>
            <li><b>src</b>: All the source files that we edit. This includes TypeScript and .styl files (for Stylus).</li>
            <li><b>dist</b>: All the generated files. This includes TypeScript output (JavaScript),
                Stylus output (CSS) and WebPack output (JavaScript).</li>
        </ul>
        </p>

        <h3>Configuring Typescript - Internal vs External Modules</h3>

        <p>
            Internal modules in Typescript allow you to structure your 'pre ECMA 6 modules' code into separate
            files and then have Typescript combine all the files together (similar to bundling via Browserify and
            Webpack) and provide a level of namespacing away from the global scope.
        </p>

        <pre>
/* This top bit is the old way of referenceing other TypeScript files, it ensures */
/* when Typescript joins the files together, this file goes after Myutils.ts */
///&lt;reference path='./MyUtils.ts' />

/* This is the internal module definition */
module ag.grid {
    export class Grid {
        ...
    }
}</pre>

        <p>
            Do not do any of this!! The above works great if you are not trying to distribute your code to
            someone else. It lacks support for CommonJS or ECMA 6 modules. Instead you should use
            External Modules.
        </p>

        <p><b>Do not use TypeScript internal modules, delete them from your code, forget they exists, and move
            to TypeScript external modules.</b></p>

        <p>
            External modules in TypeScript are what you see in ag-Grid and AngularJS code, and this is what
            works best with CommonJS as it gets compiled down to CommonJS 'require' functions (what React uses).
        </p>

        <pre>
/* Include your references like this*/
import {MyUtils} from './MyUtils' />

/* No modules, the file name and location provide the equivalent */
export class Grid {
    ...
}
</pre>

        <h3>Configuring Typescript - Compiling into Modules</h3>

        <p>
            Next is the compile settings for TypeScript. ag-Grid uses Gulp for compiling TypeScript and has the
            TypeScript settings in the Gulp file. The portion of the gulpfile.js of interest is as follows:
        </p>

        <pre>
function tscTask() {
    var tsResult = gulp
        .src('src/ts/**/*.ts')
        .pipe(gulpTypescript({
            typescript: typescript,
            module: 'commonjs',
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            declarationFiles: true,
            target: 'es5',
            noImplicitAny: true
        }));

    return merge([
        tsResult.dts
            .pipe(header(dtsHeaderTemplate, { pkg : pkg }))
            .pipe(gulp.dest('dist/lib')),
        tsResult.js
            //.pipe(sourcemaps.write())
            .pipe(header(headerTemplate, { pkg : pkg }))
            .pipe(gulp.dest('dist/lib'))
    ])
}        </pre>

        <p>The item to note above is <i><b>module: 'commonjs'</b></i>. TypeScript supports
        the following Modules: commonjs, amd, system and umd. This is what we think about them:
            <ul>
            <li><b>commonjs:</b> This will allow our application to work with today's CommonJS (yeay for React and
                other people using CommonJS) and the future ECMA 6 is also able to work with CommonJS files
                (yeay for AngularJS 2 and SystemX).</li>
            <li><b>amd:</b> This is used for Require.js. However, the popularity of Require.js is diminishing
            and you can use commonjs inside Require.js anyway, so we don't care.</li>
            <li><b>umd:</b> Stands for Universal Module Definition. It's a combination of the two above. However
            because we don't care about amd, that means we don't care about the combination either.</li>
            <li><b>system:</b> System modules are the future. However they are still changing, which is difficult
            to support. AngularJS is provided through ComomonJS - to me this is very telling as the
            AngularJS guys collaborate with the TypeScript guys, pusing the boundaries of TypeScript,
            and if the AngularJS guys think it's not ready, then me neither. Besides, CommonJS can
            also be read in from SystemX, so why take the pain at this point?</li>
        </ul>
        I do not use tsconfig.json. There is no benefit to configuring everything in Gulp, it's just my personal
        preference.
        </p>
        <p>
        So from the above, commonjs modules is the one to go for as it an be used by all the other module
        loader systems.
        </p>

        <p>If we then want to include a 'non module' version of your component, you do that using
        WebPack which takes in the JavaScript CommonJS files (what TypeScript creates) and joins them
        all together and exposes them on the global scope. More on this later in the section on WebPack.</p>

        <p>
            So keeping our small 'Grid' class example from above, the generated JavaScript file will be:
            <pre>/* require gets used where we used import */
var MyUtils = require("./MyUtils");

/* class becomes a function */
var Grid = (function () {
    function Grid() {
        ....
    }
    return Grid;
})();

/* require exports used to export the class */
exports.Grid = Grid;
</pre>
        </p>

        <h3>Exposing CommonJS Modules</h3>

        <p>
            Once your project has CommonJS files, another project can use your project using CommonJS.
            For example someone can include your file using Node dependencies and the following code:
            <pre>// for CommonJS require
var Grid = require('ag-grid/dist/lib/grid');

// or for ECMA 6 import
import {Grid} from 'ag-grid/dist/lib/grid';</pre>
        </p>

        <p>This is great, it works, but it's long winded that the client has to include 'dist/lib' in
        each call. To get around this:
        <ul>
            <li>Create a main Javascript file to include all your exports.</li>
            <li>Specify the main file in your package.json eg: "main": "./main.js"</li>
        </ul>
        Then in your main file, specify what you want to export.
        <pre>exports.Grid = require('./dist/lib/grid').Grid;</pre>
        Once this is done, then the client can access the module in the short-hand version of the above.
            <pre>// for CommonJS require
var gridModule = require('ag-grid'); // if no file specified, it's picked up from package.json entry
var Grid = gridModule.Grid;

// or for ECMA 6 import
import {Grid} from 'ag-grid/main';</pre>
        </p>

        <p>You can have many 'main' files as you like, giving you the option of splitting the modules out.
            It is standard practice to put these main files in the root of your project.
        However this only makes sense for very large projects.</p>

        <p>The use of the main files is optional, but highly recommend for the following reasons:
        <ul>
            <li>Less typing for your clients.</li>
            <li>Decouples clients from the internals, allowing you to restructure code placement.</li>
            <li>Documents an interface, only exposing what you want.</li>
        </ul></p>

        <h3>TypeScript - Creating Definition Files</h3>

        <p>
            There is a project called Definitely Typed on Github. It is assisted with
            tsd.json file that stated what typings your project needed to download from Definitely Typed.
            This project is for distrusting projects not written in TypeScript. <b>If you are writing your
            project in TypeScript, then you don't need to use Definitely Typed. Instead distribute your
            .d.ts files with your code.</b>
        </p>

        <p>
            Creating declaration files is done as part of the TypeScritp compile step via setting the property
            'declarationFiles=true'. The declaration files then get put alongside the generated JavaScript files
            and be consumed directly by TypeScript clients.
        </p>

        <h3>TypeScript - Exposing Definition Files</h3>

        <p>
            Similar to exposing the CommonJS modules, you should expose the definition files. Do this
            by creating a definition file with the same name as the module file.
            <pre>export * from './dist/lib/grid';</pre>
        </p>

        <p>Now, when a client is using TypeScript and imports your project via CommonJS or ECMA 6 modules,
        your IDE will be able to pick up the definition files automatically.</p>

        <h3>WebPack</h3>

        <p>The above CommonJS works great when the client is using CommonJS. It is probable that the client,
        assuming it's browser based, will use Browserify or WebPack to bundle up the client application,
        and it's dependencies (includes your module) into a single Javascript file.</p>

        <p>The problem with the above is it cannot be used without a module loading system. That is where
        WebPack is to the rescue. It takes a CommonJS module and generates a bundle that exposes
        the shared component on the global namespace. Like TypeScript, Webpack is also configured
        inside the Gulp file.
<pre>function webpackTask(minify, styles) {
    return gulp.src('src/entry.js')
        .pipe(webpackStream({
            entry: {
                main: 'main.js'
            },
            output: {
                path: path.join(__dirname, "dist"),
                filename: 'ag-grid.js',
                library: ["agGrid"],
                libraryTarget: "umd"
            }
        }))
        .pipe(gulp.dest('./dist/'));
}</pre>
        The above is a cut down version of what ag-Grid uses, as ag-Grid also considers minified versions
        and optionally includes CSS. See the ag-Grid project for the full workign version.
        </p>
        <p>
            What you should not are the following options:
            <ul>
            <li><b>entry:</b> Specifies the files to include in the result. Files referenced will also be included.
            This is the same file we use to expose the CommonJS library to the client.</li>
            <li><b>output.filename: </b>The resulting filename.</li>
            <li><b>output.library & output.libraryTarget: </b>The two of these settings combined tell WebPack to build
                the library and put it on the global scope. output.library will be the global variable this library will be exposed through.</li>
        </ul>
        </p>

        <p>Dependencies for Other Libraries (eg Angular 2.0 and React)</p>

        <p>AngularJS 2.0 and React components have dependencies on their associated libraries. If you want to use either
        of these libraries, you have to make them as dependencies in your project. This has the following impacts:
        <ul>
            <li>Your project will bring these dependencies with it to your client. ag-Grid supports this by separating
            out the dependent parts (eg ag-grid-react and ag-grid-ng2 projects). The client then only includes the
            part (and the dependency) if it wants.</li>
            <li>The dependent projects cannot be part of the self contained bundles. This is because the parts need
                the said libraries at compile time (not run-time like for example Angular 1)
            because your component classes extend (as in 'object oriented class' extend) classes from these libraries.
            This means if you included these dependencies in your project, they would end up in your bundled files,
            which would be bad.</li>
        </ul></p>

        <h3>CSS Styles</h3>

        <p>
            If your client is using CommonJS, then they can require / import CSS files in their
            code. You could include the require / import in your component code, however doing so
            would require advance knowledge of what packaging plug-in will be used. For example
            some plugins reference CSS files like this:
        <pre>require('ag-grid/dist/theme-fresh.css')</pre>
        while another can expect this:
        <pre>require('!ag-grid/dist/theme-fresh.css')</pre>
        of maybe this:
        <pre>require('css!ag-grid/dist/theme-fresh.css')</pre>
        </p>
        <p>Because you can't know, the safest is to let the client reference the CSS in the client code.</p>

        <p>ag-Grid provides four bundled versions:
            <ul>
            <li>Normal no CSS</li>
            <li>Normal with CSS</li>
            <li>Minified no CSS</li>
            <li>Minified with CSS</li>
        </ul>

        <h3>Summing Up</h3>

        <p>
            And that's it. The world of packaging is changing, so I don't know how long the above will be relevant for.
            However you can take it from me, ag-Grid is used by thousands of people, the above system may not be the
            best, but it does work.
        </p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-in-2016/" data-text="Stepping it Up, ag-Grid Focuses on Agnostic in 2016" data-via="ceolter" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
    <div class="col-md-3">

        <img src="../images/ag-Grid2-200.png" style="display: inline-block; padding-bottom: 20px;"/>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-in-2016/" data-text="Stepping it Up, ag-Grid Focuses on Agnostic in 2016" data-via="ceolter" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

        <div style="font-size: 14px; background-color: #dddddd; padding: 15px;">

            <p>
                <img src="/niall.png"/>
            </p>
            <p>
                About Me
            </p>
            <p>
                I have been writing software all my life! Starting with Assembly, C++ and MFC,
                moving onto full stack Java / JSP / GWT and now focusing on full stack
                Java / Javascript.
            </p>
            <p>
                Currently working on ag-Grid full time.
            </p>

            <div>
                <br/>
                <a href="http://uk.linkedin.com/in/niallcrosby"><img src="/images/linked-in.png"/></a>
                <br/>
                <br/>
                <a href="https://twitter.com/ceolter" class="twitter-follow-button" data-show-count="false" data-size="large">@ceolter</a>
                <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
            </div>

        </div>

        <!--        <div style="font-size: 14px; border: 1px solid lightgrey; margin-top: 25px; padding: 15px;">
                    This article was was published on:
                    <br/>
                    <a href="http://dailyjs.com/2015/03/31/angular-grid-react-native/?utm_content=buffer98f7e&utm_medium=social&utm_source=twitter.com&utm_campaign=buffer">DailyJS</a>
                    <br/>
                    <a href="http://www.dzone.com/links/why_the_world_needed_another_angularjs_grid.html">DZone</a>
                    <br/>
                    <a href="http://www.reddit.com/r/angularjs/comments/30uel2/why_the_world_needed_another_angularjs_grid/">reddit</a>
                    <br/>
                    <a href="http://t.co/vpH62y3THW">ng-newsletter</a>
                </div>-->
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
include('../mediaFooter.php');
?>
