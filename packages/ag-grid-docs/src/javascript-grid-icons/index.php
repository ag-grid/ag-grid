<?php
$pageTitle = "Custom Icons: Styling & Appearance Feature of our Datagrid";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Custom Icons. All the icons in the grid can be replaced with your own Custom Icons. You can either use CSS or provide your own images. Version 20 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Pinning";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



<h1>Icons</h1>

    <p class="lead">
        This sections details how to provide your own icons for the grid and style grid icons for your application requirements.
    </p>

    <note>
        <p>
            In v21 of ag-Grid we changed how icons are set in the grid. Previous to v21 the icons were
            svg files that you could override via the '$icons-path' variable in SASS files. v21 uses a WebFont 
            and CSS for the icons which is the best way to allow icon theming.
        </p>

        <p>
            For backwards compatibility you can still provide icons using the 'icons' grid option.
            If you want to use the old icons, you can set them this way.
        </p>

        <p>
            If you have created your own theme and want to include the stock icons, this is easiest
            done by adding the WebFont from the theme you like: <br>
            <code>dist/styles/webfont/agGridClassicFont.css</code> - WebFont used by themes fresh, blue, dark and bootstrap <br>
            <code>dist/styles/webfont/agGridBalhamFont.css</code> - WebFont used by theme balham and balham-dark <br>
            <code>dist/styles/webfont/agGridMaterialFont.css</code> - WebFont used by theme material<br>
        </p>
    </note>

<h2>Change Individual Icons (CSS)</h2>

<p>You can change individual icons by overriding the background images for the respective CSS selector. 
The following code snippet overrides the fresh theme pin icon  used in the drag hint when reordering columns:<p>

<snippet>
/* 
 * The override should be placed after the import of the theme. 
 * Alternatively, you can aso increase the selector's specificity.
 */
.ag-theme-balham .ag-icon-pin {
    font-family: "Font Awesome 5 Free";
    /* FontAwesome uses font-weight bold */
    font-weight: bold;
}
.ag-theme-balham .ag-icon-pin::before {
    content: '\f08d';
}
</snippet>

<h2>Replace the icons by changing the icons font (Scss)</h2>

<p>If you are using Sass/Scss in your project, you can include the ag-grid theme source file and customize its properties by overriding the default variables. </p>

<snippet>
// styles.scss
// This is an example of the application scss file; 
// Popular framework project scaffolders like angular-cli support 
// generating sass enabled projects. 
// For example, the `ng new` command accepts `--style scss`.

// import the Sass files from the ag-Grid npm package. //
// The "~" path prefix below relies on Webpack's sass-loader -
// https://github.com/webpack-contrib/sass-loader. 

$icon-font-family: "Font Awesome 5 Free";

$ag-icon-aggregation: "\f247";
$ag-icon-arrows: "\f0b2";
$ag-icon-asc: "\f062";
$ag-icon-cancel: "\f057";
$ag-icon-chart: "\f080";
$ag-icon-checkbox-checked: "\f14a";
$ag-icon-checkbox-indeterminate: "\f146";
$ag-icon-checkbox-unchecked: "\f0c8";
$ag-icon-column: "\f142";
$ag-icon-columns: "\f0db";
$ag-icon-contracted: "\f146";
$ag-icon-copy: "\f0c5";
$ag-icon-cross: "\f00d";
$ag-icon-cut: "\f0c4";
$ag-icon-data: "\f1c0";
$ag-icon-desc: "\f063";
$ag-icon-expanded: "\f0fe";
$ag-icon-eye-slash: "\f070";
$ag-icon-eye: "\f06e";
$ag-icon-filter: "\f0b0";
$ag-icon-first: "\f100";
$ag-icon-grip: "\f58e";
$ag-icon-group: "\f5fd";
$ag-icon-indeterminate: "\f06e";
$ag-icon-last: "\f101";
$ag-icon-left: "\f060";
$ag-icon-loading: "\f110";
$ag-icon-maximize: "\f2d0";
$ag-icon-menu: "\f0c9";
$ag-icon-minimize: "\f2d1";
$ag-icon-minus: "\f068";
$ag-icon-next: "\f105";
$ag-icon-none: "\f338";
$ag-icon-not-allowed: "\f05e";
$ag-icon-paste: "\f0ea";
$ag-icon-pin: "\f276";
$ag-icon-pivot: "\f074";
$ag-icon-plus: "\f067";
$ag-icon-previous: "\f104";
$ag-icon-radio-button-off: "\f111";
$ag-icon-radio-button-on: "\f058";
$ag-icon-right: "\f061";
$ag-icon-save: "\f0c7";
$ag-icon-small-down: "\f107";
$ag-icon-small-left: "\f104";
$ag-icon-small-right: "\f105";
$ag-icon-small-up: "\f106";
$ag-icon-tick: "\f00c";
$ag-icon-tree-closed: "\f105";
$ag-icon-tree-indeterminate: "\f068";
$ag-icon-tree-open: "\f107";

