<?php
$pageTitle = "ag-Grid Themes: Overview of our Themes.";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It comes with five themes out of the box, this page covers how to use these themes, how to style theme and when to create your own.";
$pageKeyboards = "ag-Grid Styling";
$pageGroup = "themes";
include '../documentation-main/documentation_header.php';
?>


<h1> Themes </h1>

<note>
    <h2>Legacy Themes</h2>

    <p>
    The 14.2.0 release (October 2017) included remakes of the themes with more consistent whitespace and <a href="#customizing-sass-variables">easier customization through Sass variables</a>.
    The previous ones are still shipped, but deprecated and likely to be removed after several releases.
    If you are using any of the themes below, give the new counterpart a try.
    </p>

    <p>
        <table class="theme-table reference">
            <tr>
                <th>Old Theme</th><th>New Theme</th>
            </tr>
            <tr>
                <td>ag-fresh</td><td>ag-theme-fresh</td>
            </tr>
            <tr>
                <td>ag-dark</td><td>ag-theme-dark</td>
            </tr>
            <tr>
                <td>ag-blue</td><td>ag-theme-blue</td>
            </tr>
            <tr>
                <td>ag-material</td><td>ag-theme-material</td>
            </tr>
            <tr>
                <td>ag-bootstrap</td><td>ag-theme-bootstrap</td>
            </tr>
        </table>
    </p>

    <p>
        If you move to a new theme you will notice the spacing is larger.
        Customising the new theme to have less spacing (so it looks more like
        an old theme) see the Github example
        <a href="https://github.com/ag-grid/ag-grid-customise-theme">ag-grid-customise-theme</a>.
    </p>

</note>

    <p>
        ag-Grid is designed to have its look and feel derived from a theme. The following themes are available out of the box:
    </p>

<dl>
    <dt>ag-theme-balham</dt>
    <dd>The default flat light theme which is used in most of the examples in the documentation.</dd>

    <dt>ag-theme-balham-dark</dt>
    <dd>A dark variation of the balham theme, used in the enterprise examples in the documentation.</dd>

    <dt>ag-theme-material</dt>
    <dd>A theme designed according to the Google Material Language Specs.</dd>

    <dt>ag-theme-fresh</dt>
    <dd>A light gray theme.</dd>

    <dt>ag-theme-dark</dt>
    <dd>A dark grey theme.</dd>

    <dt>ag-theme-blue</dt>
    <dd>A light theme with blue headers.</dd>

    <dt>ag-theme-bootstrap</dt>
    <dd>Neutral / white theme that fits well in the context of bootstrap components. Notice: the theme does not have a bootstrap dependency.</dd>
</dl>

    <p>
        To use a theme, add the theme class name to the <code>div</code> element where the ag-Grid directive is attached.
    </p>

    <p>
        The following is an example of using the balham theme:
    </p>

    <snippet language="html">
     &lt;div id="myGrid" class="ag-theme-balham"&gt;&lt;/div&gt; 
</snippet>

    <p>
        The following is an example of using the dark balham theme:
    </p>

    <snippet language="html">
    &lt;div id="myGrid" class="ag-theme-balham-dark"&gt;&lt;/div&gt;
