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
    The v19 release retired the old themes that are no longer shipped with ag-Grid.
    If you are using an old theme, you should change it to it's new version. See table below: 
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
        use that as a template. They can be found on GitHub <a href="https://github.com/ag-grid/ag-grid/tree/master/packages/ag-grid-community/src/styles">here</a>.
        <p>
        This section does not provide an example of building a theme as a number of themes
        are already provided with ag-Grid - these can be used as a basis for any additional themes you may wish to create.
        </p>
        <h3>Important</h3><p>If you create your own theme, it's name has to follow the <code>ag-theme-</code>&lt;theme name&gt; naming convention, otherwise 
        styles will not be applied to floating elements (eg. context menus) properly.</p>
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

<?= example('ag-Grid styling', 'styling', 'generated', array('processVue' => true)) ?>

    <h2 id="high-level-overview">High Level Overview</h2>

    <p>
        The code below shows the hierarchy of the core div elements which form the four quadrants
        of the table. The four quadrants are as follows:
    </p>

    <ul class="content">
        <li><b>ag-pinned-header:</b> Contains the pinned header cells. This container does not scroll.</li>
        <li><b>ag-header-container:</b> Contains the non-pinned header cells. This container is within
            a viewport (<b>ag-header-viewport</b>) that scrolls horizontally to match the position of the ag-body-viewport. This
            container does not scroll vertically.</li>
        <li><b>ag-pinned-left-cols-container or ag-pinned-right-cols-container:</b> Contains the pinned rows. This container is within a
            viewport (<b>ag-body-viewport</b>) that scrolls vertically. This container does not scroll horizontally.</li>
        <li><b>ag-center-cols-container:</b> Contains the non-pinned rows. This container is within a
            viewport (<b>ag-center-cols-viewport</b>) that scrolls horizontally.</li>
    </ul>

    <note>
        The ag-header-viewport does not have scrollbars. It only scrolls in response to changes to the ag-center-cols-viewport.
    </note>

    <h3>Detailed Breakdown</h3>

    <p>Below gives a detailed breakdown of the DOM for the example. In the example, the following is highlighted:</p>

    <ul class="content">
        <li><span class="agClass">Classes:</span> These CSS classes can have style associated with them in a theme.</li>
    </ul>

<snippet language="html">&lt;div class="ag-root"&gt;

    &lt;!-- header --&gt;
    &lt;div class="ag-header"&gt;
        &lt;div class="ag-pinned-left-header"&gt;
            &lt;div class="ag-header-row"&gt;
                &lt;!-- pinned header cell --&gt;
                &lt;div class="ag-header-cell"&gt;
                    &lt;div class="ag-cell-label-container"&gt;
                        &lt;div class="ag-header-cell-label"&gt;
                            &lt;span class="ag-header-cell-text"&gt;Athlete&lt;/span&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
                &lt;div class="ag-header-cell"&gt;
                    &lt;div class="ag-cell-label-container"&gt;
                        &lt;div class="ag-header-cell-label"&gt;
                            &lt;span class="ag-header-cell-text"&gt;Age&lt;/span&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
        &lt;div class="ag-header-viewport"&gt;
            &lt;div class="ag-header-container"&gt;
                &lt;div class="ag-header-row"&gt;
                    &lt;!-- main header cell --&gt;
                    &lt;div class="ag-header-cell"&gt;
                        &lt;div class="ag-cell-label-container"&gt;
                            &lt;div class="ag-header-cell-label"&gt;
                                &lt;span class="ag-header-cell-text"&gt;Country&lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                    &lt;div class="ag-header-cell"&gt;
                        &lt;div class="ag-cell-label-container"&gt;
                            &lt;div class="ag-header-cell-label"&gt;
                                &lt;span class="ag-header-cell-text"&gt;Year&lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;

                    &lt;!-- the other header cells... --&gt;

                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;

    &lt;!-- body --&gt;
    &lt;div class="ag-body-viewport&gt;
        &lt;div class="ag-pinned-left-cols-container"&gt;
            &lt;div class="ag-row"&gt;
                &lt;div class="ag-cell"&gt;Michael Phelps&lt;/div&gt;
                &lt;div class="ag-cell"&gt;23&lt;/div&gt;
            &lt;/div&gt;
            &lt;div class="ag-row"&gt;
                &lt;div class="ag-cell"&gt;Michael Phelps&lt;/div&gt;
                &lt;div class="ag-cell"&gt;19&lt;/div&gt;
            &lt;/div&gt;
            &lt;!-- the other pinned rows... --&gt;
        &lt;/div&gt;

        &lt;div class="ag-center-cols-viewport"&gt;
            &lt;div class="ag-center-cols-container"&gt;
                &lt;div class="ag-row"&gt;
                    &lt;div class="ag-cell"&gt;United States&lt;/div&gt;
                    &lt;div class="ag-cell"&gt;2008&lt;/div&gt;

                    &lt;!-- the other row cells... --&gt;

                &lt;/div&gt;
                &lt;div class="ag-row"&gt;
                    &lt;div class="ag-cell"&gt;United States&lt;/div&gt;
                    &lt;div class="ag-cell"&gt;2004&lt;/div&gt;

                    &lt;!-- the other row cells... --&gt;

                &lt;/div&gt;

                &lt;!-- the other body rows... --&gt;

            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;
