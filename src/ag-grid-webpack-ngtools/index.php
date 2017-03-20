<?php

$pageTitle = "Webpack Tutorial: Using ngTools/webpack";
$pageDescription = "Webpack Tutorial - ngTools/webpack- Lessons Learnt at ag-Grid";
$pageKeyboards = "webpack tutorial ngtools";

include('../includes/mediaHeader.php');
?>

<link rel="stylesheet" href="../documentation-main/documentation.css">
<script src="../documentation-main/documentation.js"></script>


<div class="row">
    <div class="col-md-12" style="padding-top: 20px; padding-bottom: 20px;">
        <h1><img src="../images/webpack_large.png"/> Webpack Tutorial: Understanding @ngtools/webpack</h1>
    </div>
</div>

<div class="row" ng-app="documentation">
    <div class="col-md-9">

        <h2>Motivation</h2>

        <p>AOT is a big part of using Angular. I've used Angular CLI successfully here at ag-Grid to build applications with AOT
            and found it very easy to use, but sometimes you need more control and fine tuning, and sometimes you just need an alternative, so in this
            blog I go through how to use ngtools/webpack, as well as describing the benefits in generally of using Webpack & AOT.</p>

        <note>It might be useful to go through an earlier blog I wrote on <a
                    href="../ag-grid-webpack-ngtools">Understanding Webpack</a> for a tutorial on Webpack core
            concepts and ideas. This blog does go into some detail and assumes a certain level of Webpack understanding,
            especially in the latter half.</note>

        <h1>Introduction to @ngtools/webpack</h1>

        <p>
            Webpack is a module bundler but through the use of <code>loaders</code> and <code>plugins</code> we can get it to do
            far more, including transpiling TypeScript, processing CSS & images and now, with the inclusion of ngtools/webpack we can
            get it to transpile our code to make it AOT ready, all within our Webpack configuration.
        </p>

        <p>All code for the blog can be found at the
            <a href="https://github.com/seanlandsman/webpack-ngtools-blog">Webpack Tutorial: Using ngTools/webpack</a> repository on
            GitHub.</p>

        <h3>Our Application</h3>

        <p>In order to focus on the build side of things our application is deliberately simple. All the file sizes and
            load times are small given our applications simplicity, so it's worth noting the relative differences in size and load times,
            not the absolute values.</p>

            <p>We have a <code>Module</code>,
            a single <code>Component</code> and a <code>Bootstrap</code> file:</p>

<pre>
<span class="codeComment">// boot.ts </span>
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {enableProdMode} from "@angular/core";
import {AppModule} from "./app.module";

declare var process;
if (process.env.ENV === 'production') {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);

<span class="codeComment">// app.module.ts</span>
import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";

// application
import {AppComponent} from "./app.component";

@NgModule({
    imports: [
        BrowserModule
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

<span class="codeComment">// app.component.ts</span>
import {Component} from "@angular/core";

@Component({
    selector: 'my-app',
    template: `
        Hello {{ name }}
    `
})
export class AppComponent {
    name: string = "Sean";
    constructor() {
    }
}
</pre>

        <p>As you can see there's not much to our application - no CSS or images and very little logic. This is deliberate so we can
        concentrate on the changes in application logic size and loaa times, which is what AOT really brings to the table.</p>

        <p>The <code>tsconfig.json</code> for both the JIT and non-AOT configuration would be:</p>
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

        <p>Not much to say about this configuration - pretty standard setup here. Note we're excluding <code>app/boot-aot.ts</code> - more on that later.</p>

        <p>The end result of running this would be:</p>

        <img src="../images/ngtools_1.png" style="width: 100%">

        <p>Exciting! But the output of the application isn't what we're interested here - we're interested in network
            traffic and load times. Let's look at that next.</p>

        <p>In this blog I'll run through 3 configurations:</p>
        <ul>
            <li><code>JIT (Just-In-Time) Configuration</code>: I'll describe this briefly as well as the results of using it.</li>
            <li><code>Non-AOT Production Configuration</code>: A Production ready configuration, but without AOT support.</li>
            <li><code>AOT Production Configuration</code>: A Production ready configuration, this time with AOT support.</li>
        </ul>

        <p>The bulk of the blog will focus on the latter two configurations - how they compare and how they're used.</p>

        <h3>JIT (Just-In-Time) Configuration</h3>
        <pre>
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var helpers = require('./helpers');
var path = require('path');

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
    ],

    devServer: {
        historyApiFallback: true,
        stats: 'minimal'
    },
};
</pre>
        <p>The items of note in this configuration is the <code>entry</code> field where we describe our entry points, and
        our <code>loaders</code>:</p>
        <ul>
            <li><code>['awesome-typescript-loader', 'angular2-template-loader']</code>: Transpile and process our Angular code.</li>
            <li><code>html-loader</code>: Take the results of our Webpack configuration and inject them into a pre-supplied html file.</li>
        </ul>

        <p>Let's run this and look at the resulting network traffic and load times, which is what we're interested in today:</p>
        <a href="../images/ngtools_2.png" target="_blank"><img src="../images/ngtools_2.png" style="width: 100%;padding-bottom: 15px"></a>

        <p>10.7MB and 1.06s to load - big, but not surprising given we're not compressing anything and we've not minified anything so far.</p>

        <p>Let's use this as a baseline - we won't make any further changes to this configuration - it'll do for development purposes.</p>

        <h3>Non-AOT Production Configuration</h3>

        <p>This time let's look at a simple configuration that will build & bundle our application - as a first pass we'll skip minification:</p>
<pre>
const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = {
    entry: {
        polyfills: './app/polyfills.ts',
        vendor: './app/vendor.ts',
        app: './app/boot.ts'
    },

    output: {
        path: helpers.root('dist/non-aot'),
        publicPath: '/',
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js'
    },

    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader']
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            }
        ]
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor', 'polyfills']
        }),

        new HtmlWebpackPlugin({
            template: 'config/index.html'
        }),

        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(ENV)
            }
        })
    ]
};
</pre>

        <p>Using this we'll get the following output:</p>

        <a href="../images/ngtools_3png" target="_blank"><img src="../images/ngtools_3.png" style="width: 100%;padding-bottom: 15px"></a>

        <p>4.3MB and 700ms to load - already a big improvement! But we can go further - let's add minification to our setup:</p>

