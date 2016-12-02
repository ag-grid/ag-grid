<?php
$key = "Getting Started ng2";
$pageTitle = "Angular 2 Datagrid";
$pageDescription = "Demonstrate the best Angular 2 datagrid. Shows and example of a datagrid for using with Angular 2.";
$pageKeyboards = "Angular 2 Grid";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1>Implementing the Angular 2 Datagrid</h1>

    <p>
        If you are building an Angular 2 application then you have the choice between A) using the plain JavaScript version
        of ag-Grid or B) using the ag-Grid Angular 2 Component from the <a href="https://github.com/ceolter/ag-grid-ng2">
            ag-grid-ng2</a> project. If you use the ag-Grid Angular 2 Component, then the grid's properties, events and API
        will all tie in with the Angular 2 ecosystem. This will make your Angular 2 coding easier.
    </p>

<!--    <note>
        <p>
            When using Angular 2, you must use the CommonJS distribution of Angular 2 and ag-Grid. That means the
            already bundled ag-Grid and Angular 2 UMD will not work (if you don't know what this means or what these
            are, then don't worry, you will be none the wiser).
        </p>
        <p>If you MUST use the UMD version of Angular 2, then use the plain Javascript version of ag-Grid.</p>
    </note>


    <note>ag-Gird v6.x adds many Angular 2 related improvements to the ag-Grid offering - this includes easier configuration,
        better renderer definition and cell editor support.
    </note>
-->
    <note>Please use the github project <a href="https://github.com/ceolter/ag-grid-ng2">ag-grid-ng2</a>
        for feedback or issue reporting around ag-Grid's support for Angular 2.</note>

    <h2>ag-Grid Angular 2 Features</h2>

    <p>
        Every feature of ag-Grid is available when using the ag-Grid Angular 2 Component. The Angular 2 Component wraps
        the functionality of ag-Grid, it doesn't duplicate, so there will be no difference between core ag-Grid and
        Angular 2 ag-Grid when it comes to features.
    </p>

    <h3>Angular 2 Full Example</h3>

    <p>
        This page goes through the
        <a href="https://github.com/ceolter/ag-grid-ng2-example">ag-grid-ng2-example</a>
        on Github. Because the example depends on SystemX and JSPM, it is not included in the
        online documentation.
    </p>

    <p>The example project includes a number of separate grids on a page, with each section demonstrating a different
        feature set:
    <ul>
        <li>A feature rich grid example, demonstrating many of ag-Grid's features using Angular 2 as a wrapper
            <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/rich-grid.component.ts" target="_blank" class="fa fa-external-link"> TypeScript</a> <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/rich-grid.component.html" target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>An example using markup to create a grid
            <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/rich-grid-declarative.component.ts" target="_blank" class="fa fa-external-link"> TypeScript</a> <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/rich-grid-declarative.component.html" target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Simple Example, using CellRenders created from Angular 2 Components
            <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/from-component.component.ts" target="_blank" class="fa fa-external-link"> TypeScript</a> <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/from-component.component.html" target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Richer Example, using CellRenderers created from Angular 2 Components, with child components, and two-way binding (parent to child components events)
            <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/from-rich.component.ts" target="_blank" class="fa fa-external-link"> TypeScript</a> <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/from-rich.component.html" target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Cell Editor example - one with a popup editor, and another with a numeric editor. Each demonstrates different editor related features
            <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/editor-component.component.ts" target="_blank" class="fa fa-external-link"> TypeScript</a> <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/editor-component.component.html" target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Floating Row Renderer Example
            <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/floating-row-renderer.component.ts" target="_blank" class="fa fa-external-link"> TypeScript</a> <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/floating-row-renderer.component.html" target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Full Width Renderer Example
            <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/full-width-renderer.component.ts" target="_blank" class="fa fa-external-link"> TypeScript</a> <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/full-width-renderer.component.html" target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Group Row Inner Renderer Example
            <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/group-row-renderer.component.ts" target="_blank" class="fa fa-external-link"> TypeScript</a> <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/group-row-renderer.component.html" target="_blank" class="fa fa-external-link"> html</a>
        </li>
        <li>A Filter Example, with the filter written as a Angular 2 Component
            <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/filter-component.component.ts" target="_blank" class="fa fa-external-link"> TypeScript</a> <a href="https://github.com/ceolter/ag-grid-ng2-example/blob/master/app/filter-component.component.html" target="_blank" class="fa fa-external-link"> html</a>
        </li>
    </ul>
    </p>

    <h3>Dependencies</h3>

    <p>
        In your package.json file, specify dependency on ag-grid AND ag-grid-ng2.
        The ag-grid package contains the core ag-grid engine and the ag-grid-ng2
        contains the Angular 2 component.
        <pre>"dependencies": {
    ...
    "ag-grid": "6.2.x",
    "ag-grid-ng2": "6.2.x"
}</pre>
    The major and minor versions should match. Every time a new major or minor
    version of ag-Grid is released, the component will also be released. However
    for patch versions, the component will not be released.
    </p>

    <p>You will then be able to access ag-Grid inside your application:</p>

    <pre>import {AgGridModule} from 'ag-grid-ng2/main';</pre>

    <p>
        Which you can then use as a dependency inside your module:
    </p>

    <pre>@NgModule({
    imports: [
        BrowserModule,
        AgGridModule.withComponents(),
        ...
})</pre>

    <p>
        You will need to include the CSS for ag-Grid, either directly inside
        your html page, or as part of creating your bundle if bundling. Teh following
        shows referencing the css from your web page:
    </p>
    <pre>&lt;link href="node_modules/ag-grid/styles/ag-grid.css" rel="stylesheet" />
&lt;link href="node_modules/ag-grid/styles/theme-fresh.css" rel="stylesheet" />
</pre>

    <h3>For Just in Time (JIT) Compilation</h3>
    <p>
        You will need to configure SystemJS for ag-grid and ag-grid-component as follows:
    </p>

    <pre>
System.config({
    map: {
        lib: 'lib',
        // angular bundles
        '@angular/core': 'node_modules/@angular/core/bundles/core.umd.js',
        '@angular/common': 'node_modules/@angular/common/bundles/common.umd.js',
        '@angular/compiler': 'node_modules/@angular/compiler/bundles/compiler.umd.js',
        '@angular/platform-browser': 'node_modules/@angular/platform-browser/bundles/platform-browser.umd.js',
        '@angular/platform-browser-dynamic': 'node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
        '@angular/http': 'node_modules/@angular/http/bundles/http.umd.js',
        '@angular/router': 'node_modules/@angular/router/bundles/router.umd.js',
        '@angular/forms': 'node_modules/@angular/forms/bundles/forms.umd.js',
        // other libraries
        'rxjs': 'node_modules/rxjs',
        'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',
        // ag libraries
        'ag-grid-ng2' : 'node_modules/ag-grid-ng2',
        'ag-grid' : 'node_modules/ag-grid',
        'ag-grid-enterprise' : 'node_modules/ag-grid-enterprise'
    },
    packages: {
        'ag-grid-ng2': {
            defaultExtension: "js"
        },
        'ag-grid': {
            defaultExtension: "js"
        },
        'ag-grid-enterprise': {
            defaultExtension: "js"
        }
        ...other packages
    }
}</pre>

    <h3 id="aotCompilation">For Ahead-of-Time (AOT) Compilation</h3>
    <p>
        We'll use SystemJS Builder for rollup.
    </p>

    <pre><span class="codeComment">// gulpfile</span>
var gulp = require('gulp');
var SystemBuilder = require('systemjs-builder');

gulp.task('aot-bundle', function () {
    var builder = new SystemBuilder();

    builder.loadConfig('./aot/systemjs.config.js')
        .then(function () {
            return builder.buildStatic('aot/app/boot-aot.js', './aot/dist/bundle.js', {
                encodeNames: false,
                mangle: false,
                minify: true,
                rollup: true,
                sourceMaps: true
            });
        })
});</pre>

    <pre><span class="codeComment">// aot systemjs config</span>
System.config({
        defaultJSExtensions: true,
        map: {
            // angular bundles
            '@angular/core': 'node_modules/@angular/core',
            '@angular/common': 'node_modules/@angular/common',
            '@angular/compiler': 'node_modules/@angular/compiler/index.js',
            '@angular/platform-browser': 'node_modules/@angular/platform-browser',
            '@angular/forms': 'node_modules/@angular/forms',
            '@angular/router': 'node_modules/@angular/router',
            // other libraries
            'rxjs': 'node_modules/rxjs',
            // 'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',
            // ag libraries
            'ag-grid-ng2' : 'node_modules/ag-grid-ng2',
            'ag-grid' : 'node_modules/ag-grid',
            'ag-grid-enterprise' : 'node_modules/ag-grid-enterprise'
        },
        packages: {
            '@angular/core': {
                main: 'index.js'
            },
            '@angular/common': {
                main: 'index.js'
            },
            '@angular/platform-browser': {
                main: 'index.js'
            },
            '@angular/forms': {
                main: 'index.js'
            },
            '@angular/router': {
                main: 'index.js'
            }
        }
    }
);
</pre>

    <p>
        All the above items are specific to either Angular 2, SystemJS or SystemJS Builder. The above is intended to point
        you in the right direction. If you need more information on this, please see the documentation
        for those projects.
    </p>

    <h2>Configuring ag-Grid in Angular 2</h2>

    <p>You can configure the grid in the following ways through Angular 2:</p>
    <ul>
        <li><b>Events:</b> All data out of the grid comes through events. These use
            Angular 2 event bindings eg <i>(modelUpdated)="onModelUpdated()"</i>.
            As you interact with the grid, the different events are fixed and
            output text to the console (open the dev tools to see the console).
        </li>
        <li><b>Properties:</b> All the data is provided to the grid as Angular 2
            bindings. These are bound onto the ag-Grid properties bypassing the
            elements attributes. The values for the bindings come from the parent
            controller.
        </li>
        <li><b>Attributes:</b> When the property is just a simple string value, then
            no binding is necessary, just the value is placed as an attribute
            eg <i>rowHeight="22"</i>. Notice that boolean attributes are defaulted
            to 'true' IF they attribute is provided WITHOUT any value. If the attribute
            is not provided, it is taken as false.
        </li>
        <li><b>Grid API via IDs:</b> The grid in the example is created with an id
            by marking it with <i>#agGrid</i>. This in turn turns into a variable
            which can be used to access the grid's controller. The buttons
            Grid API and Column API buttons use this variable to access the grids
            API (the API's are attributes on the controller).
        </li>
        <li><b>Changing Properties:</b> When a property changes value, AngularJS
            automatically passes the new value onto the grid. This is used in
            the following locations:<br/>
            a) The 'quickFilter' on the top right updates the quick filter of
            the grid.
            b) The 'Show Tool Panel' checkbox has it's value bound to the 'showToolPanel'
            property of the grid.
            c) The 'Refresh Data' generates new data for the grid and updates the
            <i>rowData</i> property.
        </li>
    </ul>

    <p>
        Notice that the grid has it's properties marked as <b>immutable</b>. Hence for
        object properties, the object reference must change for the grid to take impact.
        For example, <i>rowData</i> must be a new list of data for the grid to be
        informed to redraw.
    </p>

    <h3>Providing Angular 2 Components to ag-Grid</h3>
    <p>In order for ag-Grid to be able to use your Angular 2 Components, you need to provide them in the <strong>top level</strong> module:</p>
<pre>
@NgModule({
imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    AgGridModule.withComponents(
        [
            SquareComponent,
            CubeComponent,
            ...other components
</pre>

    <p>You can then use these components as editors, renderers or filters. For example, to use an Angular 2 Component as a Cell Renderer, you would do the following:</p>
<pre>
let colDefs = [
    {
        headerName: "Square Component",
        field: "value",
        cellRendererFramework: SquareComponent,
        editable:true,
        colId: "square",
        width: 175
    },
    ...other column definitions
]
</pre>
    <p>Please see the relevant sections on <a href="../javascript-grid-cell-rendering/#ng2CellRendering">cellRenders</a>,
        <a href="../javascript-grid-cell-editing/#ng2CellEditing">cellEditors</a> and
        <a href="../javascript-grid-filtering/#ng2Filtering">filters</a> for configuring and using Angular 2 Components in ag-Grid.</p>

    <p>
        The example has ag-Grid configured through the template in the following ways:
    </p>

    <pre><span class="codeComment">// notice the grid has an id called agGrid, which can be used to call the API</span>
&lt;ag-grid-ng2 #agGrid style="width: 100%; height: 350px;" class="ag-fresh"

    <span class="codeComment">// items bound to properties on the controller</span>
    [gridOptions]="gridOptions"
    [columnDefs]="columnDefs"
    [showToolPanel]="showToolPanel"
    [rowData]="rowData"

    <span class="codeComment">// boolean values 'turned on'</span>
    enableColResize
    enableSorting
    enableFilter

    <span class="codeComment">// simple values, not bound</span>
    rowHeight="22"
    rowSelection="multiple"

    <span class="codeComment">// event callbacks</span>
    (modelUpdated)="onModelUpdated()"
    (cellClicked)="onCellClicked($event)"
    (cellDoubleClicked)="onCellDoubleClicked($event)">

&lt;/ag-grid-ng2></pre>

    <p>
        The above is all you need to get started using ag-Grid in a Angular 2 application. Now would
        be a good time to try it in a simple app and get some data displaying and practice with
        some of the grid settings before moving onto the advanced features of cellRendering
        and custom filtering.
    </p>

    <h3>Example: Rich Grid without Components</h3>
    <p>
        The example below shows a rich configuration of ag-Grid, with no Angular 2 Components.
    </p>
    <show-example example="../ng2-example/index.html?example=rich-grid"
                  jsfile="../ng2-example/app/rich-grid.component.ts"
                  html="../ng2-example/app/rich-grid.component.html"
                  exampleHeight="525px"></show-example>

    <h2 id="ng2markup">Creating Grids with Markup</h2>

    <p>You can create Grids either programatically (with pure JavaScript/Typescript/Components), or declare them via declaratively with markup.</p>
    <p>The above section details how to specify the Grid itself. To declare columns you can specify them as follows:</p>

    <h3>Column Definition</h3>
<pre>
&lt;ag-grid-column headerName="Name" field="name" [width]="150">&lt;/ag-grid-column>
</pre>

    <p>This example declares a simple Column Definition, specifying header name, field and width.</p>

    <h3>Setting Column Properties</h3>
    <p>There are some simple rules you should follow when setting column properties via Markup:</p>
<pre ng-non-bindable>
<span class="codeComment">// string value</span>
propertyName="String Value"
[propertyName]="'String Value'"
[propertyName]="{{Interpolated Value}}"
[propertyName]="functionCallReturningAString()"

<span class="codeComment">// boolean value</span>
[propertyName]="true|false"
[propertyName]="{{Interpolated Value}}"
[propertyName]="functionCallReturningABoolean()"

<span class="codeComment">// numeric value</span>
[propertyName]="Numeric Value"
[propertyName]="functionCallReturningANumber()"

<span class="codeComment">// function value</span>
[propertyName]="functionName"
[propertyName]="functionCallReturningAFunction()"
</pre>

    <h4>Setting a Class or a Complex Value:</h4>
    <p>You can set a Class or a Complex property in the following way:</p>
<pre>
<span class="codeComment">// return a Class definition for a Filter</span>
[filter]="getSkillFilter()"

private getSkillFilter():any {
    return SkillFilter;
}

<span class="codeComment">// return an Object for filterParams</span>
[filterParams]="getCountryFilterParams()"

private getCountryFilterParams():any {
    return {
        cellRenderer: this.countryCellRenderer,
        cellHeight: 20
    }
}
</pre>

    <h3>Grouped Column Definition</h3>
    <p>To specify a Grouped Column, you can nest a column defintion:</p>
<pre ng-non-bindable>
&lt;ag-grid-column headerName="IT Skills">
    &lt;ag-grid-column headerName="Skills" [width]="125" [suppressSorting]="true" [cellRenderer]="skillsCellRenderer" [filter]="getSkillFilter()">&lt;/ag-grid-column>
    &lt;ag-grid-column headerName="Proficiency" field="proficiency" [width]="120" [cellRenderer]="percentCellRenderer" [filter]="getProficiencyFilter()">&lt;/ag-grid-column>
&lt;/ag-grid-column>
</pre>
    <p>In this example we have a parent Column of "IT Skills", with two child columns.</p>

    <h3>Example: Rich Grid using Markup</h3>
    <p>
        The example below shows the same rich grid as the example above, but with configuration done via Markup.
    </p>
    <show-example
            example="../ng2-example/index.html?example=rich-grid-declarative"
            jsfile="../ng2-example/app/rich-grid-declarative.component.ts"
            html="../ng2-example/app/rich-grid-declarative.component.html"
            exampleHeight="525px"></show-example>

    <h2>Cell Rendering & Cell Editing using Angular 2</h2>

    <p>
        It is possible to build
        <a href="../javascript-grid-cell-rendering/#ng2CellRendering">cellRenders</a>,
        <a href="../javascript-grid-cell-editing/#ng2CellEditing">cellEditors</a> and
        <a href="../javascript-grid-filtering/#ng2Filtering">filters</a> using Angular 2. Doing each of these
        is explained in the section on each.
    </p>

    <p>
        Although it is possible to use Angular 2 for your customisations of ag-Grid, it is not necessary. The grid
        will happily work with both Angular 2 and non-Angular 2 portions (eg cellRenderers in Angular 2 or normal JavaScript).
        If you do use Angular 2, be aware that you are adding an extra layer of indirection into ag-Grid. ag-Grid's
        internal framework is already highly tuned to work incredibly fast and does not require Angular 2 or anything
        else to make it faster. If you are looking for a lightning fast grid, even if you are using Angular 2 and
        the ag-grid-ng2 component, consider using plain ag-Grid Components (as explained on the pages for
        rendering etc) inside ag-Grid instead of creating Angular 2 counterparts.
    </p>

    <h2>Known Issues</h2>

    <p>
        <b>"Attempt to use a dehydrated detector"</b>
    </p>

    <p>
        If you are getting the above error, then check out <a
            href="https://www.ag-grid.com/forum/showthread.php?tid=3537">this post</a>
        where jose_DS shines some light on the issue.
    </p>

    <h2>Next Steps...</h2>

    <p>
        Now you can go to <a href="../javascript-grid-interfacing-overview/index.php">interfacing</a>
        to learn about accessing all the features of the grid.
    </p>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
