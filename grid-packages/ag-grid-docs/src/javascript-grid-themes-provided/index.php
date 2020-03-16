<?php
$pageTitle = "ag-Grid Provided Themes";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It stores the data in Row Models. Each piece of row data provided to the datgrid is wrapped in a Row Node. This section describes the Row Node and how you can use it in your applications.";
$pageKeywords = "ag-Grid data row model";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Provided Themes</h1>

    <p class="lead">
        The grid comes with a few provided themes, and the quickest way to get a nice style onto a grid is to apply one of them.
    </p>

    <p>
        The themes can be used without any modification, or can be <a href="#customising-themes">customised</a>.
    </p>

    <h2>Themes Summary</h2>

    <p>
        The themes are as follows. Click the theme name to load the demo page with this theme.
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
            <td class="theme-name-cell">
                <a href="/example.php?theme=ag-theme-alpine" target="_blank">ag-theme-alpine</a><br/>
                <a href="/example.php?theme=ag-theme-alpine-dark" target="_blank">ag-theme-alpine-dark</a>
            </td>
            <td>
                <p>
                    Modern looking themes with high contrast, and generous padding.
                </p>
                <p>
                    <span class="reccommendation">Recommendation:</span>
                    This is the default grid theme, and a great choice for most applications.
                </p>
            </td>
        </tr>
        <tr>
            <td class="theme-name-cell">
                <a href="/example.php?theme=ag-theme-balham" target="_blank">ag-theme-balham</a><br/>
                <a href="/example.php?theme=ag-theme-balham-dark" target="_blank">ag-theme-balham-dark</a>
            </td>
            <td>
                <p>
                    Themes for professional data-heavy applications.
                </p>
                <p>
                    <span class="reccommendation">Recommendation:</span>
                    Balham was the default theme before Alpine was developed. It is still a great choice
                    for applications that need to fit more data onto each page.
                </p>
            </td>
        </tr>
        <tr>
            <td class="theme-name-cell">
                <a href="/example.php?theme=ag-theme-material" target="_blank">ag-theme-material</a>
            </td>
            <td>
                <p>
                    A theme designed according to the Google Material Language Specs.
                </p>
                <p>
                    <span class="reccommendation">Recommendation:</span>
                    This theme looks great for simple applications with lots of white space, and is the obvious
                    choice if the rest of your application follows the Google Material Design spec. However the
                    Material spec doesn't cater for advanced grid features such as grouped columns and tool panels.
                    If your application uses these features, consider using <code>ag-theme-alpine</code> instead.
                </p>
            </td>
        </tr>
    </table>

    <p>
        To use a theme add the theme class name to the <code>div</code> element that contains your grid. The following is an example of using the balham theme:
    </p>

    <snippet language="html">
        &lt;div id="myGrid" class="ag-theme-balham"&gt;&lt;/div&gt;
    </snippet>

    <p>You need to ensure that the CSS for your theme is loaded.</p>

    <ul>
        <li>Some pre-built bundles, whether <a href="/javascript-grid-download/">downloaded from our website</a> or included in the <code>ag-grid-community</code> <a href="/javascript-grid-npm/">NPM package</a>, already embed the styles. If you are using one of these files you do not need to separately load CSS.</li>
        <li>If you're not using a JS bundle with styles embedded, you need to include the theme's styles in the HTML page with a <code>&lt;link&gt;</code> tag. There are a few ways to do this:</li>
        <ul>
            <li>If you are using a JavaScript bundler like webpack or Rollup and it is configured to load styles, you can <code>require()</code> the correct CSS file from node_modules. This is the recommended approach.</li>
            <li>You can copy (manually or as part of your app's build) a CSS file from node_modules and serve it with your app.</li>
            <li>You can the theme from a free CDN by adding this code to your page <code>&lt;link rel="stylesheet" href="https://unpkg.com/@ag-grid-community/all-modules@22.0.0/dist/styles/ag-theme-balham.css"&gt;</code> (note: this is useful for testing but not recommended for production as your app will be unavailable if the unpkg servers are down)</li>
        </ul>
    </ul>

    <p>
        Note that the Material theme requires the Roboto font, and this is not bundled in the material CSS. The easiest way to load Roboto is through Google's CDN:
    </p>

    <snippet language="html">
        &lt;link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"&gt;
        &lt;div id="myGrid" class="ag-theme-material"&gt;&lt;/div&gt;
    </snippet>

    <h1 id="customising-themes">Customising themes</h1>

    <p>
        In order to customise a theme, you need to set up your project to compile Sass files. The recommended way to process your project's Scss
        files is through webpack, since it provides various loaders that optimize and reduce the final size of the bundle. We provide a
        <a href="https://github.com/ag-grid/ag-grid-customise-theme/tree/master/src/vanilla">general webpack example</a> appropriate Vanilla JS and React
        projects, and an <a href="https://github.com/ag-grid/ag-grid-customise-theme/tree/master/src/angular">angular example</a> using Angular CLI.
    </p>

    <p>
        To customise a theme, include the theme mixin file and then call the mixin passing parameters to customise it. Then add CSS rules for advanced customisation:
    </p>

    <snippet language="scss">
@import "~ag-grid-community/src/styles/ag-theme-alpine/sass/ag-theme-alpine-mixin";
.ag-theme-alpine {
    @include ag-theme-alpine((
        // use theme parameters where possible
        alpine-active-color: deeppink
    ));

    .ag-header {
        // or write CSS selectors to make customisations beyond what the parameters support
        text-shadow: deeppink;
    }
}
    </snippet>

    <h2>Important theme parameters</h2>

    <p>There is a full list of theme parameters below, but a few important ones are:</p>

    <ul>
        <li><code>grid-size</code> is the main control for affecting how tightly data and UI elements are packed together.
            All padding and spacing in the grid is defined as a multiple of grid-size,
            so increasing it will make most components larger by increasing their internal white
            space while leaving the size of text and icons unchanged.</li>
        <li><code>borders</code> controls whether borders are drawn around the grid. There are more <code>border-*</code> variables to provide fine-grained control over which borders are drawn and their color.</li>
        <li><code>row-height</code> height in pixels of a grid row.</li>
        <li><code>header-height</code> height in pixels of a header row.</li>
        <li>The provided themes have theme-specific variables to set the color of many elements at once. These are shortcuts for setting several other variables.</li>
        <ul>
            <li><code>alpine-active-color</code> (Alpine only) sets the colour of checked checkboxes, range selections, row selections, selected tab underlines, and input focus outlines</li>
            <li><code>balham-active-color</code> (Balham only) sets the colour of checked checkboxes, range selections, row selections, and input focus outlines</li>
            <li><code>material-primary-color</code> and <code>material-accent-color</code> (Material only) set the colours used for the primary and accent colour roles specified in the <a href="https://material.io/design/color/">Material Design color system</a>. Currently primary color is used for buttons, range selections, selected tab underlines and input focus underlines, and accent color is used for checked checkboxes.</li>
        </ul>
    </ul>

    <h2>Customising row and header heights</h2>
    
    <p>
        The grid uses <a href="/javascript-grid-dom-virtualisation/">DOM virtualisation</a> for rendering large amounts of data,
        which means that it needs to know the size of various elements like columns and grid rows in order to calculate their
        layout. The grid uses several strategies to work out the right size:
    </p>
    
    <ol>
        <li>Firstly, the grid will attempt to measure the size of an element. This works when styles have loaded, but will not work if the grid initialises before the theme loads. Our <a href="https://github.com/ag-grid/ag-grid-customise-theme/blob/master/src/vanilla/grid.js">theme customisation examples</a> demonstrate how to wait for CSS to load before initialising the grid (see the cssHasLoaded function).</li>
            <li>If CSS has not loaded and one of the provided themes is in use, the grid contains hard-coded fallback values for these themes. For this reason we recommend that if you are extending a provided theme like ag-theme-alpine and have not changed the heights of elements, you do not change the theme name. This ensures that teh grid will us the correct fallback sizes.</li>
            <li>If neither of the above methods will work for your app (you do not want to delay app initialisation until after CSS has loaded, and are not using a provided theme with heights unchanged) then you should inform the grid about your custom element heights using <a href="/javascript-grid-properties/">grid properties</a>. The minimal set of properties you need to set to ensure correct functioning are: <code>rowHeight</code>, <code>headerHeight</code> and <code>minColWidth</code>.</li>
        </ol>
        
        <h2 id="base-theme-parameters">Full list of theme parameters</h2>
        
        <p>Here is a list of parameters accepted by the base theme and all themes that extend it, including our provided themes Balham, Alpine and Material. The default values demonstrate the kind of value that is expected (a colour, pixel value, percentage value etc) but if you are using a provided theme then the theme will have changed most of the default values. Note that some values are defined relative to other values using the <code>ag-defined</code> helper, so <code>data-color: ag-derived(foreground-color)</code> means that if you don't explicitly set the <code>data-color</code> property it will default to the value of <code>foreground-color</code>.</p>

<snippet language="scss">
// Colour of text and icons in primary UI elements like menus
foreground-color: #000,

// Colour of text in grid cells
data-color: ag-derived(foreground-color),

// Colour of text and icons in UI elements that need to be slightly less emphasised to avoid distracting attention from data
secondary-foreground-color: ag-derived(foreground-color),

// Colour of text and icons in the header
header-foreground-color: ag-derived(secondary-foreground-color),

// Color of elements that can't be interacted with because they are in a disabled state
disabled-foreground-color: ag-derived(foreground-color, $opacity: 0.5),

// Background colour of the grid
background-color: #fff,

// Background colour for all headers, including the grid header, panels etc
header-background-color: null,

// Background colour for second level headings within UI components
subheader-background-color: null,

// Background for areas of the interface that contain UI controls, like tool panels and the chart settings menu
control-panel-background-color: null,

// Background color of selected rows in the grid and in dropdown menus
selected-row-background-color: ag-derived(background-color, $mix: foreground-color 25%),

// Background colour applied to every other row or null to use background-color for all rows
odd-row-background-color: null,

// Background color when hovering over rows in the grid and in dropdown menus, or null for no rollover effect (note - if you want a rollover on one but not the other, set to null and use CSS to achieve the rollover)
row-hover-color: null,

// Color to draw around selected cell ranges
range-selection-border-color: ag-derived(foreground-color),

// Background colour of selected cell ranges. Choosing a semi-transparent color (opacity of 0.1 to 0.5 works well) will ensure that it looks good when multiple ranges overlap.
range-selection-background-color: ag-derived(range-selection-border-color, $opacity: 0.2),

// Background colour to apply to a cell range when it is copied from or pasted into
range-selection-highlight-color: ag-derived(range-selection-border-color),

// Colour and thickness of the border drawn under selected tabs, including menus and tool panels
selected-tab-underline-color: ag-derived(range-selection-border-color),
selected-tab-underline-width: 0,
selected-tab-underline-transition-speed: null,

// Background colour for cells that provide categories to the current range chart
range-selection-chart-category-background-color: rgba(#00FF84, 0.1),

// Background colour for cells that provide data to the current range chart
range-selection-chart-background-color: rgba(#0058FF, 0.1),

// Rollover colour for header cells
header-cell-hover-background-color: null,

// Colour applied to header cells when the column is being dragged to a new position
header-cell-moving-background-color: ag-derived(header-cell-hover-background-color),

// Colour to apply when a cell value changes and enableCellChangeFlash is enabled
value-change-value-highlight-background-color: rgba(#16A085, 0.5),

// Colours to apply when a value increases or decreases in an agAnimateShowChangeCellRenderer cell
value-change-delta-up-color: #43a047,
value-change-delta-down-color: #e53935,

// Colour for the "chip" that repersents a column that has been dragged onto a drop zone
chip-background-color: null,

//
// BORDERS
//

// Draw borders around most UI elements
borders: true,

// Draw the few borders that are critical to UX, e.g. between headers and rows.
borders-critical: ag-derived(borders),

// Draw decorative borders separating UI elements within components
borders-secondary: ag-derived(borders),

// Draw borders around sidebar tabs so that the active tab appears connected to the current tool panel
borders-side-button: ag-derived(borders),

border-radius: 0px,

// Colour for border around major UI components like the grid itself, headers, footers and tool panels
border-color: ag-derived(background-color, $mix: foreground-color 25%),

// Colour for borders used to separate elements within a major UI component
secondary-border-color: ag-derived(border-color),

// Colour of the border between grid rows, or null to display no border
row-border-color: ag-derived(secondary-border-color),

// Default border for cells. This can be used to specify the border-style and border-color properties e.g. `dashed red` but the border-width is fixed at 1px.
cell-horizontal-border: solid transparent,

// Separator between columns in the header. Displays between all header cells For best UX, use either this or header-column-resize-handle but not both
header-column-separator: false,
    header-column-separator-height: 100%,
    header-column-separator-width: 1px,
    header-column-separator-color: ag-derived(border-color, $opacity: 0.5),

// Visible marker for resizeable columns. Displays in the same position as the column separator, but only when the column is resizeable. For best UX, use either this or header-column-separator but not both
header-column-resize-handle: false,
    header-column-resize-handle-height: 50%,
    header-column-resize-handle-width: 1px,
    header-column-resize-handle-color: ag-derived(border-color, $opacity: 0.5),

//
// INPUTS
//

// Suppress styling of native widgets: <input type=checkbox/radio/range>. If you want to style these yourself, set this to true. If you only want to disable styling for some kinds of input, you can set this to true and e.g. @include ag-native-inputs((checkbox: false)) which will emit styles for all kinds of input except checkboxes.
suppress-native-widget-styling: false,

input-disabled-background-color: null,
input-border-color: null,

checkbox-background-color: null,
checkbox-border-radius: ag-derived(border-radius),
checkbox-checked-color: ag-derived(foreground-color),
checkbox-unchecked-color: ag-derived(foreground-color),
checkbox-indeterminate-color: ag-derived(checkbox-unchecked-color),

toggle-button-off-border-color: ag-derived(checkbox-unchecked-color),
toggle-button-off-background-color: ag-derived(checkbox-unchecked-color),
toggle-button-on-border-color: ag-derived(checkbox-checked-color),
toggle-button-on-background-color: ag-derived(checkbox-checked-color),
toggle-button-switch-background-color: ag-derived(background-color),
toggle-button-switch-border-color: ag-derived(toggle-button-off-border-color),
toggle-button-border-width: 1px,
toggle-button-height: ag-derived(icon-size),
toggle-button-width: ag-derived(toggle-button-height, $times: 2),

input-focus-box-shadow: null,
input-focus-border-color: null,

// CHART SETTINGS

// Color of border around selected chart style
minichart-selected-chart-color: ag-derived(checkbox-checked-color),
// Color of dot representing selected page of chart styles
minichart-selected-page-color: ag-derived(checkbox-checked-color),


//
// SIZING / PADDING / SPACING
//

// grid-size is the main control for affecting how tightly data and UI elements are packed together. All padding and spacing in the grid is defined as a multiple of grid-size, so increasing it will make most components larger by increasing their internal white space while leaving the size of text and icons unchanged.
grid-size: 4px,

// The size of square icons and icon-buttons
icon-size: 12px,

// These 4 variables set the padding around and spacing between widgets in "widget containers" which are parts of the UI that contain many related widgets, like the set filter menu, charts settings tabs etc.
widget-container-horizontal-padding: ag-derived(grid-size, $times: 1.5),
widget-container-vertical-padding: ag-derived(grid-size, $times: 1.5),
widget-horizontal-spacing: ag-derived(grid-size, $times: 1.5),
widget-vertical-spacing: ag-derived(grid-size),

// Horizontal padding for grid and header cells (vertical padding is not set explicitly, but inferred from row-height / header-height
cell-horizontal-padding: ag-derived(grid-size, $times: 3),

// Horizontal spacing between widgets inside cells (e.g. row group expand buttons and row selection checkboxes)
cell-widget-spacing: ag-derived(cell-horizontal-padding),

// Height of grid rows
row-height: ag-derived(grid-size, $times: 6, $plus: 1),

// Height of header rows
header-height: ag-derived(row-height),

// Height of items in lists (example of lists are dropdown select inputs and column menu set filters)
list-item-height: ag-derived(grid-size, $times: 5),

// How much to indent child columns in the column tool panel relative to their parent
column-select-indent-size: ag-derived(grid-size, $plus: icon-size),

// How much to indent child rows in the grid relative to their parent row
row-group-indent-size: ag-derived(cell-widget-spacing, $plus: icon-size),

// How much to indent child columns in the filters tool panel relative to their parent
filter-tool-panel-group-indent: 16px,

// Cause tabs to stretch across the full width of the tab panel header
full-width-tabs: false,

// Fonts
font-family: ("Helvetica Neue", sans-serif),
font-size: 14px,

// The name of the font family you're using
icon-font-family: $ag-theme-base-icon-font-family, // this var exported by ag-theme-base-font-vars.scss

// A URI (data: URI or web URL) to load the icon font from. NOTE: if your icon font is already loaded in the app's HTML page, set this to null to avoid embedding unnecessry font data in the compiled theme.
icons-data: $ag-theme-base-icons-data,             // this var exported by ag-theme-base-font-vars.scss
icons-font-codes: $ag-theme-base-icons-font-codes, // this var exported by ag-theme-base-font-vars.scss

// cards are elements that float above the UI
card-radius: ag-derived(border-radius),

// the default card shadow applies to simple cards like column drag indicators and text editors
card-shadow: none,

// override the shadow for popups - cards that contain complex UI, like menus and charts
popup-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3)
</snippet>


<?php include '../documentation-main/documentation_footer.php';?>
