<?php
$key = "Text Filter";
$pageTitle = "JavaScript Grid Text Filter";
$pageDescription = "ag-Grid comes with a text filter. This sections explains how to use the text filter.";
$pageKeyboards = "ag-Grid Text Filter";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


    <h2 id="textFilter">Text Filter</h2>

<p>
    In addition to implementing the IFilter interface, the text filter also provides the following
    API methods:
<ul>
    <li>getType(): Gets the type.</li>
    <li>setType(string): Sets the type.</li>
    <li>getFilter(): Gets the filter text.</li>
    <li>setFilter(string): Sets the filter text.</li>
</ul>
</p>
<p>
    The available types for the text filter are the strings: 'contains', 'equals', 'notEquals', 'startsWith' and 'endsWith'.
</p>
<p>
    So for example, you can set the text of the 'name' filter to start with 'bob' as follows:
<pre>var nameFilter = api.getFilterInstance('name');
nameFilter.setType('startsWith');
nameFilter.setFilter('bob');</pre>
</p>

<p>
    Or alternatively, you could just use the <i>setModel()</i> method as part of the main <i>IFilter</i>
    interface as follows:
<pre>var nameFilter = api.getFilterInstance('name');
var model = {type: 'startsWith', filter: 'bob'};
nameFilter.setModel(model);</pre>
</p>

<?php include '../documentation-main/documentation_footer.php';?>
