<?php
$key = "Next Steps";
$pageTitle = "ag-Grid Angular Next Steps";
$pageDescription = "ag-Grid Angular Next Steps";
$pageKeyboards = "ag-Grid Angular Detail";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>
    <div>

        <?php if (isFrameworkJavaScript()) { ?>
            <div class="<?= isFrameworkAll() ? 'collapsableDocs' : '' ?>">

                <?php if (isFrameworkAll()) { ?>
                    <div class="collapsableDocs-header" onclick="this.classList.toggle('active');">
                        <h4><img style="vertical-align: middle" src="/images/javascript.png" height="20px"/> Next Steps - JavaScript</h4>
                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                    </div>
                <?php } ?>

                <div>
                    <?php include './javascript.php'; ?>
                </div>
            </div>
        <?php } ?>

        <?php if (isFrameworkAngular2()) { ?>
            <div class="<?= isFrameworkAll() ? 'collapsableDocs' : '' ?>">

                <?php if (isFrameworkAll()) { ?>
                    <div class="collapsableDocs-header" onclick="this.classList.toggle('active');">
                        <h4><img style="vertical-align: middle" src="/images/angular2_small.png" height="20px"/> Next Steps - Angular</h4>
                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                    </div>
                <?php } ?>

                <div>
                    <?php include './angular.php'; ?>
                </div>
            </div>
        <?php } ?>

        <?php if (isFrameworkAngular1()) { ?>
            <div class="<?= isFrameworkAll() ? 'collapsableDocs' : '' ?>">

                <?php if (isFrameworkAll()) { ?>
                    <div class="collapsableDocs-header" onclick="this.classList.toggle('active');">
                        <h4><img style="vertical-align: middle" src="/images/angularjs.png" height="20px"/> Next Steps - AngularJS 1.x</h4>
                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                    </div>
                <?php } ?>

                <div>
                    <?php include './angularjs.php'; ?>
                </div>
            </div>
        <?php } ?>

        <?php if (isFrameworkVue()) { ?>
            <div class="<?= isFrameworkAll() ? 'collapsableDocs' : '' ?>">

                <?php if (isFrameworkAll()) { ?>
                    <div class="collapsableDocs-header" onclick="this.classList.toggle('active');">
                        <h4><img style="vertical-align: middle" src="/images/vue_small.png" height="20px"/> Next Steps - VueJS</h4>
                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                    </div>
                <?php } ?>

                <div>
                    <?php include './vue.php'; ?>
                </div>
            </div>
        <?php } ?>

        <?php if (isFrameworkAurelia()) { ?>
            <div class="<?= isFrameworkAll() ? 'collapsableDocs' : '' ?>">

                <?php if (isFrameworkAll()) { ?>
                    <div class="collapsableDocs-header" onclick="this.classList.toggle('active');">
                        <h4><img style="vertical-align: middle" src="/images/aurelia_small.png" height="20px"/> Next Steps - Aurelia</h4>
                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                    </div>
                <?php } ?>

                <div>
                    <?php include './aurelia.php'; ?>
                </div>
            </div>
        <?php } ?>

        <?php if (isFrameworkWebComponents()) { ?>
            <div class="<?= isFrameworkAll() ? 'collapsableDocs' : '' ?>">

                <?php if (isFrameworkAll()) { ?>
                    <div class="collapsableDocs-header" onclick="this.classList.toggle('active');">
                        <h4><img style="vertical-align: middle" src="../images/webComponents.png" height="20px"/> Next Steps - Web Components</h4>
                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                    </div>
                <?php } ?>

                <div>
                    <?php include './webcomponents.php'; ?>
                </div>
            </div>
        <?php } ?>
    </div>
</div>

<div>
    <div class="collapsableDocs">
        <div class="collapsableDocs-header"
             onclick="javascript: this.classList.toggle('active');">
            <h4>Framework Projects</h4>
            <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </div>

        <div class="collapsableDocs-content">
            <p></p>
            <p>If using Angular, VueJS, React or Aurelia then you will also need to reference the additional ag-Grid project for
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
                    <td>Aurelia</td>
                    <td>No</td>
                    <td>Yes</td>
                    <td>ag-grid-aurelia</td>
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
                <li><a href="https://github.com/ag-grid/ag-grid-commonjs-example">CommonJS, Gulp and
                        Browersify</a>
                    -
                    Project on Github
                </li>
                <li><a href="https://github.com/ag-grid/ag-grid-react-example">React, Webpack, Babel</a> -
                    Project
                    on
                    Github
                </li>
                <li><a href="https://github.com/ag-grid/ag-grid-angular-example">Angular & Typescript - with
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


<?php if (!isFrameworkAngular2()) { ?>

    <div class="collapsableDocs">
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
                the self contained bundle <b>you do not need to include this extra parameter</b>. Its purpose is as
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
            <pre>&lt;link rel="stylesheet" type="text/css" href="../dist/ag-grid/ag-grid.js?ignore=notused52"><br/></pre>
            But all you need is this:<br/>
            <pre>&lt;link rel="stylesheet" type="text/css" href="../dist/ag-grid.js"></pre>
            </p>
        </div>
    </div>
<?php } ?>

<?php include '../documentation-main/documentation_footer.php'; ?>

