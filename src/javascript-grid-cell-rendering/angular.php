<?php
$key = "Cell Rendering Angular";
$pageTitle = "ag-Grid Cell Rendering";
$pageDescription = "You can customise every cell in ag-Grid. This is done by providing cell renderers. This page describe creating cell renderers.";
$pageKeyboards = "ag-Grid Cell Renderers";
include '../documentation-main/documentation_header.php';
?>

<!-- Angular from here -->
<h2 id="ng2CellRendering">
    <img src="../images/angular2_large.png" style="width: 60px;"/>
    Angular Cell Rendering
</h2>

<p>
    It is possible to provide a Angular cellRenderers for ag-Grid to use. All of the information above is
    relevant to Angular cellRenderers. This section explains how to apply this logic to your Angular component.
</p>

<p>
    For examples on Angular cellRendering, see the
    <a href="https://github.com/ceolter/ag-grid-ng2-example">ag-grid-ng2-example</a> on Github.
    Angular Renderers are used on all but the first Grid on this example page (the first grid uses plain JavaScript Renderers)</p>
</p>

<h3><img src="../images/angular2_large.png" style="width: 20px;"/> Specifying a Angular cellRenderer</h3>

<p>
    If you are using the ag-grid-ng2 component to create the ag-Grid instance,
    then you will have the option of additionally specifying the cellRenderers
    as Angular components.

<h3><img src="../images/angular2_large.png" style="width: 20px;"/> cellRenderers from Angular Components</h3>
<pre><span class="codeComment">// create your cellRenderer as a Angular component</span>
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
<span class="codeComment">// then reference the Component in your colDef like this</span>
colDef = {
    {
        headerName: "Square Component",
        field: "value",
        <span class="codeComment">// instead of cellRenderer we use cellRendererFramework</span>
        cellRendererFramework: SquareComponent

        <span class="codeComment">// specify all the other fields as normal</span>
        editable:true,
        colId: "square",
        width: 200
    }
}</pre>

<p>Your Angular components need to implement <code>AgRendererComponent</code>.
    The ag Framework expects to find the <code>agInit</code> method on the created component, and uses it to supply the cell <code>params</code>.<p>

<p>
    By using <i>colDef.cellRendererFramework</i> (instead of <i>colDef.cellRenderer</i>) the grid
    will know it's a Angular component, based on the fact that you are using the Angular version of
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
In other words, wherever you specify a normal cellRenderer, you can now specify a Angular cellRenderer
in the property of the same name excepting ending 'Framework'. As long as you are using the Angular ag-Grid component,
the grid will know the framework to use is Angular.
</p>

<h3>Example: Rendering using Angular Components</h3>
<p>
    Using Angular Components in the Cell Renderers
</p>
<show-example example="../ng2-example/index.html?fromDocs=true&example=from-component"
              jsfile="../ng2-example/app/from-component.component.ts"
              html="../ng2-example/app/from-component.component.html"></show-example>

<h3><img src="../images/angular2_large.png" style="width: 20px;"/> Angular Methods / Lifecycle</h3>

<p>
    All of the methods in the ICellRenderer interface described above are applicable
    to the Angular Component with the following exceptions:
<ul>
    <li><i>init()</i> is not used. Instead implement the <code>agInit</code> method (on the <code>AgRendererComponent</code> interface).</li>
    <li><i>destroy()</i> is not used. Instead implement the Angular<code>OnDestroy</code> interface (<code>ngOnDestroy</code>) for
        any cleanup you need to do.</li>
    <li><i>getGui()</i> is not used. Instead do normal Angular magic in your Component via the Angular template.</li>
</ul>

<h3><img src="../images/angular2_large.png" style="width: 20px;"/> Handling Refresh</h3>

<p>To receive update (for example, after an edit) you should implement the optional <code>refresh</code> method on the <code>AgRendererComponent</code> interface.</p>

<h3>Example: Rendering using more complex Angular Components</h3>
<p>
    Using more complex Angular Components in the Cell Renderers
</p>
<show-example example="../ng2-example/index.html?fromDocs=true&example=from-rich-component"
              jsfile="../ng2-example/app/from-rich.component.ts"
              html="../ng2-example/app/from-rich.component.html"></show-example>

<note>The full <a href="https://github.com/ceolter/ag-grid-ng2-example">ag-grid-ng2-example</a> repo shows many more examples for rendering, including grouped rows, full width renderers
    and so on, as well as examples on using Angular Components with both CellEditors and Filters</note>

<?php include '../documentation-main/documentation_footer.php';?>

