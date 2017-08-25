<?php
$key = "Icons";
$pageTitle = "ag-Grid Icons";
$pageDescription = "ag-Grid comes with default svg icons. You can provide your own icons for the grid to use.";
$pageKeyboards = "ag-Grid Pinning";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

<h1 class="first-h1" id="icons">Icons</h1>

    <p>
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
            The old icons are available XXX
        </p>

        <p>
            If you are creating your own them and want to include the stock icons, this is easiest
            done by using this file YYY
        </p>

    </note>

<h3>Change Individual Icons (CSS)</h3>

<p>You can change individual icons by overriding the background images for the respective CSS selector. 
The following code snippet overrides the fresh theme pin icon  used in the drag hint when reordering columns:<p>

<pre>
/* 
 * The override should be placed after the import of the theme. 
 * Alternatively, you can aso increase the selector's specifcity.
 */
.ag-fresh .ag-icon-pin {
    background-image: url('path/to/my-pin-icon.svg');
}
</pre>

<p>The icon classes follow the <code>.ag-icon-{icon-file-name}</code> convention.</p>

<h3>Replace the icons by changing the icons path (Scss)</h3>

<p>If you are using Sass/Scss in your project, you can include the ag-grid theme source file and customize its properties by overriding the default variables, including the path to the icons. </p>

<p>The easiest way to replace the entire icon set is to change the <code>$ag-icons-path</code> Scss variable to point to a directory with your set of icons.
The icons should be <strong>14x14px sized SVG</strong> files. You can check the <a href="https://github.com/ag-grid/ag-grid/tree/latest/src/styles/icons">full icon list in the GitHub repository</a>. 
</p> 

<pre>
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
@import "~ag-grid/src/styles/theme-fresh.scss";
</pre>

<p>A working Sass / Webpack which includes the source theme file is available in the <a href="https://github.com/ag-grid/ag-grid-seed/tree/master/typescript-webpack/src">ag grid seed repository</a>.

<h3>Set the icons through <code>gridOptions</code> (JavaScript)</h3>
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

    <pre><span class="codeComment">// column header items</span>
menu
filter
columns
sortAscending
sortDescending
sortUnSort

<span class="codeComment">// expand / contract row group</span>
groupExpanded
groupContracted

<span class="codeComment">// expand / contract column group</span>
columnGroupOpened
columnGroupClosed

<span class="codeComment">// tool panel column group open / close</span>
columnSelectOpen
columnSelectClosed

<span class="codeComment">// row checkbox selection and tool panel column selection</span>
checkboxChecked
checkboxUnchecked
checkboxIndeterminate

<span class="codeComment">// tool panel column selection, when read only (ie disabled checkboxes)</span>
checkboxCheckedReadOnly
checkboxUncheckedReadOnly
checkboxIndeterminateReadOnly

<span class="codeComment">// when moving columns</span>
columnMovePin <span class="codeComment">// when column is to the left, before it gets pinned</span>
columnMoveAdd <span class="codeComment">// when adding a column</span>
columnMoveHide <span class="codeComment">// when removing a column</span>
columnMoveMove <span class="codeComment">// when moving a column</span>
columnMoveLeft <span class="codeComment">// when moving and scrolling left</span>
columnMoveRight <span class="codeComment">// when moving and scrolling right</span>
columnMoveGroup <span class="codeComment">// when about to drop into group panel</span>
columnMoveValue <span class="codeComment">// when about to drop into value panel</span>
columnMovePivot <span class="codeComment">// when about to drop into pivot panel</span>
dropNotAllowed <span class="codeComment">// when trying to drop column into group/value/pivot panel and column doesn't support it</span>

<span class="codeComment">// menu</span>
menuPin <span class="codeComment">// beside the column pin menu item</span>
menuValue <span class="codeComment">// beside the column value menu item</span>
menuAddRowGroup <span class="codeComment">// beside the column row group menu item</span>
menuRemoveRowGroup <span class="codeComment">// beside the column row group menu item</span>
clipboardCopy <span class="codeComment">// beside the copy to clipboard menu item</span>
clipboardPaste <span class="codeComment">// beside the paste from clipboard menu item</span>

<span class="codeComment"></span>// column drop panels
rowGroupPanel <span class="codeComment">// beside where to drop columns for row group</span>
pivotPanel <span class="codeComment">// beside where to drop columns for pivot</span>
valuePanel <span class="codeComment">// beside where to drop columns for value</span>
</pre>

    <p>
        Setting the icons on the column definitions is identical, except group icons are not used in column definitions.
    </p>

    <p>
        The icon can be any of the following:
        <ul>
            <li>
                <b>String:</b> The string will be treated as html. Use to return just text, or HTML tags.
            </li>
            <li>
                <b>Function:</b> A function that returns either a String or a DOM node or element.
            </li>
        </ul>
    </p>

    <p>
        The example below shows a mixture of different methods for providing icons. The grouping is done with images,
        and the header icons use a mix of Font Awesome and strings.
    </p>

    <p>
        (note: the example below uses ag-Grid-Enterprise, this is to demonstrate the icons for grouping only)
    </p>

    <show-example example="exampleIcons"></show-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>
