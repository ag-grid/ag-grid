<?php

$pageTitle = "ag-Grid Blog: Building Components for Javascript, React, Angular";
$pageDescription = "An in-depth guide to building a JavaScript component. This covers everything we did to build ag-Grid, a commercially successful datgrid component.";
$pageKeyboards = "javascript build components gulp typescript react angularjs";

include('../includes/mediaHeader.php');
?>

            <h1>Understand Packaging for Javascript, TypesScript, CommonJS and Everything Else</h1>

<div class="row">
    <div class="col-md-8">

        <p class="lead">
            ag-Grid is an enterprise JavaScript data grid with zero library dependencies.
            The grid is intended to be used either by plain Javascript or alongside a
            JavaScript application frameworks such as React or AngularJS 1.x.
        </p>

        <p>
            Supporting all the frameworks and build systems took days of research and practicing.
            This article goes through lessons learnt and how to structure a project while supporting
            the following:
        </p>
            <ul class="content">
            <li>ECMA 6 imports</li>
            <li>CommonJS Require</li>
            <li>TypeScript and TypeScript Definitions</li>
            <li>Optional Angular 2 and React</li>
            <li>Gulp and Webpack</li>
        </ul>

        <p>This page is based on the <a href="https://github.com/ceolter/ag-grid">ag-Grid project on Github</a>. Check the project for
        a full working example of the concepts below. The project is written in TypeScript, however you do not need TypeScript
        to use the project.</p>

        <h3>Learning from Angular 2 and Typescript</h3>

        <p>You do not need to be using, or even be a fan of, Angular 2 or Typescript for them to be useful for you.
        You can learn from them and benefit from what they bring to the community even if you're a Babel and React guy.
        </p>
        <ul class="content">
            <li><b>Typescript</b> is written by Microsoft, a proper company with experience writing proper compilers
            including C# and C++. This means I respect more their 'design on things' than I would open source
            community driven projects. Personally I learnt a lot by observing the different options of the Typescript
            compiler and how they changed the resulting JavaScript code.</li>
            <li><b>Angular 2</b> is pushing the boundaries of ECMA 6 and Typescript. This may be its achilles heel,
                in that it's using cutting edge technologies, but it is forcing these technologies into the main
            stream and ironing them out. A lot can be learnt of the future by looking at what Angular 2 is doing
            and I pay respect to the Angular 2 team for taking the brave steps.</li>
        </ul>

        <h3>Folder Structure</h3>

        <p>
            We are going to be generating a lot of files. To make this easy to work with, we define two
            core folders as follows:
        </p>
            <ul class="content">
            <li><b>src</b>: All the source files that we edit. This includes TypeScript and .styl files (for Stylus,
                what ag-Grid uses to generate CSS).</li>
            <li><b>dist</b>: All the generated files. This includes TypeScript output (JavaScript),
                Stylus output (CSS) and WebPack output (JavaScript).</li>
        </ul>

        <h3>Configuring Typescript - Internal vs External Modules</h3>

        <p>
            Internal modules in Typescript allow you to structure your 'pre ECMA 6 modules' code into separate
            files and then have Typescript combine all the files together (similar to bundling via Browserify and
            Webpack) and provide a level of namespacing away from the global scope. This was great back in the day
            before Browserify and WebPack, as it allowed splitting up your project into multiple files and then
            have the Typescript compiler bundle your files into one file.
        </p>

        <snippet>
/* This top bit is the old way of referenceing other TypeScript files, it ensures */
/* when Typescript joins the files together, this file goes after MyUtils.ts */
///&lt;reference path='./MyUtils.ts' /&gt;

/* This is the internal module definition */
module ag.grid {
    export class Grid {
        ...
    }
}</snippet>

        <p>
            Do not do any of this!! It lacks support for CommonJS or ECMA 6 modules. Instead you should use
            External Modules.
        </p>

        <p><b>Do not use TypeScript internal modules, delete them from your code, forget they exist, and move
            to TypeScript external modules.</b></p>

        <p>
            External modules in TypeScript are what you see in ag-Grid and Angular 2 code and this is what
            works best with CommonJS as it gets compiled down to CommonJS 'require' functions which is what
            most of the rest of the world is using, incluing the React community.
        </p>

        <snippet>
/* Include your references like this*/
import {MyUtils} from './MyUtils' /&gt;

