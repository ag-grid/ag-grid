<h1 id="ng2CellEditing">
    <img src="../images/angular2_large.png" style="width: 60px;"/>
    Angular Cell Editing
</h1>

<p>
    It is possible to provide a Angular cell editors's for ag-Grid to use if you are are using the
    Angular version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<p>Your Angular components need to implement <code>AgEditorComponent</code>.
    The ag Framework expects to find the <code>agInit</code> method on the created component, and uses it to supply the
    cell <code>params</code>.</p>

<h3 id="angular-methods-lifecycle"><img src="../images/angular2_large.png" style="width: 20px;"/> Angular Methods /
    Lifecycle</h3>

<p>
    All of the methods in the <code>ICellEditor</code> interface described above are applicable
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
    <li><i>afterGuiAttached()</i> is not used. Instead implement <code>AfterViewInit</code>
        (<code>ngAfterViewInit</code>) for any post Gui setup (ie to focus on an element).
    </li>
</ul>

<p>
    All of the other methods (<i>isPopup(), getValue(), isCancelBeforeStart(), isCancelAfterEnd()</i> etc)
    should be put onto your Angular component and will work as normal.
</p>

<h1 id="example-cell-editing-using-angular-components">Example: Cell Editing using Angular Components</h1>
<p>
    Using Angular Components in the Cell Editors, illustrating keyboard events, rendering, validation and lifecycle
    events.
</p>

<?= example('Angular Editor Components', 'component-editor', 'generated', array('enterprise' => false, "exampleHeight" => 370, 'onlyShow' => 'angular', 'extras' => array("bootstrap"))) ?>