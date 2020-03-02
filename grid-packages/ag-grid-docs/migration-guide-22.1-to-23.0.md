In v23 we are releasing a major rewrite of our themes with the goal of making it easier to write custom themes. We have implemented a backwards compatibility mode that will enable some apps to continue working with minimal changes. Some apps may need to upgrade to use the new method for creating custom themes, either because:

1. The backwards compatibility mode is causing issues for your app
2. You want to use new theme features added in v23 or a later release that are not supported in the backwards compatibility mode

This guide explains what has changed, why we changed it, and how to update your apps.

### Configuring backwards compatibility mode.

If you are extending a provided theme by importing the main theme file, e.g. `ag-theme-balham.scss`, upon upgrading to v23 you should see a warning that `$ag-compatibility-mode` is not defined.

Define the `$ag-compatibility-mode` *before* the line that imports the provided theme file:

```scss
$ag-compatibility-mode: "variables"; // or "legacy"
@import "~ag-grid-community/src/styles/ag-theme-balham/sass/ag-theme-balham.scss";
```

There are two supported values, `"variables"` and `"legacy"`.

* variables mode: reads the global variables that were supported in v22 and converts them to the parameter maps used in v23, *only if there is an equivalent parameter for a variable* (most variables are supported). This mode:
  * is a reliable mechanism and is safe to use long-term (although you may wish to update your themes anyway, to get the benefits of the new configuration system like better validation)
  * does not support [variables removed with no equivalent parameter](#variables-removed-with-no-equivalent-parameter) - if you were using one of these variables, you will need to write new CSS selectors to achieve the same effect. Generally, the reason why we have removed some variables is that it is simple to write CSS to achieve the same effect.
  * does not modify your CSS selectors. If you are using any of the [renamed CSS classes](#renamed-CSS-classes) you will need to update your CSS selectors
* legacy mode: attempts to make themes written for v22 and earlier work in v23. This mode:
  * is intended to be used as a temporary solution for graceful migration to v23 for apps with many or complex themes, allowing these apps to update to v23 immediately and then gradually migrate their themes at a later date
  * generates new CSS and uses Sass `@extend` directives to alias old names to new names
  * is a "best effort" solution - it will support the majority of use cases for the majority of apps, but you may need to tweak the result by adding new CSS rules to cover edge cases where the automated conversion did not work perfectly

## What has changed

Prior to this release, the primary way of customising a theme in ag-Grid was to define Sass variables, so if you wanted to change the header background colour you'd define the `$ag-header-background-color` variable.

We considered our DOM class attributes and CSS structure to be an implementation detail, not a public API. But several years of using Sass variables has taught us the limitations of this approach. There were never enough variables - every custom theme wants to make changes that we don't provide variables for, so needs to contain CSS rules as well as variable definitions. On the other hand, there were too many variables! Adding more variables was not the solution, because they are hard to discover - you need to check the documentation, rather than using the browser developer tools to find out a class name.

In v23 we have moved from configuring themes using global variables to using maps of parameters. Many parameters are direct equivalents of variables in v22, but this is not always the case:

* We provide parameters for complex use cases where changing the value of a parameter makes multiple changes across the grid.
* For simple use cases like changing the color of a single element, the recommended method is now to create a CSS selector e.g. `.ag-component-name { background-color: red }`. We have removed variables that do something that can be achieved with a simple CSS selector.
* We have added many new css classes and renamed existing ones for consistency, to improve the experience of styling the grid using CSS selectors.

The net effect is that custom themes will be simpler to write, and will break less between releases.

### Themes are now configured using parameter maps

We have moved from global variables to passing configuration to themes as a map of key/value parameters:

```scss
// old method:
$ag-header-foreground-color: red;
@import "path/to/ag-theme-xyz.scss";

// new method
@include ag-theme-xyz((
    header-foreground-color: red
));
```

The major advantage of this approach is that we are now able to warn when you pass a parameter that is not supported. It also allows our customers to use the [new module system](https://sass-lang.com/blog/the-module-system-is-launched) in Sass which does not support sharing global variables between modules.

### Renamed variables

These variables correspond to parameters with different names:

 * `$ag-primary-color` and `$ag-accent-color`. If extending a provided theme, use the theme-specific parameters to control key colours. Balham provides `balham-active-color`; Alpine provides `alpine-active-color`; and Material provides `material-primary-color` and `material-accent-color`. Or use specific parameters like `checkbox-checked-color` that control the colours of individual elements.
 * `$ag-alt-icon-color`. Use `checkbox-background-color` and `range-selection-border-color`.
 * `$ag-range-selected-color-1` (and `-2`, `-3`, `-4`). Set a semi-transparent colour to `range-selection-background-color` and the correct color when multiple ranges overlap is automatically calculated.
 * `$ag-virtual-item-height`. Use `$ag-list-item-height` instead.
 * `$ag-foreground-color-opacity`, `$ag-secondary-foreground-color-opacity`, `$ag-disabled-foreground-color-opacity`. Set a semi-transparent colour to `foreground-color`, `secondary-foreground-color`, or `disabled-foreground-color`.

### Variables removed with no equivalent parameter

The following variables have been removed. Instead of using a parameter, create a CSS rule to apply your desired effect. For example:

```scss
// old style
$ag-group-border-color: green;

// new style.

.ag-group {
    border-color: green;
}
```

// TODO mention ag-v22-to-v23-compatibility-mode ag-v22-to-v23-implement-deleted-variables()

Here is a full list of removed variables. Some have suggested replacements documented. For the other variables, use your browser's developer tools to find the appropriate class names for the element you need to target and adding new CSS rules.

 * `$ag-customise-inputs`, `$ag-input-bottom-border`, `$ag-input-bottom-border-disabled`, `$ag-input-border-width`, `$ag-input-height`, `$ag-focused-textbox-border-bottom`. Use the new %ag-text-input placeholder selector to style text inputs instead.
 * `$ag-customize-buttons`, `$ag-button-color`, `$ag-button-text-transform`, `$ag-button-background-color`: Use a CSS rule like `.ag-standard-button { ... }` instead.
 * All `$ag-dialog-*` variables: `$ag-dialog-background-color`, `$ag-dialog-border-color`, `$ag-dialog-border-size`, `$ag-dialog-border-style`, `$ag-dialog-title-background-color`, `$ag-dialog-title-font-family`, `$ag-dialog-title-font-size`, `$ag-dialog-title-font-weight`, `$ag-dialog-title-foreground-color`, `$ag-dialog-title-height`, `$ag-dialog-title-icon-size`, `$ag-dialog-title-padding`
 * `$ag-editor-background-color`
 * `$ag-filter-tool-panel-top-level-row-height` and `$ag-filter-tool-panel-sub-level-row-height`: se 
`.ag-filter-toolpanel-header` to style all headers, `.ag-filter-toolpanel-instance-header` for leaf level headers, and `.ag-filter-toolpanel-group-level-{X}-header` for a specific level of header, e.g. `.ag-filter-toolpanel-group-level-0-header` for the top level.
 * `$ag-font-weight`, `$ag-secondary-font-family`, `$ag-secondary-font-size`, `$ag-secondary-font-weight`
 * `$ag-foreground-opacity`
 * `$ag-group-background-color`
 * `$ag-group-border-color`
 * `$ag-group-border-color`
 * `$ag-group-title-background-color`
 * `$ag-group-toolbar-background-color`
 * `$ag-header-background-image`
 * `$ag-icon-color`: use a CSS rule like `.ag-icon { color: red; }`
 * `$ag-panel-background-color`
 * `$ag-rich-select-item-height`: note - this was removed because it caused issues if it was different to `list-item-height`, so use `list-item-height` instead.
 * `$ag-row-floating-background-color`
 * `$row-border-width`: use `.ag-row { border-width: 2px }`
 * `$ag-row-stub-background-color`
 * `$ag-scroll-spacer-border`
 * `$ag-tooltip-background-color`, `$ag-tooltip-border-color`, `$ag-tooltip-border-radius`, `$ag-tooltip-border-style`, `$ag-tooltip-border-width`, `$ag-tooltip-foreground-color`, `$ag-tooltip-padding`: use a CSS rule like `.ag-tooltip { padding: 10px; }`

## Renamed CSS classes

Throughout the grid, many css classes have been renamed to make them more consistent. For clarity and debuggability, we recommend that all themes update their css class name-based selectors to use the new names. However, in compatibility mode the old names are aliased to the new names.

// TODO mention ag-v22-to-v23-compatibility-mode ag-v22-to-v23-alias-renamed-classes()
```scss
@import ag-v22-to-v23-alias-renamed-classes();
```

This mixin uses Sass `@extend` rules to alias the old names to the new ones where possible.

Note: some of the css class name changes made in v23 are not simple renames, and so aren't covered by the mixin. This is especially true within the Filters Tool Panel. After using the mixin, test your theme and add/edit css rules as necessary.

The full list of renamed classes is as follows:

 * ag-alignment-end > ag-group-item-alignment-end
 * ag-alignment-start > ag-group-item-alignment-start
 * ag-alignment-stretch > ag-group-item-alignment-stretch
 * ag-button > ag-panel-title-bar-button
 * ag-cell-with-height > ag-cell-auto-height
 * ag-chart-tabbed-menu > ag-chart-menu-tabs
 * ag-child-circle > ag-angle-select-child-circle
 * ag-column-drag > ag-drag-handle
 * ag-column-select-panel > ag-column-select
 * ag-column-tool-panel-column > ag-column-select-column
 * ag-column-tool-panel-column-group > ag-column-select-column-group
 * ag-column-tool-panel-column-label > ag-column-select-column-label
 * ag-faded > ag-column-drop-empty
 * ag-fill > ag-spectrum-fill
 * ag-group-component > ag-group
 * ag-group-component-container > ag-group-container
 * ag-group-component-title > ag-group-title
 * ag-group-component-title-bar > ag-group-title-bar
 * ag-group-component-title-bar-icon > ag-group-title-bar-icon
 * ag-group-component-toolbar > ag-group-toolbar
 * ag-hue-alpha > ag-spectrum-tool
 * ag-name-value > ag-status-name-value
 * ag-nav-card-item > ag-chart-settings-card-item
 * ag-nav-card-selector > ag-chart-settings-card-selector
 * ag-paging-button > ag-paging-button-wrapper
 * ag-paging-button > ag-paging-button-wrapper
 * ag-parent-circle > ag-angle-select-parent-circle
 * ag-picker-button > ag-picker-field-button
 * ag-primary-cols-filter > ag-column-select-header-filter
 * ag-primary-cols-filter-wrapper > ag-column-select-header-filter-wrapper
 * ag-primary-cols-header-panel > ag-column-select-header
 * ag-primary-cols-list-panel > ag-column-select-list
 * ag-row-stub > ag-row-loading
 * ag-stub-cell > ag-loading
 * ag-tab-body > ag-tabs-body
 * ag-tab-header > ag-tabs-header
 * ag-title-bar > ag-panel-title-bar
 * ag-title-bar-buttons > ag-panel-title-bar-buttons
 * ag-title-bar-title > ag-panel-title-bar-title
 * ag-toolpanel-add-group-indent > ag-column-select-add-group-indent
 * ag-toolpanel-indent-1 > ag-column-select-indent-1
 * ag-toolpanel-indent-2 > ag-column-select-indent-2
 * ag-toolpanel-indent-3 > ag-column-select-indent-3
 * ag-toolpanel-indent-4 > ag-column-select-indent-4
 * ag-toolpanel-indent-5 > ag-column-select-indent-5
 * ag-width-half > ag-column-drop-horizontal-half-width

## Additional CSS classes

In v22 and earlier, components that appeared in multiple positions in the grid required nested CSS selectors to style. For example, to style groups in the chart settings tab subheadings, you'd need `.ag-chart-settings .ag-group-component-title-bar { ... }`. Now, generic components have multiple classes, one common to all instances and one that depends on the position in the grid. So you can use `.ag-charts-settings-group-title-bar { ... }` to style just the settings tab groups.

Nested selectors will continue to work, but new themes should use non-nested selectors, and existing themes may consider upgrading for clarity and performance.

### Deleted placeholder selectors

v22 defined some placeholder selectors that could be extended by 

%tab - use .ag-tab
%selected-tab - use .ag-tab-selected
%card - rounding and shadow of floating elements can be controlled by the card-radius or card-shadow parameters, or add CSS selectors to target specific elements.

// TODO mention ag-v22-to-v23-compatibility-mode and ag-v22-to-v23-alias-deleted-placeholders()