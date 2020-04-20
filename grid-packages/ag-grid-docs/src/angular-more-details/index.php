<?php
$pageTitle = "ag-Grid Reference: More Details - Angular Datagrid";
$pageDescription = "ag-Grid can be used as a data grid inside your Angular 2 application. This page details how to get started using ag-Grid inside an Angular 2 application.";
$pageKeywords = "Angular 2 Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1>Angular Components</h1>

    <p class="lead">
        If you are using the Angular component version of the grid, it is then possible to customise the
        internals of the grid with Angular components. For example you can use a component to customise
        the contents of a cell.
    </p>

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
&lt;ag-grid-angular #agGrid style="width: 100%; height: 350px;" class="ag-theme-alpine"

    // items bound to properties on the controller
    [gridOptions]="gridOptions"
    [columnDefs]="columnDefs"
    [showToolPanel]="showToolPanel"
    [rowData]="rowData"

    // boolean values 'turned on'
    animateRows
    pagination

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
               target="_blank"><i class="fa fa-external-link-alt"></i> Parent Component</a></li>
        <li>
            <a href="https://github.com/ag-grid/ag-grid-angular-example/blob/master/systemjs_aot/app/dynamic-component-example/child-message.component.ts"
               target="_blank"><i class="fa fa-external-link-alt"></i> Child Component</a></li>
    </ul>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
