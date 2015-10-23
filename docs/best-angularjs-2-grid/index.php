<?php
$key = "Getting Started ng2";
$pageTitle = "Best Angular 2 Grid";
$pageDescription = "Shows and example of a data grid for using with Angular 2.";
$pageKeyboards = "Angular 2 Grid";
include '../documentation_header.php';
?>

<div>

    <h2>Getting Started - AngularJS 2.0</h2>

    <h4>AngularJS 2 Still in Beta</h4>

    <p>
        ag-Grid's integration is been developed against beta versions of AngularJS 2.
        Until the final version is released, ag-Grid's integration with AngularJS 2
        is also liable to change.
    </p>

    <h4>Self Extracting AngularJS 2</h4>

    <p>
        AngularJS 2 was written for TypeScript and ECMA 6 module loading.
        However this is not mandatory, you can use the SFX (self extracting)
        version of AngularJS if you don't want to use ECMA 6 module loading
        and / or TypeScript. For simplicity, and to minimise the barrier
        to entry, the examples in this documentation use Javascript and
        the SFX version of AngularJS 2.
    </p>

    <p>
        For notes on JSPM, see the secton on JSPM below.
    </p>

    <h2>Simple AngularJS 2 Example</h2>

    <p>
        Below shows a step by step guide on setting up ag-Grid with an AngularJS 2 application
        using Javascript and SFX.
    </p>

    <h4>Include Dependencies</h4>

    <p>
        Include the dependencies for the application in the <i>head</i> section of your html.
    </p>

    <pre>&lt;!-- This is the SFX version of AngularJS 2.0 -->
&lt;script src="http://code.angularjs.org/2.0.0-alpha.35/angular2.sfx.dev.js">&lt;/script>

&lt;!-- include ag-Grid javascript file -->
&lt;script src="../dist/ag-grid.js">&lt;/script>

&lt;!-- include your application code, after ag-Grid and AngularJS as it depends on both -->
&lt;script src="exampleSimpleNg2.js">&lt;/script>

&lt;!-- include stylesheets for the grid -->
&lt;link rel="stylesheet" type="text/css" href="../dist/ag-grid.css">
&lt;link rel="stylesheet" type="text/css" href="../dist/theme-fresh.css"></pre>

    <h4>
        Simple App Root Component
    </h4>

    <p>
        You can't have the grid as your root component as you need your application outside
        the grid to provide details to the grid.
    </p>

    <p>
        In your HTML, include a root component as follows:
    </p>
    <pre>&lt;simple-ng2-grid/></pre>

    <p>
        Then in your Javascript, you need to define your component. Doing this use AngularJS SFX
        and Javascript (not Typescript) is done as follows:
    </p>

    <pre>// define a function to act as the class for the component
var SampleAppComponent = function() {}

// add AngularJS 2 annotations to the function
SampleAppComponent.annotations = [
    new ng.Component({
        // tell AngularJS to match the &lt;simple-ng2-grid> tag
        selector: 'simple-ng2-grid'
    }),
    new ng.View({
        // tell AngularJS that the SimpleAppComponent directive
        // uses the ag-Grid directive
        directives: [ag.grid.AgGridNg2],
        // the template for our
        template: templateForSampleAppComponent
    })
];
</pre>

    <h4>Simple App Template</h4>

    <p>
        In the example, the constructor sets the row data and column definitions onto
        the component instance, which is then available to the components template
        for binding. The template for Simple App only has one element, the ag-Grid
        element.
    </p>

    <pre>&lt;ag-grid-ng2
    // use one of the ag-Grid themes
    class="ag-fresh"
    // give some size to the grid
    style="height: 100%;"
    // use AngularJS 2 properties for column-defs and row-data
    [column-defs]="columnDefs"
    [row-data]="rowData"
/></pre>

    <p>
        The example shows us of AngularJS property bindings. The grid has full support for
        AngularJS property bindings, events and attributes. The simple example doesn't show
        it all. See the complex example below for a more meat.
    </p>

    <h4>Simple App Bootstrap</h4>

    <p>
        Then when everything is defined, we can bootstrap this mother, as follows:
    </p>

    <pre>document.addEventListener('DOMContentLoaded', function () {
    ng.bootstrap(SampleAppComponent);
});
</pre>

    <show-example example="exampleSimpleNg2"></show-example>

    <h2>Complex AngularJS 2 Example</h2>

    <p>
        Ok I'm ready, lets do it, lets go crazy and get more of AngularJS 2 involved!!
        The example below demonstrates the following:
    </p>

    <ul>
        <li><b>Events:</b> All data out of the grid comes through events. These use
            Angular 2 event bindings eg <i>(model-updated)="onModelUpdated()"</i>.
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
            eg <i>row-height="22"</i>. Notice that boolean attributes are defaulted
            to 'true' IF they attribute is provided WITHOUT any value. If the attribute
            is not provided, it is taken as false.
        </li>
        <li><b>Grid API via IDs:</b> The grid in the example is created with an id
            by marking it with <i>#ag-grid</i>. This in turn turns into a variable
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

    <show-example example="exampleNg2" extra-pages="sampleAppComponent.html"></show-example>

    <note>
        I tested the above examples to work on my Windows 8 machine with latest Chrome, Internet Explorer
        and Firefox. It didn't work on Safari on Windows 8 with an ng2 error. Also I tried with my flatmates
        new Windows 10 and Slate browser, and ng2 failed there also. I'm not worried about it as I'm
        assuming these are AngularJS issues that will be fixed in their final release as ag-Grid works
        fine in these browsers using AngularJS 1.x.
    </note>

    <h2>Destroy</h2>

    <p>
        You do not need to manually clean up the grid. The grid ties in with the AngularJS 2 lifecycle
        and releases all resources when the directive is destroyed. The example above demonstrates this
        by taking the element out of the DOM via *ng-if (which, unlike *ng-show, destroys the directives).
    </p>

    <h2>JSPM</h2>

    <p>
        To get one version of the grid to work with all technologies required one Javascript file
        to work regardless of you using JSPM, CommonJS, Angular 1 or 2, or no Angular at all, had
        one pitfall for me. That was JSPM loading of the Angular 2 library (as this will cause and
        error if Angular 2 is not available, which will be the case if you are using Angular 1 or
        no Angular at all). To get around this, you have to initialise the grid with Angular 2 if
        using JSPM. This is done as follows:
    </p>

    <pre>System.import('angular2/angular2').then( function(ng2) {
    ag.grid.initialiseAgGridWithAngular2(ng2);
});</pre>

    <h2>Next Steps...</h2>

    <p>
        Now you can go to <a href="../javascript-grid-interfacing-overview/index.php">interfacing</a>
        to learn about accessing all the features of the grid.
    </p>

</div>

<?php include '../documentation_footer.php';?>
