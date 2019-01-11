<?php
$pageTitle = "VueJS Vuex, Unidirectional data flow and Memory Footprint";
$pageDescription = "Worlds leading, feature rich Vue Grid. Designed to integrate seamlessly with Vue to deliver filtering, grouping, aggregation, pivoting and much more with the performance that you expect. Version 19 is out now.";
$pageKeyboards = "VueJS vuex data flow memory";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h1>
        Memory Footprint, Vuex & Unidirectional Data Flow
    </h1>

    <p class="lead">
        This page details how a reduced footprint as well as unidirectional data flow can be achieved when using ag-Grid
        and VueJs.
    </p>

    <h2 id="vuejs-memory">Memory Footprint</h2>

    <p>A large part of Vue's magic comes from it's reactivity and it achieves this by observing every attribute on a
        component.</p>

    <p>This is great and is what you'll want most of the time, but when it comes to large data sets - i.e. row data -
        it's often more performant memory wise to detach from this reactivity.</p>

    <p>Take for example a grid that has 100,000 rows with 10 columns - the default behaviour will be that each row
        becomes reactive, which can become a significant memory footprint.</p>

    <p>There are two ways in which you can detach row data from Vue's reactivity:
    <ul>
        <li>Wrap your row data with <code>Object.freeze</code></li>
        <li>Assign/Create the row data in the <code>created</code> hook</li>
    </ul>
    </p>

    <p>Doing either of these will ensure that Vue does not monitor the row data, which can result in a much reduced memory footprint.</p>

    <p>Note that this is only worth considering if you have a significant amount of row data.</p>

    <p>The trade off here is that you'll need a mechanism to update your component if the grid data changes - we'll cover that next.</p>

    <h2 id="data-flow">Unidirectional Data Flow / Vuex</h2>

    <p>A key tenet of Vue is the idea of unidirectional data flow - the idea that data changes flow downwards.  The problem when using the grid
    is that the grid maintains it's own state and will modify data based on certain events (ie. if a user edits a cell).</p>

    <p>If you pass row data down directly then both the grid and the parent component will point to the same data.</p>

    <p>If a user edits row data then these changes are actually made on the parent components data, which breaks the unidirectional data flow.</p>

    <p>To prevent this behaviour you should copy your data before passing it down to the grid - for example:</p>

<snippet>
&lt;ag-grid-vue style="width: 600px; height: 150px;"
             class="ag-theme-balham"
             v-model="rowData"
             ..other bindings/attributes

mounted() {
    const rowData = this.$store.getters.rowData;  // get the data from our Vuex data store
    this.rowData = Object.freeze(                 // reduce memory footprint - see above
        rowData.map(row => {                      // copy to detach from the stores copy
            return {
                ...row
            }
        })
    )
}
</snippet>

    <p>By doing this the grid and component will have separate their own copies of the data. This is especially important when
    using something like <code>Vuex</code>.</p>

    <p>Now that we've frozen and copied our data, how do we update the parent component if the grid's data changes? We'll cover
    this in the next section.</p>

    <p>In the grid configuration above we made use of <code>v-model</code> - what this will allow us to get the row data when grid data changes:</p>
<snippet>
&lt;ag-grid-vue style="width: 600px; height: 150px;"
             class="ag-theme-balham"
             v-model="rowData"
             @data-model-changed="dataModelChanged"
             ..other bindings/attributes
methods: {
    dataModelChanged(rowData) {
        this.$store.dispatch('updateRowData', rowData);
    }
}
</snippet>

    <img src="vuex.png" alt="Data flow" />

    <p>A full Vuex working example can be find in our <a href="https://github.com/seanlandsman/ag-grid-vue-vuex">ag-Grid Vuex</a> repo.</p>
</div>

    <?php include '../documentation-main/documentation_footer.php'; ?>
