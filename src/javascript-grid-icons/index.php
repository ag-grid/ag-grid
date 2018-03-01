<?php
$pageTitle = "Custom Icons: Styling & Appearance Feature of our Datagrid";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Custom Icons. All the icons in the grid can be replaced with your own Custom Icons. You can either use CSS or provide your own images. Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Pinning";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>



<h1>Icons</h1>

    <p class="lead">
    By default, ag-Grid comes with a set of SVG icons. You can provide your own icons for the grid to use.
</p>

    <note>
        <p>
            In v13 of ag-Grid we changed how icons are set in the grid. Previous to v13 the icons were
            image files that you could override via the 'icons' grid options. v13 uses SVG and CSS for
            the icons which is in line with industry best practices.
        </p>

        <p>
            For backwards compatibility you can still provide icons using the 'icons' grid option.
            If you want to use the old icons, you can set them this way.
        </p>

        <p>
            The old icons are available in the <code>src/styles/legacy</code> directory of the grid package.
        </p>

        <p>
            If you have created your own theme and want to include the stock icons, this is easiest
            done by taking the contents of the <code>dist/styles/compiled-icons.css</code> file and add its contents to your CSS theme.
        </p>

    </note>

<h2>Change Individual Icons (CSS)</h2>

<p>You can change individual icons by overriding the background images for the respective CSS selector. 
The following code snippet overrides the fresh theme pin icon  used in the drag hint when reordering columns:<p>

<snippet>
/* 
 * The override should be placed after the import of the theme. 
 * Alternatively, you can aso increase the selector's specifcity.
 */
.ag-theme-balham .ag-icon-pin {
    background-image: url('path/to/my-pin-icon.svg');
}</snippet>

<p>The icon classes follow the <code>.ag-icon-{icon-file-name}</code> convention.</p>

<h2>Replace the icons by changing the icons path (Scss)</h2>

<p>If you are using Sass/Scss in your project, you can include the ag-grid theme source file and customize its properties by overriding the default variables, including the path to the icons. </p>

<p>The easiest way to replace the entire icon set is to change the <code>$ag-icons-path</code> Scss variable to point to a directory with your set of icons.
The icons should be <strong>14x14px sized SVG</strong> files. You can check the <a href="https://github.com/ag-grid/ag-grid/tree/latest/src/styles/icons">full icon list in the GitHub repository</a>. 
</p> 

<snippet>
// styles.scss
// This is an example of the application scss file; 
// Popular framework project scaffolders like angular-cli support 
// generating sass enabled projects. 
// For example, the `ng new` command accepts `--style scss`.

// override the icons path to a custom path
$ag-icons-path: "./my-icons/";

// import the Sass files from the ag-Grid npm package. //
// The "~" path prefix below relies on Webpack's sass-loader -
// https://github.com/webpack-contrib/sass-loader. 
@import "~ag-grid/src/styles/ag-grid.scss";
@import "~ag-grid/src/styles/ag-theme-balham.scss";</snippet>

<p>A working Sass / Webpack which includes the source theme file is available in the <a href="https://github.com/ag-grid/ag-grid-seed/tree/master/typescript-webpack/src">ag grid seed repository</a>.

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

    <?= example('Icons', 'icons', 'generated', array('enterprise' => true, 'extras' => array('fontawesome') )) ?>


<?php include '../documentation-main/documentation_footer.php';?>
