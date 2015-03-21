<?php
$pageTitle = "Grouping";
$pageDescription = "Angular Grid Grouping";
$pageKeyboards = "Angular Grid Grouping";
include '../documentation_header.php';
?>

<div>

    <h2>Grouping and Aggregation</h2>

    To do a simple grouping, provide the keys you want to group by into the grid options.
    There is no limit on the number of keys that can be used.
    Grouping can be done on any attribute of the rows, grouping does not have to use
    an attribute that is used by a column.

    <p/>

    The grid option group parameters are as follows:
    <table class="table">
        <tr>
            <th>Attribute</th>
            <th>Description</th>
        </tr>
        <tr>
            <th>groupKeys</th>
            <td>An array of 1 or more strings, each entry an item to group by. Leave blank, or empty array, for no grouping.</td>
        </tr>
        <tr>
            <th>groupUseEntireRow</th>
            <td>If grouping, set to true or false (default is false). If true, group row will use all columns spanning the entire
                width of the table. If false, only the first column will be used to display the group, and the remaining
                columns will render as normal. If no aggregation function (groupAggFunction) is defined, then the additional cells
                in the group row will be blank. If an aggregation function is defined, then the result of the aggregation will be
                used for values in the remaining cells. </td>
        </tr>
        <tr>
            <th>groupInnerCellRenderer</th>
            <td>If grouping, allows custom rendering of the group cell. Use this if you are not  happy with the default
                presentation of the group.</td>
        </tr>
        <tr>
            <th>groupDefaultExpanded</th>
            <td>If grouping, set to true or false (default is false). If true, when data is loaded, groups will be expanded by default.</td>
        </tr>
        <tr>
            <th>groupAggFunction</th>
            <td>If grouping, used to create aggregates. The aggregation function takes an array of rows and should return
                one row that's an aggregate of the passed rows. For example, if each row has a field called 'price', and
                you want the total price, then return an object with the total price in a field 'price'. This will then
                get rendered in the price column on in the group row.
            </td>
        </tr>
    </table>

    <div class="bigTitle">Grouping Example</div>

    Below shows a simple grouping example, using one attribute to group, the entire row is used and no aggregation function.

    <show-example example="example1"></show-example>

    <div class="bigTitle">Grouping with Aggregation</div>

    Below shows a more complex example, using aggregation to sum the number of medals for each country.

    <show-example example="example2"></show-example>

    <div class="bigTitle">Multi-Level Grouping with Aggregation</div>

    Even more complicated, multiple levels of grouping and aggregation.

    <p/>
    When aggregating rows in multi-level, the rows been aggregated can contain aggregation rows themselves.
    This is checked using the 'group' property on the node. If it is set, then that row
    is a group row and has attributes relevant to the group. When aggregating, the results of
    the aggregation for the group is stored in the node attribute data.

    <show-example example="example3"></show-example>

    <div class="bigTitle">Advanced Multi-Level Grouping</div>

    When doing aggregations, it is not always possible to just 'sum' the values, especially if they
    are not number values. The example below shows a complex custom aggregation over age giving
    a min and a max age. The grouping row is also styled in bold.

    <show-example example="example4"></show-example>

    <div class="bigTitle">Group Row Rendering</div>

    It is possible to override the rendering of the group row. Below shows an example of aggregating,
    then using the entire row to give a summary.

    <show-example example="example5"></show-example>

    <h4>Custom Expand / Collapse Icon</h4>

    It is possible to override the default collapse / expand icon. This is set by providing
    a renderer to the grid options. Like all other renderers, the result can either be an
    html DOM element, or an string that will be treated as HTML.

    <p/>
    This example uses simple text as the icons:

    <pre>groupIconRenderer: function (expanded) { return expanded ? '-' : '+'; }
    </pre>

    <p/>
    This example uses Font Awesome icons to provide 'minus' and 'plus' icons:

    <pre>groupIconRenderer: function (expanded) {
  if (expanded) {
    return '&lt;i class="fa fa-minus-square-o"/>';
  } else {
    return '&lt;i class="fa fa-plus-square-o"/>';
  }
}</pre>

</div>

<?php include '../documentation_footer.php';?>
