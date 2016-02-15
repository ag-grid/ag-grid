<?php
$key = "Getting Started ng2";
$pageTitle = "Best Angular 2 Data Grid";
$pageDescription = "Demonstrate the best Angular 2 data grid. Shows and example of a data grid for using with Angular 2.";
$pageKeyboards = "Angular 2 Grid";
include '../documentation_header.php';
?>

<div>

    <h2>Best Angular 2 Data Grid</h2>

    <p>
        When using AngularJS 2, you must use the CommonJS distribution of Angular 2 and ag-Grid. That means the
        already bundled ag-Grid and Angular 2 UMD will not work (if you don't know what this means or what these
        are, then don't worry, you will be none the wiser).
    </p>

    <p>If you MUST use the UMD version of Angular 2, then use the plain Javascript version of ag-Grid.</p>

    <h3>Angular 2 Still in Beta</h3>

    <p>
        ag-Grid's integration is been developed against beta versions of Angular 2.
        Until the final version is released, ag-Grid's integration with Angular 2
        is also liable to change. The examples below work with Angular version 2.0.0-beta.0.
        At the time of writing, that was the latest version.
    </p>

    <h3>Angular 2 Full Example</h3>

    <p>
        This page goes through <a href="https://github.com/helix46/ag-grid-angular2-beta-ts"> the
        <a href="https://github.com/ceolter/ag-grid-ng2-example">Angular 2, SystemX, JSPM, Typescript</a>
        example on Github. Because the example depends on SystemX and JSPM, it is not included in the
        online documentation.
    </p>

    <h3>Dependencies</h3>

    <p>
        In your package.json file, specify dependency on ag-grid AND ag-grid-ng2.
        The ag-grid package contains the core ag-grid engine and the ag-grid-ng2
        contains the Angular 2 component.
        <pre><code>"dependencies": {
    ...
    "ag-grid": "3.3.x",
    "ag-grid-ng2": "3.3.x"
}</code></pre>
    The major and minor versions should match. Every time a new major or minor
    version of ag-Grid is released, the component will also be released. However
    for patch versions, the component will not be released.
    </p>

    <p>You will then bbe able to access ag-Grid inside your application:</p>

    <pre>import {AgGridNg2} from 'ag-grid-ng2/main';</pre>

    <p>
        Which you can then use as a directive inside component:
    </p>

    <pre>@Component({
    directives: [AgGridNg2],
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

    <p>
        You will also need to configure SystemX for ag-grid and ag-grid-component as follows:
    </p>

    <pre>System.config({
    packages: {
        lib: {
            format: 'register',
            defaultExtension: 'js'
        },
        'ag-grid-ng2': {
            defaultExtension: "js"
        },
        'ag-grid': {
            defaultExtension: "js"
        }
    },
    map: {
        'ag-grid-ng2': 'node_modules/ag-grid-ng2',
        'ag-grid': 'node_modules/ag-grid'
    }
});</pre>

    <p>
        All the above items are specific to either Angular 2 or SystemX. The above is intended to point
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

    <p>
        The example has ag-Grid configured through the template in the following ways:
    </p>

    <pre>// notice the grid has an id called agGrid, which can be used to call the API
&lt;ag-grid-ng2 #agGrid style="width: 100%; height: 350px;" class="ag-fresh"

    // items bound to properties on the controller
    [gridOptions]="gridOptions"
    [columnDefs]="columnDefs"
    [showToolPanel]="showToolPanel"
    [rowData]="rowData"

    // boolean values 'turned on'
    enableColResize
    enableSorting
    enableFilter

    // simple values, not bound
    rowHeight="22"
    rowSelection="multiple"

    // event callbacks
    (modelUpdated)="onModelUpdated()"
    (cellClicked)="onCellClicked($event)"
    (cellDoubleClicked)="onCellDoubleClicked($event)">
&lt;/ag-grid-ng2></pre>

    <h2>Angular Compiling</h2>

    <p>Angular Compiling is NOT supported inside ag-Grid for Angular 2.</p>

    <note>
        <p>
            The grid does not use the Angular 2 compile service the same way it does for Angular 1. I spoke to some of the Angular team about this at Angular Connect in London in October 2015. Basically the Angular 2's compile service doesn't work like that in Angular 1. Angular 2 compiles everything at application start, and then the compile service is no longer available. It is not intended by Angular 2 for the application to use the compile service after the application has finished initialising. ag-Grid discovers the template at run-time and builds it's own html, so needs the compile service at run-time.
        </p>
        <p>
            What can be done in Angular 2 is the compile service can be made available again (I do not know how to do this yet) and then I can use it as I was using the similar service in Angular 1, but because Angular 2 is still in beta, I didn't want to invest my time in this (very undocumented) approach. It also 'did not sound like a good idea for performance reasons' with the Angular 2 team, so I'm weary that this use-case has been catered for properly in Angular 2.
        </p>
        <p>
            So, long story short, until Angular 2 is out of beta and someone can provide me with the best practice approach for using the Angular 2 compile service, ag-Grid won't support internal Angular 2 bindings.
        </p>
    </note>

    <h2>Destroy</h2>

    <p>
        You do not need to manually clean up the grid. The grid ties in with the AngularJS 2 lifecycle
        and releases all resources when the directive is destroyed. The example above demonstrates this
        by taking the element out of the DOM via *ngIf (which, unlike *ng-show, destroys the directives).
    </p>

    <h2>Next Steps...</h2>

    <p>
        Now you can go to <a href="../javascript-grid-interfacing-overview/index.php">interfacing</a>
        to learn about accessing all the features of the grid.
    </p>

</div>

<?php include '../documentation_footer.php';?>