<pre>
plugins: [
    new webpack.optimize.CommonsChunkPlugin({
        name: ['app', 'vendor', 'polyfills']
    }),

    new HtmlWebpackPlugin({
        template: 'config/index.html'
    }),

    <span class="codeComment">// minifies our code</span>
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

    new webpack.DefinePlugin({
        'process.env': {
            'ENV': JSON.stringify(ENV)
        }
    })
]
</pre>

        <a href="../images/ngtools_4png" target="_blank"><img src="../images/ngtools_4.png" style="width: 100%;padding-bottom: 15px"></a>

        <p>1.3MB and 686ms to load. With very little configuration we've got a pretty respectable build config working here.</p>

        <p>There is obviously one part we're missing in our Angular application. We're including the Angular Compiler as part of
        our application and are compiling our <code>Components</code> at runtime. Let's do something about this and see what it gets us next.</p>


        <h3>AOT Production Configuration</h3>

        <p>Similar the the Non-AOT version above, this time we reference an AOT ready bootstrap file to make use of the generated AOT factory
            (generated by the webpack config to follow):</p>

<pre>
<span class="codeComment">// boot-aot.ts</span>
import {platformBrowser} from "@angular/platform-browser";
import {AppModuleNgFactory} from "../aot/app/app.module.ngfactory";

import { enableProdMode } from '@angular/core';

declare var process;
if (process.env.ENV === 'production') {
    console.log("PROD MODE");
    enableProdMode();
}

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
</pre>

        <p>In this bootstrap file we no longer dynamically compile our module and components, but rather use the pre-compiled factory to do it for us.
        This will mean much faster load times.</p>

        <p>Next we can drop <code>import '@angular/platform-browser-dynamic'</code> as we won't need it (as we're not
            dynamically compiling anything anymore). Let's create a new <code>vendor-aot.ts</code> file that only includes what we need:</p>

<pre>
// Angular
import '@angular/platform-browser';
import '@angular/core';
import '@angular/common';
import '@angular/http';
import '@angular/router';
import '@angular/forms';

// RxJS
import 'rxjs';
</pre>

        <p>We need an <code>tsconfig.json</code> suitable for AOT transpiling too:</p>
        <p>The <code>tsconfig-aot.json</code> for both the JIT and non-AOT configuration would be:</p>
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
  }
}
</pre>
        <p>The key parts of this are:</p>
        <ul>
            <li><code>exclude</code>: We're excluding the <code>aot</code> output folder and <code>boot-aot.ts</code>
            AOT bootstrap file. We exclude the boostrap file as the factory referenced within won't exist yet (the AOT plugin will do this for us, next)</li>
            <li><code>angularCompilerOptions</code>: Specifies AOT compiler properties, specifically the output dir here</li>
        </ul>

        <p>And finally, here is our AOT ready Webpack configuration (with minification included):</p>

<pre>
const path = require('path');
const webpack = require('webpack');

