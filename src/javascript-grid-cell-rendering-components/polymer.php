<h2 id="polymerCellRendering">
    <img src="../images/polymer-large.png" style="width: 60px;"/>
    Polymer Cell Rendering
</h2>

<p>
    It is possible to provide Polymer cell renderers for ag-Grid to use if you are are using the
    Polymer version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<h3 id="example-rendering-using-polymer-components">Example: Rendering using Polymer Components</h3>
<p>
    Using Polymer Components in the Cell Renderers
</p>
<?= example('Simple Dynamic Component', 'polymer-dynamic', 'polymer', array("exampleHeight" => 460)) ?>

<h3 id="polymer-methods-lifecycle"><img src="../images/polymer-large.png" style="width: 20px;"/> Polymer Methods /
    Lifecycle</h3>

<p>
    All of the methods in the <code>ICellRenderer</code> interface described above are applicable
    to the Polymer Component with the following exceptions:
<ul>
    <li><i>init()</i> is not used. Instead implement the <code>agInit</code> method.
    </li>
    <li><i>getGui()</i> is not used. Instead do normal Polymer magic in your Component via the Polymer template.</li>
</ul>

<h3 id="handling-refresh"><img src="../images/polymer-large.png" style="width: 20px;"/> Handling Refresh</h3>

<p>
    To handle refresh, implement logic inside the <code>refresh()</code> method inside your component and return true.
    If you do not want to handle refresh, just return false from the refresh method (which will tell the grid you do
    not handle refresh and your component will be destroyed and recreated if the underlying data changes).
</p>

<note>The full <a href="https://github.com/ag-grid/ag-grid-polymer-example">ag-grid-polymer-example</a> repo shows many
    more examples for rendering, including grouped rows, full width renderers
    and so on, as well as examples on using Polymer Components with both Cell Editors and Filters
</note>