<?php
$key = "Angular Examples";
$pageTitle = "ag-Grid Angular Examples";
$pageDescription = "ag-Grid Angular Examples";
$pageKeyboards = "ag-Grid angular axamples";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Angular Examples</h2>

    <p>
        This page goes through the
        <a href="https://github.com/ceolter/ag-grid-angular-example">ag-grid-angular-example</a>
        on Github.</p>

    <p>The example project includes a number of separate grids on a page, with each section demonstrating a
        different
        feature set:

    <div class="row">
        <div class="col-sm-6">
            <a href="#rich-grid" class="column-links column-items">Rich Grid</a>
            <a href="#rich-grid-declarative" class="column-links column-items">Rich Grid with Markup</a>
            <a href="#dynamic" class="column-links column-items">Dynamic Component</a>
            <a href="#rich-dynamic" class="column-links column-items">Richer Dynamic Components</a>
            <a href="#editor" class="column-links column-items">Editor Components</a>
        </div>
        <div class="col-sm-6">
            <a href="#filter" class="column-links column-items">Filter Component</a>
            <a href="#floating-row" class="column-links column-items">Floating Row Renderer</a>
            <a href="#full-width" class="column-links column-items">Full Width Renderer</a>
            <a href="#group-row" class="column-links column-items">Group Row Inner Renderer</a>
            <a href="#master-detail" class="column-links column-items">Master/Detail Components</a>
        </div>
    </div>

    <div id="rich-grid" class="collapsableDocs">
        <div class="collapsableDocs-header"
             onclick="javascript: this.classList.toggle('active');">
            <h4>Rich Grid Example</h4>
            <p>A feature rich Grid example, demonstrating many of ag-Grid's features, including Date, Header and Header Group Components.</p>
            <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </div>

        <div class="collapsableDocs-content">
            <show-complex-example example="../ng2-example/index.html?fromDocs=true&example=from-component"
                                  sources="{
                            [
                                { root: '../ng2-example/app/dynamic-component-example/', files: 'dynamic.component.ts,dynamic.component.html,square.component.ts,cube.component.ts,params.component.ts,child-message.component.ts,currency.component.ts' },
                                { root: '../ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                                  plunker="https://embed.plnkr.co/J04rdB/">
            </show-complex-example>
        </div>
    </div>

    <div id="rich-grid-declarative" class="collapsableDocs">
        <div class="collapsableDocs-header"
             onclick="javascript: this.classList.toggle('active');">
            <h4>Rich Grid with Markup</h4>
            <p>A feature rich Grid example (as above), this time using Markup.</p>
            <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </div>

        <div class="collapsableDocs-content">
            <show-complex-example example="../ng2-example/index.html?fromDocs=true&example=from-rich-component"
                                  sources="{
                            [
                                { root: '../ng2-example/app/rich-dynamic-component-example/', files: 'rich.component.ts,rich.component.html,ratio.module.ts,ratio.parent.component.ts,ratio.component.ts,clickable.module.ts,clickable.parent.component.ts,clickable.component.ts' },
                                { root: '../ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                                  plunker="https://embed.plnkr.co/qmgvkW/">
            </show-complex-example>
        </div>
    </div>

    <div id="dynamic" class="collapsableDocs">
        <div class="collapsableDocs-header"
             onclick="javascript: this.classList.toggle('active');">
            <h4>Dynamic Component</h4>
            <p>A simple Grid using Angular Components as Cell Renderers</p>
            <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </div>

        <div class="collapsableDocs-content">
            <show-complex-example example="../ng2-example/index.html?fromDocs=true&example=from-rich-component"
                                  sources="{
                            [
                                { root: '../ng2-example/app/rich-dynamic-component-example/', files: 'rich.component.ts,rich.component.html,ratio.module.ts,ratio.parent.component.ts,ratio.component.ts,clickable.module.ts,clickable.parent.component.ts,clickable.component.ts' },
                                { root: '../ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                                  plunker="https://embed.plnkr.co/qmgvkW/">
            </show-complex-example>
        </div>
    </div>

    <div id="rich-dynamic" class="collapsableDocs">
        <div class="collapsableDocs-header"
             onclick="javascript: this.classList.toggle('active');">
            <h4>Richer Dynamic Components</h4>
            <p>A Richer Example using Angular Components as Cell Renderers, Child Components, Two-Way Binding and
                Parent to Child Components Events.</p>
            <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </div>

        <div class="collapsableDocs-content">
            <show-complex-example example="../ng2-example/index.html?fromDocs=true&example=from-component"
                                  sources="{
                            [
                                { root: '../ng2-example/app/dynamic-component-example/', files: 'dynamic.component.ts,dynamic.component.html,square.component.ts,cube.component.ts,params.component.ts,child-message.component.ts,currency.component.ts' },
                                { root: '../ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                                  plunker="https://embed.plnkr.co/J04rdB/">
            </show-complex-example>
        </div>
    </div>

    <div id="editor" class="collapsableDocs">
        <div class="collapsableDocs-header"
             onclick="javascript: this.classList.toggle('active');">
            <h4>Editor Components</h4>
            <p>A Cell Editor example - one with a popup editor, and another with a numeric editor.</p>
            <p>Each component demonstrates different editor related features</p>
            <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </div>

        <div class="collapsableDocs-content">
            editor example
        </div>
    </div>

    <div id="filter" class="collapsableDocs">
        <div class="collapsableDocs-header"
             onclick="javascript: this.classList.toggle('active');">
            <h4>Filter Component</h4>
            <p>A Filter Example, with the Filter written as a Angular Component.</p>
            <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </div>

        <div class="collapsableDocs-content">
            filter example
        </div>
    </div>

    <div id="floating-row" class="collapsableDocs">
        <div class="collapsableDocs-header"
             onclick="javascript: this.classList.toggle('active');">
            <h4>Floating Row Renderer</h4>
            <p>A Floating Row Renderer Example</p>
            <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </div>

        <div class="collapsableDocs-content">
            floating row example
        </div>
    </div>

    <div id="full-width" class="collapsableDocs">
        <div class="collapsableDocs-header"
             onclick="javascript: this.classList.toggle('active');">
            <h4>Full Width Renderer</h4>
            <p>A Full Width Renderer Example</p>
            <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </div>

        <div class="collapsableDocs-content">
            full width example
        </div>
    </div>

    <div id="group-row" class="collapsableDocs">
        <div class="collapsableDocs-header"
             onclick="javascript: this.classList.toggle('active');">
            <h4>Group Row Inner Renderer</h4>
            <p>A Group Row Inner Renderer Example</p>
            <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </div>

        <div class="collapsableDocs-content">
            Group Row Inner Renderer example
        </div>
    </div>

    <div id="master-detail" class="collapsableDocs">
        <div class="collapsableDocs-header"
             onclick="javascript: this.classList.toggle('active');">
            <h4>Master/Detail Components</h4>
            <p>A Master/Detail Example, with both the Master and the Detail elements being Angular Components.</p>
            <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </div>

        <div class="collapsableDocs-content">
            Master/Detail Components example
        </div>
    </div>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