const helpers = require('./helpers');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const AotPlugin = require('@ngtools/webpack').AotPlugin;

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = {
    entry: {
        polyfills: './app/polyfills.ts',
        vendor: './app/vendor-aot.ts',
        app: './app/boot-aot.ts'
    },

    output: {
        path: helpers.root('dist/aot'),
        publicPath: '/',
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js'
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
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor', 'polyfills']
        }),

        <span class="codeComment">// AOT Plugin </span>
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

        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(ENV)
            }
        })
    ]
};
</pre>


    <p>The main differences here is that we now point to our new <code>vendor-aot.ts</code> and <code>boot-aot.ts</code> in our entry points,
    and we also make use of the ngtools/webpack AOT plugin:</p>

<pre>
new AotPlugin({
    tsConfigPath: './tsconfig.aot.json',
    entryModule: helpers.root('app/app.module#AppModule')
}),
</pre>

        <p>The plugin makes use of our AOT friendly tsconfig and additionally points to the application entry point - in this case
        our main Application Module (app.module.ts).</p>


        <p>The output of running this configuration would be:</p>

        <a href="../images/ngtools_5png" target="_blank"><img src="../images/ngtools_5.png" style="width: 100%;padding-bottom: 15px"></a>

        <p>951kb and 549ms to load. What a huge improvement in file size - thats almost all due to us no longer including the Angular Compiler
            in our application anymore.</p>

        <p>The load time is improved too, and that's due to our components being pre-compiled - the compilation step has been
        pushed to build time, which is where it belongs for production deployments. </p>

        <p>Still though, this isn't a huge improvement in load times and this can be explained by the fact our application
            is so simple - there is only one component here, so although faster already if we had more components the improvements would
        be even better between AOT and non-AOT builds. Let's confirm that by adding a few simple components to our application:</p>

        <pre>
<span class="codeComment">// square.component.ts </span>
import {Component, Input} from '@angular/core';

@Component({
    selector: 'squared-value',
    template: `{{valueSquared()}}`
})
export class SquareComponent  {
    @Input() value: number;

    public valueSquared(): number {
        return this.value * this.value;
    }
}

<span class="codeComment">// cube.component.ts </span>
import {Component, Input} from '@angular/core';

@Component({
    selector: 'cubed-value',
    template: `{{valueCubed()}}`
})
export class CubeComponent  {
    @Input() value: number;

    public valueCubed(): number {
        return this.value * this.value * this.value;
    }
}

<span class="codeComment">// quad.component.ts </span>
import {Component, Input} from '@angular/core';

@Component({
    selector: 'quadrupal-value',
    template: `{{valueQuadrupaled()}}`
})
export class QuadComponent  {
    @Input() value: number;

    public valueQuadrupaled(): number {
        return this.value * this.value * this.value * this.value;
    }
}

<span class="codeComment">// simple-1.component.ts -> simple-6.component.ts</span>
<span class="codeComment">// simple-1.component.ts</span>
import {Component, Input} from '@angular/core';

@Component({
    selector: 'simple-1-value',
    template: `{{ value }}`
})
export class Simple1Component {
    @Input() value: number = 1;
}

...repeated 6 times

<span class="codeComment">// simple-6.component.ts</span>
import {Component, Input} from '@angular/core';

@Component({
    selector: 'simple-6-value',
    template: `{{ value }}`
})
export class Simple1Component {
    @Input() value: number = 6;
}

<span class="codeComment">// boot.ts - unchanged </span>
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {enableProdMode} from "@angular/core";
import {AppModule} from "./app.module";

declare var process;
if (process.env.ENV === 'production') {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);

<span class="codeComment">// app.module.ts</span>
import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";

// application
import {AppComponent} from "./app.component";
import {SquareComponent} from "./components/square.component";
import {CubeComponent} from "./components/cube.component";
import {QuadComponent} from "./components/quad.component";

