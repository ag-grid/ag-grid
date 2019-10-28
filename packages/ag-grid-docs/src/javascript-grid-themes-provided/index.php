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
            <td class="theme-name-cell"><code>ag-theme-alpine<br/>ag-theme-alpine-dark</code></td>
            <td>
                <p>
                    <strong>New</strong> modern looking themes using styled components and two accent colors. <code>ag-theme-alpine-dark</code> is a dark
                    version of <code>ag-theme-alpine</code>.
                </p>
                <p>
                    <span class="reccommendation">Recommendation:</span>
                    This is the most recent and polished theme set, upgrading the Balham theme.  
                </p>
            </td>
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

  <h1>Alpine Themes</h1>
    <p>
        The Alpine theme comes in two versions: 1) light and 2) dark. Below shows examples of each type.
    </p>

    <p>Example Alpine Light (ag-theme-alpine)</p>

    <?= example('Alpine Theme', 'theme-alpine', 'generated', array( 'enterprise' => true, 'processVue' => true )) ?>

    <p>Example Alpine Dark (ag-theme-alpine-dark)</p>

    <?= example('Alpine Theme (dark)', 'theme-alpine-dark', 'generated', array( 'enterprise' => true, 'processVue' => true )) ?>

    <h3>Customizing the Alpine Theme</h3>

    <p>In addition to the basic set of Sass variables, the Alpine theme exposes the following Sass variables which you can override to change the theme look:

<snippet>
$alpine-blue: #2196f3;
$alpine-orange: #ff9800;
$alpine-purple: #e040fb; 
$alpine-green: #76ff03;

$alpine-black: #181d1f;
$alpine-white: #fff;

$alpine-gray-1: #222628;
$alpine-gray-2: #585652;
$alpine-gray-3: #68686e;
$alpine-gray-4: #babfc7;
$alpine-gray-5: #fcfdfe;

$alpine-light-pink: #fce4ec;
$alpine-dim-green: #43a047;
$alpine-dim-red: #e53935;
$alpine-deep-teal: #16a085;

////////////////////////////////////////
// Colors
////////////////////////////////////////

// Used as an active state across the grid - focus forms, caret, etc.
$color-primary: $alpine-blue !default;
// color used for the grid selection and selection checkboxes.
$color-secondary: $alpine-orange !default;
// background
$color-background: $alpine-white !default;

// text
$color-foreground: $alpine-black !default;

// used for panels and popups
$color-background-alt: $alpine-gray-5 !default;

// borders between the grid elements (body, panel, header, etc.)
$color-border-primary: $alpine-gray-4 !default;

// borders between body cells
$color-border-secondary: transparentize($alpine-gray-4, 0.5) !default;

$color-icon: $alpine-gray-3 !default;

// range selection
$color-selected: lighten($color-secondary, 40) !default;
$color-background-range-selection: lighten($color-secondary, 44) !default;
$color-background-range-selected-1: darken($color-background-range-selection, 10) !default;
$color-background-range-selected-2: darken($color-background-range-selection, 20) !default;
$color-background-range-selected-3: darken($color-background-range-selection, 30) !default;
$color-background-range-selected-4: darken($color-background-range-selection, 40) !default;

$color-row-hover: transparentize($color-primary, 0.9) !default;

// shadows of popups, menus, etc
$color-chrome-shadow: $alpine-gray-4 !default;

// dropdown arrow
$url-data-image-dropdown-arrow: url($black-dropdown-arrow) !default;
$url-hover-data-image-dropdown-arrow: url($blue-dropdown-arrow) !default;
$url-pressed-data-image-dropdown-arrow: url($white-dropdown-arrow) !default;

// color for the reset / cancel buttons
$color-form-element-secondary: $alpine-gray-3;
$color-border-form-element: $alpine-gray-4 !default;
$color-background-form-element-disabled: transparentize($alpine-gray-4, 0.8) !default;

// inactive color for the switch
$color-background-toggle-button: $alpine-gray-4 !default;

// chart selections
$color-background-chart-range-selection-category: $alpine-green !default;
$color-background-chart-range-selection: $alpine-blue !default;

// chips in grouping and aggregation
$color-background-chip: transparentize($alpine-gray-4, 0.8) !default;

