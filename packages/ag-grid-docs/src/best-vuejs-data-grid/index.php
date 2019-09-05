<?php
$pageTitle = "VueJS Datagrid";
$pageDescription = "Worlds leading, feature rich Vue Grid. Designed to integrate seamlessly with Vue to deliver filtering, grouping, aggregation, pivoting and much more with the performance that you expect. Version 19 is out now.";
$pageKeyboards = "VueJS Grid, Vue Grid, Vue Table";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>


    <h1 id="implementing-the-vuejs-datagrid">
    Vue Grid | ag-Grid
    </h1>

<h2>Binding Row Data with <code>v-model</code></h2>

<p>You can bind row data in the usual way with <code>:rowData="rowData"</code>, but you can also do so by using <code>v-model</code>.</p>

<p>The advantage of doing so is that this will facilitate unidirectional data flow (see next section). The main difference over normal
binding is that any data changes will emit an <code>data-model-changed</code> event which will have the current row data as a parameter.</p>

<p>Please refer to the section below for a practical application of this binding.</p>

<h2>“$attrs is readonly”,“$listeners is readonly”,“Avoid mutating a prop directly”</h2>

<p>Despite the wording of this warning, the issue is almost always due to multiple versions of <code>Vue</code> being
    instantiated at runtime.</p>
<p>This can occur in any number of ways, but the solution is simple - update (or create) <code>webpack.config.js</code>:
</p>

<snippet lang="js">
resolve: {
        alias: {
                'vue$': path.resolve(__dirname, 'node_modules/vue/dist/vue.js')
        }
}
</snippet>

<p>Here we're telling Webpack to use the full build. You may need to change the value according to the build you
    need.</p>

<p>Please refer to the <a href="https://vuejs.org/v2/guide/installation.html#Explanation-of-Different-Builds">Vue
        Documentation</a>
    for more information on the different builds available.</p>

<p>The longer term fix is something the Vue team are contemplating - please refer to this
    <a href="https://github.com/vuejs/vue/issues/8278">GitHub Issue</a> for more information.</p>

<h2>Example Repos</h2>

<p>The following Vue repos are available, with each demonstrating a different feature:
<ul>
    <li><a href="https://github.com/ag-grid/ag-grid-vue-example">Main Example</a></li>
    <li><a href="https://github.com/seanlandsman/ag-grid-vue-vuex">Vuex</a></li>
    <li><a href="https://github.com/seanlandsman/ag-grid-vue-i18n">i18n</a></li>
    <li><a href="https://github.com/seanlandsman/ag-grid-vue-routing">Routing</a></li>
    <li><a href="https://github.com/seanlandsman/ag-grid-vue-typescript">Typescript</a></li>
    <li><a href="https://github.com/seanlandsman/ag-grid-vue-umd">UMD</a></li>
    <li><a href="https://github.com/seanlandsman/ag-grid-vue-playground">Playground</a>: Declarative, Auto Refresh and Model Driven Examples</li>
</ul></p>

<?php include '../documentation-main/documentation_footer.php'; ?>
