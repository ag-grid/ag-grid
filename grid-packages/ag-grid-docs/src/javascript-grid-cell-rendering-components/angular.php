<!-- Angular from here -->
<h2>
    Angular Cell Render Components
</h2>

<p>
    It is possible to provide Angular cell renderers for ag-Grid to use if you are are using the
    Angular version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<note>
    Note: Here we are referring to Angular versions 2 and up. This section is not relevant to AngularJS 1.
</note>

<h3>Example: Rendering using Angular Components</h3>

<?= example('Simple Dynamic Component', 'dynamic-components', 'generated', array('enterprise' => false, 'onlyShow' => 'angular', 'extras' => array('fontawesome', "bootstrap"))) ?>

<h3>Angular Methods / Lifecycle</h3>

<p>
    Your Angular components need to implement <code>AgRendererComponent</code>.
    The ag Framework expects to find the <code>agInit</code> method on the created component, and uses it to supply the
    cell <code>params</code>.
<p>

<p>
    All of the methods in the <code>ICellRenderer</code> interface described above are applicable
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
</ul>

<h3>Handling Refresh</h3>

<p>
    To handle refresh, implement logic inside the <code>refresh()</code> method inside your component and return true.
    If you do not want to handle refresh, just return false from the refresh method (which will tell the grid you do
    not handle refresh and your component will be destroyed and recreated if the underlying data changes).
</p>

<h3>Example: Rendering using more complex Angular Components</h3>

<p>
    Using more complex Angular Components in the Cell Renderers - specifically how you can use nested <code>NgModule</code>'s
    within the grid.
</p>
<?= example('Richer Dynamic Components', 'angular-rich-dynamic', 'angular', array("exampleHeight" => 370, "showResult" => true, "extras" => array("bootstrap"))); ?>