</snippet> 

    <h2>When to Create a Theme</h2>

    <p>
        You have the following options when choosing a theme:
    </p>

    <ol class="content">
        <li>Use one of the provided themes e.g. <code>ag-theme-balham</code>.</li>
        <li>Use one of the provided themes and tweak using the provided <a href="#customizing-sass-variables">Sass variables</a>.</li>
        <li>Create your own theme from scratch. This is the most complex approach and you are more
        exposed to breaking changes in ag-Grid releases.</li>
    </ol>

    <p>
        You should only create your own theme when options 1 and 2 above don't suit, as it is
        the most difficult.
        If you do decide to create your own theme, then you can use one of the provided themes and
        use that as a template. They can be found on GitHub here:
        <a href="https://github.com/ag-grid/ag-grid/tree/master/src/styles">https://github.com/ceolter/ag-grid/tree/master/src/styles</a>.
    </p>

    <p>
        This section does not provide an example of building a theme as a number of themes
        are already provided with ag-Grid - these can be used as a basis for any additional themes you may wish to create.
    </p>

    <h2 id="when-to-style-via-themes">When to Style via Themes</h2>

    <p>
        Themes are intended to change the overall look and feel of a grid. If you want to style a particular
        column, or a particular header, consider using either cell and header renderers, or applying CSS
        classes or styles at the column definition level.
    </p>

    <p>
        Sometimes it is possible to achieve the same effect using custom renderers as it is with themes.
        If so, use whichever one makes more sense for you, there isn't a hard and fast rule.
    </p>

    <h2 id="what-to-style-via-themes">What to Style via Themes</h2>

    <p>
        Any of the CSS classes described below can have style associated with them.  
        However you should be cautious about overriding style that is associated outside of the theme.
        For example, the ag-pinned-cols-viewport, has the following style:
    </p>

    <snippet language="css">
   .ag-pinned-cols-viewport {
        float: left;
        position: absolute;
        overflow: hidden;
    }</snippet>

    <p>
        The style attributes float, position and overflow are intrinsic to how the grid works. Changing
        these values will change how the grid operates. If unsure, take a look at the styles associated
        with an element using your browsers developer tools. If still unsure, try it out, if the style
        you want to apply breaks the grid, then it's not a good style to apply!
    </p>

    <h2 id="structure-example">Structure Example</h2>

    <p>
        The exact structure of the DOM within ag-Grid is dependent on its configuration and what
        data is present. This page takes the below basic example grid, with one pinned column, as an
        example to demonstrate the DOM structure. The reader is encouraged to inspect the DOM
        (using your browsers developer tools) to dig deeper.
    </p>

<?= example('ag-Grid styling', 'styling', 'generated') ?>

    <h2 id="high-level-overview">High Level Overview</h2>

    <p>
        The diagram below shows the hierarchy of the core div elements which form the four quadrants
        of the table. The four quadrants are as follows:
    </p>

    <ul class="content">
        <li><b>ag-pinned-header:</b> Contains the pinned header cells. This container does not scroll.</li>
        <li><b>ag-header-container:</b> Contains the non-pinned header cells. This container is within
            a viewport (<b>ag-header-viewport</b>) that scrolls horizontally to match the position of the ag-body-viewport. This
            container does not scroll vertically.</li>
        <li><b>ag-pinned-cols-container:</b> Contains the pinned rows. This container is within a
            viewport (<b>ag-pinned-cols-viewport</b>) that scrolls vertically to match the position of the ag-body-viewport. This
            container does not scroll horizontally.</li>
        <li><b>ag-body-container:</b> Contains the non-pinned rows. This container is within a
            viewport (<b>ag-body-viewport</b>) that scrolls both vertically and horizontally.</li>
    </ul>

    <note>
        Both the ag-header-viewport and ag-pinned-cols-viewport do not have scrollbars. They
        only scroll in response to changes to the ag-body-viewport.
    </note>

    <h3>Core DIV Elements</h3>

    <div class='inline' style="margin-left: 50px;">
        ag-root <br/>
        <!-- header -->
        <div class='block'>
            ag-header <br/>
            <div class='inline'>
                ag-pinned-header <br/>
                <img src="pinnedHeader.png"/>
            </div>
            <div class='inline'>
                ag-header-viewport <br/>
                <div class='inline'>
                    ag-header-container <br/>
                    <img src="header.png"/>
                </div>
            </div>
        </div>
        <!-- body -->
        <div class='block'>
            ag-body <br/>
            <div class='inline'>
                ag-pinned-cols-viewport <br/>
                <div class='inline'>
                    ag-pinned-cols-container <br/>
                    <img src="pinnedBody.png"/>
                </div>
            </div>
            <div class='inline'>
                ag-body-viewport-wrapper <br/>
                <div class='inline'>
                    ag-body-viewport <br/>
                    <div class='inline'>
                        ag-body-container <br/>
                        <img src="body.png"/>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <h3>Detailed Breakdown</h3>

    <p>Below gives a detailed breakdown of the DOM for the example. In the example, the following is highlighted:</p>

    <ul class="content">
        <li><span class="agClass">Classes:</span> These CSS classes can have style associated with them in a theme.</li>
        <li><span class="agAttr">Row & Col Attributes:</span> These attributes can be used to identify rows and columns using CSS selectors.</li>
        <li><span class="agPos">Position Attributes:</span> Nothing to do with style, however they stick out below, so worth mentioning. These
            are set by ag-Grid to position the rows within the containers. Because rows are virtualised, and widths are dynamic, these
            attributes cannot be set as classes, they are set as dynamic styles by ag-Grid.</li>
    </ul>

