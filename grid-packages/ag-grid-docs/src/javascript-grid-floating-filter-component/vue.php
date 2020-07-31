<h2>Vue Floating Filters</h2>

<p>
    It is possible to provide a Vue floating filter for ag-Grid to use if you are are using the
    Vue version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<p>
    The below example shows how to create a custom floating filter re-using the out-of-the-box Number filter with Vue.
</p>

<?= grid_example('Vue Floating Filter Component', 'floating-filter-component', 'generated', ['enterprise' => false, 'exampleHeight' => 370, 'onlyShow' => 'vue', 'extras' => ['bootstrap'], 'reactFunctional' => true]) ?>
