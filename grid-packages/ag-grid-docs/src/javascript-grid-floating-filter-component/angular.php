<h2>Angular Floating Filters</h2>

<p>
    It is possible to provide an Angular floating filter for ag-Grid to use if you are are using the
    Angular version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<p>
    The below example shows how to create a custom floating filter re-using the out-of-the-box Number filter with Angular.
</p>

<?= grid_example('Angular Floating Filter Component', 'floating-filter-component', 'generated', ['enterprise' => false, 'exampleHeight' => 370, 'onlyShow' => 'angular', 'extras' => ['bootstrap'], 'reactFunctional' => true]) ?>
