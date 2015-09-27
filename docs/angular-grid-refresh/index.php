<?php
$key = "Refresh";
$pageTitle = "AngularJS Angular Grid Refresh";
$pageDescription = "It is possible to refresh Angular Grid in many ways. This page explains how to refresh cells inside the grid.";
$pageKeyboards = "AngularJS Angular Grid Refresh";
include '../documentation_header.php';
?>

<div>

    <h2>Refresh</h2>

    <p>
        When the underlying data is changed for the grid, you can get the grid to refresh. The easiest way is to call
        <i>api.refreshView()</i>, which will refresh the entire table. Refreshing the entire view works very fast - this
        is in fact what is getting done as you are scrolling over large data - the DOM is been constantly redrawn
        with the rows as they come into the viewable area.
    </p>

    <p>
        Even with lightening speed, this may not be what you want, as this will loose any context or state you may
        have in any of your cells. This can be a problem if a) the cell required
        time to build, such as requiring data from the server, and rebuilding such a cell would cause a visible
        redraw on the screen or b) the cell has a state or context, such as the cell is currently being edited, or
        the cell has been interacted with in some way that deviates it from the default initial representation.
    </p>
    <p>
        This section goes through the options available as an alternative to calling <i>api.refreshView()</i>.
    </p>
    <note>
        If you are using AnguarJS to build your cells, then you may be benefiting from two-way-binding.
        If you are, then you might be wondering what all this refresh rubbish is all about and do you need it?
        Well if you are happy with what you have, that's totally fine, you can keep it. It is the authors
        opinion to avoid two-way-binding inside a grid as it gives poor performance, especially when displaying large
        amounts of data and virtualising the rows. On top of that, it is also the authors goal to have a grid that
        is not dependent on AngularJS, to allow the grid to work in other frameworks.
    </note>

    <h3>Refreshing Everything, Specific Rows or Specific Cells</h3>

    <p>
        To refresh the grid, you can choose between the following options:
    <ul>
        <li><b>refreshView()</b>: Rips out every virtual row and draws it again.</li>
        <li><b>refreshRows(rowNodes)</b>: Rips out the virtual rows showing representing the provided
        list of row nodes and then redraws them.</li>
        <li><b>refreshCells(rowNodes, colIds)</b>: Gets the individual cells for the provided rowNodes
        to refresh, the row itself and all other cells stay intact.</li>
    </ul>
    </p>

    The grid below shows the above three options in action. The grid's columns 'Make' and 'Model'
    have cellRenderers that also display the timestamp the cell was rendered, so you can see when
    the cell is rendered again. Notice the following:
    <ul>
        <li>Refresh All -> All cells get refreshed.</li>
        <li>Double Jillian -> Jillian's rows get completely refreshed.</li>
        <li>Double Niall -> The 'Price' column only in Niall's rows get refreshed.</li>
    </ul>

    <show-example example="example3"></show-example>

    <h3>Volatile Cells</h3>

    <p>
        In addition to the <i>api.refreshView()</i> call, there is also a similar <i>api.softRefreshView()</i> call.
        The soft refresh differs in the following ways:
    </p>
    <ul>
        <li>The rows are left intact, only the contents of the cells are redrawn.</li>
        <li>Only cells marked as <i>volatile</i> are redrawn.</li>
        <li>Classes and styles (including class rules) are reapplied to the cell.</li>
    </ul>
    <p>
        Cells are marked as volatile by setting the attribute on the column definition.
    </p>

    <h3>Volatile Cells Example</h3>

    <p>
        The example below shows refreshing in action. The weekday columns are editable. As you edit the cells,
        the numbers on the right has side change. The <i>volatile summary</i> change as the cells change, as
        the columns are marked as <i>volatile</i> and the grid <i>onCellValueChanged()</i> function is calling <i>api.softRefresh()</i>
    </p>
    <p>
        Note that the class rules are reapplied as the total and value change, marking the value as bold and
        red it if goes above the threshold.
    </p>

    <show-example example="example1"></show-example>

    <h3>Cell Refresh from Inside</h3>

    <p>
        You can request a cell to be refreshed from within by calling the <i>params.refreshCell()</i> function
        passed to the cell renderer. This is handy if the cell wants to refresh itself and / or get the cell
        style rules reapplied.
    </p>

    <p>
        This can be handy if the cell gets itself into a state it wants to get out for. For example, you could have
        your own custom editing, and when the data has finished editing, you cal 'refreshCell()' will is a handy
        way to get the grid to rip the cell out and put it back again to the fresh 'non-editing' state.
    </p>

    <h3>Refresh Headers and Footers</h3>

    <p>
        If you call <i>api.recomputeAggregates()</i>, all header and footer rows will subsequently get ripped
        out and redrawn to show the new aggregate values. If you want to refresh all headers and footers without
        recomputing the aggregates, you can call <i>api.refreshGroupRows()</i> - useful if you want to refresh
        for reasons other than the aggregates being recomputed.
    </p>

    <h3>Headers, Footers and Cell Refresh Example</h3>

    <p>
        The example below demonstrates the following features:
    </p>

    <p>
        <b>Cell Refresh:</b> As you hit + and - below, the containing cell updates the record and calls
        <i>api.refreshCell()</i>. This gets the cell to redraw and have it's css rules reapplied - marking
        the cell as red if the value goes above a threshold.
    </p>
    <p>
        <b>Aggregate Refresh:</b> As the values change, the table is also recomputing the aggregates, which
        in turn get redrawn.
    </p>

    <show-example example="example2"></show-example>

</div>

<?php include '../documentation_footer.php';?>