<snippet language="html">&lt;div class='ag-root ag-layout-normal'>

    &lt;!-- header -->
    &lt;div class="ag-header">
        &lt;div class="ag-pinned-header">

            &lt;!-- pinned header cell -->
            &lt;div class="ag-header-cell">
                &lt;div class="ag-header-label">Athlete&lt;/div>
            &lt;/div>
            <!-- pinned header cell -->
            &lt;div class="ag-header-cell">
                &lt;div class="ag-header-label">Age&lt;/div>
            &lt;/div>

        &lt;/div>
        &lt;div class="ag-header-viewport">
            &lt;div class="ag-header-container">

                &lt;!-- main header cell -->
                &lt;div class="ag-header-cell">
                    &lt;div class="ag-header-label">County&lt;/div>
                &lt;/div>
                &lt;!-- main header cell -->
                &lt;div class="ag-header-cell">
                    &lt;div class="ag-header-label">Year&lt;/div>
                &lt;/div>

                &lt;!-- the other header cells... -->
            &lt;/div>
        &lt;/div>
    &lt;/div>

    &lt;!-- body -->
    &lt;div class="ag-body">
        &lt;div class="ag-pinned-cols-viewport">
            &lt;div class="ag-pinned-cols-container">

                &lt;div class="ag-row ag-row-even" row="0" style="top: 0px; height: 30px;">
                    &lt;div class="ag-cell cell-col-0" col="0" style="width: 150px;">Michael Phelps&lt;/div>
                    &lt;div class="ag-cell cell-col-1" col="1" style="width: 90px;">23&lt;/div>
                &lt;/div>

                &lt;div class="ag-row ag-row-odd" row="1" style="top: 30px; height: 30px;">
                    &lt;div class="ag-cell cell-col-0" col="0" style="width: 150px;">Michael Phelps&lt;/div>
                    &lt;div class="ag-cell cell-col-1" col="1" style="width: 90px;">19&lt;/div>
                &lt;/div>

                &lt;!-- the other pinned rows... -->

            &lt;/div>
        &lt;/div>
        &lt;div class="ag-body-viewport-wrapper">
            &lt;div class="ag-body-viewport">
                &lt;div class="ag-body-container">

                    &lt;div class="ag-row ag-row-even" row="0" style="top: 0px; height: 30px; width: 830px;">
                        &lt;div class="ag-cell cell-col-2" col="2" style="width: 120px;">United States&lt;/div>
                        &lt;div class="ag-cell cell-col-3" col="3" style="width: 90px;">2008&lt;/div>
                        &lt;div class="ag-cell cell-col-4" col="4" style="width: 110px;">24/08/2008&lt;/div>
                        &lt;!-- the other row cells... -->
                    &lt;/div>

                    &lt;div class="ag-row ag-row-odd" row="1" style="top: 30px; height: 30px; width: 830px;">
                        &lt;div class="ag-cell cell-col-2" col="2" style="width: 120px;">United States&lt;/div>
                        &lt;div class="ag-cell cell-col-3" col="3" style="width: 90px;">2004&lt;/div>
                        &lt;div class="ag-cell cell-col-4" col="4" style="width: 110px;">29/08/2004&lt;/div>
                        &lt;!-- the other row cells... -->
                    &lt;/div>

                    &lt;!-- the other body rows... -->

                &lt;/div>
            &lt;/div>
        &lt;/div>
    &lt;/div>