// delta changes
$color-cell-data-changed: $alpine-light-pink !default;
$color-value-change-delta-up: $alpine-dim-green !default;
$color-value-change-delta-down: $alpine-dim-red !default;
$color-value-change-value-highlight-background: transparentize($alpine-deep-teal, 0.5) !default;

////////////////////////////////////////
//Fonts
////////////////////////////////////////

// Primary
$font-family-default: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif !default;
$size-font-default: 14px !default;
$weight-font-default: 400 !default;
$font-default: $weight-font-default $size-font-default $font-family-default;

// Secondary (used mostly in headers)
$font-family-secondary: $font-family-default !default;
$size-font-secondary: 13px !default;
$weight-font-secondary: 700 !default;
$font-secondary: $weight-font-secondary $size-font-secondary $font-family-secondary;

// Form elements
$font-family-form-element: $font-family-default !default;
$size-font-form-element: 13px !default;
$weight-font-form-element: 400 !default;
$font-form-element: $weight-font-form-element $size-font-form-element $font-family-form-element;

// Chrome UI (menu, tool panel, etc)
$font-family-chrome: $font-family-default !default;
$size-font-chrome: 13px !default;
$weight-font-chrome: 400 !default;
$font-chrome: $weight-font-chrome $size-font-chrome $font-family-chrome;

