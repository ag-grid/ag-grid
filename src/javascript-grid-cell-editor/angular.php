<h2>
    Angular Cell Editing
</h2>

<p>
    It is possible to provide Angular cell editors's for ag-Grid to use if you are are using the
    Angular version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<p>Your Angular components need to implement <code>AgEditorComponent</code>.
    The ag Framework expects to find the <code>agInit</code> method on the created component, and uses it to supply the
    cell <code>params</code>.</p>

<h3 id="angular-methods-lifecycle"> Angular Methods / Lifecycle</h3>

<p>
    All of the methods in the <code>ICellEditor</code> interface described above are applicable
    to the Angular Component with the following exceptions:
</p>
<ul class="content">
    <li><code>init()</code> is not used. Instead implement the <code>agInit</code> method (on the
        <code>AgRendererComponent</code> interface).
    </li>
    <li><code>destroy()</code> is not used. Instead implement the Angular<code>OnDestroy</code> interface
        (<code>ngOnDestroy</code>) for
        any cleanup you need to do.
    </li>
    <li><code>getGui()</code> is not used. Instead do normal Angular magic in your Component via the Angular template.</li>
    <li><code>afterGuiAttached()</code> is not used. Instead implement <code>AfterViewInit</code>
        (<code>ngAfterViewInit</code>) for any post Gui setup (ie to focus on an element).
    </li>
</ul>

<p>
    All of the other methods (<code>isPopup(), getValue(), isCancelBeforeStart(), isCancelAfterEnd()</code> etc)
    should be put onto your Angular component and will work as normal.
</p>

<h3>Example: Cell Editing using Angular Components</h3>

<p>
    Using Angular Components in the Cell Editors, illustrating keyboard events, rendering, validation and lifecycle
    events.
</p>

<?= example('Angular Editor Components', 'component-editor', 'generated', array("enterprise" => 1, "exampleHeight" => 370, 'onlyShow' => 'angular', 'extras' => array("bootstrap"))) ?>