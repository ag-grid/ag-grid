<h1 id="reactCellEditing">
    <img src="../images/react_large.png" style="width: 60px;"/>
    React Cell Editing
</h1>

<p>
    It is possible to provide React cell editors's for ag-Grid to use if you are are using the
    React version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<h3 id="react-props"><img src="../images/react_large.png" style="width: 20px;"/> React Props</h3>

<p>
    The React component will get the 'Cell Editor Params' as described above as its React Props.
    Therefore you can access all the parameters as React Props.

<h3 id="react-methods-lifecycle"><img src="../images/react_large.png" style="width: 20px;"/> React Methods / Lifecycle
</h3>

<p>
    All of the methods in the <code>ICellEditor</code> interface described above are applicable
    to the React Component with the following exceptions:
<ul>
    <li><i>init()</i> is not used. Instead use the React props passed to your Component.</li>
    <li><i>destroy()</i> is not used. Instead use the React <i>componentWillUnmount()</i> method for
        any cleanup you need to do.
    </li>
    <li><i>getGui()</i> is not used. Instead do normal React magic in your <i>render()</i> method..</li>
</ul>

<p>
    All of the other methods (<i>isPopup(), isCancelBeforeStart(), isCancelAfterEnd(), afterGuiAttached()</i> etc)
    should be put onto your React component and will work as normal.
</p>

<h1 id="example-cell-editing-using-react-components">Example: Cell Editing using React Components</h1>
<p>
    Using React Components in the Cell Editors, illustrating keyboard events, rendering, validation and lifecycle
    events.
</p>
<?= example('React Editor Components', 'component-editor', 'generated', array('enterprise' => false, "exampleHeight" => 370, 'onlyShow' => 'react', 'extras' => array("bootstrap"))) ?>
