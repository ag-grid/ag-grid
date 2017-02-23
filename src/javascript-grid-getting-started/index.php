<?php
$key = "Getting Started";
$pageTitle = "Getting Started";
$pageDescription = "Getting Started ag-Grid and ag-Grid Enterprise";
$pageKeyboards = "Getting Started ag-Grid Enterprise";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div ng-controller="GettingStartedController" ng-show="showGettingStarted" class="ng-hide">
    <div>
        <div ng-if="isFramework(['javascript','all'])">
            <div ng-class="{collapsableDocs: isFramework('all')}">
                <div ng-if="isFramework('all')"
                     ng-click="toggleDiv('jsOpen')"
                     class="collapsableDocs-header"
                     onclick="javascript: this.classList.toggle('active');">
                    <h4><img style="vertical-align: middle" src="/images/javascript.png" height="20px"/> Overview -
                        JavaScript</h4>
                    <i class="fa fa-arrow-right" aria-hidden="true"></i>
                </div>

                <div ng-if="jsOpen || frameworkContext==='javascript'"
                     ng-class="{'collapsableDocs-content': isFramework('all')}">
                    <?php include './javascript.php'; ?>
                </div>
            </div>
        </div>

        <div ng-if="isFramework(['angular','all'])">
            <div ng-class="{collapsableDocs: isFramework('all')}">
                <div ng-if="isFramework('all')"
                     ng-click="toggleDiv('angularOpen')"
                     class="collapsableDocs-header"
                     onclick="javascript: this.classList.toggle('active');">
                    <h4><img style="vertical-align: middle" src="/images/angular2_small.png" height="20px"/> Overview -
                        Angular</h4>
                    <i class="fa fa-arrow-right" aria-hidden="true"></i>
                </div>

                <div ng-if="angularOpen || frameworkContext==='angular'"
                     ng-class="{'collapsableDocs-content': isFramework('all')}">
                    <?php include './angular.php'; ?>
                </div>
            </div>
        </div>

        <div ng-if="isFramework(['angularjs','all'])">
            <div ng-class="{collapsableDocs: isFramework('all')}">
                <div ng-if="isFramework('all')"
                     ng-click="toggleDiv('angularJsOpen')"
                     class="collapsableDocs-header"
                     onclick="javascript: this.classList.toggle('active');">
                    <h4><img style="vertical-align: middle" src="/images/angularjs.png" height="20px"/> Overview -
                        AngularJS 1.x</h4>
                    <i class="fa fa-arrow-right" aria-hidden="true"></i>
                </div>

                <div ng-if="angularJsOpen || frameworkContext==='angularjs'"
                     ng-class="{'collapsableDocs-content': isFramework('all')}">
                    <?php include './angularjs.php'; ?>
                </div>
            </div>
        </div>

        <div ng-if="isFramework(['vue','all'])">
            <div ng-class="{collapsableDocs: isFramework('all')}">
                <div ng-if="isFramework('all')"
                     ng-click="toggleDiv('vueOpen')"
                     class="collapsableDocs-header"
                     onclick="javascript: this.classList.toggle('active');">
                    <h4><img style="vertical-align: middle" src="/images/vue_small.png" height="20px"/> Overview - VueJS
                    </h4>
                    <i class="fa fa-arrow-right" aria-hidden="true"></i>
                </div>

                <div ng-if="vueOpen || frameworkContext==='vue'"
                     ng-class="{'collapsableDocs-content': isFramework('all')}">
                    <?php include './vue.php'; ?>
                </div>
            </div>
        </div>

        <div ng-if="isFramework(['react','all'])">
            <div ng-class="{collapsableDocs: isFramework('all')}">
                <div ng-if="isFramework('all')"
                     ng-click="toggleDiv('reactOpen')"
                     class="collapsableDocs-header"
                     onclick="javascript: this.classList.toggle('active');">
                    <h4><img style="vertical-align: middle" src="/images/react_small.png" height="20px"/> Overview -
                        ReactJS</h4>
                    <i class="fa fa-arrow-right" aria-hidden="true"></i>
                </div>

                <div
                     ng-class="{'collapsableDocs-content': isFramework('all')}">
                    <?php include './react.php'; ?>
                </div>
            </div>
        </div>

        <div ng-if="isFramework(['aurelia','all'])">
            <div ng-class="{collapsableDocs: isFramework('all')}">
                <div ng-if="isFramework('all')"
                     ng-click="toggleDiv('aureliaOpen')"
                     class="collapsableDocs-header"
                     onclick="javascript: this.classList.toggle('active');">
                    <h4><img style="vertical-align: middle" src="/images/aurelia_small.png" height="20px"/> Overview -
                        Aurelia</h4>
                    <i class="fa fa-arrow-right" aria-hidden="true"></i>
                </div>

                <!-- we don't lazy load this one as the nature of the react file means
                     it'll execute the react demo script regardless-->
                <div ng-if="aureliaOpen || frameworkContext==='aurelia'"
                     ng-class="{'collapsableDocs-content': isFramework('all')}">
                    <?php include './aurelia.php'; ?>
                </div>
            </div>
        </div>

        <div ng-if="isFramework(['webcomponents','all'])">
            <div ng-class="{collapsableDocs: isFramework('all')}">
                <div ng-if="isFramework('all')"
                     ng-click="toggleDiv('webcomponentsOpen')"
                     class="collapsableDocs-header"
                     onclick="javascript: this.classList.toggle('active');">
                    <h4><img style="vertical-align: middle" src="/images/webcomponents.png"
                             height="20px"/> Overview - Web Components</h4>
                    <i class="fa fa-arrow-right" aria-hidden="true"></i>
                </div>

                <div ng-if="webcomponentsOpen || frameworkContext==='webcomponents'"
                     ng-class="{'collapsableDocs-content': isFramework('all')}">
                    <?php include './webcomponents.php'; ?>
                </div>
            </div>
        </div>

        <div ng-if="isFramework(['javascript','all'])">
            <div class="collapsableDocs">
                <div class="collapsableDocs-header"
                     onclick="javascript: this.classList.toggle('active');">
                    <h4>Additional Framework Projects</h4>
                    <i class="fa fa-arrow-right" aria-hidden="true"></i>
                </div>

                <div class="collapsableDocs-content">
                    <p></p>
                    <p>If using React or Angular, you will also need to reference the additional ag-Grid project for
                        that
                        framework. Details are provided the documentation for those frameworks.</p>

                    <h4>Bundled vs CommonJS & Frameworks Summary</h4>

                    <p>
                        If you want to use the Angular or React component of ag-Grid, then you have to
                        use the commonjs distribution (not the bundled). You will also need to include
                        the additional ag-Grid project for these components.
                    </p>

                    <p>
                        If you are using the plain Javascript, Angular 1 or Web Components version
                        of ag-Grid, you can use the bundled version or the commonjs version.
                    </p>

                    <p>
                        The table below summarises these details.
                    </p>

                    <style>
                        .blog-main td {
                            padding: 2px 10px 2px 10px;
                        }

                        .blog-main th {
                            padding: 2px 10px 2px 10px;
                        }

                        .blog-main table {
                            margin-bottom: 10px;
                        }
                    </style>

                    <table style="background-color: beige">
                        <tr style="background-color: blanchedalmond">
                            <th>Framework</th>
                            <th>Works with Bundled</th>
                            <th>Works with CommonJS</th>
                            <th>Extra Project</th>
                        </tr>
                        <tr>
                            <td>Pure JavaScript</td>
                            <td>Yes</td>
                            <td>Yes</td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td>React</td>
                            <td>No</td>
                            <td>Yes</td>
                            <td>ag-grid-react</td>
                        </tr>
                        <tr>
                            <td>Angular 1</td>
                            <td>Yes</td>
                            <td>Yes</td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td>Angular</td>
                            <td>No</td>
                            <td>Yes</td>
                            <td>ag-grid-angular</td>
                        </tr>
                        <tr>
                            <td>VueJS</td>
                            <td>No</td>
                            <td>Yes</td>
                            <td>ag-grid-vue</td>
                        </tr>
                        <tr>
                            <td>Web Components</td>
                            <td>Yes</td>
                            <td>Yes</td>
                            <td>-</td>
                        </tr>
                    </table>

                    <p>
                        <b>Warning:</b> if you are using the bundled version of the grid (/dist/ag-grid-js) then you
                        must
                        specify
                        this directly,
                        the main files specified in package.json and bower.json point to the commonjs versions of
                        ag-Grid.
                    </p>

                    <h3>List of Loading / Building Examples</h3>

                    <p>
                        Below is a list of the examples demonstrating the different build tools, loading mechanisms and
                        frameworks.
                        You may not see the exact stack you want, but you can grab information from all the examples. Eg
                        you
                        might
                        want to program React and Typescript, below you can see examples of React and Typescript, just
                        not
                        together.
                    </p>
                    <ul>
                        <li><a href="https://github.com/ceolter/ag-grid-commonjs-example">CommonJS, Gulp and
                                Browersify</a>
                            -
                            Project on Github
                        </li>
                        <li><a href="https://github.com/ceolter/ag-grid-react-example">React, Webpack, Babel</a> -
                            Project
                            on
                            Github
                        </li>
                        <li><a href="https://github.com/ceolter/ag-grid-angular-example">Angular & Typescript - with
                                examples
                                using
                                SystemJS, Webpack and Angular-CLI</a> - Project on Github
                        </li>
                    </ul>

                    <h3>Choosing a Framework and What Next</h3>

                    <p>
                        ag-Grid does not favor any framework. It's agnostic. It doesn't have a preference for what
                        framework
                        you
                        use.
                        ag-Grid supports 7 flavours: Angular, AngularJS 1.x, React, VueJS, Aurelia, Web Components and
                        Native
                        Javascript.
                        Every ag-Grid feature is fully available in each framework, there is no bias. You choose which
                        framework
                        you
                        want. So continue now to the section on the framework you are interested in, then jump to the
                        details of how to use the grid.
                    </p>
                </div>
            </div>
        </div>

        <div ng-if="frameworkContext!=='angular'" class="collapsableDocs">
            <div class="collapsableDocs-header"
                 onclick="javascript: this.classList.toggle('active');">
                <h4>Documentation Examples</h4>
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </div>

            <div class="collapsableDocs-content">
                <p></p>
                <p>
                    Almost all the examples in the online documentation use the self contained bundle of ag-Grid and do
                    not use
                    any framework. This is to make the examples as easy to follow (focusing only on what the example
                    is about) and easy to copy and run locally.
                </p>

                <p>
                    Also in the examples, ag-Grid is loaded with an additional parameter <i>"ignore=notused"</i>. If you
                    are
                    using
                    the self contained bundle <b>you do not need to include this extra parameter</b>. It's purpose is as
                    a dummy
                    parameter, which the documentation
                    changes every time there is a grid release, to trick the browser in getting the latest version
                    rather than
                    using
                    a cached version.
                    <br/>
                </p>
                <p>
                    So eg, the example has this:<br/>
                <pre>&lt;link rel="stylesheet" type="text/css" href="../dist/ag-grid/ag-grid.js?ignore=notused40"><br/></pre>
                But all you need is this:<br/>
                <pre>&lt;link rel="stylesheet" type="text/css" href="../dist/ag-grid.js"></pre>
                </p>
            </div>
        </div>
        <h2>Browser Support/Compatibility</h2>

        <p>ag-Grid is compatible with IE 9+, Firefox, Chrome and Safari.</p>
    </div>
</div>
<?php include '../documentation-main/documentation_footer.php'; ?>
