<?php
$key = "Getting Started Aurelia";
$pageTitle = "Aurelia Grid";
$pageDescription = "ag-Grid can be used as a data grid inside your Aurelia application. This page details how to get started.";
$pageKeyboards = "Aurelia Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 id="implementing-the-aurelia-datagrid">
        <img src="../images/svg/docs/getting_started.svg" width="50"/>
        <img style="vertical-align: middle" src="../images/aurelia_small.png" height="25px"/>
        Aurelia Grid
    </h1>

    <p>This page shows you how to get started with ag-Grid and Aurelia.</p>

    <?php
    $frameworkChild = 'aurelia';
    include '../javascript-grid-getting-started/ag-grid-dependency-framework.php'
    ?>

    <h3>Download ag-Grid-Enterprise</h3>

    <table>
        <tr>
            <td style="padding: 10px;"><img src="../images/bower.png"/></td>
            <td>
                <b>Bower</b><br/>
                bower install ag-grid-enterprise
            </td>

            <td style="width: 20px;"/>

            <td style="padding: 10px;"><img src="../images/npm.png"/></td>
            <td>
                <b>NPM</b><br/>
                npm install ag-grid-enterprise
            </td>

            <td style="width: 20px;"/>

            <td style="padding: 10px;"><img src="../images/github.png"/></td>
            <td>
                <b>Github</b><br/>
                Download from <a href="https://github.com/ag-grid/ag-grid-enterprise">Github</a>
            </td>
        </tr>
    </table>

    <h3>Referencing ag-Grid-Enterprise</h3>
    <p>In your application, before instantiating the grid, you need to reference the included ag-grid-enterprise dependency:</p>
    <pre>
import {GridOptions} from "ag-grid";
import "ag-grid-enterprise/main";

...other dependencies';
</pre>

    <p style="margin-top: 5px">
        If you are building an Aurelia application then you have the choice between A) using the plain JavaScript
        version
        of ag-Grid or B) using the ag-Grid Aurelia Component from the <a
                href="https://github.com/ag-grid/ag-grid-aurelia">
            ag-grid-aurelia</a> project. If you use the ag-Grid Aurelia Component, then the grid's properties, events
        and API
        will all tie in with the Aurelia ecosystem - this will make your Aurelia coding easier.
    </p>

    <note>Please use the github project <a href="https://github.com/ag-grid/ag-grid-aurelia">ag-grid-aurelia</a>
        for feedback or issue reporting around ag-Grid's support for Aurelia.
    </note>

    <h2 id="ag-grid-aurelia-features">ag-Grid Aurelia Features</h2>

    <p>
        Every feature of ag-Grid is available when using the ag-Grid Aurelia Component. The Aurelia Component wraps
        the functionality of ag-Grid, it doesn't duplicate, so there will be no difference between core ag-Grid and
        Aurelia ag-Grid when it comes to features.
    </p>

    <h3 id="aurelia-full-example">Aurelia Full Example</h3>

    <p>
        This page goes through the
        <a href="https://github.com/ag-grid/ag-grid-aurelia-example">ag-grid-aurelia-example</a>
        on Github.
    </p>

    <p>The example project includes a number of separate grids on a page, with each section demonstrating a different
        feature set:
    <ul>
        <li>A feature rich grid example, demonstrating many of ag-Grid's features using Aurelia as a wrapper
            <a href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/rich-grid-example/rich-grid-example.ts"
               target="_blank" class="fa fa-external-link"> TypeScript</a> <a
                    href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/rich-grid-example/rich-grid-example.html"
                    target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>An example using markup to create a grid
            <a href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/rich-grid-declarative-example/rich-grid-declarative-example.ts"
               target="_blank" class="fa fa-external-link"> TypeScript</a> <a
                    href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/rich-grid-declarative-example/rich-grid-declarative-example.html"
                    target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Cell Editor Example - one with a popup editor, and another with a numeric editor. Each demonstrates
            different editor related features
            <a href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/editor-example/editor-example.ts"
               target="_blank" class="fa fa-external-link"> TypeScript</a> <a
                    href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/editor-example/editor-example.html"
                    target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Pinned Row Renderer Example
            <a href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/floating-row-example/floating-row-example.ts"
               target="_blank" class="fa fa-external-link"> TypeScript</a> <a
                    href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/floating-row-example/floating-row-example.html"
                    target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Full Width Renderer Example
            <a href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/full-width-example/full-width-example.ts"
               target="_blank" class="fa fa-external-link"> TypeScript</a> <a
                    href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/full-width-example/full-width-example.html"
                    target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Group Row Inner Renderer Example
            <a href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/group-row-example/group-row-example.ts"
               target="_blank" class="fa fa-external-link"> TypeScript</a> <a
                    href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/group-row-example/group-row-example.html"
                    target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Filter Example
            <a href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/filter-example/filter-example.ts"
               target="_blank" class="fa fa-external-link"> TypeScript</a> <a
                    href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/filter-example/filter-example.html"
                    target="_blank" class="fa fa-external-link"> html</a>
        </li>
    </ul>
    </p>

    <p>Once you have the ag-Grid dependencies installed, you will then be able to access ag-Grid classes and components
        inside your application:</p>

    <pre>import {GridOptions, GridApi, ColumnApi} from "ag-grid";</pre>

    <p>
        You will need to include the CSS for ag-Grid, either directly inside
        your html page, or as part of creating your bundle if bundling. Teh following
        shows referencing the css from your web page:
    </p>
    <pre>&lt;link href="node_modules/ag-grid/styles/ag-grid.css" rel="stylesheet" />