&lt;/div>
</snippet>

    <h2 id="styling-with-for-print">Styling with For Print</h2>

    <p>
        Styling with the option <a href="../javascript-grid-for-print/">domLayout=forPrint</a>
        is similar to styling as normal, however the dom layout is much simpler.
        When laying out for printing, there are no pinned columns and no viewports for scrolling.
    </p>

<snippet language="html">&lt;div class="ag-root ag-layout-for-print">

    &lt;!-- header -->
    &lt;div class="ag-header-container">
        &lt;div class="ag-header-cell" style="width: 120px;">
            &lt;span>Athlete&lt;/span>
        &lt;/div>
        &lt;div class="ag-header-cell" style="width: 90px;">
            &lt;span>Age&lt;/span>
        &lt;/div>

        &lt;!-- the other headers... -->

    &lt;/div>

    <!-- body -->
    &lt;div class="ag-body-container">
        &lt;div class="ag-row ag-row-even" row="0" style="height: 30px; width: 830px;">
            &lt;div class="ag-cell cell-col-0" col="0" style="width: 120px;">Michael Phelps&lt;/div>
            &lt;div class="ag-cell cell-col-1" col="1" style="width: 90px;">United States&lt;/div>

            &lt;!-- the other row cells... -->

        &lt;/div>
        &lt;div class="ag-row ag-row-odd" row="1" style="height: 30px; width: 830px;">
            &lt;div class="ag-cell cell-col-0" col="0" style="width: 120px;">Michael Phelps&lt;/div>
            &lt;div class="ag-cell cell-col-1" col="1" style="width: 90px;">United States&lt;/div>

            &lt;!-- the other row cells... -->

        &lt;/div>

        &lt;!-- the other rows... -->

    &lt;/div>
&lt;/div>
</snippet>

<h2 id="highlighting-rows-and-columns">Highlighting Rows and Columns</h2>

<p>
    The class <code>ag-row-hover</code> and <code>ag-column-hover</code> are added
    to cells as the mouse is dragged over the cells row or column.
</p>

<p>
    The example below demonstrates the following:
    <ul>
        <li>
            CSS class <code>ag-row-hover</code> has background color added to it,
            so when you hover over a cell, the row will be highlighted.
        </li>
        <li>
            CSS class <code>ag-column-hover</code> has background color added to it,
            so when you hover over a cell or a header, the column will be highlighted.
        </li>
        <li>
            If you hover over a header group, all columns in the group will be highlighted.
        </li>
    </ul>
</p>

<?= example('Highlight Rows And Columns', 'highlight-rows-and-columns', 'generated') ?>

<h2 id="customizing-sass-variables">Customizing the themes with Sass variables</h2>

<p>
ag-Grid themes are build using <a href="http://sass-lang.com">Sass</a>.
This means that you can change the looks of the theme you use using Sass,
by overriding the theme variables value and referencing the Sass source files afterwards.</p> 

<p>Some of the things you can change in the theme include:</p>

<ul class="content">
    <li>Changing the text / header / tool panel foreground and background colors</li>
    <li>Changing the icons size and color</li>
    <li>Changing the cell / row spacing*</li>
</ul>

<note>
* If you are going to change the <strong>row or header height</strong>, you should also modify the respective options in the JavaScript grid configuration. 
This is a redundant step we are looking into removing in the future.
</note>

