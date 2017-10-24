<?php
$key = "Tree Data";
$pageTitle = "ag-Grid Tree Data";
$pageDescription = "ag-Grid Tree Data";
$pageKeyboards = "ag-Grid Tree Data";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h1 class="first-h1"><img src="../images/enterprise_50.png" title="Enterprise Feature"/> Tree Data</h1>

    <p>
        Use Tree Data to display data that has parent / child relationships where the parent / child relationships are
        provided as part of the data. For example, a folder can contain zero or more files and other folders.
    </p>

    </p>
        This section introduces simple ways to work with Tree Data before covering more advanced use cases.
    </p>

    <note>
        How Tree Data is managed in ag-Grid was changed in ag-Grid v14. This page presents the new way of working with Tree Data.
        The old way was part of ag-Grid free, the new way is part of ag-Grid Enterprise. The old way is deprecated but you
        can still use it, but we will not be enhancing it. For documentation on the older version of the grid prior to v14
        see <a href="../javascript-grid-tree">Tree Data (Legacy)</a>.
    </note>

    <h2 id="tree-data-mode">Tree Data Mode</h2>

    <p>
        In order to set the grid to work with Tree Data, simply enable Tree Data mode via the Grid Options using:
        <code>gridOptions.treeData = true</code>.
    </p>

    <h2 id="supplying-tree-data">Supplying Tree Data</h2>

    <p>
       When providing Tree Data to the grid, it should be supplied as an array of objects in the same way as non grouped
       row data:
    <p>

<snippet>
    var rowData = [
    {orgHierarchy: ['Erica'], jobTitle: "CEO", employmentType: "Permanent"},
    {orgHierarchy: ['Erica', 'Malcolm'], jobTitle: "VP", employmentType: "Permanent"}
    ...
]</snippet>

    <p>
       However Tree Data differs in that it captures a path (or hierarchy) for each object. In the example above you will
       notice there is an object property 'orgHierarchy' which represents a path for each entry where 'Erica' is a parent
       of 'Malcolm'.
    </p>
    <p>
        There is nothing special about the property name 'orgHierarchy' or the data type <code>string[]</code>.
        For example the same hierarchical information could be represented as follows:
    </p>

    <snippet>
var rowData = [
    {path: "Erica", jobTitle: "CEO", employmentType: "Permanent"},
    {path: "Erica/Malcolm", jobTitle: "VP", employmentType: "Permanent"}
    ...
]</snippet>

    <p>
        All the grid requires is that you implement the <code>gridOptions.getDataPath(data)</code> callback and return a
        <code>string[]</code>. The following snippet demonstrates how this is done for both sample data formats above:
    </p>

    <snippet>
getDataPath: function(data) {
    return data.orgHierarchy; // orgHierarchy: ['Erica', 'Malcolm']
}

getDataPath: function(data) {
    return data.path.split('/'); // path: "Erica/Malcolm"
}
</snippet>

    <h2 id="configuring-a-group-column">Configuring Group Column</h2>

    <p>
        There are two ways to configure the Group Column:
    </p>

    <ul>
        <li><b>Auto Column Group</b> -  this is automatically selected by the grid when in Tree Data mode, however
        you can override the defaults. </li>
        <li><b>Custom Column Group</b> - you can provide your own custom column group definition which gives allows
        more control over how the Group Column is displayed.</li>
    </ul>

    <h3>Auto Column Group</h3>

    <p>
        When the grid is working with Tree Data there is no need to explicitly specify a Column Group as the grid will
        use the  <a href="../javascript-grid-grouping/#auto-column-group">Auto Column Group</a>. However you will
        probably want to override some of the defaults as shown below:
    </p>

<snippet>
autoGroupColumnDef: {
    headerName: "My Group",
    width: 300,
    cellRendererParams: {
        suppressCount: true
    }
}
</snippet>

    <h3>Custom Column Group</h3>

    <p>
        As noted above, providing your own Custom Column Group has the advantage of giving you full control over the
        presentation of the Column Group, however it is not as convenient as using the default Auto Column Group.
    </p>

    <p>
        For details on how you can provide your own Custom Group Column see: <a href="../javascript-grid-grouping/#specifying-group-columns">Specifying Group Columns</a>.
    </p>


    <note>
        It is <b>not</b> possible to have multiple group display columns for tree data like you do for row grouping.
        When doing tree data, you should only have one column for display the group.
    </note>

    <h2>Example - Organisational Hierarchy</h2>

    <p>
       The following example combines all the steps above to show a simplified organisational hierarchy:
    </p>



    <?= example('Org Hierarchy', 'org-hierarchy', 'generated', array("enterprise" => 1, "exampleHeight" => 375)) ?>

    <h2 id="filler-nodes">Filler Groups</h2>

    <p>
        It is not necessary to include entries for each level in the path if data is not required at group levels as shown below:
    </p>

