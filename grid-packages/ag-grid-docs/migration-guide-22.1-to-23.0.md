In v23 we are releasing a major rewrite of our themes with the goal of making it easier to write custom themes. Most custom themes will need updating to use the new system. We want to explain why we're doing this, and tell you how to upgradew your themes.

## Why we're updating our themes

Prior to this release, the primary way of customising a theme in ag-Grid was to define Sass variables, so if you wanted to change the header background colour you'd define the `$ag-header-background-color` variable. We considered our DOM class attributes and CSS structure to be an implementation detail, not a public API. But several years of using Sass variables has taught us the limitations of this approach:

1. There were never enough variables - every custom theme wants to make changes that we don't provide variables for, so needs to contain CSS rules as well as variable definitions.
2. There were too many variables! Adding more variables was not the solution, because they are hard to discover - you need to check the documentation, rather than using the browser developer tools to find out a class name.
3. "Clever" variables that do more than one thing cause issues. For example, `$ag-accent-color` changed the colour of certain important elements, but in practice every custom theme has a different idea of which elements should be accented.
4. Because our DOM and class name structures weren't designed as public APIs, the CSS rules required in custom themes were often complicated, deeply nested, and inconsistent beween grid features. This lead to brittleness: upgrading to a minor release could break people's themes.
5. The base theme made some opinionated design decisions like adding borders and padding. Themes that didn't want those borders and padding to remove them with rules like `... some complex selector ... { border: none , padding: 0}`.

So in the latest release of ag-Grid we have added many new css classes, renamed existing ones for consistency, and rewritten the base theme and our provided themes (Alpine, Balham and Material) to make them easier to extend. The strategy for theming ag-Grid is now:

* The primary way of customising elements is now CSS. In the majority of cases you should only need a single class name in your selector, e.g. `.ag-component-name { padding: 10px }`.
* Variables in the base theme now do one thing only, and opinionated variables have been moved from the base theme to the provided themes.
* We have removed variables that do something that can be easily achieved with a CSS selector.
* Our base theme still has contains opinionated design features, but themes can opt-out. If you have a different idea about where borders should be drawn, you can define `$ag-borders: false` and the base theme will not add any borders, giving you a clean slate to add your own borders.

The net effect is that custom themes will be simpler to write, and will break less between releases.

## The effect on existing custom themes

This is a big change, and all custom themes will require updating. But once they have been updated, they should be easier to maintain in the future.


## Placeholders removed

%tab - use .ag-tab
%selected-tab - use .ag-tab-selected
%card - use $ag-card-* variables or CSS selectors


## Sass variable changes

We have made various changes to Sass variables. When we have renamed variables, we still support the old variable names for compatibilty, but the changes are listed here for your information.

$ag-header-icon-size, $ag-row-border-width, $ag-transition-speed, $ag-cell-data-changed-color, $ag-use-icons-for-pager-buttons: These vars were defined but not used and have been removed.

$ag-foreground-opacity > $ag-foreground-color-opacity
$ag-alt-icon-color > $ag-checkbox-background-colorag-range-selection-border-color
   
$ag-range-selected-color-1 (and -2, -3, -4): removed. Colour when multiple ranges overlap now calculated automatically from the opacity of $ag-range-selection-background-color.

$ag-foreground-color-opacity, $ag-secondary-foreground-color-opacity, $ag-disabled-foreground-color-opacity: removed. If you were using them, instead set a semi-transparent colour to $ag-foreground-color, $ag-secondary-foreground-color, or $ag-disabled-foreground-color

$ag-primary-color removed. Use $ag-range-selection-border-color and $ag-selected-tab-underline-color.

$ag-tooltip-background-color, $ag-tooltip-border-color, $ag-tooltip-border-radius, $ag-tooltip-border-style, $ag-tooltip-border-width, $ag-tooltip-foreground-color, $ag-tooltip-padding: removed. Use a CSS rule like .ag-tooltip { padding: 10px; }

$ag-accent-color > removed. If extending the base theme, use specific colour variables like $ag-checkbox-check-color or use CSS selectors to change element colors. If extending a provided theme, check the theme's ag-theme-{themename}-vars.scss file for theme-specific variables to achieve the same effect. Fopr example, the material theme provides `$ag-mat-accent-color`.

Variables starting `$ag-dialog-` and `$ag-dialog-title-` have been removed. Instead of using these variables, use a css selector like `.ag-panel { ... }` or `.ag-panel-title { ... }`. The full list of removed variables is: $ag-dialog-background-color, $ag-dialog-border-size, $ag-dialog-border-style, $ag-dialog-border-color, $ag-dialog-title-background-color, $ag-dialog-title-foreground-color, $ag-dialog-title-height, $ag-dialog-title-font-family, $ag-dialog-title-font-size, $ag-dialog-title-font-weight, $ag-dialog-title-padding, $ag-dialog-title-icon-size, 

$ag-header-background-image: removed. .ag-header {background: xxx}

$ag-row-stub-background-color: removed. use .ag-row-loading {background-color: xxx}

$ag-row-floating-background-color: removed. Use .ag-row-pinned {background-color: xxx}

$ag-group-border-color: removed

TODO: replaced with new styles, document
$ag-editor-background-color: null !default;
$ag-panel-background-color: null !default;
$ag-group-background-color: null !default;
$ag-group-border-color: null !default;
$ag-group-title-background-color: null !default;
$ag-group-toolbar-background-color: null !default;

