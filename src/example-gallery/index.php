<?php
$key = "Gallery";
$pageTitle = "ag-Grid Gallery";
$pageDescription = "Shows random examples of ag-Grid mixing different parts of the library.";
$pageKeyboards = "ag-Grid Gallery";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="icons">Gallery</h2>

    <p>
        This section of the documentation demonstrates different configurations of the grid.
        It is really a mixed bag section, showing combinations of grid features working together that
        doesn't fit into a particular documentation section.
    </p>

    <h3>Auto Height, Full Width & Pagination</h3>

    <p>
        Shows the autoHeight feature working with fullWidth and pagination.
        <ul>
            <li>The fullWidth rows are embedded. This means:
                <ul>
                    <li>Embedded rows are chopped into the pinned sections.</li>
                    <li>Embedded rows scroll horizontally with the other rows.</li>
                </ul>
            </li>
            <li>There are 15 rows and pagination page size is 10, so as you go from
            one page to the other, the grid re-sizes to fit the page (10 rows on the first
                page, 5 rows on the second page).</li>
        </ul>
    </p>


    <show-complex-example example="exampleAutoHeightFullWidth.html"
                          sources="{
                        [
                            { root: './', files: 'exampleAutoHeightFullWidth.html,exampleAutoHeightFullWidth.js' }
                        ]
                      }"
                          exampleheight="500px">
    </show-complex-example>

    <hr/>

    <h2 id="tree-data-vertical-scroll-location">Expanding Groups &amp; Vertical Scroll Location</h2>

    <p>
        Depending on your scroll position the last item's group data may not be visible when
        clicking on the expand icon.
    </p>
    <p>
        You can resolve this by using the function <strong>api.ensureIndexVisible()</strong>.
        This ensures the index is visible, scrolling the table if needed.
    </p>
    <p>
        In the example below, if you expand a group at the bottom, the grid will scroll so all the
        children of the group are visible.
    </p>

    <show-example example="exampleTreeScroll"></show-example>


    <h2>Enterprise Row Model & Complex Columns</h2>

    <p>
        This example mixes enterprise row model and complex objects. It shows how you can have value getters
        and embedded fields (ie the field attribute has dot notation).
    </p>

    <p>
        In the example, all rows back are modified so that the rows looks something like this:
    </p>

    <snippet>
row = {
    // country field is complex object
    country: {
        name: 'Ireland',
        code: 'IRE'
    },
    // year field is complex object
    year: {
        name: '2012',
        shortName: "'12"
    },
    // other fields as normal
    ...
};</snippet>

    <p>
        Then the columns are set up so that country uses a <code>valueGetter</code> and year uses a field
        with dot notation, ie <code>year.name</code>
    </p>

    <show-complex-example example="exampleEnterpriseComplexObjects.html"
                          sources="{
                                [
                                    { root: './', files: 'exampleEnterpriseComplexObjects.html,exampleEnterpriseComplexObjects.js,complexColumns.js,mockServerComplex.js' }
                                ]
                              }"
                          exampleheight="500px">
    </show-complex-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
