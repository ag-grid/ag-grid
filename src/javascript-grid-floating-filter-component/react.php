<!-- React from here -->
<h2 id="react">
    <img src="../images/react_large.png" style="width: 60px;"/>
    React Floating Filters
</h2>

<div class="note" style="margin-bottom: 20px">
    <img align="left" src="../images/note.png" style="margin-right: 10px;"/>
    <p>This section explains how to utilise ag-Grid floatingFilter using React. You should read about how
        <a href="../javascript-grid-floating-filter-component/">Floating filter works in ag-Grid</a> first before trying to
        understand this section.</p>
</div>

<p id="react-floating-filter-example">
    See example below on how to create a custom floating filter reusing the out of the box number filter with React
</p>

<?= example('React Floating Filter Component', 'floating-filter-component', 'generated', array('enterprise' => false, "exampleHeight" => 370, 'onlyShow' => 'react', 'extras' => array("bootstrap"))) ?>

<note>The full <a href="https://github.com/ag-grid/ag-grid-react-example">ag-grid-react-example</a> repo shows many
    more examples for rendering, including grouped rows, full width renderer's
    and so on, as well as examples on using React Components with both Cell Editors and Filters
</note>