</snippet>

    <h2 id="styling-with-for-print">Styling with For Print</h2>

    <p>
        Styling with the option <a href="../javascript-grid-for-print/">domLayout='print'</a>
        is similar to styling as normal, however the dom layout is much simpler.
        When laying out for printing, there are no pinned columns and no viewports for scrolling.
    </p>

<snippet language="html">&lt;div class="ag-root ag-layout-print"&gt;

    &lt;!-- header --&gt;
    &lt;div class="ag-header"&gt;
        &lt;div class="ag-header-viewport"&gt;
            &lt;div class="ag-header-container"&gt;
                &lt;div class="ag-header-row"&gt;
                    &lt;!-- main header cell --&gt;
                    &lt;div class="ag-header-cell"&gt;
                        &lt;div class="ag-cell-label-container"&gt;
                            &lt;div class="ag-header-cell-label"&gt;
                                &lt;span class="ag-header-cell-text"&gt;Athlete&lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                    &lt;div class="ag-header-cell"&gt;
                        &lt;div class="ag-cell-label-container"&gt;
                            &lt;div class="ag-header-cell-label"&gt;
                                &lt;span class="ag-header-cell-text"&gt;Age&lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                    &lt;div class="ag-header-cell"&gt;
                        &lt;div class="ag-cell-label-container"&gt;
                            &lt;div class="ag-header-cell-label"&gt;
                                &lt;span class="ag-header-cell-text"&gt;Country&lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;
                    &lt;div class="ag-header-cell"&gt;
                        &lt;div class="ag-cell-label-container"&gt;
                            &lt;div class="ag-header-cell-label"&gt;
                                &lt;span class="ag-header-cell-text"&gt;Year&lt;/span&gt;
                            &lt;/div&gt;
                        &lt;/div&gt;
                    &lt;/div&gt;

                    &lt;!-- the other header cells... --&gt;

                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;

    &lt;!-- body --&gt;
    &lt;div class="ag-body-viewport&gt;
        &lt;div class="ag-center-cols-viewport"&gt;
            &lt;div class="ag-center-cols-container"&gt;
                &lt;div class="ag-row"&gt;
                    &lt;div class="ag-cell"&gt;Michael Phelps&lt;/div&gt;
                    &lt;div class="ag-cell"&gt;23&lt;/div&gt;
                    &lt;div class="ag-cell"&gt;United States&lt;/div&gt;
                    &lt;div class="ag-cell"&gt;2008&lt;/div&gt;

                    &lt;!-- the other row cells... --&gt;

                &lt;/div&gt;
                &lt;div class="ag-row"&gt;
                    &lt;div class="ag-cell"&gt;Michael Phelps&lt;/div&gt;
                    &lt;div class="ag-cell"&gt;19&lt;/div&gt;
                    &lt;div class="ag-cell"&gt;United States&lt;/div&gt;
                    &lt;div class="ag-cell"&gt;2004&lt;/div&gt;

                    &lt;!-- the other row cells... --&gt;

                &lt;/div&gt;

                &lt;!-- the other body rows... --&gt;

            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;
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

<?= example('Highlight Rows And Columns', 'highlight-rows-and-columns', 'generated', array('processVue' => true)) ?>

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

<p>For a live example, see: <a href="https://github.com/ag-grid/ag-grid-customise-theme">Theme Customization Example Repository</a>:</p>

