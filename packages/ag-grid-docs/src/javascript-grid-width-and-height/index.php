<?php
$pageTitle = "Grid Size: Core Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Grid Size. Rows in the grid will Animate into place after the user sorts or filters. Version 20 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Resizing";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Grid Size</h1>

    <p class="lead">
        Under normal usage, your application should set the width and height of the grid
        using CSS styles. The grid will then fit the width you provide and use scrolling
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
        </p>

        <p>
            If your grid is not the size you think it should be then put a border on the grid's
            div and see if that's the size you want (the grid will fill this div). If it is not the size
            you want, then you have a CSS layout issue in your application.
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
        selects the buttons.
    </p>

    <?= example('Width & Height', 'width-and-height', 'multi', array( 'exampleHeight' => 600 )) ?>

    <h2 id="auto-height">Grid Auto Height</h2>

    <p>
        Depending on your scenario, you may wish for the grid to auto-size it's height to the number
        of rows displayed inside the grid. This is useful if you have relatively few rows and don't
        want empty space between the last row and the bottom of the grid.
    </p>

    <p>
        To allow the grid to auto-size it's height to fit rows, set grid property <code>domLayout='autoHeight'</code>.
    </p>

    <p>
        When <code>domLayout='autoHeight'</code> then your application <b>should not</b> set height
        on the grid div, as the div should be allowed flow naturally to fit the grid contents.
        When auto height is off then your application <b>should</b>
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
            <code>api.setDomLayout()</code> or by changing the bound property <code>domLayout</code>.
        </li>
    </ul>

    <note>
        The following test is best viewed if you open it in a new tab, so it is obvious that there are no scroll bars.
        Note that if you use the example inlined the scroll bars shown are for the containing iframe, not the grid.
    </note>

    <?= example('Auto Height', 'auto-height', 'generated', array("enterprise" => 1, "noStyle" => 1, 'processVue' => true)) ?>

    <h2>DOM Layout</h2>

    <p>
        There are three DOM Layout values the grid can have 'normal', 'autoHeight' and 'print'. They are used
        as follows:
        <ul>
            <li><b>normal</b>: This is the default if nothing is specified. The grid fits the width and height
            of the div you provide and scrolls in both directions.</li>
            <li><b>autoHeight</b>: The grid's height is set to fit the number of rows so no vertical scrollbar
                is provided by the grid. The grid scrolls horizontally as normal.</li>
            <li><b>print</b>: No scroll bars are used and the grid renders all rows and columns. This layout
            is explained in <a href="../javascript-grid-for-print/">Printing</a>.</li>
        </ul>
    </p>

    <h2>Min Height with Auto Height</h2>

    <p>
        There is a minimum height of 50px for displaying the rows for autoheight.
        This is for aesthetic purposes, in particular to allow room to show the
        'no rows' message when no rows are in the grid otherwise this message
        would be overlaying on top of the header which does not look well.
    </p>

    <p>
        It is not possible to specify a max height when using auto-height.
    </p>

    <note>
        Users ask is it possible to set a max height when using auto-height? The answer is no.
        If using auto-height, the grid is set up to work in a different way. It is not possible to switch.
        If you do need to switch, you will need to turn auto-height off.
    </note>

    <h2>Resize with Parent Container</h2>

    <p>
        We can dynamically react to screen changes by making use of the grid API features. In this section we describe
        a few recommended approaches to resize the grid and show/hide columns based on screen size changes.
    </p>

    <note>These recipes below are suggestions - as the grid can be placed & positioned in your application in many ways and
        with many frameworks the suggestions below may not work out of the box in your particular application, but they should serve
        to help point you in the right direction.</note>

    <h3>Inside Flexbox Container</h3>
    <p>By default, the grid runs a timer that watches its container size and resizes the UI accordingly. This might interfere with the default behavior of elements with <code>display: flex</code> set. The simple workaround is to add <code>overflow: hidden</code> to the grid element parent.</p>

    <p>Open the example below in a new tab and resize the window to see how the grid instance gets resized accordingly.</p>

    <?= example('Grid Inside a Flexbox Container', 'flexbox', 'generated', array("processVue" => true)) ?>

    <h3>Inside CSS Grid Container</h3>
    <p>By default the grid watches its container size and resizes the UI accordingly. This might interfere with the default behavior of elements with <code>display: grid</code> set. The simple workaround is to add <code>overflow: hidden</code> to the grid element parent.</p>

    <p>Open the example below in a new tab and resize the window to see how the grid instance gets resized accordingly.</p>

    <?= example('Grid Inside a CSS Grid Container', 'css-grid', 'generated', array("processVue" => true)) ?>

    <h3>Dynamic Resizing with Horizontal Scroll</h3>

    <p>
        The quickest way to achieve a responsive grid is to set the grid's containing div to a percentage. With this
        simple change the grid will automatically resize based on the div size and columns that can't fit in the viewport
        will simply be hidden and available to the right via the scrollbar.
    </p>

    <?= example('Dynamic horizontal resizing with scroll', 'example', 'generated', array("processVue" => true)) ?>

    <h3>Dynamic Resizing without Horizontal Scroll</h3>

    <p>Sometimes you want to have columns that don't fit in the current viewport to simply be hidden altogether with no
        horizontal scrollbar.</p>

    <p>To achieve this determine the width of the grid and work out how many columns could fit in that space, hiding any that
        don't fit, constantly updating based on the <code>gridSizeChanged</code> event firing, like the next example shows.</p>

    <p>This example is best seen when opened in a new tab - then change the horizontal size of the browser and watch as
        columns hide/show based on the current grid size.</p>

    <?= example('Dynamic horizontal resizing without scroll', 'example1', 'generated', array("processVue" => true)) ?>

    <h3>Dynamic Vertical Resizing</h3>

    <p>Sometimes the vertical height of the grid is greater than the number of rows you have it in.  You can dynamically
        set the row heights to fill the available height as the following example shows:</p>

    <?= example('Dynamic vertical resizing', 'example2', 'generated', array("processVue" => true)) ?>




<?php include '../documentation-main/documentation_footer.php';?>
