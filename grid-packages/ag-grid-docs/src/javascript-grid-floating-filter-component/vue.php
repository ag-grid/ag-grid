<!-- vue from here -->
<h2> Vue Floating Filters </h2>

<p>
    It is possible to provide a Vue floating filter for ag-Grid to use if you are are using the
    Vue version of ag-Grid. See <a href="../javascript-grid-components/#registering-framework-components">
    registering framework components</a> for how to register framework components.
</p>

<p>
    The below example show how to create a custom floating filter reusing the out of the box number filter with Vue.
</p>

<?= example('Vue Floating Filter Component', 'floating-filter-component', 'generated', array('enterprise' => false, "exampleHeight" => 370, "processVue" => true, 'onlyShow' => 'vue', 'extras' => array("bootstrap"))) ?>