@NgModule({
    imports: [
        BrowserModule
    ],
    declarations: [
        AppComponent,
        SquareComponent,
        CubeComponent,
        QuadComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

<span class="codeComment">// app.component.ts</span>
import {Component} from "@angular/core";

@Component({
    selector: 'my-app',
    template: `
        Hello {{ name }}
        &lt;hr/&gt;
        &lt;squared-value [value]="4"&gt;&lt;/squared-value&gt;
        &lt;cubed-value [value]="4"&gt;&lt;/cubed-value&gt;
        &lt;quadrupal-value [value]="4"&gt;&lt;/quadrupal-value&gt;
        &lt;hr&gt;
        &lt;simple-1-value&gt;&lt;/simple-1-value&gt;
        &lt;simple-2-value&gt;&lt;/simple-2-value&gt;
        &lt;simple-3-value&gt;&lt;/simple-3-value&gt;
        &lt;simple-4-value&gt;&lt;/simple-4-value&gt;
        &lt;simple-5-value&gt;&lt;/simple-5-value&gt;
        &lt;simple-6-value&gt;&lt;/simple-6-value&gt;
    `
})
export class AppComponent {
    name: string = "Sean";
    constructor() {
    }
}
</pre>

        <p>The output of the application now looks like this:</p>

        <a href="../images/ngtools_8png" target="_blank"><img src="../images/ngtools_8.png" style="width: 100%;padding-bottom: 15px"></a>

        <p>Still simple, we just have a few more components this time around.</p>

        <p>The results of running this with the non-AOT configuration would be:</p>

        <a href="../images/ngtools_6png" target="_blank"><img src="../images/ngtools_6.png" style="width: 100%;padding-bottom: 15px"></a>

        <p>1.3MB and 734ms to load. The increased load time would be down to Angular needing to compile there (admittedly simple)
        components at runtime.</p>

        <p>And running it with the AOT configuration would give us:</p>

        <a href="../images/ngtools_9png" target="_blank"><img src="../images/ngtools_9.png" style="width: 100%;padding-bottom: 15px"></a>

        <p>989kb and 535ms to load. Same size and even quicker (although that's just lucky - if we ran it again it might
            be slower next time around)!.</p>

        <p>Although all these values are small, especially the load times, you can hopefully see how these improvements would be
        magnified in a real-world application with many complex components. For very little effort you gain all the benefits of AOT
        while still being able to leverage the flexibility that Webpack offers. I can't see a good reason why you woudln't use the two
        together!</p>

        <note>Although the file sizes should be pretty consistent if you run this code, the load times can vary dramatically depending
        on your machine configuration and what the load on your machine is at the time. It's probably worth looking at the load times on average
        in a real-world application, rather than a particular page load to get an idea of the real benefits on offer with AOT.</note>

        <p>For a slightly more real-world example I've taken a number of our ag-Grid Angular Examples and placed them on a single page to see
        what improvements I could see. I've excluded file sizes from this as our examples include a number of non-compressible
            images, but looking at the load times I saw the following improvements:</p>

        <ul>
            <li>Non-AOT: 2.2s</li>
            <li>AOT: 1.64s</li>
        </ul>

        <p>That's a pretty decent improvement by the inclusion of a single plugin - and thats with relatively simple components. If
        you scale up to a full application with many components and for example lazy loading, the improvement you would see
        would be even greater.</p>

        <note>For guidance on using @ngtoools/webpack with ag-Grid please see the <a
                    href="../ag-grid-angular-ngtools-webpack">ag-Grid @ngtools/webpack Documentation</a></note>


        <div style="background-color: #eee; padding: 5px; display: inline-block;">

            <div style="margin-bottom: 5px;">If you liked this article then please share</div>

            <table style="background-color: #eee;">
                <tr>
                    <td>
                        <script type="text/javascript" src="//www.redditstatic.com/button/button1.js"></script>
                    </td>
                    <td>
                        &nbsp;&nbsp;&nbsp;
                    </td>
                    <td>
                        <a href="https://twitter.com/share" class="twitter-share-button"
                           data-url="https://www.ag-grid.com/ag-grid-webpack-ngtools/"
                           data-text="Webpack Tutorial: Understanding ngtools/webpack" data-via="seanlandsman"
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
                    </td>
                </tr>
            </table>
        </div>

    </div>
    <div class="col-md-3">

        <div>
            <a href="https://twitter.com/share" class="twitter-share-button"
               data-url="https://www.ag-grid.com/ag-grid-webpack-ngtools/"
               data-text="Webpack Tutorial: Understanding ngtools/webpack" data-via="seanlandsman"
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

        <div style="font-size: 14px; background-color: #dddddd; padding: 15px;">

            <p><img src="../images/sean.png"/></p>
            <p style="font-weight: bold;">
                Sean Landsman
            </p>
            <p>                
                Sean was the first person that Niall asked to join the team. Sean ensures that we can keep the agnostic in ag-Grid... he is responsible for integrating with all of our supported frameworks. Many of customers will be familiar with Sean as he is very active in our user forums supporting the needs of our customers. He has also recently given a number of talks at conferences where his calm manner belies his years of experience.
            </p>
            <p>
               Lead Developer - Frameworks
            </p>

            <div>
                <br/>
                <a href="https://www.linkedin.com/in/sean-landsman-9780092"><img src="/images/linked-in.png"/></a>
                <br/>
                <br/>
                <a href="https://twitter.com/seanlandsman" class="twitter-follow-button" data-show-count="false"
                   data-size="large">@seanlandsman</a>
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

    </div>
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

<footer class="license">
    © ag-Grid Ltd. 2015-2017
</footer>

<?php
include('../includes/mediaFooter.php');
?>