// tooltip and status bar are chrome but smaller
$size-font-tooltip: $size-font-chrome - 1 !default;
$size-font-status-bar: $size-font-chrome - 1 !default;
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
        .nav.nav-tabs .nav-link {
            color: #fff;
        }
        .nav.nav-tabs .nav-link.active {
            color: #000;
        }
        .col {
            border: 1px solid transparent;
            border-right-color: lightgrey;
            border-bottom-color: lightgray;
            font-size: 0.8rem;
        }
    </style>
    <ul class="nav nav-tabs bg-primary pl-2 pt-2" id="theme-tabpanel" role="tablist">
        <li class="nav-item mr-2">
            <a class="nav-link active" id="base-tab" data-toggle="tab" href="#base" role="tab" aria-controls="base" aria-selected="true">Base Variables</a>
        </li>
        <li class="nav-item mr-2">
            <a class="nav-link" id="balham-tab" data-toggle="tab" href="#balham" role="tab" aria-controls="balham" aria-selected="false">Balham Theme</a>
        </li>
        <li class="nav-item mr-2">
            <a class="nav-link" id="material-tab" data-toggle="tab" href="#material" role="tab" aria-controls="material" aria-selected="false">Material Theme</a>
        </li>
    </ul>
    <div class="tab-content border border-top-0" id="theme-content" style="max-height: 34rem; overflow: hidden;">
        <div class="container tab-pane show active" id="base" role="tabpanel" aria-labelledby="base-tab" style="max-height: 34rem; overflow-y: auto;">
            <div class="row">
                <div class="col text-center font-weight-bold p-2">Variable Name</div>
                <div class="col text-center font-weight-bold p-2">Default Value</div>
                <div class="col text-center font-weight-bold p-2">Description</div>
            </div>
            <div class="row">
                <div class="col p-2">foreground-opacity</div>
                <div class="col p-2">1</div>
                <div class="col p-2">The foreground opacity.</div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-foreground-color-opacity</div>
                <div class="col p-2">1</div>
                <div class="col p-2">The header font color opacity.</div>
            </div>
            <div class="row">
                <div class="col p-2">disabled-foreground-color-opacity</div>
                <div class="col p-2">0.5</div>
                <div class="col p-2">The opacity of the disabled / empty text elements.</div>
            </div>
            <div class="row">
                <div class="col p-2">icon-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The icon color.</div>
            </div>
            <div class="row">
                <div class="col p-2">alt-icon-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The secondary icon, used on icons with two colors (eg. checkbox background).</div>
            </div>
            <div class="row">
                <div class="col p-2">foreground-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The default color of the text.</div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-foreground-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The header font color.</div>
            </div>
            <div class="row">
                <div class="col p-2">disabled-foreground-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The color of the disabled / empty text elements.</div>
            </div>
            <div class="row">
                <div class="col p-2">menu-option-active-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The background color of the context / column menu items when hovered.</div>
            </div>
            <div class="row">
                <div class="col p-2">input-disabled-background-color</div>
                <div class="col p-2">#ebebeb</div>
                <div class="col p-2">The color of disabled input field</div>
            </div>
            <div class="row">
                <div class="col p-2">card-background-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The background color for the context menu and the column menu.</div>
            </div>
            <div class="row">
                <div class="col p-2">border-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The color used for all borders.</div>
            </div>
            <div class="row">
                <div class="col p-2">scroll-spacer-border</div>
                <div class="col p-2">1px solid <code>border-color</code></div>
                <div class="col p-2">The border that separates the pinned columns from the scrollable area within the horizontal scrollbar</div>
            </div>
            <div class="row">
                <div class="col p-2">primary-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The main color associated with selected cells and other items (eg. cell border color, sidbar selected tab border).</div>
            </div>
            <div class="row">
                <div class="col p-2">accent-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The color for the checked checkboxes.</div>
            </div>
            <div class="row">
                <div class="col p-2">background-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The default background color.</div>
            </div>
            <div class="row">
                <div class="col p-2">odd-row-background-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The odd row background color.</div>
            </div>
            <div class="row">
                <div class="col p-2">editor-background-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The background color of cells being edited.</div>
            </div>
            <div class="row">
                <div class="col p-2">header-background-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The header background color.</div>
            </div>
            <div class="row">
                <div class="col p-2">header-cell-hover-background-color</div>
                <div class="col p-2">$header-background-color</div>
                <div class="col p-2">The header background color while hovering</div>
            </div>
            <div class="row">
                <div class="col p-2">header-cell-moving-background-color</div>
                <div class="col p-2">#bebebe</div>
                <div class="col p-2">The header background color while being moved.</div>
            </div>
            <div class="row">
                <div class="col p-2">header-foreground-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The header text color.</div>
            </div>
            <div class="row">
                <div class="col p-2">header-background-image</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The header background gradient - you can also refer to an an image with `url(...)`.</div>
            </div>
            <div class="row">
                <div class="col p-2">panel-background-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The background color of the column menu.</div>
            </div>
            <div class="row">
                <div class="col p-2">tool-panel-background-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The tool panel background color</div>
            </div>
            <div class="row">
                <div class="col p-2">chip-background-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The background color of the column labels used in the grouping / pivoting.</div>
            </div>
            <div class="row">
                <div class="col p-2">range-selection-background-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The background color of the selected cells.</div>
            </div>
            <div class="row">
                <div class="col p-2">hover-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The background color of the row when hovered.</div>
            </div>
            <div class="row">
                <div class="col p-2">selected-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The background color of selected rows.</div>
            </div>
            <div class="row">
                <div class="col p-2">cell-data-changed-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The background color used when the cell flashes when data is changed.</div>
            </div>
            <div class="row">
                <div class="col p-2">focused-cell-border-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The border color of the focused cell.</div>
            </div>
            <div class="row">
                <div class="col p-2">tab-background-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The background color of the tab in the column menu</div>
            </div>
            <div class="row">
                <div class="col p-2">cell-highlight-border</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The border used to mark cells as being copied.</div>
            </div>
            <div class="row">
                <div class="col p-2">cell-horizontal-border</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The border delimiter between cells.</div>
            </div>
            <div class="row">
                <div class="col p-2">ag-range-selected-color-1</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The selection background color.</div>
            </div>
            <div class="row">
                <div class="col p-2">ag-range-selected-color-2</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The selection background color when it overlaps with another selection (range) 1 level.</div>
            </div>
            <div class="row">
                <div class="col p-2">ag-range-selected-color-3</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The selection background color when it overlaps with another selection (range) 2 levels.</div>
            </div>
            <div class="row">
                <div class="col p-2">ag-range-selected-color-4</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The selection background color when it overlaps with another selection (range) 3 levels.</div>
            </div>
            <div class="row">
                <div class="col p-2">value-change-delta-up-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The color used when the cell value increases.</div>
            </div>
            <div class="row">
                <div class="col p-2">value-change-delta-down-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The color used when the cell value decreases.</div>
            </div>
            <div class="row">
                <div class="col p-2">value-change-value-highlight-background-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The background color used when the cell value changes.</div>
            </div>
            <div class="row">
                <div class="col p-2">row-floating-background-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The background color of the pinned rows.</div>
            </div>
            <div class="row">
                <div class="col p-2">row-stub-background-color</div>
                <div class="col p-2"><code>&lt;no default&gt;</code></div>
                <div class="col p-2">The color of row stub background (see: <a href="/javascript-grid-row-node/">Row Node</a>)</div>
            </div>
            <div class="row">
                <div class="col p-2">grid-size</div>
                <div class="col p-2">4px</div>
                <div class="col p-2">The basic unit used for the grid spacing and dimensions. Changing this makes the grid UI more / less compact.</div>
            </div>
            <div class="row">
                <div class="col p-2">icon-size</div>
                <div class="col p-2">12px</div>
                <div class="col p-2">The icon width and height (icons are square).</div>
            </div>
            <div class="row">
                <div class="col p-2">header-height</div>
                <div class="col p-2"><code>grid-size</code> * 6 + 1</div>
                <div class="col p-2">The header row height - if you change this, you also have to change the value of the `headerHeight` in the grid options. We are looking into removing this redundant step in the future.</div>
            </div>
            <div class="row">
                <div class="col p-2">row-height</div>
                <div class="col p-2"><code>grid-size</code> * 6 + 1</div>
                <div class="col p-2">The row height - if you change this, you also have to change the value of the `rowHeight` in the grid options. We are looking into removing this redundant step in the future.</div>
            </div>
            <div class="row">
                <div class="col p-2">cell-horizontal-padding</div>
                <div class="col p-2"><code>grid-size</code> * 3</div>
                <div class="col p-2">The cell horizontal padding.</div>
            </div>
            <div class="row">
                <div class="col p-2">virtual-item-height</div>
                <div class="col p-2"><code>grid-size</code> * 5</div>
                <div class="col p-2">The height of virtual items (eg. Set Filter items).</div>
            </div>
            <div class="row">
                <div class="col p-2">header-icon-size</div>
                <div class="col p-2">14px</div>
                <div class="col p-2">The header icon height.</div>
            </div>
            <div class="row">
                <div class="col p-2">font-family</div>
                <div class="col p-2">'Helvetica Neue', sans-serif</div>
                <div class="col p-2">The grid font family.</div>
            </div>
            <div class="row">
                <div class="col p-2">font-size</div>
                <div class="col p-2">14px</div>
                <div class="col p-2">The grid font size.</div>
            </div>
            <div class="row">
                <div class="col p-2">font-weight</div>
                <div class="col p-2">400</div>
                <div class="col p-2">The grid font weight</div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-font-family</div>
                <div class="col p-2"><code>font-family</code></div>
                <div class="col p-2">The font family used in the header.</div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-font-size</div>
                <div class="col p-2">14px</div>
                <div class="col p-2">The header font size.</div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-font-weight</div>
                <div class="col p-2">400</div>
                <div class="col p-2">The header font weight.</div>
            </div>
            <div class="row">
                <div class="col p-2">card-shadow</div>
                <div class="col p-2">none</div>
                <div class="col p-2">Box shadow value for the context menu and the column menu.</div>
            </div>
            <div class="row">
                <div class="col p-2">card-radius</div>
                <div class="col p-2">0</div>
                <div class="col p-2">Border radius for the context menu and the column menu.</div>
            </div>
            <div class="row">
                <div class="col p-2">row-border-width</div>
                <div class="col p-2">0</div>
                <div class="col p-2">the row border width.</div>
            </div>
            <div class="row">
                <div class="col p-2">toolpanel-indent-size</div>
                <div class="col p-2"><code>grid-size</code> * <code>icon-size</code></div>
                <div class="col p-2">The indent used for the tool panel hierarchy.</div>
            </div>
            <div class="row">
                <div class="col p-2">tooltip-background-color</div>
                <div class="col p-2">#535353</div>
                <div class="col p-2">The tooltip background color.</div>
            </div>
            <div class="row">
                <div class="col p-2">tooltip-foreground-color</div>
                <div class="col p-2">#ffffff</div>
                <div class="col p-2">The tooltip foreground color.</div>
            </div>
            <div class="row">
                <div class="col p-2">tooltip-border-radius</div>
                <div class="col p-2">2px</div>
                <div class="col p-2">The tooltip boder radius.</div>
            </div>
            <div class="row">
                <div class="col p-2">tooltip-padding</div>
                <div class="col p-2">5px</div>
                <div class="col p-2">The tooltip padding.</div>
            </div>
            <div class="row">
                <div class="col p-2">tooltip-border-width</div>
                <div class="col p-2">1px</div>
                <div class="col p-2">The tooltip border width.</div>
            </div>
            <div class="row">
                <div class="col p-2">tooltip-border-style</div>
                <div class="col p-2">solid</div>
                <div class="col p-2">The tooltip border style.</div>
            </div>
            <div class="row">
                <div class="col p-2">tooltip-border-color</div>
                <div class="col p-2">#ebebeb</div>
                <div class="col p-2">The tooltip border color</div>
            </div>
        </div>
        <div class="container tab-pane" id="balham" role="tabpanel" aria-labelledby="balham-tab" style="max-height: 34rem; overflow-y: auto;">
            <div class="row">
                <div class="col text-center font-weight-bold p-2">Variable Name</div>
                <div class="col text-center font-weight-bold p-2">Default Value</div>
            </div>
            <div class="row">
                <div class="col p-2">foreground-opacity</div>
                <div class="col p-2">0.87</div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-foreground-color-opacity</div>
                <div class="col p-2">0.54</div>
            </div>
            <div class="row">
                <div class="col p-2">disabled-foreground-color-opacity</div>
                <div class="col p-2">0.38</div>
            </div>
            <div class="row">
                <div class="col p-2">grid-size</div>
                <div class="col p-2">4px</div>
            </div>
            <div class="row">
                <div class="col p-2">icon-size</div>
                <div class="col p-2">16px</div>
            </div>
            <div class="row">
                <div class="col p-2">row-height</div>
                <div class="col p-2"><code>grid-size</code> * 7</div>
            </div>
            <div class="row">
                <div class="col p-2">default-background</div>
                <div class="col p-2">#FFFFF;</div>
            </div>
            <div class="row">
                <div class="col p-2">chrome-background</div>
                <div class="col p-2"><code>lighten(flat-clouds, 3)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">active</div>
                <div class="col p-2">#0091EA</div>
            </div>
            <div class="row">
                <div class="col p-2">foreground-color</div>
                <div class="col p-2">#000000;</div>
            </div>
            <div class="row">
                <div class="col p-2">border-color</div>
                <div class="col p-2"><code>flat-silver</code></div>
            </div>
            <div class="row">
                <div class="col p-2">icon-color</div>
                <div class="col p-2"><code>flat-gray-4</code></div>
            </div>
            <div class="row">
                <div class="col p-2">alt-background</div>
                <div class="col p-2"><code>flat-clouds</code></div>
            </div>
            <div class="row">
                <div class="col p-2">odd-row-background-color</div>
                <div class="col p-2">#fcfdfe</div>
            </div>
            <div class="row">
                <div class="col p-2">header-cell-moving-background-color</div>
                <div class="col p-2"><code>default-background</code></div>
            </div>
            <div class="row">
                <div class="col p-2">foreground-color</div>
                <div class="col p-2"><code>rgba(foreground-color, foreground-opacity)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-foreground-color</div>
                <div class="col p-2"><code>rgba(foreground-color, secondary-foreground-color-opacity)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">disabled-foreground-color</div>
                <div class="col p-2"><code>rgba(foreground-color, disabled-foreground-color-opacity)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">input-disabled-background-color</div>
                <div class="col p-2">#ebebeb</div>
            </div>
            <div class="row">
                <div class="col p-2">primary-color</div>
                <div class="col p-2"><code>active</code></div>
            </div>
            <div class="row">
                <div class="col p-2">accent-color</div>
                <div class="col p-2"><code>active</code></div>
            </div>
            <div class="row">
                <div class="col p-2">range-selection-background-color</div>
                <div class="col p-2"><code>transparentize(active, 0.8)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">ag-range-selected-color-1</div>
                <div class="col p-2"><code>opacify(range-selection-background-color, 0.1)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">ag-range-selected-color-2</div>
                <div class="col p-2"><code>opacify(range-selection-background-color, 0.2)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">ag-range-selected-color-3</div>
                <div class="col p-2"><code>opacify(range-selection-background-color, 0.3)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">ag-range-selected-color-4</div>
                <div class="col p-2"><code>opacify(range-selection-background-color, 0.4)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">range-selection-highlight-color</div>
                <div class="col p-2"><code>active</code></div>
            </div>
            <div class="row">
                <div class="col p-2">selected-color</div>
                <div class="col p-2"><code>lighten(active, 40)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">alt-icon-color</div>
                <div class="col p-2"><code>default-background</code></div>
            </div>
            <div class="row">
                <div class="col p-2">background-color</div>
                <div class="col p-2"><code>default-background</code></div>
            </div>
            <div class="row">
                <div class="col p-2">editor-background-color</div>
                <div class="col p-2"><code>chrome-background</code></div>
            </div>
            <div class="row">
                <div class="col p-2">panel-background-color</div>
                <div class="col p-2"><code>chrome-background</code></div>
            </div>
            <div class="row">
                <div class="col p-2">tool-panel-background-color</div>
                <div class="col p-2"><code>chrome-background</code></div>
            </div>
            <div class="row">
                <div class="col p-2">header-background-color</div>
                <div class="col p-2"><code>chrome-background</code></div>
            </div>
            <div class="row">
                <div class="col p-2">header-foreground-color</div>
                <div class="col p-2"><code>secondary-foreground-color</code></div>
            </div>
            <div class="row">
                <div class="col p-2">hover-color</div>
                <div class="col p-2"><code>alt-background</code></div>
            </div>
            <div class="row">
                <div class="col p-2">chip-background-color</div>
                <div class="col p-2"><code>darken(alt-background, 5)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">row-stub-background-color</div>
                <div class="col p-2">inherit</div>
            </div>
            <div class="row">
                <div class="col p-2">row-floating-background-color</div>
                <div class="col p-2">inherit</div>
            </div>
            <div class="row">
                <div class="col p-2">cell-data-changed-color</div>
                <div class="col p-2">#fce4ec</div>
            </div>
            <div class="row">
                <div class="col p-2">value-change-delta-up-color</div>
                <div class="col p-2">#43a047</div>
            </div>
            <div class="row">
                <div class="col p-2">value-change-delta-down-color</div>
                <div class="col p-2">#e53935</div>
            </div>
            <div class="row">
                <div class="col p-2">value-change-value-highlight-background-color</div>
                <div class="col p-2"><code>transparentize(#16A085, 0.5)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">header-height</div>
                <div class="col p-2"><code>grid-size * 8</code></div>
            </div>
            <div class="row">
                <div class="col p-2">virtual-item-height</div>
                <div class="col p-2"><code>grid-size * 7</code></div>
            </div>
            <div class="row">
                <div class="col p-2">row-border-width</div>
                <div class="col p-2">1px</div>
            </div>
            <div class="row">
                <div class="col p-2">toolpanel-indent-size</div>
                <div class="col p-2"><code>$grid-size</code> + <code>$icon-size</code></div>
            </div>
            <div class="row">
                <div class="col p-2">row-group-indent-size</div>
                <div class="col p-2"><code>$grid-size</code> * 3 + <code>$icon-size</code></div>
            </div>
            <div class="row">
                <div class="col p-2">cell-horizontal-padding</div>
                <div class="col p-2"><code>grid-size</code> * 3</div>
            </div>
            <div class="row">
                <div class="col p-2">header-icon-size</div>
                <div class="col p-2">14px</div>
            </div>
            <div class="row">
                <div class="col p-2">border-radius</div>
                <div class="col p-2">2px</div>
            </div>
            <div class="row">
                <div class="col p-2">font-family</div>
                <div class="col p-2">-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif</div>
            </div>
            <div class="row">
                <div class="col p-2">font-size</div>
                <div class="col p-2">12px</div>
            </div>
            <div class="row">
                <div class="col p-2">font-weight</div>
                <div class="col p-2">400</div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-font-family</div>
                <div class="col p-2"><code>font-family</code></div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-font-size</div>
                <div class="col p-2">12px</div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-font-weight</div>
                <div class="col p-2">600</div>
            </div>
            <div class="row">
                <div class="col p-2">tooltip-background-color</div>
                <div class="col p-2"><code>lighten($flat-gray-2, 5%)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">tooltip-foreground-color</div>
                <div class="col p-2"><code>foreground-color</code></div>
            </div>
            <div class="row">
                <div class="col p-2">tooltip-border-radius</div>
                <div class="col p-2"><code>border-radius</code></div>
            </div>
            <div class="row">
                <div class="col p-2">tooltip-border-color</div>
                <div class="col p-2"><code>tooltip-foreground-color</code></div>
            </div>
        </div>
        <div class="container tab-pane" id="material" role="tabpanel" aria-labelledby="material-tab" style="max-height: 34rem; overflow-y: auto;">
            <div class="row">
                <div class="col text-center font-weight-bold p-2">Variable Name</div>
                <div class="col text-center font-weight-bold p-2">Default Value</div>
            </div>
            <div class="row">
                <div class="col p-2">mat-grey-0 <code>(color accessor)</code></div>
                <div class="col p-2">#ffffff</div>
            </div>
            <div class="row">
                <div class="col p-2">mat-grey-50 <code>(color accessor)</code></div>
                <div class="col p-2">#fafafa</div>
            </div>
            <div class="row">
                <div class="col p-2">mat-grey-100 <code>(color accessor)</code></div>
                <div class="col p-2">#f5f5f5</div>
            </div>
            <div class="row">
                <div class="col p-2">mat-grey-200 <code>(color accessor)</code></div>
                <div class="col p-2">#eeeeee</div>
            </div>
            <div class="row">
                <div class="col p-2">mat-grey-300 <code>(color accessor)</code></div>
                <div class="col p-2">#e2e2e2</div>
            </div>
            <div class="row">
                <div class="col p-2">mat-indigo-500 <code>(color accessor)</code></div>
                <div class="col p-2">#3f51b5</div>
            </div>
            <div class="row">
                <div class="col p-2">mat-pink-A200 <code>(color accessor)</code></div>
                <div class="col p-2">#ff4081</div>
            </div>
            <div class="row">
                <div class="col p-2">mat-pink-50 <code>(color accessor)</code></div>
                <div class="col p-2">#fce4ec</div>
            </div>
            <div class="row">
                <div class="col p-2">mat-indigo-50 <code>(color accessor)</code></div>
                <div class="col p-2">#e8eaf6</div>
            </div>
            <div class="row">
                <div class="col p-2">foreground-opacity</div>
                <div class="col p-2">0.87</div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-foreground-color-opacity</div>
                <div class="col p-2">0.54</div>
            </div>
            <div class="row">
                <div class="col p-2">disabled-foreground-color-opacity</div>
                <div class="col p-2">0.38</div>
            </div>
            <div class="row">
                <div class="col p-2">grid-size</div>
                <div class="col p-2">8px</div>
            </div>
            <div class="row">
                <div class="col p-2">icon-size</div>
                <div class="col p-2">18px</div>
            </div>
            <div class="row">
                <div class="col p-2">header-height</div>
                <div class="col p-2"><code>grid-size</code> * 7</div>
            </div>
            <div class="row">
                <div class="col p-2">row-height</div>
                <div class="col p-2"><code>grid-size</code> * 6</div>
            </div>
            <div class="row">
                <div class="col p-2">row-border-width</div>
                <div class="col p-2">1px</div>
            </div>
            <div class="row">
                <div class="col p-2">toolpanel-indent-size</div>
                <div class="col p-2"><code>grid-size</code> + <code>icon-size</code></div>
            </div>
            <div class="row">
                <div class="col p-2">row-group-indent-size</div>
                <div class="col p-2"><code>grid-size</code> * 3 + <code>icon-size</code></div>
            </div>
            <div class="row">
                <div class="col p-2">cell-horizontal-padding</div>
                <div class="col p-2"><code>grid-size</code> * 3</div>
            </div>
            <div class="row">
                <div class="col p-2">virtual-item-height</div>
                <div class="col p-2"><code>grid-size</code> * 5</div>
            </div>
            <div class="row">
                <div class="col p-2">header-icon-size</div>
                <div class="col p-2">14px</div>
            </div>
            <div class="row">
                <div class="col p-2">font-family</div>
                <div class="col p-2">"Roboto", sans-serif</div>
            </div>
            <div class="row">
                <div class="col p-2">font-size</div>
                <div class="col p-2">13px</div>
            </div>
            <div class="row">
                <div class="col p-2">font-weight</div>
                <div class="col p-2">400</div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-font-family</div>
                <div class="col p-2">"Roboto", sans-serif</div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-font-size</div>
                <div class="col p-2">12px</div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-font-weight</div>
                <div class="col p-2">700</div>
            </div>
            <div class="row">
                <div class="col p-2">foreground-color</div>
                <div class="col p-2"><code>rgba(#000, foreground-opacity)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">secondary-foreground-color</div>
                <div class="col p-2"><code>rgba(#000, secondary-foreground-color-opacity)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">disabled-foreground-color</div>
                <div class="col p-2"><code>rgba(#000, $disabled-foreground-color-opacity)</code></div>
            </div>
            <div class="row">
                <div class="col p-2">header-background-color</div>
                <div class="col p-2">$background-color</div>
            </div>
            <div class="row">
                <div class="col p-2">header-cell-hover-background-color</div>
                <div class="col p-2">darken(<code>$header-background-color</code>, 5%)</div>
            </div>
            <div class="row">
                <div class="col p-2">header-cell-moving-background-color</div>
                <div class="col p-2"><code>$header-cell-hover-background-color</code></div>
            </div>
            <div class="row">
                <div class="col p-2">header-foreground-color</div>
                <div class="col p-2"><code>$secondary-foreground-color</code></div>
            </div>
            <div class="row">
                <div class="col p-2">border-color</div>
                <div class="col p-2"><code>mat-indigo-300</code></div>
            </div>
            <div class="row">
                <div class="col p-2">primary-color</div>
                <div class="col p-2"><code>mat-indigo-500</code></div>
            </div>
            <div class="row">
                <div class="col p-2">accent-color</div>
                <div class="col p-2"><code>mat-pink-A200</code></div>
            </div>
            <div class="row">
                <div class="col p-2">icon-color</div>
                <div class="col p-2">#333</div>
            </div>
            <div class="row">
                <div class="col p-2">background-color</div>
                <div class="col p-2"><code>mat-grey-0</code></div>
            </div>
            <div class="row">
                <div class="col p-2">editor-background-color</div>
                <div class="col p-2"><code>mat-grey-50</code></div>
            </div>
            <div class="row">
                <div class="col p-2">panel-background-color</div>
                <div class="col p-2"><code>mat-grey-200</code></div>
            </div>
            <div class="row">
                <div class="col p-2">tool-panel-background-color</div>
                <div class="col p-2"><code>mat-grey-50</code></div>
            </div>
            <div class="row">
                <div class="col p-2">chip-background-color</div>
                <div class="col p-2"><code>mat-grey-300</code></div>
            </div>
            <div class="row">
                <div class="col p-2">range-selection-background-color</div>
                <div class="col p-2"><code>mat-indigo-50</code></div>
            </div>
            <div class="row">
                <div class="col p-2">range-selection-highlight-color</div>
                <div class="col p-2"><code>mat-pink-50</code></div>
            </div>
            <div class="row">
                <div class="col p-2">hover-color</div>
                <div class="col p-2"><code>mat-grey-50</code></div>
            </div>
            <div class="row">
                <div class="col p-2">selected-color</div>
                <div class="col p-2"><code>mat-grey-200</code></div>
            </div>
            <div class="row">
                <div class="col p-2">cell-data-changed-color</div>
                <div class="col p-2"><code>mat-pink-50</code></div>
            </div>
            <div class="row">
                <div class="col p-2">card-shadow</div>
                <div class="col p-2">0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)</div>
            </div>
            <div class="row">
                <div class="col p-2">card-radius</div>
                <div class="col p-2">2px</div>
            </div>
            <div class="row">
                <div class="col p-2">value-change-delta-up-color</div>
                <div class="col p-2">#43a047</div>
            </div>
            <div class="row">
                <div class="col p-2">value-change-delta-down-color: </div>
                <div class="col p-2">#e53935</div>
            </div>
            <div class="row">
                <div class="col p-2">value-change-value-highlight-background-color</div>
                <div class="col p-2">#00acc1</div>
            </div>
        </div>
    </div>

<?php include '../documentation-main/documentation_footer.php';?>
