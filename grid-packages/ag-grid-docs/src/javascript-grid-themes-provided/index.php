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
                This is the recommended grid theme, and a great choice for most applications.
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
                Balham was the recommended theme before Alpine was developed. It is still a great choice
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

<h2>Applying a provided theme to your app</h2>

<p>
    To use a theme add the theme class name to the <code>div</code> element that contains your grid. The following is an example of using the Alpine theme:
</p>

<snippet language="html">
    &lt;div id="myGrid" class="ag-theme-alpine"&gt;&lt;/div&gt;
</snippet>

<p>In order for the above code to work, the correct stylesheets must be loaded.</p>

<p>The Grid ships with two kinds of stylesheet. The structural styles contain the CSS rules that are essential to the functioning of the grid. They are in the <code>ag-grid.css</code> file in the grid distribution (or <code>ag-grid.scss</code> if you're using Sass). Theme stylesheets add a design look and feel on top of the structural styles. The are in files named <code>ag-theme-{theme-name}.css</code>. You need to ensure that both are loaded, and that structural styles are loaded before theme styles.</p>

<ul>
    <li>Some pre-built bundles, whether <a href="/javascript-grid-download/">downloaded from our website</a> or included in the <code>ag-grid-community</code> <a href="/javascript-grid-npm/">NPM package</a>, already embed the structural styles and all provided themes. If you are using one of these files you do not need to separately load CSS.</li>
    <li>If you're not using a JS bundle with styles embedded, you need to include the structural styles and your chosen theme's styles in your app's HTML page. There are a few ways to do this:</li>
    <ul>
        <li>If you are using a JavaScript bundler like webpack or Rollup and it is configured to load styles, you can <code>require()</code> the correct CSS file from node_modules. This is the recommended approach as webpack will take care of minifying your CSS in production.</li>
        <li>You can copy, either manually or as part of your app's build, the required CSS files (ag-grid.css and ag-theme-{theme-name}.css) from node_modules and serve it with your app.</li>
        <li>You can load the structural styles and theme from a free CDN by adding this code to your page:<br>
            <code>&lt;link rel="stylesheet" href="https://unpkg.com/@ag-grid-community/all-modules@23.0.0/dist/styles/ag-grid.css"&gt;</code><br>
            <code>&lt;link rel="stylesheet" href="https://unpkg.com/@ag-grid-community/all-modules@23.0.0/dist/styles/ag-theme-alpine.css"&gt;</code><br>
            If you do this, be sure to update the CSS version number in the URL to match the JS version you're using, and change the theme name in the URL to the one you're using. This is useful for testing and prototyping but not recommended for production as your app will be unavailable if the unpkg servers are down.</li>
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

<p>Themes can be customised using parameters or CSS rules. Parameters are arguments to a theme that change its appearance. Some parameters have effects that would be very hard to achieve using CSS rules. Parameters can be set through the Sass API, and colour parameters can additionally be set with CSS variables.</p>

<h2>Important theme parameters</h2>

<p>Here are some of the most important theme parameters. There is a <a href="#base-theme-parameters">full list</a> further down this page.</p>

<ul>
    <li><code>grid-size</code> is the main control for affecting how tightly data and UI elements are packed together. All padding and spacing in the grid is defined as a multiple of grid-size, so increasing it will make most components larger by increasing their internal white space while leaving the size of text and icons unchanged.</li>
    <li><code>borders</code> controls whether borders are drawn around the grid. There are more <code>border-*</code> parameters to provide fine-grained control over which borders are drawn and their color.</li>
    <li><code>row-height</code> height in pixels of a grid row.</li>
    <li><code>header-height</code> height in pixels of a header row.</li>
    <li><code>foreground-color</code> and <code>background-color</code> set the text color and background color for the grid - there are may more color parameters available for more fine-grained control over the color scheme.</li>
    <li>The provided themes have theme-specific parameters to set the color of many elements at once. These are shortcuts for setting several other parameters.</li>
    <ul>
        <li><code>alpine-active-color</code> (Alpine only) sets the colour of checked checkboxes, range selections, row selections, selected tab underlines, and input focus outlines</li>
        <li><code>balham-active-color</code> (Balham only) sets the colour of checked checkboxes, range selections, row selections, and input focus outlines</li>
        <li><code>material-primary-color</code> and <code>material-accent-color</code> (Material only) set the colours used for the primary and accent colour roles specified in the <a href="https://material.io/design/color/">Material Design color system</a>. Currently primary color is used for buttons, range selections, selected tab underlines and input focus underlines, and accent color is used for checked checkboxes.</li>
    </ul>
</ul>

<h2>Setting parameters using Sass</h2>

<p>
    To set theme parameters using Sass, you must set your project up to compile Sass files. The recommended way to do this is through webpack, since it provides various loaders that optimize and reduce the final size of the bundle. We provide a <a href="https://github.com/ag-grid/ag-grid-customise-theme/tree/master/src/vanilla">general webpack example</a> appropriate Vanilla JS and React projects, and an <a href="https://github.com/ag-grid/ag-grid-customise-theme/tree/master/src/angular">angular example</a> using Angular CLI.
</p>

<p>
    To customise a theme, include the theme mixin file and then call the mixin passing parameters to customise it. Then add CSS rules for advanced customisation:
</p>

<snippet language="scss">
@import "~ag-grid-community/src/styles/ag-grid.scss";
@import "~ag-grid-community/src/styles/ag-theme-alpine/sass/ag-theme-alpine-mixin";

.ag-theme-alpine {
    @include ag-theme-alpine((
        // use theme parameters where possible
        alpine-active-color: deeppink
    ));

    .ag-header {
        // or write CSS selectors to make customisations beyond what the parameters support
        text-style: italic;
    }
}
</snippet>

<p>Note how this example includes the structural styles (<code>ag-gris.scss</code>) before the theme mixin. Doing this means that both structural and theme styles will be included in the compiled CSS file. Alternatively, you could leave out the first <code>@import</code> and then embed the structural stylesheet separately in your HTML page.</p>

<h3>Customising row and header heights</h3>

<p>
    The grid uses <a href="/javascript-grid-dom-virtualisation/">DOM virtualisation</a> for rendering large amounts of data,
    which means that it needs to know the size of various elements like columns and grid rows in order to calculate their
    layout. The grid uses several strategies to work out the right size:
</p>

<ol>
    <li>Firstly, the grid will attempt to measure the size of an element. This works when styles have loaded, but will not work if the grid initialises before the theme loads. Our <a href="https://github.com/ag-grid/ag-grid-customise-theme/blob/master/src/vanilla/grid.js">theme customisation examples</a> demonstrate how to wait for CSS to load before initialising the grid (see the cssHasLoaded function).</li>
    <li>If CSS has not loaded and one of the provided themes is in use, the grid contains hard-coded fallback values for these themes. For this reason we recommend that if you are extending a provided theme like ag-theme-alpine and have not changed the row and header heights, you keep the same theme name so that the grid knows what fallback sizes to apply.</li>
    <li>If neither of the above methods will work for your app (you do not want to delay app initialisation until after CSS has loaded, and are not using a provided theme with heights unchanged) then you should inform the grid about your custom element heights using <a href="/javascript-grid-properties/">grid properties</a>. The minimal set of properties you need to set to ensure correct functioning are: <code>rowHeight</code>, <code>headerHeight</code> and <code>minColWidth</code>.</li>
</ol>

<h2 id="setting-parameters-css-variables">Setting color parameters using CSS variables</h2>

<p>CSS variables (officially known to as "CSS Custom Properties") are supported by most modern browsers but will not work in IE11. Any parameter whose name ends with <code>-color</code> is available as a CSS variable with the prefix <code>--ag-</code>. For example the <code>foreground-color</code> parameter can be set as follows:</p>

<snippet language="scss">
.ag-theme-alpine {
    /* use theme parameters where possible */
    --ag-foreground-color: deeppink;
}

/* or write CSS selectors to make customisations beyond what the parameters support */
.ag-theme-alpine .ag-header {
    text-style: italic;
}
</snippet>

<h2>Customising themes using CSS rules</h2>

<p>Whether you're using Sass or CSS parameters, you will find that some design effects can't be achieved through parameters alone. For example, there is no parameter to set the <code>font-style: italic</code> on header cells. If you want your column headers to be italic, use regular CSS:</p>

<snippet language="css">
.ag-theme-alpine .ag-header-cell-label {
    font-weight: normal;
}
</snippet>

<p>Note how we include the name of the theme in the rule: <code>.ag-theme-alpine .ag-header-cell-label { ... } </code>. This is important - without the theme name, your styles will not override the theme's built-in styles due to CSS selector specificity rules.</p>

<p>The best way to find the right class name to use in a CSS rule is using the browser's developer tools. You will notice that components often have multiple class names, some more general than others. For example, the <a href="/javascript-grid-tool-panel-columns/#column-tool-panel-example">row grouping panel</a> is a component onto which you can drag columns to group them. The internal name for this is the "column drop" component, and there are two kinds - a horizontal one at the top of the header and a vertical one in the columns tool panel. You can use the class name <code>ag-column-drop</code> to target either kind, or <code>ag-column-drop-vertical</code> / <code>ag-column-drop-horizontal</code> to target one only.</p>

<h2 id="base-theme-parameters">Full list of theme parameters</h2>

<p>Here is a list of parameters accepted by the base theme and all themes that extend it, including our provided themes Alpine, Balham and Material.</p>

<p>The default values in this list demonstrate the kind of value that is expected (a colour, pixel value, percentage value etc) but bear in mind that if you are using a provided theme then the theme will have changed most of the default values - you can find the default values for your theme by inspecting its source code in the grid distribution - look for a file called <code>_ag-theme-{theme-name}-default-params.scss</code>.</p>

<p>Note that some values are defined relative to other values using the <code>ag-derived</code> helper function, so <code>data-color: ag-derived(foreground-color)</code> means that if you don't set the <code>data-color</code> property it will default to the value of <code>foreground-color</code>. See the <a href="#ag-derived">ag-derived docs</a> for more information.</p>

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

// Background colour for toolbars directly under subheadings (as used in the chart settings menu)
subheader-toolbar-background-color: null,

// Background for areas of the interface that contain UI controls, like tool panels and the chart settings menu
control-panel-background-color: null,

// Background color of selected rows in the grid and in dropdown menus
selected-row-background-color: ag-derived(background-color, $mix: foreground-color 25%),

// Background colour applied to every other row or null to use background-color for all rows
odd-row-background-color: null,

// Background color of the overlay shown over the grid when it is covered by an overlay, e.g. a data loading indicator.
modal-overlay-background-color: ag-derived(background-color, $opacity: 0.66),

// Background color when hovering over rows in the grid and in dropdown menus, or null for no rollover effect (note - if you want a rollover on one but not the other, set to null and use CSS to achieve the rollover)
row-hover-color: null,

// Color to draw around selected cell ranges
range-selection-border-color: ag-derived(foreground-color),

// Background colour of selected cell ranges. By default, setting this to a semi-transparent color (opacity of 0.1 to 0.5 works well) will generate appropriate values for the range-selection-background-color-{1..4} colours used when multiple ranges overlap.
// NOTE: if setting this value to a CSS variable, and your app supports overlapping range selections, also set range-selection-background-color-{1..4}.
range-selection-background-color: ag-derived(range-selection-border-color, $opacity: 0.2),

// These 4 parameters are used for fine-grained control over the background color used when 1, 2, 3 or 4 ranges overlap.
range-selection-background-color-1: ag-derived(range-selection-background-color),
range-selection-background-color-2: ag-derived(range-selection-background-color, $self-overlay: 2),
range-selection-background-color-3: ag-derived(range-selection-background-color, $self-overlay: 3),
range-selection-background-color-4: ag-derived(range-selection-background-color, $self-overlay: 4),

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

// By default, color variables can be overridden at runtime by CSS variables, e.g.
// background-color can be overridden with the CSS var --ag-background-color. Pass true
// to disable this behaviour.
suppress-css-var-overrides: false,

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

input-border-color: null,
input-disabled-border-color: ag-derived(input-border-color, $opacity: 0.3),
input-disabled-background-color: null,

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
</p>

<h2>Passing CSS custom property values to color parameters</h2>

<p>Earlier on this page it was <a href="setting-parameters-css-variables">demonstrated</a> how to set a parameter using its named CSS variable. It is also possible to pass a variable value to a color parameter:</p>

<snippet language="scss">
.ag-theme-alpine {
    @include ag-theme-alpine((
        data-color: var(--myDataColorVar, black)
    ));
}
</snippet>

<p>This will cause the text in grid cells to be set at runtime to the value of the <code>--myDataColorVar</code> CSS variable if it is set, or else black.</p>

<h2>Parameter cascading</h2>

<p>A parameter cascade is when one parameter defaults to another, which may itself default to a different parameter. In this way we can have very general purpose parameters like <code>foreground-color</code> which changes the color of all text in the grid, and more specific parameters like <code>data-color</code> which only change the color of text in grid cells. Consider the following parameters, all of which derive their value directly or indirectly from the foreground color:</p>

<snippet language="scss">
foreground-color: #000,
data-color: ag-derived(foreground-color),
secondary-foreground-color: ag-derived(foreground-color),
header-foreground-color: ag-derived(secondary-foreground-color),
disabled-foreground-color: ag-derived(foreground-color, $opacity: 0.5),
</snippet>

<p>Note how <code>disabled-foreground-color</code> alters the opacity of the default foreground color, so setting <code>foreground-color</code> to red (<code>#FF0000</code>) will automatically generate a semi-transparent red (<code>rgba(255,0,0,0.5)</code>)</p>

<h3>Parameter cascading and CSS variables</h3>

<p>There is a limitation of parameter cascading when used in combination with CSS variables. Sometimes, one parameter in the cascade alters the value of the parameter that it derives from, as in the case of <code>disabled-foreground-color</code> above. This requires the value to be known at compile time, and it is not possible to achieve this effect at runtime using CSS variables.</p>

<p>If you are setting parameters using the built in CSS variables, defining <code>--ag-foreground-color: red</code> will not automatically set the disabled foreground color to semi-transparent red - if you want this effect, you must explicitly define <code>--ag-disabled-foreground-color: rgba(255,0,0,0.5)</code>.</p>

<p>If you are passing CSS custom property values to color parameters, e.g. <code>foreground-color: var(--myForegroundColor, red)</code> then again it will not be possible to automatically calculate the disabled foreground color, and you will need to specify a value e.g. <code>disabled-foreground-color:  var(--myDisabledForegroundColor, rgba(255,0,0,0.5))</code>. In this case there will be a warning emitted by the Sass build process describing the issue.</p>

<h2>Disabling colours by setting them to <code>null</code></h2>

<p>Any color parameter can be set to null. This will disable the parameter entirely, including CSS variable support. If you want to use CSS variables to control a parameter at runtime, you must set a non-null default value.</p>

<p>Some values, like `input-focus-border-color`, default to null. These will not be controllable through CSS variables unless you give them a default value.</p>

// TODO check that this is required - can we have CSS vars without defaults?

<h2>Sass mixins and functions</h2>

<p>The following theme functions and mixins are available if you are include a theme mixin file like <code>ag-theme-alpine-mixin.scss</code>, or can be used in isolation by importing <code>styles/mixins/_ag-theme-params.scss</code> from the grid distribution.</p>

<h3 id="ag-derived">@function ag-param</h3>

// TODO

<h3 id="ag-derived">@function ag-derived</h3>

// TODO

- ag-derived
- ag-derived with modifications

<h3 id="ag-derived">@mixin ag-color-property</h3>

// TODO

<?php include '../documentation-main/documentation_footer.php';?>
