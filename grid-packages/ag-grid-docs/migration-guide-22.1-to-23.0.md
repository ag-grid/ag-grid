In v23 we are releasing a major rewrite of our themes with the goal of making it easier to write custom themes. This document explains what we've changed, why we've made these changes, what you need to do.

## What you need to do

* If you are using the "Balham" or "Material" themes:
  * Test your theme, going through all the areas you have customised and making sure they all look correct.
  * If everything still looks correct you do not need to make any changes.
  * If anything does not work as expected, read this migration guide to establish what you need to change.
* If you have a large custom theme that extends any of our provided themes, but contains many CSS rules that extensively change the appearance so that it looks very different from the base theme, then consider updating your theme to extend ag-theme-base. This will provide the most stable long term base for your theme. See [this demo](https://github.com/ag-grid/ag-grid-customise-theme/tree/latest/src/vanilla-extending-base) for an example of a custom theme extending the base theme.
* If you are using one of the original grid themes: "fresh", "dark", "blue" or "bootstrap":
  * The advice is the same as for Balham and Material, except that these themes are now officially deprecated. We have no plans to remove them from our distribution because they are working fine for many of our users. HOWEVER if you continue to use them, you should be aware that we will not be testing and updating them with each release so some features may not look exactly right.
  * If you need to make changes to how one of these themes look, you can migrate to a custom theme on top of ag-theme-base. We have provided some examples of how to build fresh, dark, blue and bootstrap on top of the new base theme [in this repo](https://github.com/ag-grid/ag-grid-customise-theme/tree/latest/src/legacy/v22-provided-themes).

## Why we are changing the theme system

We frequently received feedback from our customers that their custom themes required updating too often, and would often break on upgrading to a new minor release. The root cause was that our base theme used a lot of complex and nested selectors. These are more likely to require updating between releases as a result of minor changes in DOM structure. Because of CSS specificity rules, any theme extending the base theme had to use the same complex and nested selectors to override unwanted styles set in the base theme - and while we could test and update our own themes between releases, our users found that their custom themes needed regular updating to adjust to DOM changes.

The changes described in this document all work together to fix this situation. We have rewritten the base theme so that most of its CSS selectors consist of a single class name. This has allowed us to rewrite our provided themes - Balahm, Material and Alpine - to simplify them in the same way. Any CSS selectors in your custom themes can be simplified too.

While re-writing our themes we took the opportunity to make some other "housekeeping" type improvements like [removing](#variables-removed-with-no-equivalent-parameter) unnecessary variables, [renaming](#renamed-css-classes) inconsistent class names, and moving to a [new method](#themes-are-now-configured-using-parameters) for configuring themes.

Upgrading your custom themes to v23 will take some work, but the result should be less breaking changes going forward. In addition, we have implemented a [backwards compatibility mode](#backwards-compatibility-mode) to help you with the transition.

## What we have changed

### Themes are now configured using parameters

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

Many parameters are direct equivalents of variables in v22, but this is not always the case.

### Renamed variables

These variables correspond to parameters with different names. Where possible, they will automatically be converted in backwards compatibility mode (both `$ag-compatibility-mode: "variables"` and `"legacy"`).

 * `$ag-primary-color` and `$ag-accent-color`. If extending a provided theme, use the theme-specific parameters to control key colours. Balham provides `balham-active-color`; Alpine provides `alpine-active-color`; and Material provides `material-primary-color` and `material-accent-color`. Or use specific parameters like `checkbox-checked-color` that control the colours of individual elements.
 * `$ag-alt-icon-color`. Renamed to `checkbox-background-color`.
 * `$ag-range-selected-color-1` (and `-2`, `-3`, `-4`). Set a semi-transparent colour to `range-selection-background-color` and the correct color when multiple ranges overlap is automatically calculated.
 * `$ag-virtual-item-height`. Renamed to `$ag-list-item-height`.
 * `$ag-foreground-color-opacity`, `$ag-secondary-foreground-color-opacity`, `$ag-disabled-foreground-color-opacity`. Set a semi-transparent colour to `foreground-color`, `secondary-foreground-color`, or `disabled-foreground-color`.

### Variables removed with no equivalent parameter

We have removed variables where it is trivial to achieve the same effect using a CSS selector. Instead of using a parameter, create a CSS rule to apply your desired effect. For example:

```scss
// old style
$ag-group-border-color: green;

// new style.

.ag-group {
    border-color: green;
}
```

In `$ag-compatibility-mode: "legacy"` these new rules will be created for you automatically. If you want to achieve this without the rest of legacy compatibility mode, you can disable compatibility mode add the line `@include ag-v22-to-v23-implement-deleted-variables();` to your custom theme.

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

### Renamed CSS classes

Throughout the grid, many css classes have been renamed to make them more consistent. For clarity and debuggability, we recommend that all themes update their css class name-based selectors to use the new names. In `$ag-compatibility-mode: "legacy"` these will be automatically aliased to the new names. If you want to achieve this aliasing without the rest of legacy compatibility mode, you can disable compatibility mode and add the line `@include ag-v22-to-v23-alias-renamed-classes();` to your custom theme.

Note: some of the css class name changes made in v23 are not simple renames, and so aren't covered by the mixin. This is especially true within the Filters Tool Panel. After using the mixin, test your theme and add/edit css rules as necessary.

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

### Additional CSS classes

In v22 and earlier, components that appeared in multiple positions in the grid required nested CSS selectors to style. For example, to style groups in the chart settings tab subheadings, you'd need `.ag-chart-settings .ag-group-component-title-bar { ... }`. Now, generic components have multiple classes, one common to all instances and one that depends on the position in the grid. So you can use `.ag-charts-settings-group-title-bar { ... }` to style just the settings tab groups.

Nested selectors will continue to work, but new themes should use non-nested selectors, and existing themes may consider upgrading for clarity, performance, and less breaking changes when upgrading to new releases.

### Deleted placeholder selectors

v22 defined some placeholder selectors that could be extended by custom themes. In `$ag-compatibility-mode: "legacy"` these will be automatically aliased to the new names. If you want to achieve this aliasing without the rest of legacy compatibility mode, you can disable compatibility mode and add the line `@include ag-v22-to-v23-alias-deleted-placeholders();` to your custom theme.

 * %tab - use .ag-tab
 * %selected-tab - use .ag-tab-selected
 * %card - rounding and shadow of floating elements can be controlled by the card-radius or card-shadow parameters, or add CSS selectors to target specific elements.

## Backwards compatibility mode

We have implemented a backwards compatibility mode to help you with the transition to v23.

### Configuring backwards compatibility mode

We have implemented a backwards compatibility mode that will enable some apps to continue working with minimal changes. If you are extending a provided theme importing the main theme file, e.g. `ag-theme-balham.scss`, you will automatically be opted in to "variables" backwards compatibility mode.

```scss
$ag-compatibility-mode: "variables"; // or "legacy"
// Set any legacy global variables before including the file. These will be
// picked up and used to generate theme parameters.
$ag-header-foreground-color: red;
@import "~ag-grid-community/src/styles/ag-theme-balham/sass/ag-theme-balham.scss";
```

There are two supported values, `"variables"` and `"legacy"`.

* variables mode: reads the global variables that were supported in v22 and converts them to the parameter maps used in v23, *only if there is an equivalent parameter for a variable* (most variables are supported). This mode:
  * is a reliable mechanism and is safe to use long-term (although you may wish to update your themes anyway, to get the benefits of the new configuration system like better validation)
  * does not support [variables removed with no equivalent parameter](#variables-removed-with-no-equivalent-parameter) - if you were using one of these variables, you will need to write new CSS selectors to achieve the same effect. Generally, the reason why we have removed some variables is that it is simple to write CSS to achieve the same effect.
  * does not modify your CSS selectors. If you are using any of the [renamed CSS classes](#renamed-CSS-classes) you will need to update your CSS selectors.
* legacy mode: attempts to make themes written for v22 and earlier work in v23. This mode:
  * is intended to be used as a temporary solution for graceful migration to v23 for apps with many or complex themes, allowing these apps to update to v23 immediately and then gradually migrate their themes at a later date
  * generates new CSS and uses Sass `@extend` directives to alias old names to new names
  * is a "best effort" solution - it will support the majority of use cases for the majority of apps, but you may need to tweak the result by adding new CSS rules to cover edge cases where the automated conversion did not work perfectly

### Advanced control of backwards compatibility mode

If the theme parameters generated by the backwards compatibility mode aren't right for you app, you can override them:

```scss
// define this variable before including the theme file
$ag-theme-override-params: (
  header-background-color: blue
);
@import "~ag-grid-community/src/styles/ag-theme-balham/sass/ag-theme-balham.scss";
```

Backwards- compatibility mode automatically renames old global variables, e.g. the variable `$ag-icon-color` used to be called `$icon-color`, and both names are supported. However, this process of renaming variables works but causes deprecation warnings in recent releases of Dart Sass. If you only use up-to-date v22 variable names (always prefixed with `$ag-`) then you can disable the renaming to remove the deprecation warnings:

```scss
// define this variable before including the theme file
$ag-suppress-legacy-var-import: true;
@import "~ag-grid-community/src/styles/ag-theme-balham/sass/ag-theme-balham.scss";
```