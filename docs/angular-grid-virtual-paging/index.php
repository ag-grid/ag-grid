<?php
$key = "Virtual Paging / Infinite Scrolling";
$pageTitle = "Angular Grid Virtual Paging";
$pageDescription = "Angular Grid allows the data to stay on the server and only load data for what is currently visible in the GUI.";
$pageKeyboards = "Angular Grid Virtual Paging";
include '../documentation_header.php';
?>

<div>

    <h2>Virtual Paging / Infinite Scrolling</h2>

    <p>
        Virtual paging allows the grid to lazy load rows from the server depending on what the scroll position is of the grid.
    </p>
    <p>
        If the grid knows how many pages in total at the start, the scroll will be sized to match the entire data set
        despite the data set not loaded from the server.
    </p>
    <p>
        If the grid does not know how many pages at the start, the scroll will extend automatically until the last row is reached.
        This feature is known in other grids as <b>infinite scrolling</b>.
    </p>

    <p><b>Note:</b> Pagination and Virtual Paging are different solutions to the same problem. It is not possible to apply both at the same time.</p>

    <h4>How it Works</h4>

    <p>
        The following diagram is a high level overview:
    </p>

    <p>
        <img src="high-level.png"/>
    </p>

    <p>
        The virtual model behind the grid contains a cache of pages. Each page contains a subset of the entire data set.
        When the grid scrolls to a position where there is no corresponding page in the cache, the virtual model
        uses the provided datasource (you provide the datasource) to get the rows for the requested page. In the diagram,
        the datasource is getting the rows from a database in a remote server.
    </p>

    <h4>Turning On Virtual Paging</h4>

    <p>
        To turn on virtual paging, you must a) set the gridOptions attribute virtualPaging to true and b) provide a datasource.
    </p>

    <pre>
// before grid initialised
gridOptions.virtualPaging = true;
gridOptions.datasource = myDataSource;

// after grid initialised, you can set or change the datasource
gridOptions.api.setDatasource(myDataSource);</pre>

    <p>
        Changing the datasource after the grid is initialised will reset the paging in the grid. This is useful if the context of your
        data changes, eg if a filter or other search criteria is changed outside of the grid.
    </p>

    <h4>Aggregation and Grouping</h4>

    <p>
        Aggregation and grouping are not available in virtual paging. This is because to do such would require the grid knowing
        the entire data set, which is not possible when virtualising the pages.
    </p>

    <h4>Sorting & Filtering</h4>

    <p>
        Client side sorting & filtering does not make sense in virtual paging and is just not supported.
    </p>

    <p>
        Server side sorting & filtering is supported.
    </p>

    <h4>Simple Example - No Sorting or Filtering</h4>

    The example below shows virtual paging. The example makes use of infinite scrolling and caching.

    <show-example example="virtualPaging"></show-example>

    <h4>A Wee Bit More Complex Example - Sorting & Filtering</h4>

    <p>
        The following example extends the example above by adding server side sorting and filtering.
    </p>

    <p>
        Any column can be sorted by clicking the header. When this happens, the datasource is called
        again with the new sort options.
    </p>

    <p>
        The columns <b><i>Age</i></b>, <b><i>Country</i></b> and <b><i>Year</i></b> can be filtered.
        When this happens, the datasource is called again with the new filtering options.
    </p>

    <show-example example="virtualPagingServerSide"></show-example>

</div>

<?php include '../documentation_footer.php';?>