<?php if (!isFrameworkAll()) { ?>
    <h2 id="implementing-the-vuejs-datagrid"><img style="vertical-align: middle" src="/images/vue_small.png" height="25px"/> Next Steps</h2>
<?php } ?>

<h2 id="parent_child">Child to Parent Communication</h2>

<p>There are a variety of ways to manage component communication in Angular (shared service, local variables etc), but you
    often need a simple way to let a "parent" component know that something has happened on a "child" component. In this case
    the simplest route is to use the <code>gridOptions.context</code> to hold a reference to the parent, which the child can then access.</p>

<pre>
<span class="codeComment">// in the parent component - the component that hosts ag-grid-angular and specifies which angular components to use in the grid</span>
beforeMount() {
    this.gridOptions = {
        context: {
            componentParent: this
        }
    };
    this.createRowData();
    this.createColumnDefs();
},

<span class="codeComment">// in the child component - the Vue components created dynamically in the grid</span>
<span class="codeComment">// the parent component can then be accessed as follows:</span>
this.params.context.componentParent
</pre>

<p>Note that although we've used <code>componentParent</code> as the property name here it can be anything - the main
    point is that you can use the <code>context</code> mechanism to share information between the components.</p>

<p>The <span style="font-style: italic">"A Simple Example, using cell renderer's created from VueJS Components"</span> above illustrates this in the Child/Parent column:</p>
<ul>
    <li><a href="https://github.com/ag-grid/ag-grid-vue-example/blob/master/src/dynamic-component-example/DynamicComponentExample.vue" target="_blank" class="fa fa-external-link"> Parent & Child Component</a></li>
</ul>

<h3 id="building-bundling">Building & Bundling</h3>
<p>There are many ways to build and/or bundle an VueJS Application. We provide fully working examples using a simplified
    Webpack build as part of the <a href="https://github.com/ag-grid/ag-grid-vue-example">ag-grid-vue-example</a> on GitHub.</p>

<?php
$framework_enterprise = 'import Vue from "vue";
import "../node_modules/ag-grid/dist/styles/ag-grid.css";
import "../node_modules/ag-grid/dist/styles/theme-fresh.css";

// need if you use ag-grid enterprise features
import "ag-grid-enterprise/main";

...other dependencies';

include '../javascript-grid-getting-started/ag-grid-enterprise-framework.php'
?>

<h2 id="cell-rendering-cell-editing-using-vuej">Cell Rendering & Cell Editing using VueJS</h2>

<p>
    It is possible to build
    <a href="../javascript-grid-cell-rendering-components/#vue2CellRendering">cell renderer's</a>,
    <a href="../javascript-grid-cell-editing/#vue2CellEditing">cell editors</a> and
    <a href="../javascript-grid-filtering/#vue2Filtering">filters</a> using VueJS. Doing each of these
    is explained in the section on each.
</p>

<h2 id="next-steps">Next Steps...</h2>

<p>
    Now you can go to <a href="../javascript-grid-interfacing-overview/">interfacing</a>
    to learn about accessing all the features of the grid.
</p>

