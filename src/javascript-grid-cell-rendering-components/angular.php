<!-- Angular from here -->
<h2 id="ng2CellRendering">
    <img src="../images/angular2_large.png" style="width: 60px;"/>
    Angular Cell Rendering
</h2>

<div class="note" style="margin-bottom: 20px">
    <img align="left" src="../images/note.png" style="margin-right: 10px;"/>
    <p>This section explains how to utilise ag-Grid cellRenders using Angular 2+. You should read about how
        <a href="/">Cell Rendering works in ag-Grid</a> first before trying to
        understand this section.</p>
</div>

<p>
    It is possible to provide a Angular cell renderer's for ag-Grid to use. All of the information above is
    relevant to Angular cell renderer's. This section explains how to apply this logic to your Angular component.
</p>

<p>
    For examples on Angular cellRendering, see the
    <a href="https://github.com/ag-grid/ag-grid-angular-example">ag-grid-angular-example</a> on Github.
    Angular renderer's are used on all but the first Grid on this example page (the first grid uses plain JavaScript
    renderer's)</p>
</p>

<h3 id="specifying-a-angular-cell-renderer"><img src="../images/angular2_large.png" style="width: 20px;"/> Specifying a
    Angular cell renderer</h3>

<p>
    If you are using the ag-grid-angular component to create the ag-Grid instance,
    then you will have the option of additionally specifying the cell renderer's
    as Angular components.

<h3 id="cell-renderers-from-angular-components"><img src="../images/angular2_large.png" style="width: 20px;"/>
    cell renderer's from Angular Components</h3>
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
// then reference the Component in your colDef like this
colDef = {
    {
        headerName: "Square Component",
        field: "value",
        // instead of cellRenderer we use cellRendererFramework
        cellRendererFramework: SquareComponent

        // specify all the other fields as normal
        editable:true,
        colId: "square",
        width: 200
    }
}</snippet>

<p>Your Angular components need to implement <code>AgRendererComponent</code>.
    The ag Framework expects to find the <code>agInit</code> method on the created component, and uses it to supply the
    cell <code>params</code>.<p>

<p>
    By using <code>colDef.cellRendererFramework</code> (instead of <code>colDef.cellRenderer</code>) the grid
    will know it's an Angular component, based on the fact that you are using the Angular version of
    ag-Grid.
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
In other words, wherever you specify a normal cell renderer, you can now specify a Angular cell renderer
in the property of the same name excepting ending 'Framework'. As long as you are using the Angular ag-Grid component,
the grid will know the framework to use is Angular.
</p>

<h3 id="example-rendering-using-angular-components">Example: Rendering using Angular Components</h3>
<p>
    Using Angular Components in the Cell Renderer's
</p>

<?= example('Simple Dynamic Component', 'angular-dynamic', 'angular', array("exampleHeight" => 440, "showResult" => true, "extras" => array("bootstrap"))); ?>

<h3 id="angular-methods-lifecycle"><img src="../images/angular2_large.png" style="width: 20px;"/> Angular Methods /
    Lifecycle</h3>

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

<h3 id="handling-refresh"><img src="../images/angular2_large.png" style="width: 20px;"/> Handling Refresh</h3>

<p>To receive update (for example, after an edit) you should implement the optional <code>refresh</code> method on the
    <code>AgRendererComponent</code> interface.</p>

<h3 id="example-rendering-using-more-complex-angular-components">Example: Rendering using more complex Angular
    Components</h3>
<p>
    Using more complex Angular Components in the Cell Renderer's
</p>
<?= example('Richer Dynamic Components', 'angular-rich-dynamic', 'angular', array("exampleHeight" => 370, "showResult" => true, "extras" => array("bootstrap"))); ?>


<note>The full <a href="https://github.com/ag-grid/ag-grid-angular-example">ag-grid-angular-example</a> repo shows many
    more examples for rendering, including grouped rows, full width renderer's
    and so on, as well as examples on using Angular Components with both Cell Editors and Filters
</note>