@import "~ag-grid/src/styles/ag-grid.scss";
@import "~ag-grid/src/styles/ag-theme-balham.scss";

.ag-icon {
    font-weight: bold;
}
</snippet>

<p>A working Sass / Webpack which includes the source theme file is available in the <a href="https://github.com/ag-grid/ag-grid-customise-theme">ag grid customising theme repository</a>.

<h2>Set the icons through <code>gridOptions</code> (JavaScript)</h2>

    <p>
        The icons can either be set on the grid options (all icons) or on the column definition (all except group).
        If defined in both the grid options and column definitions, the column definition will get used. This
        allows you to specify defaults in the grid options to fall back on, and then provide individual icons for
        specific columns. This is handy if, for example, you want to include 'A..Z' as string sort icons and just
        the simple arrow for other columns.
    </p>

    <p>
        The icons are set as follows:
    </p>

    <snippet>
// column header items
menu
filter
columns
sortAscending
sortDescending
sortUnSort

// expand / contract row group
groupExpanded
groupContracted

// expand / contract column group
columnGroupOpened
columnGroupClosed

// tool panel column group open / close
columnSelectOpen
columnSelectClosed

// row checkbox selection and tool panel column selection
checkboxChecked
checkboxUnchecked
checkboxIndeterminate

// tool panel column selection, when read only (ie disabled checkboxes)
checkboxCheckedReadOnly
checkboxUncheckedReadOnly
checkboxIndeterminateReadOnly

// when moving columns
columnMovePin // when column is to the left, before it gets pinned
columnMoveAdd // when adding a column
columnMoveHide // when removing a column
columnMoveMove // when moving a column
columnMoveLeft // when moving and scrolling left
columnMoveRight // when moving and scrolling right
columnMoveGroup // when about to drop into group panel
columnMoveValue // when about to drop into value panel
columnMovePivot // when about to drop into pivot panel
dropNotAllowed // when trying to drop column into group/value/pivot panel and column doesn't support it

// menu
menuPin // beside the column pin menu item
menuValue // beside the column value menu item
menuAddRowGroup // beside the column row group menu item
menuRemoveRowGroup // beside the column row group menu item
clipboardCopy // beside the copy to clipboard menu item
clipboardPaste // beside the paste from clipboard menu item

// column drop panels
rowGroupPanel // beside where to drop columns for row group
pivotPanel // beside where to drop columns for pivot
valuePanel // beside where to drop columns for value</snippet>

// drag
rowDrag // the column dragger icon
    <p>
        Setting the icons on the column definitions is identical, except group icons are not used in column definitions.
    </p>

    <p>
        The icon can be any of the following:
    </p>
        <ul class="content">
            <li>
                <b>String:</b> The string will be treated as html. Use to return just text, or HTML tags.
            </li>
            <li>
                <b>Function:</b> A function that returns either a String or a DOM node or element.
            </li>
        </ul>

    <p>
        The example below shows a mixture of different methods for providing icons. The grouping is done with images,
        and the header icons use a mix of Font Awesome and strings.
    </p>

    <p>
        (note: the example below uses ag-Grid-Enterprise, this is to demonstrate the icons for grouping only)
    </p>

    <?= example('Icons', 'icons', 'generated', array('enterprise' => true, "processVue" => true, 'extras' => array('fontawesome') )) ?>


<?php include '../documentation-main/documentation_footer.php';?>