<snippet>
// all path levels provided
var rowData = [
    {filePath: ['Documents']},
    {filePath: ['Documents', 'txt']},
    {filePath: ['Documents', 'txt', 'notes.txt'], dateModified: "21 May 2017, 13:50", size: "14 KB"}
    ...
    ]

    // only leaf level provided
    var rowData = [
    {filePath: ['Documents', 'txt', 'notes.txt'], dateModified: "21 May 2017, 13:50", size: "14 KB"}
    ...
]</snippet>

    <p>
        The second variation above leaves out row data entries for 'Documents' and 'txt' nodes, in this case the grid
        will create <i>Filler Groups</i> for these.
    </p>

    <p>
        This following example includes the column 'Group Type' to highlight which nodes are 'provided' in the row data and
        which are generated by the grid as a 'filler' group:
    </p>

    <?= example('Filler Nodes', 'filler-nodes', 'generated', array("enterprise" => 1, "exampleHeight" => 300)) ?>

    <note>
        As <i>Filler Groups</i> are generated by the grid they will not contain a <code>data</code> property on the <code>RowNode</code>.
        This could be a limitation if you wanted to provide an 'id' for each group even when there is no data displayed at group levels.
    </note>

    <h2 id="tree-data-aggregation">Tree Data Aggregation</h2>

    <p>
        When using Tree Data, columns defined with an aggregation function will always perform aggregations on the group nodes.
        This means any supplied group data will be ignored in favour of the aggregated values.
    </p>
    <p>
        However if there are no child nodes to aggregate it will default to the provided value in the row data.
    </p>
    <p>
        The <a href="#example-file-browser">File Browser</a> example below demonstrates aggregation
        on the 'size' column.
    </p>

    <p>
        Also you can refer to the section on <a href="../javascript-grid-aggregation/">Aggregation</a> more details.
    </p>

    <h2 id="tree-data-filtering">Tree Data Filtering</h2>

    <p>
        Other than the <a href="../javascript-grid-filter-set/">Set Filter</a>, filtering works the same way
        with Tree Data.
    </p>

    <p>
        When using Tree Data the Set Filter will contain a list all unique values across each level of the group hierarchy.
    </p>

    <p>
        Also note that as filtering is performed across all group levels, a group will be included if:
        <dl style="margin-left: 25px;">
            <dd>a) it has any children, or</dd>
            <dd>b) it's data passes the filter</dd>
        </dl>
    </p>

    <p>
        The <a href="#example-file-browser">File Browser</a> example below demonstrates the Set Filter works with Tree Data.
    </p>


    <h2>Example - File Browser</h2>

    <p>
        The following example presents a more complex example which includes Aggregation and Filtering:
    </p>

    <ul>
        <li><b>'Add New Group' Button</b> - will add a new group under Music.</li>
        <li><b>'Move Selected to stuff' Button</b> - will move any non parent groups into the 'stuff' folder.</li>
        <li><b>'Remove Selected' Button</b> - will remove selected group along with children.</li>
        <li><b>'Files' Filter</b> - you can filter group and leaf names across the entire file tree.</li>
        <li><b>'Size' Aggregation</b> - as you move selected items into 'stuff' you'll notice updated folder sizes.</li>
    </ul>

    <?= example('File Browser', 'file-browser', 'generated', array('enterprise' => true, 'extras' => array('fontawesome')) ) ?>

    <h2 id="only-one-column">Pivot and Row Grouping with Tree Data</h2>

    <p>
        It is not possible to do pivot or row grouping while using tree data. This means all the functions
        related to pivot (eg colDef.pivot, or pivot in the tool panel) and row grouping (eg colDef.rowGroup, or
        row group in the tool panel) will be disabled.
    </p>

    <h2 id="child-counts">Child Counts</h2>

    <p>
        If you are showing child counts for the groups, then the child count is a count of all children and grand children.
        This is different to <a href="../javascript-grid-grouping/">Row Grouping</a> where only leaf levels are counted,
        in tree data, all group children are also counted.
    </p>

    <h2 id="selection">Selection</h2>

    <p>
        There are currently a few difference with selection of groups when using Tree Data:

        <ul>
            <li><code>gridOptions.groupSelectsChildren</code> is not supported.</li>
            <li><code>cellRendererParams.checkbox = true</code> should be used instead of <code>gridOptions.rowSelection</code>.</li>
            <li><code>gridOptions.api.getSelectedNodes()</code> does not return 'Filler' groups.</li>
        </ul>

    </p>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