&lt;link href="node_modules/ag-grid/styles/theme-fresh.css" rel="stylesheet" />
</pre>

    <p>
        You will also need to configure Aurelia (aurelia_project/aurelia.json) to use ag-grid and ag-grid-aurelia as
        follows:
    </p>

    <pre>      {
        "name": "vendor-bundle.js",
        "prepend": [
          "node_modules/bluebird/js/browser/bluebird.core.js",
          "scripts/require.js"
        ],
        "dependencies": [
          "aurelia-binding",
          "aurelia-bootstrapper",
          ...other dependencies...
          {
            "name": "ag-grid",
            "path": "../node_modules/ag-grid",
            "main": "main"
          },
          {
            "name": "ag-grid-aurelia",
            "path": "../../ag-grid-aurelia",
            "main": "main"
          }
        ]</pre>

    <p>
        All the above items are specific to Aurelia and is intended to point
        you in the right direction. If you need more information on this, please see the Aurelia documentation.
    </p>

    <h2 id="configuring-ag-grid-in-aurelia">Configuring ag-Grid in Aurelia</h2>

    <p>You can configure the grid in the following ways through Aurelia:</p>
    <ul>
        <li><b>Events:</b> All data out of the grid comes through events. These use
            Aurelia event bindings eg <i>model-updated.call="onModelUpdated()"</i>.
            As you interact with the grid, the different events are fixed and
            output text to the console (open the dev tools to see the console).
        </li>
        <li><b>Properties:</b> All the data is provided to the grid as Aurelia
            bindings. These are bound onto the ag-Grid properties bypassing the
            elements attributes. The values for the bindings come from the parent
            controller.
        </li>
        <li><b>Attributes:</b> When the property is just a simple string value, then
            no binding is necessary, just the value is placed as an attribute
            eg <i>row-height.bind="22"</i>.
        </li>
        <li><b>Grid API via IDs:</b> The grid in the example is created with an id
            by marking it with <i>#agGrid</i>. This in turn turns into a variable
            which can be used to access the grid's controller. The buttons
            Grid API and Column API buttons use this variable to access the grids
            API (the API's are attributes on the controller).
        </li>
        <li><b>Changing Properties:</b> When a property changes value, Aurelia
            automatically passes the new value onto the grid. This is used in
            the following locations:<br/>
            a) The 'quickFilter' on the top right updates the quick filter of
            the grid.
            b) The 'Show Tool Panel' checkbox has its value bound to the 'showToolPanel'
            property of the grid.
            c) The 'Refresh Data' generates new data for the grid and updates the
            <i>rowData</i> property.
        </li>
    </ul>

    <p>
        Notice that the grid has its properties marked as <b>immutable</b>. Hence for
        object properties, the object reference must change for the grid to take impact.
        For example, <i>rowData</i> must be a new list of data for the grid to be
        informed to redraw.
    </p>

    <p>
        The example has ag-Grid configured through the template in the following ways:
    </p>

    <pre><span class="codeComment">// notice the grid has an id called agGrid, which can be used to call the API</span>
