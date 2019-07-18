<?php
$pageTitle = "ag-Grid Provided Themes";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It stores the data in Row Models. Each piece of row data provided to the datgrid is wrapped in a Row Node. This section describes the Row Node and how you can use it in your applications.";
$pageKeyboards = "ag-Grid data row model";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Provided Themes</h1>


    <p class="lead">
        Provided Themes are themes that come provided with the grid. The quickest way to get a nice style
        onto a grid is to apply a provided theme.
    </p>

    <p>
        The themes can be used without any modification, or can tweaked by <a href="#customizing-sass-variables">
            altering the SASS variables
        </a>.
    </p>

    <h2>Themes Summary</h2>

    <p>
        The themes are as follows:
    </p>

    <table class="properties">
        <style>
            .theme-name-cell {
                white-space: nowrap;
                font-weight: bold;
            }
            .reccommendation {
                font-weight: bold;
            }
        </style>
        <tr>
            <th>Theme Name</th>
            <th>Description</th>
        </tr>
        <tr>
            <td class="theme-name-cell"><code>ag-theme-balham<br/>ag-theme-balham-dark</code></td>
            <td>
                <p>
                    Flat themes for professional applications. <code>ag-theme-balham-dark</code> is a dark
                    version of <code>ag-theme-balham</code>.
                </p>
                <p>
                    <span class="reccommendation">Recommendation:</span>
                    These are great themes to use.
                </p>
            </td>
        </tr>
        <tr>
            <td class="theme-name-cell"><code>ag-theme-material</code></td>
            <td>
                <p>
                    A theme designed according to the Google Material Language Specs.
                </p>
                <p>
                    <span class="reccommendation">Recommendation:</span>
                    This theme looks great for simple grids, however the Google
                    Material spec doesn't cater for complex parts of a grid such as grouped columns
                    and tool panels. For grids that use these advanced parts of the grid, the result may
                    not look great. Google Material is great for simpler customer facing applications
                    that use a lot of white space, but not as great for business applications where
                    more functions get included over cleanness of design.
                </p>
            </td>
        </tr>
        <tr>
            <td class="theme-name-cell"><code>ag-theme-fresh</code><br/><code>ag-theme-dark</code><br/><code>ag-theme-blue</code></td>
            <td>
                <p>
                    Older flat themes that were part of the grid before we had a proper CSS person join the team.
                </p>
                <p>
                    <span class="reccommendation">Recommendation:</span>
                    These themes look old. Prefer the <code>ag-theme-balham</code> theme and use
                    SASS variables to change the colors if required.
                </p>
            </td>
        </tr>
        <tr>
            <td class="theme-name-cell"><code>ag-theme-bootstrap</code></td>
            <td>
                <p>
                    Neutral / white theme that fits well in the context of bootstrap components.
                </p>
                <p>
                    <span class="reccommendation">Recommendation:</span>
                    Bootstrap is not as popular these days, overcome by Material Design. This theme gets little
                    attention from grid users or the grid team.
                </p>
            </td>
        </tr>
    </table>

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


    <h1>Balham Themes</h1>

    <p>
        The Balham theme comes in two versions: 1) light and 2) dark. Below shows examples of each type.
    </p>

    <p>Example Balham Light (ag-theme-balham)</p>

<?= example('Balham Theme', 'theme-balham', 'generated', array( 'enterprise' => true, 'processVue' => true )) ?>

    <p>Example Balham Dark (ag-theme-balham-dark)</p>

