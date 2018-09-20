<div>

    <h2 id="implementing-the-aurelia-datagrid">
        <img src="../images/svg/docs/getting_started.svg" width="50"/>
        <img style="vertical-align: middle" src="../images/aurelia_small.png" height="25px"/>
        Getting Started
    </h2>

    <?php
    $frameworkChild = 'aurelia';
    include 'ag-grid-dependency-framework.php'
    ?>

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
                    href="https://github.com/ceolter/ag-grid-aurelia-example/blob/master/src/components/rich-grid-example/rich-grid-example.html"
                    target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>An example using markup to create a grid
            <a href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/rich-grid-declarative-example/rich-grid-declarative-example.ts"
               target="_blank" class="fa fa-external-link"> TypeScript</a> <a
                    href="https://github.com/ceolter/ag-grid-aurelia-example/blob/master/src/components/rich-grid-declarative-example/rich-grid-declarative-example.html"
                    target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Cell Editor Example - one with a popup editor, and another with a numeric editor. Each demonstrates
            different editor related features
            <a href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/editor-example/editor-example.ts"
               target="_blank" class="fa fa-external-link"> TypeScript</a> <a
                    href="https://github.com/ceolter/ag-grid-aurelia-example/blob/master/src/components/editor-example/editor-example.html"
                    target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Pinned Row Renderer Example
            <a href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/floating-row-example/floating-row-example.ts"
               target="_blank" class="fa fa-external-link"> TypeScript</a> <a
                    href="https://github.com/ceolter/ag-grid-aurelia-example/blob/master/src/components/floating-row-example/floating-row-example.html"
                    target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Full Width Renderer Example
            <a href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/full-width-example/full-width-example.ts"
               target="_blank" class="fa fa-external-link"> TypeScript</a> <a
                    href="https://github.com/ceolter/ag-grid-aurelia-example/blob/master/src/components/full-width-example/full-width-example.html"
                    target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Group Row Inner Renderer Example
            <a href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/group-row-example/group-row-example.ts"
               target="_blank" class="fa fa-external-link"> TypeScript</a> <a
                    href="https://github.com/ceolter/ag-grid-aurelia-example/blob/master/src/components/group-row-example/group-row-example.html"
                    target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Filter Example
            <a href="https://github.com/ag-grid/ag-grid-aurelia-example/blob/master/src/components/filter-example/filter-example.ts"
               target="_blank" class="fa fa-external-link"> TypeScript</a> <a
                    href="https://github.com/ceolter/ag-grid-aurelia-example/blob/master/src/components/filter-example/filter-example.html"
                    target="_blank" class="fa fa-external-link"> html</a>
        </li>
    </ul>
    </p>

    <p>Once you have the ag-Grid dependencies installed, you will then be able to access ag-Grid classes and components
        inside your application:</p>

    <snippet>
        import {GridOptions, GridApi, ColumnApi} from "ag-grid-community";
    </snippet>

    <p>
        You will need to include the CSS for ag-Grid, either directly inside
        your html page, or as part of creating your bundle if bundling. Teh following
        shows referencing the css from your web page:
    </p>
    <snippet>
        &lt;link href="node_modules/ag-grid/styles/ag-grid.css" rel="stylesheet" /&gt;
        &lt;link href="node_modules/ag-grid/styles/ag-theme-balham.css" rel="stylesheet" /&gt;
    </snippet>

    <p>
        You will also need to configure Aurelia (aurelia_project/aurelia.json) to use ag-grid and ag-grid-aurelia as
        follows:
    </p>

    <snippet>
        {
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
        ]
    </snippet>

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
            API (the APIs are attributes on the controller).
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

<snippet>
// notice the grid has an id called agGrid, which can be used to call the API
&lt;ag-grid-aurelia #agGrid class="ag-theme-balham"
    // items bound to properties on the controller
    grid-options.bind="gridOptions"
    column-defs.bind="columnDefs"
    show-tool-panel.bind="showToolPanel"
    row-data.bind="rowData"

    // boolean values 'turned on'
    enable-col-resize
    enable-sorting
    enable-filter
    group-headers
    suppress-row-click-selection
    tool-panel-suppress-groups
    tool-panel-suppress-values
    debug

    // simple values
    row-height.bind="22"
    row-selection="multiple"

    // event callbacks
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
    column-pinned-count-changed.call="onColumnEvent($event)"&gt;
&lt;/ag-grid-aurelia&gt;
</snippet>

    <p>
        The above is all you need to get started using ag-Grid in a Aurelia application. Now would
        be a good time to try it in a simple app and get some data displaying and practice with
        some of the grid settings before moving onto the advanced features of cellRendering
        and custom filtering.
    </p>

</div>

