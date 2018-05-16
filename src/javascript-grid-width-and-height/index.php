<?php
$pageTitle = "Grid Size: Core Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Grid Size. Rows in the grid will Animate into place after the user sorts or filters. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Resizing";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Grid Size</h1>

    <p class="lead">
        Under normal usage, your application should set the width and height of the grid
        using CSS styles. The grid will then fit the width you provide and provide scrolling
        inside the grid to allowing viewing all rows and columns.
    </p>

    <snippet>
// set width using percentages
&lt;div id="myGrid" class="ag-theme-balham" style="width: 100%; height: 100%;"&gt;&lt;/div&gt;

// OR set width using fixed pixels
&lt;div id="myGrid" class="ag-theme-balham" style="width: 500px; height: 200px;"&gt;&lt;/div&gt;</snippet>

    <note>

        <p><b>Pitfall When Using Percent Width & Height</b></p>

        <p>
            If using % for your height, then make sure the container you are putting the grid into
            also has height specified, as the browser will fit the div according to a percentage of
            the parents height, and if the parent has no height, then this % will always be zero.
            If your grid is not using all the space you think it should, then put a border on the grid's
            div and see if that's the size you want (the grid will fill this div). If it is not the size
            you want, then you have a CSS layout issue to solve outside of the grid.
        </p>

    </note>

    <h2>Changing Width and Height</h2>

    <p>
        If the width and / or height change after the grid is initialised, the grid will
        automatically resize to fill the new area.
    </p>

    <h3>Example: Setting and Changing Grid Width and Height</h3>

    <p>
        The example below shows setting the grid size and then changing it as the user
        selects the buttons. Notice that the example calls <code>api.doLayout()</code> after
        the resize to avoid a flicker.
    </p>

    <?= example('Width & Height', 'width-and-height', 'multi', array( 'exampleHeight' => 600 )) ?>

    <h2 id="auto-height">Grid Auto Height</h2>

    <p>
        Depending on your scenario, you may wish for the grid to auto-size it's height to the number
        of rows displayed inside the grid. This is useful if you have relatively few rows and don't
        want empty space between the last row and the bottom of the grid.
    </p>

    <p>
        To allow the grid to auto-size it's height to fit rows, set grid property <code>gridAutoHeight=true</code>.
    </p>

    <p>
        When <code>gridAutoHeight=true</code> then your application <b>should not</b> set height
        on the grid div, as the div should be allowed flow naturally to fit the grid contents.
        When <code>gridAutoHeight=false</code> (the default) then your application <b>should</b>
        set height on the grid div, as the grid will fill the div you provide it.
    </p>

    <note>
        <p>
            Don't use Grid Auto Height when displaying large numbers of rows.
        </p>
        <p>
            If using Grid Auto Height, then the grid will render all rows
            into the DOM. This is different to normal operation where the grid will only render
            rows that are visible inside the grid's scrollable viewport. For large grids (eg >1,000
            rows) the draw time of the grid will be slow, or for very large grids, your application
            can freeze. This is not a problem with the grid, it is a limitation on browsers
            on how much data they can easily display on one web page. For this reason, if showing
            large amounts of data, it is not adviseable to use Grid Auto Height. Instead use
            the grid as normal and the grid's row virtualisation will take care of this problem
            for you.
        </p>
    </note>

    <p>
        The example below demonstrates the autoHeight feature. Notice the following:
    </p>

    <ul class="content">
        <li>As you set different numbers of rows into the grid, the grid will resize it's height to just fit the rows.</li>
        <li>As the grid height exceeds the height of the browser, you will need to use the browser vertical scroll
        to view data (or the iFrames scroll if you are looking at the example embedded below).</li>
        <li>The height will also adjust as you filter, to add and remove rows.</li>
        <li>If you have pinned rows, the grid will size to accommodate the pinned rows.</li>
        <li>Vertical scrolling will not happen, however horizontal scrolling, including pinned columns, will work as normal.</li>
        <li>
            It is possible to move the grid into and out of 'full height' mode by using the
            <code>api.setGridAutoHeight()</code> or by changing the bound property <code>gridAutoHeight</code>.
        </li>
    </ul>

    <note>
        The following test is best viewed if you open it in a new tab, so it is obvious that there are no scroll bars.
        Note that if you use the example inlined the scroll bars shown are for the containing iframe, not the grid.
    </note>

    <?= example('Auto Height', 'auto-height', 'generated', array("enterprise" => 1, "noStyle" => 1)) ?>

    <h2>Max Height with Auto Height</h2>

    <p>
        It is not possible to specify a max height when using auto-height.
    </p>

    <note>
        Users ask is it possible to set a max height when using auto-height? The answer is no.
        If using auto-height, the grid is set up to work in a different way. It is not possible to switch.
        If you do need to switch, you will need to change to a new instance of the grid.
    </note>

<?php include '../documentation-main/documentation_footer.php';?>