/* No modules, the file name and location provide the equivalent */
export class Grid {
    ...
}</snippet>

        <h3>Configuring Typescript - Compiling into Modules</h3>

        <p>
            Next is the compile settings for TypeScript. ag-Grid uses Gulp for compiling TypeScript and has the
            TypeScript settings in the Gulp file. The portion of the gulpfile.js of interest is as follows:
        </p>

        <snippet>
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
}       </snippet>

        <p>The item of interest for now is <i><b>module: 'commonjs'</b></i>. TypeScript supports
        the following 4 Modules: commonjs, amd, system and umd. This is what we think about them:
            <ul class="content">
            <li><b>commonjs:</b> This will allow our application to work with today's CommonJS (yeay for React and
                other people using CommonJS) and the future ECMA 6 is also able to work with CommonJS files
                (yeay for AngularJS 1.x 2 and SystemX).</li>
            <li><b>amd:</b> This is used for Require.js. However, the popularity of Require.js is diminishing
            and you can use commonjs inside Require.js anyway, so we don't care.</li>
            <li><b>umd:</b> Stands for Universal Module Definition. It's a combination of the two above. However
            because we don't care about amd, that means we don't care about the combination either.</li>
            <li><b>system:</b> System modules are the future. However they are still changing, which is difficult
            to support. Angular 2 is provided through CommonJS - to me this is very telling as the
            Angular 2 guys collaborate with the TypeScript guys, pushing the boundaries of TypeScript,
            and if the Angular 2 guys think System modules are not ready, then I don't either. Besides, CommonJS can
            also be read in from SystemX, so why take the risk and pain at this point? CommonJS works and is stable.</li>
        </ul>
        ag-Grid uses Gulp to configure TypeScript. Another popular way is to use tsconfig.json. There is no
        benefit, both ways achieve the same result.
        </p>
        <p>
        So from the above, commonjs modules is the one to go for as it is still popular and can be used by all
        the other popular module loading systems.
        </p>

        <p>If we then want to include a 'non module' version of your component, you do that using
        WebPack which takes in the JavaScript CommonJS files (what TypeScript creates) and joins them
        all together and exposes them on the global scope. More on this later in the section on WebPack.</p>

        <p>
            So keeping our small 'Grid' class example from above, the generated Typescript to JavaScript file will be:
            <snippet>
/* require gets used where we used import */
var MyUtils = require("./MyUtils");

/* ECMA 6 class becomes a function in ECMA 5, how Typescript supports classes today */
var Grid = (function () {
    function Grid() {
        ....
    }
    return Grid;
})();

/* require exports used to export the class */
exports.Grid = Grid;</snippet>
        </p>

        <h3>Exposing CommonJS Modules</h3>

        <p>
            Once your project has CommonJS files, another project can use your project using CommonJS.
            For example someone can include your file using Node dependencies and the following code:
            <snippet>
// for CommonJS require
var Grid = require('ag-grid/dist/lib/grid');

// or for ECMA 6 import
import {Grid} from 'ag-grid/dist/lib/grid';</snippet>
        </p>

        <p>This is great, it works, but it's long winded that the client has to include 'dist/lib' in
        each call. To get around this:
</p>
        <ul class="content">
            <li>Create a main Javascript file in the root of your project to include all your exports. in ag-Grid, this file is called main.js</li>
            <li>Specify the main file in your package.json eg: "main": "./main.js"</li>
        </ul>

        <p>Then in your main file, specify what you want to export.</p>
        <snippet>
exports.Grid = require('./dist/lib/grid').Grid;</snippet>
        Once this is done, then the client can access the module in the short-hand version of the above.
            <snippet>
// for CommonJS require
var Grid = require('ag-grid').Grid; // if no file specified, it's picked up from package.json entry

// or for ECMA 6 import
import {Grid} from 'ag-grid-community';</snippet>
        </p>

        <p>You can have as many 'main' files as you like, giving you the option of splitting the modules out.
            However this only makes sense for very large projects where splitting out helps.
            It is standard practice to put these main files in the root of your project.
        </p>

        <p>The use of the main files is optional, but highly recommend for the following reasons:</p>
        <ul class="content">
            <li>Less typing for your clients.</li>
            <li>Decouples clients from the internals, allowing you to restructure code placement.</li>
            <li>Documents an interface, only exposing what you want.</li>
        </ul>

        <h3>TypeScript - Creating Definition Files</h3>

        <p>
            There is a project called Definitely Typed on Github that hosts definition files for JavaScript projects.
            This project is for distributing definitions for projects not written in TypeScript. <b>If you are writing your
            project for distribution in TypeScript, then you don't need to put your definitions in Definitely Typed. Instead distribute your
            definition files with your code.</b>
        </p>

        <p>
            Creating declaration files is done as part of the TypeScript compile step via setting the property
            'declarationFiles=true'. The declaration files then get put alongside the generated JavaScript files
            and be consumed directly by TypeScript clients.
        </p>

        <h3>TypeScript - Exposing Definition Files</h3>

        <p>
            Similar to exposing the CommonJS modules, you should expose the definition files. Do this
            by creating a definition file with the same name as the module file. In ag-Grid, this file
        is called main.d.ts and contains lines like the following:
            <snippet>
export * from './dist/lib/grid';</snippet>
        </p>

        <p>Now, when a client is using TypeScript and imports your project via CommonJS or ECMA 6 modules,
        your IDE will be able to pick up the definition files automatically.</p>

        <h3>WebPack</h3>

        <p>The above CommonJS works great when the client is using CommonJS. It is probable that the client,
        assuming it's browser based, will use Browserify or WebPack to bundle up the client application
        and its dependencies (including your module) into a single Self Contained Javascript Bundle file.</p>

        <p>The problem with the above is it assumes your client will be using a module loading system. That is where
        WebPack is to the rescue. It takes a CommonJS module and generates a bundle that exposes
        the shared component on the global namespace. This will allow your clients to use your component 'the old way'
        by just referencing your script directly from the HTML page. In the ag-Grid project, similar to TypeScript, Webpack is also configured
        inside the Gulp file. You have the option of webpack.config.js instead of having the settings in Gulp, again
        no advantage, it's just the preference of ag-Grid to keep the config inside the Gulp file.
