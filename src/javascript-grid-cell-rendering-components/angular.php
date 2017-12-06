<!-- Angular from here -->
<h1 id="ng2CellRendering">
    <img src="../images/angular2_large.png" style="width: 60px;"/>
    Angular Cell Render Components
</h1>

<p>
    It is possible to provide a Angular cell renderer's for ag-Grid to use if you are are using the
    Angular version of ag-Grid. All of the information above is
    relevant to Angular cell renderer's. This section explains how to apply this logic to your Angular component.
    Note: Here we are referring to Angular versions 2 and up. This section is not relevant to AngularJS 1.
</p>

<p>The code snippet below shows a quick example of how to use an Angular component as a cell renderer.</p>

<snippet>
// create your cell renderer as a Angular component
@Component({
    selector: 'square-cell',
    template: `{{valueSquared()}}`
})
class SquareComponent implements AgRendererComponent {
    private params:any;

    agInit(params:any):void {
        this.params = params;
    }

    private valueSquared():number {
        return this.params.value * this.params.value;
    }
}

var gridOptions = {

    // register the cell renderer with the grid using the grid frameworkComponents property.
    // using 'frameworkComponents' instead of 'components' tells the grid to use the underlying framework.
    frameworkComponents: {
        'squareCellRenderer': SquareComponent
    }

    // define some columns and use the customer cell renderer
    columnDefs: [
        {
            field: "square1",
            // reference the cell renderer in the column definition by name
            cellRenderer: 'squareCellRenderer'
        },
        {
            field: "square2",
            // alternatively the cell renderer can be referenced directly
            cellRendererFramework: SquareComponent
        },
    ]
    ...
};

</snippet>

<p>Your Angular components need to implement <code>AgRendererComponent</code>.
    The ag Framework expects to find the <code>agInit</code> method on the created component, and uses it to supply the
    cell <code>params</code>.<p>

<h2>Registering Angular Cell Renderers</h2>

<p>
    As with normal JavaScript cell renderers you can register Angular cell renderers by name
    or reference them directly.
</p>

<p>
    To register Angular Cell Renderers by name us the grid property
    <code>componentFramework</code> (the 'framework' part tells the grid that you want to use
    Angular and not normal JavaScript) and then reference the cell renderer as normal
    using <code>colDef.cellRenderer</code>.
</p>

<p>
    To reference Angular Cell Renderers directly use <code>colDef.cellRendererFramework</code>
    instead of <code>colDef.cellRenderer</code>.
</p>

<p>
    This same mechanism can be to use a Angular Component in the following locations:
<ul>
    <li>colDef.cellRenderer<b>Framework</b></li>
    <li>colDef.floatingCellRenderer<b>Framework</b></li>
    <li>gridOptions.fullWidthCellRenderer<b>Framework</b></li>
    <li>gridOptions.groupRowRenderer<b>Framework</b></li>
    <li>gridOptions.groupRowInnerRenderer<b>Framework</b></li>
</ul>
</p>

<h2 id="example-rendering-using-angular-components">Example: Rendering using Angular Components</h2>
<p>
    Using Angular Components in the Cell Renderer's
</p>

<?= example('Simple Dynamic Component', 'dynamic-components', 'generated', array('enterprise' => false, 'extras' => array('fontawesome', "bootstrap")), "angular") ?>

<h2 id="angular-methods-lifecycle"><img src="../images/angular2_large.png" style="width: 20px;"/> Angular Methods /
    Lifecycle</h2>

<p>
    All of the methods in the <code>ICellRenderer</code> interface described above are applicable
    to the Angular Component with the following exceptions:
<ul>
    <li><i>init()</i> is not used. Instead implement the <code>agInit</code> method (on the
        <code>AgRendererComponent</code> interface).
    </li>
    <li><i>destroy()</i> is not used. Instead implement the Angular<code>OnDestroy</code> interface
        (<code>ngOnDestroy</code>) for
        any cleanup you need to do.
    </li>
    <li><i>getGui()</i> is not used. Instead do normal Angular magic in your Component via the Angular template.</li>
</ul>

<h2 id="handling-refresh"><img src="../images/angular2_large.png" style="width: 20px;"/> Handling Refresh</h2>

<p>
    To handle refresh, implement logic inside the <code>refresh()</code> method inside your component and return true.
    If you do not want to handle refresh, just return false from the refresh method (which will tell the grid you do
    not handle refresh and your component will be destroyed and recreated if the underlying data changes).
</p>

<h2 id="example-rendering-using-more-complex-angular-components">Example: Rendering using more complex Angular
    Components</h2>
<p>
    Using more complex Angular Components in the Cell Renderer's - specifically how you can use nested <code>NgModule</code>'s
    within the grid.
</p>
<?= example('Richer Dynamic Components', 'angular-rich-dynamic', 'angular', array("exampleHeight" => 370, "showResult" => true, "extras" => array("bootstrap"))); ?>
