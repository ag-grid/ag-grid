    <h2 id="polymerCellEditing">
        <img src="../images/polymer-large.png" style="width: 60px;"/>
        Polymer Cell Editing
    </h2>

    <p>
        It is possible to provide a Polymer cell editors's for ag-Grid to use if you are are using the
        Polymer version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
        registering framework components</a> for how to register framework components.
    </p>

    <h3 id="polymer-parameters"><img src="../images/polymer-large.png" style="width: 20px;"/> Polymer Parameters</h3>

    <p>The ag Framework expects to find the <code>agInit</code> method on the created component, and uses it to supply the cell <code>params</code>.</p>

    <h3 id="polymer-methods-lifecycle"><img src="../images/polymer-large.png" style="width: 20px;"/> Polymer Methods / Lifecycle</h3>

    <p>
        All of the methods in the <code>ICellEditor</code> interface described above are applicable
        to the Polymer Component with the following exceptions:
    <ul>
        <li><i>init()</i> is not used. Instead implement the <code>agInit</code> method.</li>
        <li><i>getGui()</i> is not used. Instead do normal Polymer magic in your Component via the Polymer template.</li>
    </ul>

    <p>
        All of the other methods (<i>isPopup(), getValue(), destroy(), afterGuiAttached(), isCancelBeforeStart(), isCancelAfterEnd()</i> etc)
        should be put onto your Polymer component and will work as normal.
    </p>

    <h1 id="example-cell-editing-using-polymer-components">Example: Cell Editing using Polymer Components</h1>
    <p>
        Using Polymer Components in the Cell Editors, illustrating keyboard events, rendering, validation and lifecycle events.
    </p>
    <?= example('Polymer Editor Components', 'polymer-editor', 'polymer', array("exampleHeight" => 370, "showResult" => true)); ?>