<p>The example below is taken from <a href="https://github.com/ag-grid/ag-grid-customise-theme">Theme Customization Example Repository</a>:</p>

<snippet>
// Customize the look and feel of the grid with Sass variables
// Up-to-date list of variables is available in the source code: https://github.com/ag-grid/ag-grid/blob/latest/src/styles/ag-theme-fresh.scss 
$icons-path: "~ag-grid/src/styles/icons/";

// changes the border color
$border-color: #FF0000;

// Changes the font size
// $font-size: 12px;

// Changes the font family
// $font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;

// Reverts the cell horizontal padding change between ag-fresh and ag-theme-fresh
// $cell-horizontal-padding: 2px;

// changes the icon color
$icon-color: red;


@import '~ag-grid/src/styles/ag-grid.scss';
@import '~ag-grid/src/styles/ag-theme-fresh.scss';</snippet>

<p>A runnable version of the example above is available in the <a href="https://github.com/ag-grid/ag-grid-customise-theme">ag-Grid Customize Theme repository</a>. </p>

<p>Following is a list of the most common Sass variables used, their default values for the fresh theme, and a short explanation of their purpose.</p>

<dl class="content">
<dt>$accent-color<code>black </code></dt>
<dd>
The color for the checked checkboxes.
</dd>
<dt>$ag-range-selected-color-1<code>rgba(120, 120, 120, 0.4) </code></dt>
<dd>
The selection background color.
</dd>
<dt>$background-color<code>white </code></dt>
<dd>
The default background color.
</dd>
<dt>$border-color<code>darkgrey </code></dt>
<dd>
The color used for all borders.
</dd>
<dt>$card-background-color<code>#f6f6f6 </code></dt>
<dd>
The background color for the context menu and the column menu.
</dd>
<dt>$cell-data-changed-color<code>white </code></dt>
<dd>
The background color used when the cell flashes when data is changed.
</dd>
<dt>$cell-highlight-border<code>2px solid darkgreen </code></dt>
<dd>
The border used to mark cells as being copied.
</dd>
<dt>$cell-horizontal-border<code>1px dotted silver </code></dt>
<dd>
The border delimiter between cells.
</dd>
<dt>$cell-horizontal-padding<code>$grid-size * 3 </code></dt>
<dd>
The cell horizontal padding.
</dd>
<dt>$chip-background-color<code>#ecf0f1 </code></dt>
<dd>
The background color of the column labels used in the grouping / pivoting.
</dd>
<dt>$disabled-foreground-color-opacity<code>0.5 </code></dt>
<dd>
The opacity of the disabled / empty text elements.
</dd>
<dt>$disabled-foreground-color<code>rgba(black, $disabled-foreground-color-opacity) </code></dt>
<dd>
The color of the disabled / empty text elements.
</dd>
<dt>$focused-cell-border-color<code>darkgrey </code></dt>
<dd>
The border color of the focused cell.
</dd>
<dt>$font-family<code>'Helvetica Neue', sans-serif </code></dt>
<dd>
The grid font family.
</dd>
<dt>$font-size<code>14px </code></dt>
<dd>
The grid font size.
</dd>
<dt>$font-weight<code>400 </code></dt>
<dd>
The grid font weight (400 equals 'normal').
</dd>
<dt>$foreground-opacity<code>1 </code></dt>
<dd>
The foreground opacity.
</dd>
<dt>$foreground-color<code>rgba(black, $foreground-opacity) </code></dt>
<dd>
The default color of the text.
</dd>
<dt>$grid-size<code>4px </code></dt>
<dd>
The basic unit used for the grid spacing and dimensions. Changing this makes the grid UI more / less compact.
</dd>
<dt>$header-background-color<code>transparent </code></dt>
<dd>
The header background color.
</dd>
<dt>$header-background-image<code>linear-gradient(white, lightgrey) </code></dt>
<dd>
The header background gradient - you can also refer to an an image with `url(...)`.
</dd>
<dt>$header-height<code>$grid-size * 6 + 1 </code></dt>
<dd>
The header row height - if you change this, you also have to change the value of the `headerHeight` in the grid options. We are looking into removing this redundant step in the future. 
</dd>
<dt>$header-icon-size<code>14px </code></dt>
<dd>
The header icon height.
</dd>
<dt>$hover-color<code>inherit </code></dt>
<dd>
The background color of the row when hovered. 
</dd>
<dt>$icon-color<code>#333 </code></dt>
<dd>
The icon color.
</dd>
<dt>$icon-size<code>12px </code></dt>
<dd>
The icon width and height (icons are square).
</dd>
<dt>$icons-path<code>'./icons/' </code></dt>
<dd>
The path to the icon svg files. If you are to change that, make sure that the directory you point to contains the complete set of icons.
</dd>
<dt>$menu-option-active-color<code>#bde2e5 </code></dt>
<dd>
The background color of the context / column menu items when hovered.
</dd>
<dt>$odd-row-background-color<code>#f6f6f6 </code></dt>
<dd>
The odd row background color.
</dd>
<dt>$panel-background-color<code>#f6f6f6 </code></dt>
<dd>
The background color of the column menu.
</dd>
<dt>$range-selection-background-color<code>rgba(120, 120, 120, 0.4) </code></dt>
<dd>
The background color of the selected cells.
</dd> 
<dt>$range-selection-highlight-color<code>rgba(255, 255, 255, 0.4) </code></dt>
<dd>
The background color for the copied cells.
</dd>
<dt>$row-height<code>($grid-size * 6 + 1) </code></dt>
<dd>
The row height - if you change this, you also have to change the value of the `rowHeight` in the grid options. We are looking into removing this redundant step in the future. 
</dd>
<dt>$secondary-font-family<code>$font-family </code></dt>
<dd>
The font family used in the header.
</dd>
<dt>$secondary-font-size<code>14px </code></dt>
<dd>
The header font size.
</dd>
<dt>$secondary-font-weight<code>400 </code></dt>
<dd>
The header font weight.
</dd>
<dt>$secondary-foreground-color-opacity<code>1 </code></dt>
<dd>
The header font color opacity.
</dd>
<dt>$secondary-foreground-color<code>rgba(#333, $secondary-foreground-color-opacity) </code></dt>
<dd>
The header font color.
</dd>
<dt>$tab-background-color<code>#e6e6e6 </code></dt>
<dd>
The background color of the tab in the column menu
</dd>
<dt>$tool-panel-background-color<code>#f6f6f6 </code></dt>
<dd>
The tool panel background color
</dd>
<dt>$value-change-delta-down-color<code>darkred </code></dt>
<dd>
The color used when the cell value decreases.
</dd>
<dt>$value-change-delta-up-color<code>darkgreen </code></dt>
<dd>
The color used when the cell value increases.
</dd>
<dt>$value-change-value-highlight-background-color<code>#cec </code></dt>
<dd>
The background color used when the cell value changes.
</dd>
<dt>$row-group-indent-size<code>$grid-size * 3 + $icon-size</code></dt>
<dd>
The indent used for the row groups.
</dd>
<dt>$toolpanel-indent-size<code>$grid-size + $icon-size</code></dt>
<dd>
The indent used for the tool panel hierarchy.
</dd>
</dl>

<p>You can examine the full, up-to-date list of the Sass variables and their usage in <a href="https://github.com/ag-grid/ag-grid/tree/master/src/styles">the source code of the themes</a>.
The <code>_ag-theme-common.scss</code> file contains the actual implementation, while the <code>ag-theme-*.scss</code> contain the default variable values for each theme.
</p>




<?php include '../documentation-main/documentation_footer.php';?>
