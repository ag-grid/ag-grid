<?php
$key = "More Detail Angular";
$pageTitle = "Angular 2 Grid";
$pageDescription = "ag-Grid can be used as a data grid inside your Angular 2 application. This page details how to get started using ag-Grid inside an Angular 2 application.";
$pageKeyboards = "Angular 2 Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1 class="first-h1">
        <img style="vertical-align: middle" src="../images/angular2_large.png" height="50px"/>
        Angular 2+ Datagrid - More Details
    </h1>

    <note>Full working examples of ag-Grid and Angular can be found in <a href="https://github.com/ag-grid/ag-grid-angular-example">Github</a>, illustrating
        (amongst others) Rich Grids, Filtering with Angular Components, Master/Detail Grid and so on.</note>

    <h3>Downloading the ag-Grid Angular Component</h3>

    <p style="margin-top: 5px">
        Using Angular with ag-Grid introduces a dependency on Angular. For this reason:
    <ul>
        <li>You need to include the additional project ag-grid-angular, which has the Angular dependency.</li>
        <li>You cannot use the bundled version of ag-Grid. You must use the CommonJS distribution.</li>
    </ul>

    <table>
        <tr>
            <td style="padding: 10px;"><img src="../images/bower.png"/></td>
            <td>
                <table>
                    <tr>
                        <td><b>Bower</b></td>
                    </tr>
                    <tr>
                        <td>bower install ag-grid</td>
                    </tr>
                    <tr>
                        <td>bower install ag-grid-angular</td>
                    </tr>
                </table>
            </td>

            <td style="width: 215px;"/>

            <td style="padding: 10px;"><img src="../images/npm.png"/></td>
            <td>
                <table>
                    <tr>
                        <td><b>NPM</b></td>
                    </tr>
                    <tr>
                        <td>npm install ag-grid</td>
                    </tr>
                    <tr>
                        <td>npm install ag-grid-angular</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <p>You can then reference the dependency as follows in the top of your component:</p>

    <pre>import {AgGridModule} from 'ag-grid-angular/main';</pre>

    <p>
        Which you can then use as a dependency inside your module:
    </p>

    <pre>@NgModule({
    imports: [
        BrowserModule,
        AgGridModule.withComponents([...optional Angular Components to be used in the grid....]),
        ...
})</pre>

    <p>And finally, reference it in your template as follows:</p>
<pre>
<span class="codeComment">// component template</span>
&lt;ag-grid-angular style="width: 500px; height: 115px;" class="ag-fresh"
                [rowData]="rowData"
                [columnDefs]="columnDefs"&gt;
&lt;/ag-grid-angular&gt;
</pre>

    <h3><img src="../images/enterprise_50.png" style="height: 22px;margin-right: 5px"/>Downloading the ag-Grid Angular Enterprise Dependency</h3>

    <p>If you're using the ag-Grid Enterprise features, then in addition to the ag-Grid Angular dependency above, you also require
    the ag-Grid Angular Enterprise dependency:</p>

    <h3>Download ag-Grid-Enterprise</h3>

    <table>
        <tr>
            <td style="padding: 10px;"><img src="../images/bower.png"/></td>
            <td>
                <b>Bower</b><br/>
                bower install ag-grid-enterprise
            </td>

            <td style="width: 180px;"/>


            <td style="padding: 10px;"><img src="../images/npm.png"/></td>
            <td>
                <b>NPM</b><br/>
                npm install ag-grid-enterprise
            </td>
        </tr>
    </table>

    <p>The Enterprise dependency has to be made available before any Grid related component, so we suggest importing it in your
    Angular root module if possible before kicking off the actual application - for example:</p>

<pre>
<span class="codeComment">// only necessary if you're using ag-Grid-Enterprise features</span>
import "ag-grid-enterprise";
</pre>

    <h2 id="ag-Grid-angular-features">ag-Grid Angular Features</h2>

    <p>
        Every feature of ag-Grid is available when using the ag-Grid Angular Component. The Angular Component wraps the
        functionality of ag-Grid, it doesn't duplicate, so there will be no difference between core ag-Grid and
        Angular ag-Grid when it comes to features.
    </p>

    <h2 id="configuring-ag-grid-in-angular">Configuring ag-Grid in Angular</h2>

    <p>You can configure the grid in the following ways through Angular:</p>
    <ul>
        <li><b>Events:</b> All data out of the grid comes through events. These use
            Angular event bindings eg <i>(modelUpdated)="onModelUpdated()"</i>.
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
        <li><b>Changing Properties:</b> When a property changes value, AngularJS 1.x
            automatically passes the new value onto the grid. This is used in
            the following locations in the "feature rich grid example" above:<br/>
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

    <note>
        Sometimes the gridReady grid event can fire before the Angular component is ready to receive it, so in
        an
        Angular
        environment its safer to on you cannot safely rely on <code>AfterViewInit</code> instead before using
        the API
    </note>

    <h3 id="providing-angular-components-to-ag-grid">Providing Angular Components to ag-Grid</h3>
    <p>In order for ag-Grid to be able to use your Angular Components, you need to provide them in the <strong>top
            level</strong> module:</p>
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

    <p>You can then use these components as editors, renderers or filters. For example, to use an Angular
        Component as a
        Cell Renderer, you would do the following:</p>
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
    <p>Please see the relevant sections on <a
                href="../javascript-grid-cell-rendering-components/#ng2CellRendering">cell renderer's</a>,
        <a href="../javascript-grid-cell-editing/#ng2CellEditing">cell editors</a> and
        <a href="../javascript-grid-filtering/#ng2Filtering">filters</a> for configuring and using Angular
        Components in
        ag-Grid.</p>

    <p>
        The example has ag-Grid configured through the template in the following ways:
    </p>

    <pre><span class="codeComment">// notice the grid has an id called agGrid, which can be used to call the API</span>
&lt;ag-grid-angular #agGrid style="width: 100%; height: 350px;" class="ag-fresh"

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

&lt;/ag-grid-angular></pre>

    <p>
        The above is all you need to get started using ag-Grid in a Angular application. Now would
        be a good time to try it in a simple app and get some data displaying and practice with
        some of the grid settings before moving onto the advanced features of cellRendering
        and custom filtering.
    </p>

    <h4 id="parent_child">Child to Parent Communication</h4>

    <p>There are a variety of ways to manage component communication in Angular (shared service, local variables
        etc),
        but you
        often need a simple way to let a "parent" component know that something has happened on a "child"
        component. In
        this case
        the simplest route is to use the <code>gridOptions.context</code> to hold a reference to the parent,
        which the
        child can then access.</p>

    <pre>
<span class="codeComment">// in the parent component - the component that hosts ag-grid-angular and specifies which angular components to use in the grid</span>
constructor() {
    this.gridOptions = &lt;GridOptions&gt;{
        context: {
            componentParent: this
        }
    };
    this.gridOptions.rowData = this.createRowData();
    this.gridOptions.columnDefs = this.createColumnDefs();
}

<span class="codeComment">// in the child component - the angular components created dynamically in the grid</span>
<span class="codeComment">// the parent component can then be accessed as follows:</span>
this.params.context.componentParent
</pre>

    <p>Note that although we've used <code>componentParent</code> as the property name here it can be anything -
        the
        main
        point is that you can use the <code>context</code> mechanism to share information between the
        components.</p>

    <p>The <span
                style="font-style: italic">"A Simple Example, using CellRenderers created from Angular Components"</span>
        above illustrates this in the Child/Parent column:</p>
    <ul>
        <li>
            <a href="https://github.com/ag-grid/ag-grid-angular-example/blob/master/systemjs_aot/app/from-component.component.ts"
               target="_blank" class="fa fa-external-link"> Parent Component</a></li>
        <li>
            <a href="https://github.com/ag-grid/ag-grid-angular-example/blob/master/systemjs_aot/app/child-message.component.ts"
               target="_blank" class="fa fa-external-link"> Child Component</a></li>
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

    <ul>
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
            <a href="/ag-grid-angular-ngtools-webpack"> @ngTools/Webpack</a>
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
    <pre>
&lt;ag-grid-column headerName="Name" field="name" [width]="150">&lt;/ag-grid-column>
</pre>

    <p>This example declares a simple Column Definition, specifying header name, field and width.</p>

    <h3 id="setting-column-properties">Setting Column Properties</h3>
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

    <h4 id="setting-a-class-or-a-complex-value">Setting a Class or a Complex Value:</h4>
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

    <h3 id="grouped-column-definition">Grouped Column Definition</h3>
    <p>To specify a Grouped Column, you can nest a column defintion:</p>
    <pre ng-non-bindable>
&lt;ag-grid-column headerName="IT Skills">
    &lt;ag-grid-column headerName="Skills" [width]="125" [suppressSorting]="true" [cellRenderer]="skillsCellRenderer" [filter]="getSkillFilter()">&lt;/ag-grid-column>
    &lt;ag-grid-column headerName="Proficiency" field="proficiency" [width]="120" [cellRenderer]="percentCellRenderer" [filter]="getProficiencyFilter()">&lt;/ag-grid-column>
&lt;/ag-grid-column>
</pre>
    <p>In this example we have a parent Column of "IT Skills", with two child columns.</p>

    <h3 id="example-rich-grid-using-markup">Example: Rich Grid using Markup</h3>
    <p>
        The example below shows the same rich grid as the example above, but with configuration done via Markup.
    </p>
    <show-complex-example example="../framework-examples/angular-examples/index.html?fromDocs=true&example=rich-grid-declarative"
                          sources="{
                            [
                                { root: '/framework-examples/angular-examples/app/rich-grid-declarative-example/', files: 'rich-grid-declarative.component.ts,rich-grid-declarative.component.html,proficiency-renderer.css,rich-grid.css' },
                                { root: '/framework-examples/angular-examples/app/header-group-component/', files: 'header-group.component.ts,header-group.component.html,header-group.component.css' },
                                { root: '/framework-examples/angular-examples/app/header-component/', files: 'header.component.ts,header.component.html,header.component.css' },
                                { root: '/framework-examples/angular-examples/app/filters/', files: 'skillFilter.ts,proficiencyFilter.ts' },
                                { root: '/framework-examples/angular-examples/app/date-component/', files: 'date.component.ts,date.component.html,date.component.css' },
                                { root: '/framework-examples/angular-examples/app/', files: 'app.module.ts' }
                            ]
                          }"
                          plunker="https://embed.plnkr.co/1rHK9l/"
                          exampleHeight="525px">
    </show-complex-example>

    <h2 id="cell-rendering-cell-editing-using-angular">Cell Rendering & Cell Editing using Angular</h2>

    <p>
        It is possible to build
        <a href="../javascript-grid-cell-rendering-components/#ng2CellRendering">cell renderer's</a>,
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

    <pre>
TestBed.configureTestingModule({
    imports: [
        AgGridModule.withComponents([...optional Angular Components...]
    ]
    ...rest of module definition
</pre>

    <p>You also need to aware that the Grid <code>API</code> and <code>ColumnAPI</code> will only be available after your
        fixtures <code>detectChanges</code> has been invoked:</p>
    <pre>
it('grid API is not available until  `detectChanges`', () => {
    expect(component.gridOptions.api).not.toBeTruthy();
});

it('grid API is available after `detectChanges`', () => {
    fixture.detectChanges();
    expect(component.gridOptions.api).toBeTruthy();
});
</pre>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
