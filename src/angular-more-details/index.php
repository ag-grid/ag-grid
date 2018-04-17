<?php
$pageTitle = "ag-Grid Reference: More Details - Angular Datagrid";
$pageDescription = "ag-Grid can be used as a data grid inside your Angular 2 application. This page details how to get started using ag-Grid inside an Angular 2 application.";
$pageKeyboards = "Angular 2 Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1>ag-Grid Angular Overview</h1>

    <note>Full working examples of ag-Grid and Angular can be found in <a href="https://github.com/ag-grid/ag-grid-angular-example">Github</a>, illustrating
        (amongst others) rich grids, filtering with angular components, master/detail grid and so on.</note>


    <p>
        Every feature of ag-Grid is available when using the ag-Grid Angular component. The Angular component wraps the
        functionality of ag-Grid, it doesn't duplicate, so there will be no difference between core ag-Grid and
        Angular ag-Grid when it comes to features.
    </p>

    <h2 id="configuring-ag-grid-in-angular">Configuring ag-Grid in Angular</h2>

    <p>You can configure the grid in the following ways through Angular:</p>

    <ul class="content">
        <li><b>Events:</b> All data out of the grid comes through events. These use
            Angular event bindings eg <code>(modelUpdated)="onModelUpdated()"</code>.
            As you interact with the grid, the different events are fixed and
            output text to the console (open the dev tools to see the console).
        </li>
        <li><b>Properties:</b> All the data is provided to the grid as Angular
            bindings. These are bound onto the ag-Grid properties bypassing the
            elements attributes. The values for the bindings come from the parent
            controller.
        </li>
        <li><b>Attributes:</b> When the property is just a simple string value, then
            no binding is necessary, just the value is placed as an attribute
            eg <code>rowHeight="22"</code>. Notice that boolean attributes are defaulted
            to <code>true</code> IF they attribute is provided WITHOUT any value. If the attribute
            is not provided, it is taken as false.
        </li>
        <li><b>Grid API via IDs:</b> The grid in the example is created with an id
            by marking it with <code>#agGrid</code>. This in turn turns into a variable
            which can be used to access the grid's controller. The buttons
            Grid API and Column API buttons use this variable to access the grids
            API (the APIs are attributes on the controller).
        </li>
        <li><b>Changing Properties:</b> When a property changes value, Angular
            automatically passes the new value onto the grid. This is used in
            the following locations in the feature rich grid example above:<br/>
            a) The quick filter on the top right updates the quick filter of
            the grid.
            b) The 'Show Tool Panel' checkbox has its value bound to the <code>showToolPanel</code>
            property of the grid.
            c) The 'Refresh Data' generates new data for the grid and updates the
            <code>rowData</code> property.
        </li>
    </ul>

    <p>
        Notice that the grid has its properties marked as <b>immutable</b>. Hence for
        object properties, the object reference must change for the grid to take impact.
        For example, <code>rowData</code> must be a new list of data for the grid to be
        informed to redraw.
    </p>

    <note>
        Sometimes the <code>gridReady</code> grid event can fire before the Angular component is ready to receive it, so in
        an Angular environment its safer to rely on <code>AfterViewInit</code> instead before using the API.
    </note>

    <h3 id="providing-angular-components-to-ag-grid">Providing Angular Components to ag-Grid</h3>
    <p>In order for ag-Grid to be able to use your Angular components, you need to provide them in the <strong>top
            level</strong> module:</p>
    <snippet>
