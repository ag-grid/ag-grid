<?php
$pageTitle = "Vue Markup";
$pageDescription = "Worlds leading, feature rich Vue Grid. Designed to integrate seamlessly with Vue to deliver filtering, grouping, aggregation, pivoting and much more with the performance that you expect. Version 19 is out now.";
$pageKeywords = "VueJS Grid, Vue Grid, Vue Table";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>


    <h1 id="implementing-the-vuejs-datagrid">
    Vue Markup
    </h1>

<p>You can also define your grid column definition decoratively if you would prefer.</p>

<p>You declare the grid as normal:</p>

<snippet lang="html">
&lt;ag-grid-vue
        class="ag-theme-balham"
        style="width: 700px; height: 400px;"
        :rowData="rowData"
        ...rest of definition
</snippet>

<p>And within this component you can then define your column definitions:</p>

<snippet lang="html">
&lt;ag-grid-vue
    ...rest of definition
&gt;
    &lt;ag-grid-column headerName="IT Skills"&gt;
        &lt;ag-grid-column field="skills" :width="120" suppressSorting
                        cellRendererFramework="SkillsCellRenderer"
                        :menuTabs="['filterMenuTab']"&gt;
        &lt;/ag-grid-column&gt;
        &lt;ag-grid-column field="proficiency" :width="135"
                        cellRendererFramework="ProficiencyCellRenderer"
                        :menuTabs="['filterMenuTab']""&gt;
        &lt;/ag-grid-column&gt;
    &lt;/ag-grid-column&gt;
&lt;/ag-grid-vue&gt;
</snippet>

<p>In this example we're defining a grouped column with <code>IT Skills</code> having two child columns <code>Skills and
        Proficiency</code></p>

<p>Not that anything other than a string value will need to be bound (i.e. <code>:width="120"</code>) as Vue will
    default to providing values as Strings.</p>

<p>A full working example of defining a grid declaratively can be found in the <a
            href="https://github.com/seanlandsman/ag-grid-vue-playground">Vue Playground Repo.</a></p>


<?php include '../documentation-main/documentation_footer.php'; ?>
