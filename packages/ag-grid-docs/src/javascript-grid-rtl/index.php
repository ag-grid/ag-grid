<?php
$pageTitle = "RTL: Styling & Appearance Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is RTL. Use Right to Left alignment to allow languages such as Arabic & Hebrew. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid RTL";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


    <h1>RTL - Right To Left</h1>

    <p>
        RTL is used for displaying languages that go from Right to Left, eg Hebrew and Arabic.
        To get ag-Grid to display in RTL format, set the property <code>enableRtl=true</code>.
    </p>

    <h2>Simple Example</h2>

    <p>
        Below shows a simple example of a grid using RTL. To make it look better we should really be using
        an RTL language, however none of us in ag-Grid knows any RTL languages, so we are sticking with English.
    </p>

    <?= example('RTL Simple', 'rtl-simple', 'generated') ?>

    <h2>Complex Example</h2>

    <p>
        Below shows a more complex example. It's the same example as used on the ag-Grid main demo page.
        To demonstrate all the edge cases of RTL, the tool panel and pinned areas are shown. This example
        is using ag-Grid Enterprise - hence the tool panel and context menu's are active.
    </p>

    <?= example('RTL Complex', 'rtl-complex', 'vanilla', array("enterprise" => 1)) ?>

    <h2>How it Works</h2>

    <p>
        If you are creating your own theme, knowing how the RTL is implemented will be useful.
    </p>

    <h3>CSS Styling</h3>

    <p>
        The following CSS classes are added to the grid when RTL is on and off:
</p>
        <ul class="content">
        <li><b>ag-rtl</b>: Added when RTL is ON. It sets the style <code>'direction=rtl'</code>.</li>
        <li><b>ag-ltr</b>: Added when RTL is OFF. It sets the style <code>'direction=ltr'</code>.</li>
    </ul>

    <p>
        You can see these classes by inspecting the DOM of ag-Grid. A lot of the layout of the grid
        is reversed with this simple CSS class change.
    </p>

    <p>
        Themes then also use these styles for adding different values based on whether RTL is used or NOT.
        For example, the following is used inside the provided themes:
    </p>
    <snippet>
// selection checkbox gets 4px padding to the RIGHT when LTR
.ag-ltr .ag-selection-checkbox {
    padding-right 4px;
}

// selection checkbox gets 4px padding to the LEFT when RTL
.ag-rtl .ag-selection-checkbox {
    padding-left 4px;
}</snippet>

    <h2>Pinning and Scroll Bars</h2>

    <p>
        Under normal operation, when columns are pinned to the right, the vertical scroll will appear
        alongside the right pinned panel. For RTL the scroll will appear on the left pinned panel
        when left pinning columns.
    </p>

    <h2> Layout of Columns </h2>

    <p>
        The grid normally lays the columns out from left to right. When doing RTL the columns go
        from the right to the left. If the grid was using normal HTML layout, then the columns
        would all reverse by themselves, however the grid used Column Visualisation, so it needs
        to know exactly where each column is. Hence there is a lot of math logic inside ag-Grid
        that is tied with the scrolling. Not only is the scrolling inverted, all the maths logic
        is inverted also. All of this is taken care of for you inside ag-Grid. Once <code>enableRtl=true</code>
        is set, the grid will know to use the RTL varient of all the calculations.
    </p>


<?php include '../documentation-main/documentation_footer.php';?>
