<?php
$pageTitle = "ag-Grid: Optimising your Datagrid Performance";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. The core grid engine gives Performance unlike that seen before. The grid uses row and column virtualisation, animation frames and many other techniques. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Performance";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



    <h1>Performance</h1>

    <p class="lead">
        ag-Grid is fast. However ag-Grid can also be configured and extended in many ways.

        Often people come to the ag-Grid forum and ask 'why is the grid in my application not that fast?'.

        This page explains how you can make the grid go faster.
    </p>

    <h2>1. Setting Expectations</h2>

    <p>
        ag-Grid can be as fast as demonstrated in the demo application <a href="../example.php">Demo Application</a>.
        You can resize the demo application to the same size as the grid in your application by resizing the browser.
        Then navigate around the grid (scroll, filter etc) and see how fast the demo grid is compared to your own
        implementation. If the demo grid is going faster, then there is room for performance improvements.
    </p>

    <h2>2. Check Cell Renderers</h2>

    <p>
        ag-Grid can be slowed down by your custom
        <a href="../javascript-grid-cell-rendering-components/">cell renderers</a>. To test this, remove all
        cell renderers from your grid and compare the speed again. If the grid does improve it's speed by
        removing cell renderers, try to introduce the cell renderers one by one to find out which ones
        are adding the most overhead.
    </p>

    <h2>3. Create Fast Cell Renderers</h2>

    <p> The fastest cell renderers have the following properties:</p>

    <note>
        Do NOT use a framework (eg Angular or React) for the cell renderers. The grid rendering is highly
        customised and plain JavaScript cell renderers will work faster than framework equivalents. It is
        still fine to use the framework version of ag-Grid (eg for setting ag-Grid properties etc) however
        because there are so many cells getting created and destroyed, the additional layer the frameworks
        add do not help performance and should be provided if you are having performance concerns.
    </note>

   <p>     Not everyone needs blazing fast cell renderers (eg maybe you have users on fast machines with fast browsers,
        or maybe your grids have few columns) in which case framework cell renderers may work fine. The suggestion
        of not using frameworks for cells is only applicable when you are looking to squeeze for performance gains.
    </p>

    <note>We suggest not using frameworks for cell renderers for because of the large number of cells getting
    created and destroyed. Most of the time a cell will not have complex features in it, so using plain
    JavaScript should not be a problem. For all other components (filters, editors etc) using the frameworks
    won't make much noticeable difference as these components are not created and destroyed as often as
    cell renderers.</note>

    <h2>4. Turn Off Animations</h2>

    <p>
        Row and column animations make for a great user experience. However not all browsers are as good at
        animations as others. Consider checking the client's browser and turning off row and column animation
        for slower browsers.
    </p>

    <h2>5. Configure Row Buffer</h2>

    <p>
        The <code>rowBuffer</code> property sets the number of rows the grid renders outside of the viewable area.
        The default is 10.
        For example, if your grid is showing 50 rows (as that's all the fits on your screen without scrolling),
        then the grid will actually render 70 in total (10 extra above and 10 extra below). Then when you scroll
        the grid will already have 10 rows ready waiting to show so the user will not see a redraw (not all browsers
        show the redraw, only the slower ones).
    </p>

    <p>
        Setting a low row buffer will make initial draws of the grid faster (eg when data is first loaded, or after
        filtering, grouping etc). Setting a high row buffer will reduce the redraw visible vertically scrolling.
    </p>

    <h2>6. Use Chrome</h2>

    <p>
        The grid works fastest on Google Chrome. If you can, tell your users.
    </p>

    <h2>7. Understand</h2>

    <p>
        Read the article <a href="../ag-grid-8-performance-hacks-for-javascript/">8 Performance Hacks for JavaScript</a>
        so you know what the grid is doing, that way you will be able to reason with it.
    </p>


<?php include '../documentation-main/documentation_footer.php';?>