<p>Following is a list of Sass variables, their default values, and a short explanation of their purpose.</p>
<style>
.tabpanel, .tabheader, .tabpanel .content {
    display: flex
}
.tabpanel {
    flex-direction: column;
    height: 500px;
    border: 1px solid lightgray;
    border-radius: 5px;
}
.tabheader {
    background-image: linear-gradient(to bottom right, #0084e7, #0067b4);
    height: 50px;
    flex: none;
    align-items: flex-end;
}
.tab {
    height: 40px;
    line-height: 40px;
    background-color: #ebebeb;
    cursor: pointer;
    margin: 0 0 0 10px;
    padding: 0 5px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    user-select: none;
    -ms-user-select: none;
}
.tab.selected {
    border: 1px solid #ebebeb;
    border-bottom-width: 0;
    background-color: white;
    color: #0084e7;
}
.tabpanel .content {
    height: calc(100% - 45px);
}
.tabpanel .content > div {
    width: 100%;
    max-height: 100%;
    overflow-y: auto;
    margin: 10px;
    border: 1px solid lightgray;
    border-left-width: 0;
}
.tabpanel table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
} 
.tabpanel tr {
    height: 40px;
}
.tabpanel table th, .tabpanel table td {
    border: 1px solid #ebebeb;
    padding: 5px;
}
.tabpanel table tr:first-of-type th {
    border-top-width: 0;
}
.tabpanel table th {
    text-align: center;
}
.tabpanel table tbody tr td:first-of-type {
    white-space: pre;
}
.hidden {
    display: none;
}
</style> 
<script>
window.addEventListener("load", function() {
    var tabs = document.querySelectorAll('.tabpanel .tab');

    function changeActiveTab(e) {
        var tab, selectedIdx, currentIdx, i, cts;

        if (e.target.classList.contains('selected')) { return; }
        for (i = 0; i < tabs.length; i++) {
            tab = tabs[i];
            if (tab.classList.contains('selected')) { 
                selectedIdx = i; 
            }
            if (tab === e.target) {
                currentIdx = i;
            }
            if (currentIdx != null && selectedIdx != null) { break; }
        }

        tabs[selectedIdx].classList.toggle('selected');
        tabs[currentIdx].classList.toggle('selected');

        cts = document.querySelectorAll('.tabpanel .content > div');

        cts[selectedIdx].classList.toggle('hidden');
        cts[currentIdx].classList.toggle('hidden');
    }
    for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        tab.addEventListener('click', changeActiveTab);
    }
});
</script>
<div class="tabpanel">
    <div class="tabheader">
    <div class="tab selected">Base Variables</div>
        <div class="tab">Balham Theme</div>
        <div class="tab">Material Theme</div>
    </div>
    <div class="content">
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Variable Name</th>
                        <th style="width: 195px;">Default Value</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                <tr>
                    <td>foreground-opacity</td>
                    <td>1</td>
                    <td>The foreground opacity.</td>
                </tr>
                <tr>
                    <td>secondary-foreground-color-opacity</td>
                    <td>1</td>
                    <td>The header font color opacity.</td>
                </tr>
                <tr>
                    <td>disabled-foreground-color-opacity</td>
                    <td>0.5</td>
                    <td>The opacity of the disabled / empty text elements.</td>
                </tr>
                <tr>
                    <td>icon-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The icon color.</td>
                </tr>
                <tr>
                    <td>alt-icon-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The secondary icon, used on icons with two colors (eg. checkbox background).</td>
                </tr>
                <tr>
                    <td>foreground-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The default color of the text.</td>
                </tr>
                <tr>
                    <td>secondary-foreground-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The header font color.</td>
                </tr>
                <tr>
                    <td>disabled-foreground-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The color of the disabled / empty text elements.</td>
                </tr>
                <tr>
                    <td>menu-option-active-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The background color of the context / column menu items when hovered.</td>
                </tr>
                <tr>
                    <td>input-disabled-background-color</td>
                    <td>#ebebeb</td>
                    <td>The color of disabled input field</td>
                </tr>
                <tr>
                    <td>card-background-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The background color for the context menu and the column menu.</td>
                </tr>
                <tr>
                    <td>border-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The color used for all borders.</td>
                </tr>
                <tr>
                    <td>scroll-spacer-border</td>
                    <td>1px solid <code>border-color</code></td>
                    <td>The border that separates the pinned columns from the scrollable area within the horizontal scrollbar</td>
                </tr>
                <tr>
                    <td>primary-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The main color associated with selected cells and other items (eg. cell border color, sidbar selected tab border).</td>
                </tr>
                <tr>
                    <td>accent-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The color for the checked checkboxes.</td>
                </tr>
                <tr>
                    <td>background-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The default background color.</td>
                </tr>
                <tr>
                    <td>odd-row-background-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The odd row background color.</td>
                </tr>
                <tr>
                    <td>editor-background-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The background color of cells being edited.</td>
                </tr>
                <tr>
                    <td>header-background-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The header background color.</td>
                </tr>
                <tr>
                    <td>header-cell-hover-background-color</td>
                    <td>$header-background-color</td>
                    <td>The header background color while hovering</td>
                </tr>
                <tr>
                    <td>header-cell-moving-background-color</td>
                    <td>#bebebe</td>
                    <td>The header background color while being moved.</td>
                </tr>
                <tr>
                    <td>header-foreground-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The header text color.</td>
                </tr>
                <tr>
                    <td>header-background-image</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The header background gradient - you can also refer to an an image with `url(...)`.</td>
                </tr>
                <tr>
                    <td>panel-background-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The background color of the column menu.</td>
                </tr>
                <tr>
                    <td>tool-panel-background-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The tool panel background color</td>
                </tr>
                <tr>
                    <td>chip-background-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The background color of the column labels used in the grouping / pivoting.</td>
                </tr>
                <tr>
                    <td>range-selection-background-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The background color of the selected cells.</td>
                </tr>
                <tr>
                    <td>hover-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The background color of the row when hovered.</td>
                </tr>
                <tr>
                    <td>selected-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The background color of selected rows.</td>
                </tr>
                <tr>
                    <td>cell-data-changed-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The background color used when the cell flashes when data is changed.</td>
                </tr>
                <tr>
                    <td>focused-cell-border-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The border color of the focused cell.</td>
                </tr>
                <tr>
                    <td>tab-background-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The background color of the tab in the column menu</td>
                </tr>
                <tr>
                    <td>cell-highlight-border</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The border used to mark cells as being copied.</td>
                </tr>
                <tr>
                    <td>cell-horizontal-border</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The border delimiter between cells.</td>
                </tr>
                <tr>
                    <td>ag-range-selected-color-1</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The selection background color.</td>
                </tr>
                <tr>
                    <td>ag-range-selected-color-2</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The selection background color when it overlaps with another selection (range) 1 level.</td>
                </tr>
                <tr>
                    <td>ag-range-selected-color-3</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The selection background color when it overlaps with another selection (range) 2 levels.</td>
                </tr>
                <tr>
                    <td>ag-range-selected-color-4</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The selection background color when it overlaps with another selection (range) 3 levels.</td>
                </tr>
                <tr>
                    <td>value-change-delta-up-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The color used when the cell value increases.</td>
                </tr>
                <tr>
                    <td>value-change-delta-down-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The color used when the cell value decreases.</td>
                </tr>
                <tr>
                    <td>value-change-value-highlight-background-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The background color used when the cell value changes.</td>
                </tr>
                <tr>
                    <td>row-floating-background-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The background color of the pinned rows.</td>
                </tr>
                <tr>
                    <td>row-stub-background-color</td>
                    <td><code>&lt;no default&gt;</code></td>
                    <td>The color of row stub background (see: <a href="/javascript-grid-row-node/">Row Node</a>)</td>
                </tr>
                <tr>
                    <td>grid-size</td>
                    <td>4px</td>
                    <td>The basic unit used for the grid spacing and dimensions. Changing this makes the grid UI more / less compact.</td>
                </tr>
                <tr>
                    <td>icon-size</td>
                    <td>12px</td>
                    <td>The icon width and height (icons are square).</td>
                </tr>
                <tr>
                    <td>header-height</td>
                    <td><code>grid-size</code> * 6 + 1</td>
                    <td>The header row height - if you change this, you also have to change the value of the `headerHeight` in the grid options. We are looking into removing this redundant step in the future.</td>
                </tr>
                <tr>
                    <td>row-height</td>
                    <td><code>grid-size</code> * 6 + 1</td>
                    <td>The row height - if you change this, you also have to change the value of the `rowHeight` in the grid options. We are looking into removing this redundant step in the future.</td>
                </tr>
                <tr>
                    <td>cell-horizontal-padding</td>
                    <td><code>grid-size</code> * 3</td>
                    <td>The cell horizontal padding.</td>
                </tr>
                <tr>
                    <td>virtual-item-height</td>
                    <td><code>grid-size</code> * 5</td>
                    <td>The height of virtual items (eg. Set Filter items).</td>
                </tr>
                <tr>
                    <td>header-icon-size</td>
                    <td>14px</td>
                    <td>The header icon height.</td>
                </tr>
                <tr>
                    <td>font-family</td>
                    <td>'Helvetica Neue', sans-serif</td>
                    <td>The grid font family.</td>
                </tr>
                <tr>
                    <td>font-size</td>
                    <td>14px</td>
                    <td>The grid font size.</td>
                </tr>
                <tr>
                    <td>font-weight</td>
                    <td>400</td>
                    <td>The grid font weight</td>
                </tr>
                <tr>
                    <td>secondary-font-family</td>
                    <td><code>font-family</code></td>
                    <td>The font family used in the header.</td>
                </tr>
                <tr>
                    <td>secondary-font-size</td>
                    <td>14px</td>
                    <td>The header font size.</td>
                </tr>
                <tr>
                    <td>secondary-font-weight</td>
                    <td>400</td>
                    <td>The header font weight.</td>
                </tr>
                <tr>
                    <td>card-shadow</td>
                    <td>none</td>
                    <td>Box shadow value for the context menu and the column menu.</td>
                </tr>
                <tr>
                    <td>card-radius</td>
                    <td>0</td>
                    <td>Border radius for the context menu and the column menu.</td>
                </tr>
                <tr>
                    <td>row-border-width</td>
                    <td>0</td>
                    <td>the row border width.</td>
                </tr>
                <tr>
                    <td>toolpanel-indent-size</td>
                    <td><code>grid-size</code> * <code>icon-size</code></td>
                    <td>The indent used for the tool panel hierarchy.</td>
                </tr>
                <tr>
                    <td>tooltip-background-color</td>
                    <td>#535353</td>
                    <td>The tooltip background color.</td>
                </tr>
                <tr>
                    <td>tooltip-foreground-color</td>
                    <td>#ffffff</td>
                    <td>The tooltip foreground color.</td>
                </tr>
                <tr>
                    <td>tooltip-border-radius</td>
                    <td>2px</td>
                    <td>The tooltip boder radius.</td>
                </tr>
                <tr>
                    <td>tooltip-padding</td>
                    <td>5px</td>
                    <td>The tooltip padding.</td>
                </tr>
                <tr>
                    <td>tooltip-border-width</td>
                    <td>1px</td>
                    <td>The tooltip border width.</td>
                </tr>
                <tr>
                    <td>tooltip-border-style</td>
                    <td>solid</td>
                    <td>The tooltip border style.</td>
                </tr>
                <tr>
                    <td>tooltip-border-color</td>
                    <td>#ebebeb</td>
                    <td>The tooltip border color</td>
                </tr>
                </tbody>
            </table>
        </div>
        <div class="hidden">
            <table>
                <thead>
                    <tr>
                        <th>Variable Name</th>
                        <th>Default Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>foreground-opacity</td>
                        <td>0.87</td>
                    </tr>
                    <tr>
                        <td>secondary-foreground-color-opacity</td>
                        <td>0.54</td>
                    </tr>
                    <tr>
                        <td>disabled-foreground-color-opacity</td>
                        <td>0.38</td>
                    </tr>
                    <tr>
                        <td>grid-size</td>
                        <td>4px</td>
                    </tr>
                    <tr>
                        <td>icon-size</td>
                        <td>16px</td>
                    </tr>
                    <tr>
                        <td>row-height</td>
                        <td><code>grid-size</code> * 7</td>
                    </tr>
                    <tr>
                        <td>default-background</td>
                        <td>#FFFFF;</td>
                    </tr>
                    <tr>
                        <td>chrome-background</td>
                        <td><code>lighten(flat-clouds, 3)</code></td>
                    </tr>
                    <tr>
                        <td>active</td>
                        <td>#0091EA</td>
                    </tr>
                    <tr>
                        <td>foreground-color</td>
                        <td>#000000;</td>
                    </tr>
                    <tr>
                        <td>border-color</td>
                        <td><code>flat-silver</code></td>
                    </tr>
                    <tr>
                        <td>icon-color</td>
                        <td><code>flat-gray-4</code></td>
                    </tr>
                    <tr>
                        <td>alt-background</td>
                        <td><code>flat-clouds</code></td>
                    </tr>
                    <tr>
                        <td>odd-row-background-color</td>
                        <td>#fcfdfe</td>
                    </tr>
                    <tr>
                        <td>header-cell-moving-background-color</td>
                        <td><code>default-background</code></td>
                    </tr>
                    <tr>
                        <td>foreground-color</td>
                        <td><code>rgba(foreground-color, foreground-opacity)</code></td>
                    </tr>
                    <tr>
                        <td>secondary-foreground-color</td>
                        <td><code>rgba(foreground-color, secondary-foreground-color-opacity)</code></td>
                    </tr>
                    <tr>
                        <td>disabled-foreground-color</td>
                        <td><code>rgba(foreground-color, disabled-foreground-color-opacity)</code></td>
                    </tr>
                    <tr>
                        <td>input-disabled-background-color</td>
                        <td>#ebebeb</td>
                    </tr>
                    <tr>
                        <td>primary-color</td>
                        <td><code>active</code></td>
                    </tr>
                    <tr>
                        <td>accent-color</td>
                        <td><code>active</code></td>
                    </tr>
                    <tr>
                        <td>range-selection-background-color</td>
                        <td><code>transparentize(active, 0.8)</code></td>
                    </tr>
                    <tr>
                        <td>ag-range-selected-color-1/td>
                        <td><code>opacify(range-selection-background-color, 0.1)</code></td>
                    </tr>
                    <tr>
                        <td>ag-range-selected-color-2</td>
                        <td><code>opacify(range-selection-background-color, 0.2)</code></td>
                    </tr>
                    <tr>
                        <td>ag-range-selected-color-3</td>
                        <td><code>opacify(range-selection-background-color, 0.3)</code></td>
                    </tr>
                    <tr>
                        <td>ag-range-selected-color-4</td>
                        <td><code>opacify(range-selection-background-color, 0.4)</code></td>
                    </tr>
                    <tr>
                        <td>range-selection-highlight-color</td>
                        <td><code>active</code></td>
                    </tr>
                    <tr>
                        <td>selected-color</td>
                        <td><code>lighten(active, 40)</code></td>
                    </tr>
                    <tr>
                        <td>alt-icon-color</td>
                        <td><code>default-background</code></td>
                    </tr>
                    <tr>
                        <td>background-color</td>
                        <td><code>default-background</code></td>
                    </tr>
                    <tr>
                        <td>editor-background-color</td>
                        <td><code>chrome-background</code></td>
                    </tr>
                    <tr>
                        <td>panel-background-color</td>
                        <td><code>chrome-background</code></td>
                    </tr>
                    <tr>
                        <td>tool-panel-background-color</td>
                        <td><code>chrome-background</code></td>
                    </tr>
                    <tr>
                        <td>header-background-color</td>
                        <td><code>chrome-background</code></td>
                    </tr>
                    <tr>
                        <td>header-foreground-color</td>
                        <td><code>secondary-foreground-color</code></td>
                    </tr>
                    <tr>
                        <td>hover-color</td>
                        <td><code>alt-background</code></td>
                    </tr>
                    <tr>
                        <td>chip-background-color</td>
                        <td><code>darken(alt-background, 5)</code></td>
                    </tr>
                    <tr>
                        <td>row-stub-background-color</td>
                        <td>inherit</td>
                    </tr>
                    <tr>
                        <td>row-floating-background-color</td>
                        <td>inherit</td>
                    </tr>
                    <tr>
                        <td>cell-data-changed-color</td>
                        <td>#fce4ec</td>
                    </tr>
                    <tr>
                        <td>value-change-delta-up-color</td>
                        <td>#43a047</td>
                    </tr>
                    <tr>
                        <td>value-change-delta-down-color</td>
                        <td>#e53935</td>
                    </tr>
                    <tr>
                        <td>value-change-value-highlight-background-color</td>
                        <td><code>transparentize(#16A085, 0.5)</code></td>
                    </tr>
                    <tr>
                        <td>header-height</td>
                        <td><code>grid-size * 8</code></td>
                    </tr>
                    <tr>
                        <td>virtual-item-height</td>
                        <td><code>grid-size * 7</code></td>
                    </tr>
                    <tr>
                        <td>row-border-width</td>
                        <td>1px</td>
                    </tr>
                    <tr>
                        <td>toolpanel-indent-size</td>
                        <td><code>$grid-size</code> + <code>$icon-size</code></td>
                    </tr>
                    <tr>
                        <td>row-group-indent-size</td>
                        <td><code>$grid-size</code> * 3 + <code>$icon-size</code></td>
                    </tr>
                    <tr>
                        <td>cell-horizontal-padding</td>
                        <td><code>grid-size</code> * 3</td>
                    </tr>
                    <tr>
                        <td>header-icon-size</td>
                        <td>14px</td>
                    </tr>
                    <tr>
                        <td>border-radius</td>
                        <td>2px</td>
                    </tr>
                    <tr>
                        <td>font-family</td>
                        <td>-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif</td>
                    </tr>
                    <tr>
                        <td>font-size</td>
                        <td>12px</td>
                    </tr>
                    <tr>
                        <td>font-weight</td>
                        <td>400</td>
                    </tr>
                    <tr>
                        <td>secondary-font-family</td>
                        <td><code>font-family</code></td>
                    </tr>
                    <tr>
                        <td>secondary-font-size</td>
                        <td>12px</td>
                    </tr>
                    <tr>
                        <td>secondary-font-weight</td>
                        <td>600</td>
                    </tr>
                    <tr>
                        <td>tooltip-background-color</td>
                        <td><code>lighten($flat-gray-2, 5%)</code></td>
                    </tr>
                    <tr>
                        <td>tooltip-foreground-color</td>
                        <td><code>foreground-color</code></td>
                    </tr>
                    <tr>
                        <td>tooltip-border-radius</td>
                        <td><code>border-radius</code></td>
                    </tr>
                    <tr>
                        <td>tooltip-border-color</td>
                        <td><code>tooltip-foreground-color</code></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="hidden">
            <table>
                <thead>
                    <tr>
                        <th>Variable Name</th>
                        <th>Default Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>mat-grey-0 <code>(color accessor)</code></td>
                        <td>#ffffff</td>
                    </tr>
                    <tr>
                        <td>mat-grey-50 <code>(color accessor)</code></td>
                        <td>#fafafa</td>
                    </tr>
                    <tr>
                        <td>mat-grey-100 <code>(color accessor)</code></td>
                        <td>#f5f5f5</td>
                    </tr>
                    <tr>
                        <td>mat-grey-200 <code>(color accessor)</code></td>
                        <td>#eeeeee</td>
                    </tr>
                    <tr>
                        <td>mat-grey-300 <code>(color accessor)</code></td>
                        <td>#e2e2e2</td>
                    </tr>
                    <tr>
                        <td>mat-indigo-500 <code>(color accessor)</code></td>
                        <td>#3f51b5</td>
                    </tr>
                    <tr>
                        <td>mat-pink-A200 <code>(color accessor)</code></td>
                        <td>#ff4081</td>
                    </tr>
                    <tr>
                        <td>mat-pink-50 <code>(color accessor)</code></td>
                        <td>#fce4ec</td>
                    </tr>
                    <tr>
                        <td>mat-indigo-50 <code>(color accessor)</code></td>
                        <td>#e8eaf6</td>
                    </tr>
                    <tr>
                        <td>foreground-opacity</td>
                        <td>0.87</td>
                    </tr>
                    <tr>
                        <td>secondary-foreground-color-opacity</td>
                        <td>0.54</td>
                    </tr>
                    <tr>
                        <td>disabled-foreground-color-opacity</td>
                        <td>0.38</td>
                    </tr>
                    <tr>
                        <td>grid-size</td>
                        <td>8px</td>
                    </tr>
                    <tr>
                        <td>icon-size</td>
                        <td>18px</td>
                    </tr>
                    <tr>
                        <td>header-height</td>
                        <td><code>grid-size</code> * 7</td>
                    </tr>
                    <tr>
                        <td>row-height</td>
                        <td><code>grid-size</code> * 6</td>
                    </tr>
                    <tr>
                        <td>row-border-width</td>
                        <td>1px</td>
                    </tr>
                    <tr>
                        <td>toolpanel-indent-size</td>
                        <td><code>grid-size</code> + <code>icon-size</code></td>
                    </tr>
                    <tr>
                        <td>row-group-indent-size</td>
                        <td><code>grid-size</code> * 3 + <code>icon-size</code></td>
                    </tr>
                    <tr>
                        <td>cell-horizontal-padding</td>
                        <td><code>grid-size</code> * 3</td>
                    </tr>
                    <tr>
                        <td>virtual-item-height</td>
                        <td><code>grid-size</code> * 5</td>
                    </tr>
                    <tr>
                        <td>header-icon-size</td>
                        <td>14px</td>
                    </tr>
                    <tr>
                        <td>font-family</td>
                        <td>"Roboto", sans-serif</td>
                    </tr>
                    <tr>
                        <td>font-size</td>
                        <td>13px</td>
                    </tr>
                    <tr>
                        <td>font-weight</td>
                        <td>400</td>
                    </tr>
                    <tr>
                        <td>secondary-font-family</td>
                        <td>"Roboto", sans-serif</td>
                    </tr>
                    <tr>
                        <td>secondary-font-size</td>
                        <td>12px</td>
                    </tr>
                    <tr>
                        <td>secondary-font-weight</td>
                        <td>700</td>
                    </tr>
                    <tr>
                        <td>foreground-color</td>
                        <td><code>rgba(#000, foreground-opacity)</code></td>
                    </tr>
                    <tr>
                        <td>secondary-foreground-color</td>
                        <td><code>rgba(#000, secondary-foreground-color-opacity)</code></td>
                    </tr>
                    <tr>
                        <td>disabled-foreground-color</td>
                        <td><code>rgba(#000, $disabled-foreground-color-opacity)</code></td>
                    </tr>
                    <tr>
                        <td>header-background-color</td>
                        <td>$background-color</td>
                    </tr>
                    <tr>
                        <td>header-cell-hover-background-color</td>
                        <td>darken(<code>$header-background-color</code>, 5%)</td>
                    </tr>
                    <tr>
                        <td>header-cell-moving-background-color</td>
                        <td><code>$header-cell-hover-background-color</code></td>
                    </tr>
                    <tr>
                        <td>header-foreground-color</td>
                        <td><code>$secondary-foreground-color</code></td>
                    </tr>
                    <tr>
                        <td>border-color</td>
                        <td><code>mat-indigo-300</code></td>
                    </tr>
                    <tr>
                        <td>primary-color</td>
                        <td><code>mat-indigo-500</code></td>
                    </tr>
                    <tr>
                        <td>accent-color</td>
                        <td><code>mat-pink-A200</code></td>
                    </tr>
                    <tr>
                        <td>icon-color</td>
                        <td>#333</td>
                    </tr>
                    <tr>
                        <td>background-color</td>
                        <td><code>mat-grey-0</code></td>
                    </tr>
                    <tr>
                        <td>editor-background-color</td>
                        <td><code>mat-grey-50</code></td>
                    </tr>
                    <tr>
                        <td>panel-background-color</td>
                        <td><code>mat-grey-200</code></td>
                    </tr>
                    <tr>
                        <td>tool-panel-background-color</td>
                        <td><code>mat-grey-50</code></td>
                    </tr>
                    <tr>
                        <td>chip-background-color</td>
                        <td><code>mat-grey-300</code></td>
                    </tr>
                    <tr>
                        <td>range-selection-background-color</td>
                        <td><code>mat-indigo-50</code></td>
                    </tr>
                    <tr>
                        <td>range-selection-highlight-color</td>
                        <td><code>mat-pink-50</code></td>
                    </tr>
                    <tr>
                        <td>hover-color</td>
                        <td><code>mat-grey-50</code></td>
                    </tr>
                    <tr>
                        <td>selected-color</td>
                        <td><code>mat-grey-200</code></td>
                    </tr>
                    <tr>
                        <td>cell-data-changed-color</td>
                        <td><code>mat-pink-50</code></td>
                    </tr>
                    <tr>
                        <td>card-shadow</td>
                        <td>0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)</td>
                    </tr>
                    <tr>
                        <td>card-radius</td>
                        <td>2px</td>
                    </tr>
                    <tr>
                        <td>value-change-delta-up-color</td>
                        <td>#43a047</td>
                    </tr>
                    <tr>
                        <td>value-change-delta-down-color: </td>
                        <td>#e53935</td>
                    </tr>
                    <tr>
                        <td>value-change-value-highlight-background-color</td>
                        <td>#00acc1</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>




<?php include '../documentation-main/documentation_footer.php';?>