@NgModule({
imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    AgGridModule.withComponents(
        [
            SquareComponent,
            CubeComponent,
            // ...other components</snippet>

    <p>You can then use these components as editors, renderers or filters. For example, to use an Angular
        Component as a
        Cell Renderer, you would do the following:</p>
    <snippet>
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
]</snippet>
    <p>Please see the relevant sections on <a
                href="../javascript-grid-cell-rendering-components/#ng2CellRendering">cell renderers</a>,
        <a href="../javascript-grid-cell-editing/#ng2CellEditing">cell editors</a> and
        <a href="../javascript-grid-filtering/#ng2Filtering">filters</a> 
for configuring and using Angular components in ag-Grid.</p> 

<p> The example has ag-Grid configured through the template in the following ways: </p>

    <snippet>
// notice the grid has an id called agGrid, which can be used to call the API
&lt;ag-grid-angular #agGrid style="width: 100%; height: 350px;" class="ag-theme-balham"

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
    (cellDoubleClicked)="onCellDoubleClicked($event)"&gt;

&lt;/ag-grid-angular&gt;</snippet>

    <p>
        The above is all you need to get started using ag-Grid in a Angular application. Now would
        be a good time to try it in a simple app and get some data displaying and practice with
        some of the grid settings before moving onto the advanced features of cellRendering
        and custom filtering.
    </p>

    <h3 id="parent_child">Child to Parent Communication</h3>

    <p>There are a variety of ways to manage component communication in Angular (shared service, local variables
        etc),
        but you
        often need a simple way to let a "parent" component know that something has happened on a "child"
        component. In
        this case
        the simplest route is to use the <code>gridOptions.context</code> to hold a reference to the parent,
        which the
        child can then access.</p>

    <snippet>
// in the parent component - the component that hosts ag-grid-angular and specifies which angular components to use in the grid
constructor() {
    this.gridOptions = &lt;GridOptions&gt;{
        context: {
            componentParent: this
        }
    };
    this.gridOptions.rowData = this.createRowData();
    this.gridOptions.columnDefs = this.createColumnDefs();
}

// in the child component - the angular components created dynamically in the grid
// the parent component can then be accessed as follows:
this.params.context.componentParent</snippet>

    <p>Note that although we've used <code>componentParent</code> as the property name here it can be anything -
        the main point is that you can use the <code>context</code> mechanism to share information between the components.</p>

    <p>The <span
                style="font-style: italic">"A Simple Example, using CellRenderers created from Angular Components"</span>
        above illustrates this in the Child/Parent column:</p>
    <ul class="content">
        <li>
            <a href="https://github.com/ag-grid/ag-grid-angular-example/blob/master/systemjs_aot/app/dynamic-component-example/dynamic.component.ts"
               target="_blank"><i class="fa fa-external-link"></i> Parent Component</a></li>
        <li>
            <a href="https://github.com/ag-grid/ag-grid-angular-example/blob/master/systemjs_aot/app/dynamic-component-example/child-message.component.ts"
               target="_blank"><i class="fa fa-external-link"></i> Child Component</a></li>
    </ul>

    <h3 id="building-bundling">Building & Bundling</h3>
    <p>There are many ways to build and/or bundle an Angular Application. In the Getting Started/Overview
        section we
        went
        through using Angular CLI to create an ag-Grid Angular application, but we also provide full working
        examples
        using
        either SystemJS, Webpack or Webpack 2 as part of the <a
                href="https://github.com/ag-grid/ag-grid-angular-example">ag-grid-angular-example</a> project on
        GitHub.
    </p>
    <p>We document the main parts of these tools below, but please refer to the examples for more detail.</p>

    <ul class="content">
        <li>
            <a href="/ag-grid-angular-angularcli"> Angular CLI</a>
        </li>
        <li>
            <a href="/ag-grid-angular-webpack"> Webpack</a>
        </li>
        <li>
            <a href="/ag-grid-angular-webpack-2"> Webpack 2</a>
        </li>
        <li>
            <a href="/ag-grid-angular-webpack-3"> Webpack 2</a>
        </li>
        <li>
            <a href="/ag-grid-angular-systemjs"> SystemJS</a>
        </li>
    </ul>

    <h2 id="ng2markup">Creating Grids with Markup</h2>

    <p>You can create Grids either programatically (with pure JavaScript/Typescript/Components), or declare them
        via
        declaratively with markup.</p>
    <p>The above section details how to specify the Grid itself. To declare columns you can specify them as
        follows:</p>

    <h3 id="column-definition">Column Definition</h3>
    <snippet>
&lt;ag-grid-column headerName="Name" field="name" [width]="150"&gt;&lt;/ag-grid-column&gt;</snippet>

    <p>This example declares a simple Column Definition, specifying header name, field and width.</p>

    <h3 id="setting-column-properties">Setting Column Properties</h3>
    <p>There are some simple rules you should follow when setting column properties via Markup:</p>

<pre class="language-js" ng-non-bindable><code>// string value
propertyName="String Value"
[propertyName]="'String Value'"
[propertyName]="{{Interpolated Value}}"
[propertyName]="functionCallReturningAString()"

// boolean value
[propertyName]="true|false"
[propertyName]="{{Interpolated Value}}"
[propertyName]="functionCallReturningABoolean()"

// numeric value
[propertyName]="Numeric Value"
[propertyName]="functionCallReturningANumber()"

// function value
[propertyName]="functionName"
[propertyName]="functionCallReturningAFunction()"</code>
</pre>

<h4 id="setting-a-class-or-a-complex-value">Setting a Class or a Complex Value</h4>
    <p>You can set a Class or a Complex property in the following way:</p>
    <snippet>
// return a Class definition for a Filter
[filter]="getSkillFilter()"

private getSkillFilter():any {
    return SkillFilter;
}

// return an Object for filterParams
[filterParams]="getCountryFilterParams()"

private getCountryFilterParams():any {
    return {
        cellRenderer: this.countryCellRenderer,
        cellHeight: 20
    }
}</snippet>

    <h3 id="grouped-column-definition">Grouped Column Definition</h3>
    <p>To specify a Grouped Column, you can nest a column defintion:</p>
    <snippet>
&lt;ag-grid-column headerName="IT Skills"&gt;
    &lt;ag-grid-column headerName="Skills" [width]="125" [suppressSorting]="true" [cellRenderer]="skillsCellRenderer" [filter]="getSkillFilter()"&gt;&lt;/ag-grid-column&gt;
    &lt;ag-grid-column headerName="Proficiency" field="proficiency" [width]="120" [cellRenderer]="percentCellRenderer" [filter]="getProficiencyFilter()"&gt;&lt;/ag-grid-column&gt;
&lt;/ag-grid-column&gt;</snippet>
    <p>In this example we have a parent Column of "IT Skills", with two child columns.</p>

    <h2 id="example-rich-grid-using-markup">Example: Rich Grid using Markup</h2>
    <p>
        The example below shows the same rich grid as the example above, but with configuration done via Markup.
    </p>
    <?= example('ag-Grid in Angular with Markup', 'angular-rich-grid-markup', 'angular', array( "enterprise" => 1, "exampleHeight" => 525, "showResult" => true, "extras" => array( "fontawesome", "bootstrap" ) )); ?>

    <h2 id="cell-rendering-cell-editing-using-angular">Cell Rendering & Cell Editing using Angular</h2>

    <p>
        It is possible to build
        <a href="../javascript-grid-cell-rendering-components/#ng2CellRendering">cell renderers</a>,
        <a href="../javascript-grid-cell-editing/#ng2CellEditing">cell editors</a> and
        <a href="../javascript-grid-filtering/#ng2Filtering">filters</a> using Angular. Doing each of these
        is explained in the section on each.
    </p>

    <p>
        Although it is possible to use Angular for your customisations of ag-Grid, it is not necessary. The grid
        will happily work with both Angular and non-Angular portions (eg cellRenderers in Angular or normal
        JavaScript).
    </p>

    <h2 id="aggrid-angular-testing">Testing ag-Grid Angular Applications with Karma & Jasmine</h2>

    <p>In our <a href="https://github.com/ag-grid/ag-grid-angular-seed">Angular Seed Repo</a> we provide working
        examples of how to test your Angular project with Karma & Jasmine.</p>

    <p>As with your actual application, you need to ensure you <code>import</code> the <code>AgGridModule</code> when
        specifying your tests:</p>

    <snippet>
TestBed.configureTestingModule({
    imports: [
        AgGridModule.withComponents([...optional Angular Components...]
    ]
    ...rest of module definition</snippet>

    <p>You also need to aware that the Grid <code>API</code> and <code>ColumnAPI</code> will only be available after your
        fixtures <code>detectChanges</code> has been invoked:</p>
    <snippet>
it('grid API is not available until  `detectChanges`', () =&gt; {
    expect(component.gridOptions.api).not.toBeTruthy();
});

it('grid API is available after `detectChanges`', () =&gt; {
    fixture.detectChanges();
    expect(component.gridOptions.api).toBeTruthy();
});</snippet>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