&lt;g-grid-aurelia #agGrid class="ag-fresh"
    <span class="codeComment">// items bound to properties on the controller</span>
    grid-options.bind="gridOptions"
    column-defs.bind="columnDefs"
    show-tool-panel.bind="showToolPanel"
    row-data.bind="rowData"

    <span class="codeComment">// boolean values 'turned on'</span>
    enable-col-resize
    enable-sorting
    enable-filter
    group-headers
    suppress-row-click-selection
    tool-panel-suppress-groups
    tool-panel-suppress-values
    debug

    <span class="codeComment">// simple values</span>
    row-height.bind="22"
    row-selection="multiple"

    <span class="codeComment">// event callbacks</span>
    model-updated.call="onModelUpdated()"
    cell-clicked.call="onCellClicked($event)"
    cell-double-clicked.call="onCellDoubleClicked($event)"
    cell-context-menu.call="onCellContextMenu($event)"
    cell-value-changed.call="onCellValueChanged($event)"
    cell-focused.call="onCellFocused($event)"
    row-selected.call="onRowSelected($event)"
    selection-changed.call="onSelectionChanged()"
    before-filter-changed.call="onBeforeFilterChanged()"
    after-filter-changed.call="onAfterFilterChanged()"
    filter-modified.call="onFilterModified()"
    before-sort-changed.call="onBeforeSortChanged()"
    after-sort-changed.call="onAfterSortChanged()"
    virtual-row-removed.call="onVirtualRowRemoved($event)"
    row-clicked.call="onRowClicked($event)"
    ready.call="onReady($event)"

    column-everything-changed.call="onColumnEvent($event)"
    column-row-group-changed.call="onColumnEvent($event)"
    column-value-changed.call="onColumnEvent($event)"
    column-moved.call="onColumnEvent($event)"
    column-visible.call="onColumnEvent($event)"
    column-group-opened.call="onColumnEvent($event)"
    column-resized.call="onColumnEvent($event)"
    column-pinned-count-changed.call="onColumnEvent($event)">
&lt;/ag-grid-aurelia></pre>

    <p>
        The above is all you need to get started using ag-Grid in a Aurelia application. Now would
        be a good time to try it in a simple app and get some data displaying and practice with
        some of the grid settings before moving onto the advanced features of cellRendering
        and custom filtering.
    </p>

<!--    <h3 id="example-rich-grid-with-pure-javascript">Example: Rich Grid with Pure JavaScript</h3>-->
<!--    <p>-->
<!--        The example below shows a rich configuration of ag-Grid-->
<!--    </p>-->
<!--    <show-example example="../framework-examples/aurelia-example/#/rich-grid/true"-->
<!--                  jsfile="../framework-examples/aurelia-example/components/rich-grid-example/rich-grid-example.ts"-->
<!--                  html="../framework-examples/aurelia-example/components/rich-grid-example/rich-grid-example.html"-->
<!--                  exampleHeight="525px"></show-example>-->

</div>

<h2 id="ng2markup">Creating Grids with Markup</h2>

<p>You can create Grids either programatically (with pure JavaScript/Typescript/Components), or declare them via declaratively with markup.</p>
<p>The above section details how to specify the Grid itself. To declare columns you can specify them as follows:</p>

<h3 id="column-definition">Column Definition</h3>
<pre>
&lt;ag-grid-column header-name="Name" field="name" width.bind="150" pinned.bind="true"></ag-grid-column>
</pre>

<p>This example declares a simple Column Definition, specifying header name, field and width.</p>

<h3 id="setting-column-properties">Setting Column Properties</h3>
<p>There are some simple rules you should follow when setting column properties via Markup:</p>
<pre ng-non-bindable>
<span class="codeComment">// string value</span>
property-name="String Value"
property-name="'String Value'"
property-name="${Interpolated Value}"

