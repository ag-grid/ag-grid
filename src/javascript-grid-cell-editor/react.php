<h2>
    React Cell Editing
</h2>

<p>
    It is possible to provide React cell editorss for ag-Grid to use if you are are using the
    React version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<h3> React Props</h3>

<p>
    The React component will get the 'Cell Editor Params' as described above as its React Props.
    Therefore you can access all the parameters as React Props.
</p>

<h3> React Methods / Lifecycle </h3>

<p>
    All of the methods in the <code>ICellEditor</code> interface described above are applicable
    to the React Component with the following exceptions:
</p>

<ul class="content">
    <li><code>init()</code> is not used. Instead use the React props passed to your Component.</li>
    <li><code>destroy()</code> is not used. Instead use the React <code>componentWillUnmount()</code> method for
        any cleanup you need to do.
    </li>
    <li><code>getGui()</code> is not used. Instead do normal React magic in your <code>render()</code> method.</li>
</ul>

<p>
    All of the other methods (<code>isPopup(), isCancelBeforeStart(), isCancelAfterEnd(), afterGuiAttached()</code> etc)
    should be put onto your React component and will work as normal.
</p>

<h3>Example: Cell Editing using React Components</h3>
<p> Using React Components in the Cell Editors, illustrating keyboard events, rendering, validation and lifecycle events.  </p>

<?= example('React Editor Components', 'component-editor', 'generated', array('enterprise' => 1, "exampleHeight" => 370, 'onlyShow' => 'react', 'extras' => array("bootstrap"))) ?>
