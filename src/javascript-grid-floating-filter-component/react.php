<!-- React from here -->
<h2 id="react">
    <img src="../images/react_large.png" style="width: 60px;"/>
    React Floating Filters
</h2>

<p>
    It is possible to provide React floating filter for ag-Grid to use if you are are using the
    React version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<p>
    The below example show how to create a custom floating filter reusing the out of the box number filter with React.
</p>

<?= example('React Floating Filter Component', 'floating-filter-component', 'generated', array('enterprise' => false, "exampleHeight" => 370, 'onlyShow' => 'react', 'extras' => array("bootstrap"))) ?>