<snippet>
function webpackTask(minify, styles) {
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
}</snippet>
        The above is a cut down version of what ag-Grid uses, as ag-Grid also considers minified versions
        and optionally includes CSS. See the ag-Grid project for the full working version.
        </p>
        <p>
            What you should note are the following options:
        </p>
            <ul class="content">
            <li><b>entry:</b> Specifies the files to include in the result. Indirectly referenced files will also be included.
            This is the same file we use to expose the CommonJS library to the client.</li>
            <li><b>output.filename: </b>The resulting filename.</li>
            <li><b>output.library & output.libraryTarget: </b>The two of these settings combined tell WebPack to build
                the library and put it on the global scope. output.library will be the global variable this library will be exposed through.</li>
        </ul>

        <p>This technique, btw, is what Angular 2 uses to create its UMD version of Angular 2.0.</p>

        <h3>CSS Styles</h3>

        <p>
            If your client is using CommonJS, then they can require / import CSS files in their
            code. You could include the require / import in your component code, however doing so
            would require advance knowledge of what packaging plug-in will be used. For example
            some plugins reference CSS files like this:
        <snippet>
require('ag-grid/dist/ag-theme-balham.css')</snippet>
        while another can expect this:
        <snippet>
require('!ag-grid/dist/ag-theme-balham.css')</snippet>
        or maybe this:
        <snippet>
require('css!ag-grid/dist/ag-theme-balham.css')</snippet>
        </p>
        <p>Because you can't know, the safest is to let the client reference the CSS in the client code.</p>


        <p>As for the Self Contained JavaScript Bundle versions, ag-Grid doesn't know if the client would prefer the CSS bundled with
            the JavaScript code or not, so ag-Grid provides four bundled versions:
</p>
            <ul class="content">
            <li>Normal no CSS</li>
            <li>Normal with CSS</li>
            <li>Minified no CSS</li>
            <li>Minified with CSS</li>
        </ul>

        <h3>Dependencies for Other Libraries (eg Angular 2.0 and React)</h3>

        <p>Angular 2.0 and React components have dependencies on their associated libraries. If you want to use either
            of these libraries, you have to make them as dependencies in your project. The best way to do this is as
            peer dependencies (peerDependencies in package.json) so that the client can control what version of the library
            to use and your component will use what's provided to it. This has the following impacts:
</p>
        <ul class="content">
            <li>Your project will force these dependencies on your client. This would be bad if, for example, your client
                uses Angular 2 and has no desire to have React as a dependency. ag-Grid supports this by separating
                out the dependent parts into separate Github projects (eg ag-grid-react and ag-grid-angular projects).
                The client then only includes ag-Grid and the additional project that it wants, thus only bringing in
                the framework dependency that is relevant.</li>
            <li>The dependent projects cannot be part of the Self Contained JavaScript Bundles described above
                that you can build with WebPack for direct HTML inclusion. This is because the parts need
                the said libraries at compile time (not run-time like for example Angular 1)
                because your component classes have compile time linked dependencies on the frameworks
                (React components 'object oriented class' extend React classes, and Angular 2 components
                use ECMA 6 decorators) from these libraries.
                This means if you included these dependencies in your project they would
                be dragged into your bundled files. This would be bad, as the client will need
                to be providing the framework.</li>
        </ul>

        <p>
            One thing to note about the second point and Angular 2 - it says you cannot Webpack UMD bundle Angular 2
            components, so how then can we write components that work with Angular 2's UMD distribution? The answer is
            that you will also need to provide your component as compatible with Angular 2's UMD interface, ie you
            will need to reference Angular 2 on the global scope (or have the client give you a reference to the library
            somehow) and then use ECMA 5 JavaScript techniques instead of
            ECMA 6 decorators. This means you would have to either NOT use ECMA 6 at all
            in your component's Angular 2 references,
            or have two versions of your library, one using ECMA 5 and one using ECMA 6.
            Personally I don't see this catching on. I do not believe that the
            majority of libraries are going to support the Angular 2 UMD model. Right now, a quick inspection of some
            popular Angular 2 components shows they are not supporting UMD.
        </p>

        <h3>Summing Up</h3>

        <p>
            And that's it. The world of packaging is changing, so I don't know for how long the above will be relevant.
            However you can take it from me, ag-Grid is used by thousands of people, the above system is tried and
            tested and does work.
        </p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/understanding-packaging-for-javascript-typescript-commonjs-and-everything-else/" data-text="Understand Packaging for Javascript, TypesScript, CommonJS and Everything Else" data-via="ceolter" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
<?php include '../blog-authors/niall.php' ?>
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

<?php
include('../includes/mediaFooter.php');
?>