<span class="codeComment">// boolean value</span>
property-name.bind="true|false"
property-name.bind="{{Interpolated Value}}"
property-name.bind="functionCallReturningABoolean()"

<span class="codeComment">// numeric value</span>
property-name="Numeric Value"
property-name.bind="functionCallReturningANumber()"

<span class="codeComment">// function value</span>
property-name.bind="functionName"
property-name.bind="functionCallReturningAFunction()"
</pre>

<h4 id="setting-a-class-or-a-complex-value">Setting a Class or a Complex Value:</h4>
<p>You can set a Class or a Complex property in the following way:</p>
<pre>
<span class="codeComment">// return a Class definition for a Filter</span>
filter.bind="getSkillFilter()"

private getSkillFilter():any {
    return SkillFilter;
}

<span class="codeComment">// return an Object for filterParams</span>
filter-params.bind.bind="getCountryFilterParams()"

private getCountryFilterParams():any {
    return {
        cellRenderer: this.countryCellRenderer,
        cellHeight: 20
    }
}
</pre>

<h3 id="grouped-column-definition">Grouped Column Definition</h3>
<p>To specify a Grouped Column, you can nest a column defintion:</p>
<pre>
&lt;ag-grid-column header-name="IT Skills">
&lt;ag-grid-column header-name="Skills" width.bind="125" suppress-sorting.bind="true" cell-renderer.bind="skillsCellRenderer" filter.bind="getSkillFilter()">&lt;/ag-grid-column>
&lt;ag-grid-column header-name="Proficiency" field="proficiency" width.bind="120"
                cell-renderer.bind="percentCellRenderer" filter.bind="getProficiencyFilter()">&lt;/ag-grid-column>
&lt;/ag-grid-column>
</pre>
<p>In this example we have a parent Column of "IT Skills", with two child columns.</p>

<!--<h3 id="example-rich-grid-using-markup">Example: Rich Grid using Markup</h3>-->
<!--<p>-->
<!--    The example below shows the same rich grid as the example above, but with configuration done via Markup.-->
<!--</p>-->
<!--<show-example example="../framework-examples/aurelia-example/#/richgrid-declarative/true"-->
<!--              jsfile="../framework-examples/aurelia-example/components/rich-grid-declarative-example/rich-grid-declarative-example.ts"-->
<!--              html="../framework-examples/aurelia-example/components/rich-grid-declarative-example/rich-grid-declarative-example.html"-->
<!--              exampleHeight="525px"></show-example>-->

<h2 id="cell-rendering-cell-editing-using-aurelia">Cell Rendering & Cell Editing using Aurelia</h2>

<p>
    It is possible to build
    <a href="../javascript-grid-cell-rendering-components/#aureliaCellRendering">cellRenderers</a>,
    <a href="../javascript-grid-cell-editing/#aureliaCellEditing">cellEditors</a> and
    <a href="../javascript-grid-filtering/#aureliaFiltering">filters</a> using Aurelia. Doing each of these
    is explained in the section on each.
</p>

<p>
    Although it is possible to use Aurelia for your customisations of ag-Grid, it is not necessary. The grid
    will happily work with both Aurelia and non-Aurelia portions (eg cellRenderers in Aurelia or normal JavaScript).
    If you do use Aurelia, be aware that you are adding an extra layer of indirection into ag-Grid. ag-Grid's
    internal framework is already highly tuned to work incredibly fast and does not require Aurelia or anything
    else to make it faster. If you are looking for a lightning fast grid, even if you are using Aurelia and
    the ag-grid-aurelia component, consider using plain ag-Grid Components (as explained on the pages for
    rendering etc) inside ag-Grid instead of creating Aurelia counterparts.
</p>

<h2 id="next-steps">Next Steps...</h2>

<p>
    Now you can go to <a href="../javascript-grid-interfacing-overview/">interfacing</a>
    to learn about accessing all the features of the grid.
</p>

<?php include '../documentation-main/documentation_footer.php'; ?>