<?= example('Balham Theme (dark)', 'theme-balham-dark', 'generated', array( 'enterprise' => true, 'processVue' => true )) ?>

    <h3>Change the Theme Accent Color</h3>

    <p>
        In addition to the finer grained Scss color variables available for the rest of the themes, the Balham
        theme has a 'catch all' Sass variable named '$active' that determines the color of the selected checkboxes,
        selected rows and icons in the column menu.
    </p>

    <snippet>
        // Set the colors to blue and amber
        $active: #E91E63; // pink-500 from https://www.materialui.co/colors
        // Import the ag-Grid balham theme
        @import '~ag-grid-community/src/styles/ag-theme-balham/sass/ag-theme-balham';</snippet>

    <p>
        The recommended way to process your project's Scss files is through webpack, since it provides various loaders that optimize and reduce the final size of the bundle.
    </p>



    <h1>Material Design Theme</h1>

    <p>
        To comply with the <a href="https://material.io/guidelines/components/data-tables.html#">material design data table guidelines</a>,
        the theme uses different spacing and icon set compared to the other themes.
    </p>

    <p> The example below shows the grid with a rich set of features enabled.</p>

    <?= example('Material Theme', 'theme-material', 'generated', array( 'enterprise' => true, 'processVue' => true, 'extras' => array("roboto") )) ?>

    <h3>Include the Roboto Font</h3>

    <p>The material design guidelines require the Roboto font to be used throughout the interface. The easiest way to include it in the document is by loading it from the Google CDN.
        Put the following code in the HEAD element of your document: </p>

    <snippet>
        &lt;link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"&gt;</snippet>


    <h3>Change the Theme Primary / Secondary Colors through Scss</h3>

    <p>
        The material theme uses Scss internally, exposing several variables which control its appearance.
        The ones you are likely looking into changing are the primary and secondary colors. The default ones are
        <a href="https://material.io/guidelines/style/color.html#color-color-palette">indigo-500 and pink-A200 from the Google color palette</a>, which match the indigo-pink Angular Material theme.
    </p>

    <p>To change the application colors, set the variables values to your colors of choice, and include the Scss theme file after that.<p>

    <snippet>
        // Set the colors to blue and amber
        $primary-color: #2196F3; // blue-500
        $accent-color: #FFD740; // amber-A200

        // Import the ag-Grid material theme
        @import '~ag-grid-community/src/styles/ag-theme-material/sass/ag-theme-material';</snippet>

    <p>You can examine the full list of the variables that can be changed in the <a href="https://github.com/ag-grid/ag-grid/blob/latest/src/styles/ag-theme-material.scss#L17-L59">theme source file</a>.</p>

    <p>
        The recommended way to process your project's Scss files is through webpack, since it provides various loaders that optimize and reduce the final size of the bundle.
        A working example for Angular 2 based on angular-cli can be found in <a href="https://github.com/ag-grid/ag-grid-material/tree/master/angular-material">the ag-grid-material repository</a>.
    </p>

    <h3>Change the row height / header height / icon size </h3>

    <p>
        The material design guidelines specify the size of the icons, height of the headers and the rows. We recommend keeping them to the default values for "true" material look.
        However, In case you wish to change the sizing, you should do that both in the grid configuration
        and by overriding the <code>$grid-size</code> and <code>$icon-size</code>.
        A working example that showcases this using webpack can be found <a href="https://github.com/ag-grid/ag-grid-material/tree/master/custom-sizing">ag-grid-material GitHub repository</a>.
    </p>

    <h3>Integrate with Other Material Component Libraries</h3>

    <p>
        You can customize the various UI bits of the grid by providing custom cell renderers or editor components.
        A working example that integrates Angular Material's input, checkbox, select and datepicker can be found in the <a href="https://github.com/ag-grid/ag-grid-material/tree/master/angular-material">ag-grid-material GitHub repository</a>.
    </p>




    <h1>Fresh, Dark and Blue Themes</h1>

    <p>
        The fresh, dark and blue themes were the original themes provided by the grid. You should consider using the
        Balham themes instead of these. However they are kept for backwards compatibility.
    </p>

    <p>Example Fresh (ag-theme-fresh)</p>

<?= example('Fresh Theme', 'theme-fresh', 'generated', array( "enterprise" => true, 'processVue' => true )) ?>

    <p>Example Dark (ag-theme-dark)</p>

<?= example('Dark Theme', 'theme-dark', 'generated', array( 'enterprise' => true, 'processVue' => true )) ?>

    <p>Example Blue (ag-theme-blue)</p>

<?= example('Blue Theme', 'theme-blue', 'generated', array( "enterprise" => true, 'processVue' => true )) ?>




    <h2>Bootstrap Theme</h2>

    <p>The following is an example of the bootstrap theme:</p>

    <?= example('Bootstrap Theme', 'theme-bootstrap', 'generated', array( 'enterprise' => true, 'processVue' => true )) ?>




    <h1 id="customizing-sass-variables">Customizing Themes</h1>

    <p>
        The provided themes are build using <a href="http://sass-lang.com">Sass</a>.
        This means that you can change the looks of the theme you use using Sass,
        by overriding the theme variables value and referencing the Sass source files afterwards.
    </p>

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

    <p>
        For a live example, see: <a href="https://github.com/ag-grid/ag-grid-customise-theme">Theme Customization Example Repository</a>.
    </p>

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