$ag-customise-inputs, $ag-input-bottom-border, $ag-input-bottom-border-disabled, $ag-input-border-width, $ag-input-height, $ag-focused-textbox-border-bottom: removed. Use the new %ag-text-input placeholder selector to style text inputs instead. See ag-theme-material.scss for an example.


$ag-customize-buttons, $ag-button-color, $ag-button-text-transform, $ag-button-background-color: remvoed. Apply styles to buttons using css class name selectors like `.ag-standard-button { ... }`

$ag-scroll-spacer-border: removed. Now drawn as a 'critical' level border controlled by $ag-borders.

$ag-font-weight, $ag-secondary-font-family, $ag-secondary-font-size, $ag-secondary-font-weight - removed. Use css selectors to style the desired elements appropriately. $ag-font-family, $ag-font-size are still available.

$ag-rich-select-item-height: removed. In practice, this caused issues if it was different from $ag-list-item-height, so use $ag-list-item-height instead.

$ag-filter-tool-panel-top-level-row-height and $ag-filter-tool-panel-sub-level-row-height: removed. CSS selectors to set the height with one of these selectors:
`.ag-filter-toolpanel-header`: all headers
`.ag-filter-toolpanel-instance-header`: leaf level headers
`.ag-filter-toolpanel-group-level-{X}-header`: specific level of header, e.g. `.ag-filter-toolpanel-group-level-0-header` for the top level

## CSS class renames

ag-group-component
ag-group-component-title-bar
ag-group-component-title-bar-icon
ag-group-component-title
ag-group-component-container
ag-group-component-toolbar
Are now ag-group, ag-group-title-bar etc

.ag-row-stub > .ag-row-loading

.ag-faded > removed. This was only used on column-drop icons and titles when the component was empty. Use the new `.ag-column-drop-empty` class.

.title (in the vertical column drop component) > .ag-column-drop-vertical-title

.ag-alignment-stretch, .ag-alignment-start, .ag-alignment-end
are now
.ag-group-item-alignment-stretch, .ag-group-item-alignment-start, .ag-group-item-alignment-end

.ag-column-drag and .ag-row-drag are now .ag-drag-handle

.ag-nav-card-selector is now .ag-chart-settings-card-selector

.ag-nav-card-item is now .ag-chart-settings-card-item

ag-title-bar > ag-panel-title-bar
ag-title-bar-title > ag-panel-title-bar-title
ag-title-bar-buttons > ag-panel-title-bar-buttons
.ag-button > ag-panel-title-bar-button

.ag-paging-button > .ag-paging-button-wrapper

.ag-cell-with-height > .ag-cell-auto-height

.ag-name-value > ag-status-name-value


ag-parent-circle > ag-angle-select-parent-circle
ag-child-circle > ag-angle-select-child-circle

ag-picker-button > ag-picker-field-button

ag-fill > ag-spectrum-fill

ag-hue-alpha > ag-spectrum-tool


ag-tab-header > ag-tabs-header
ag-tab-body > ag-tabs-body


ag-chart-tabbed-menu > ag-chart-menu-tabs

ag-column-select-panel > ag-column-select
ag-primary-cols-header-panel > ag-column-select-header
ag-primary-cols-filter > ag-column-select-header-filter
ag-primary-cols-filter-wrapper > ag-column-select-header-filter-wrapper
ag-primary-cols-list-panel > ag-column-select-list

.ag-filter-toolpanel-header - this was set on headers and search. Now it is only set on headers. Use .ag-filter-toolpanel-search to style the search box.

ag-filter-toolpanel-search
ag-filter-toolpanel-group
ag-filter-toolpanel-filter
ag-filter-toolpanel-filter-header
ag-filter-toolpanel-filter-body

Shared: 
ag-filter-toolpanel-header
ag-filter-toolpanel-header-expand
ag-filter-toolpanel-header-text


ag-filter-panel -> ag-filter-toolpanel
ag-filter-header > ag-filter-toolpanel-search-header
ag-filter-toolpanel-header > ag-filter-toolpanel-instance-header
ag-filter-panel-group-title -> ag-filter-toolpanel-group-title
ag-filter-panel-group-title-bar -> ag-filter-toolpanel-group-title-bar
ag-filter-panel-group-item -> ag-filter-toolpanel-group-item
ag-filter-toolpanel-body > ag-filter-toolpanel-instance-body
ag-filter-air > ag-filter-toolpanel-instance-filter

ag-stub-cell > ag-loading


ag-paging-button-wrapper

ag-column-tool-panel-column > ag-column-select-column
ag-column-tool-panel-column-group > ag-column-select-column-group
ag-column-tool-panel-column-label > ag-column-select-column-label

.ag-toolpanel-indent-1 > .ag-column-select-indent-1
.ag-toolpanel-indent-2 > .ag-column-select-indent-2
.ag-toolpanel-indent-3 > .ag-column-select-indent-3
.ag-toolpanel-indent-4 > .ag-column-select-indent-4
.ag-toolpanel-indent-5 > .ag-column-select-indent-5

.ag-toolpanel-add-group-indent > .ag-column-select-add-group-indent

.ag-column-drop > .ag-column-drop-horizontal-half-width