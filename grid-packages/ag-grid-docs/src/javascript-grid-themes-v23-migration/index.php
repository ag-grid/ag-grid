<?php
$pageTitle = "ag-Grid Provided Themes";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It stores the data in Row Models. Each piece of row data provided to the datgrid is wrapped in a Row Node. This section describes the Row Node and how you can use it in your applications.";
$pageKeywords = "ag-Grid data row model";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Migrating themes to ag-Grid 23.x</h1>

<p>With the release of ag-Grid version 23, we have undertaken a major rewrite of the Sass code behind our provided themes, with the goal of making it easier to write custom themes. This document explains what you need to do, why we've made these changes, and exactly what we've changed.</p>

<h2 id="what-you-need-to-do">What you need to do</h2>

<ul>
    <li>If you are using the &quot;Balham&quot; or &quot;Material&quot; themes:</li>
    <ul>
        <li>Test your theme to ensure that all the customisations you have made still look correct.</li>
        <li>If everything still looks correct you do not need to make any changes.</li>
        <li>If anything does not work as expected, read this migration guide to establish what you need to change.</li>
    </ul>
    <li>If you have a large custom theme that extends any of our provided themes, but contains many CSS rules that extensively change the appearance so that it looks very different from the base theme, then consider updating your theme to extend ag-theme-base. This will provide the most stable long term base for your theme. See <a href="https://github.com/ag-grid/ag-grid-customise-theme/tree/master/src/vanilla-extending-base">this demo</a> for an example of a custom theme extending the base theme.</li>
    <li>If you are using one of the original grid themes: &quot;fresh&quot;, &quot;dark&quot;, &quot;blue&quot; or &quot;bootstrap&quot;:</li>
    <ul>
        <li>The advice is the same as for Balham and Material, except that these themes are now officially deprecated. We have no plans to remove them from our distribution because they are working fine for many of our users. HOWEVER if you continue to use them, you should be aware that we will not be testing and updating them with each release so some features may not look exactly right.</li>
        <li>If you need to make changes to how one of these themes look, you can migrate to a custom theme on top of ag-theme-base. We have provided some examples of how to build fresh, dark, blue and bootstrap on top of the new base theme <a href="https://github.com/ag-grid/ag-grid-customise-theme/tree/master/src/legacy/v22-provided-themes">in this repo</a>.</li>
    </ul>
</ul>

<h2 id="why-we-are-changing-the-theme-system">Why we are changing the theme system</h2>

<p>We frequently received feedback from our customers that their custom themes required updating too often, and would often break on upgrading to a new minor release. The root cause was that our base theme used a lot of complex and nested selectors. These are more likely to require updating between releases as a result of minor changes in DOM structure. Because of CSS specificity rules, any theme extending the base theme had to use the same complex and nested selectors to override unwanted styles set in the base theme - and while we could test and update our own themes between releases, our users found that their custom themes needed regular updating to adjust to DOM changes.</p>

<p>The changes described in this document all work together to fix this situation. We have rewritten the base theme so that most of its CSS selectors consist of a single class name. This has allowed us to rewrite our provided themes - Balham, Material and Alpine - to simplify them in the same way. Any CSS selectors in your custom themes can be simplified too.</p>

<p>While re-writing our themes we took the opportunity to make some other &quot;housekeeping&quot; type improvements like <a href="#variables-removed-with-no-equivalent-parameter">removing</a> unnecessary variables, <a href="#renamed-css-classes">renaming</a> inconsistent class names, and moving to a <a href="#themes-are-now-configured-using-parameters">new method</a> for configuring themes.</p>

<p>Upgrading your custom themes to v23 will take some work, but the result should be less breaking changes going forward. In addition, we have implemented a <a href="#backwards-compatibility-mode">backwards compatibility mode</a> to help you with the transition.</p>

<h2 id="what-we-have-changed">What we have changed</h2>

<h3 id="themes-are-now-configured-using-parameters">1. Themes are now configured using parameters</h3>

<p>We have moved from global variables to passing configuration to themes as a map of key/value parameters:</p>

<snippet language="scss">
// old method:
$ag-header-foreground-color: red;
@import "path/to/ag-theme-xyz.scss";

// new method
@include ag-theme-xyz((
    header-foreground-color: red
));
</snippet>

<p>The major advantage of this approach is that we are now able to warn when you pass a parameter that is not supported. It also allows our customers to use the <a href="https://sass-lang.com/blog/the-module-system-is-launched">new module system</a> in Sass which does not support sharing global variables between modules.</p>

<p>Many parameters are direct equivalents of variables in v22, but this is not always the case.</p>

<h3 id="renamed-variables">2. Renamed variables</h3>

<p>These variables correspond to parameters with different names. Where possible, they will automatically be converted in backwards compatibility mode.</p>

<ul>
    <li><code>$ag-primary-color</code> and <code>$ag-accent-color</code>. If extending a provided theme, use the theme-specific parameters to control key colours.</li>
    <ul>
        <li>Balham provides <code>balham-active-color</code></li>
        <li>Alpine provides <code>alpine-active-color</code></li>
        <li>Material provides <code>material-primary-color</code> and <code>material-accent-color</code>.</li>
        <li>Or use specific parameters like <code>checkbox-checked-color</code> that control the colours of individual elements.</li>
    </ul>
    <li><code>$ag-alt-icon-color</code>. Renamed to <code>checkbox-background-color</code>.</li>
    <li><code>$ag-range-selected-color-1</code> (and <code>-2</code>, <code>-3</code>, <code>-4</code>). These used to set the color when multiople ranges overlap. They are no longer required, instead set a semi-transparent colour to <code>range-selection-background-color</code> and the correct color when multiple ranges overlap is automatically calculated.</li>
    <li><code>$ag-virtual-item-height</code>. Renamed to <code>$ag-list-item-height</code>.</li>
    <li><code>$ag-foreground-color-opacity</code>, <code>$ag-secondary-foreground-color-opacity</code>, <code>$ag-disabled-foreground-color-opacity</code>. Set a semi-transparent colour to <code>foreground-color</code>, <code>secondary-foreground-color</code>, or <code>disabled-foreground-color</code>.</li>
</ul>

<h3 id="variables-removed-with-no-equivalent-parameter">3. Variables removed with no equivalent parameter</h3>

<p>We have removed variables where it is trivial to achieve the same effect using a CSS selector. Instead of using a parameter, create a CSS rule to apply your desired effect. For example:</p>

<snippet language="scss">
// old style
$ag-group-component-border-color: green;

// new style.

.ag-group {
    border-color: green;
}
</snippet>

<p>In <code>$ag-compatibility-mode: &quot;legacy&quot;</code> these new rules will be created for you automatically. If you want to achieve this without the rest of legacy compatibility mode, you can disable compatibility mode add the line <code>@include ag-v22-to-v23-implement-deleted-variables();</code> to your custom theme.</p>

<p>Here is a full list of removed variables. Some have suggested replacements documented. For the other variables, use your browser's developer tools to find the appropriate class names for the element you need to target and adding new CSS rules.</p>

<ul>
    <li><code>$ag-customise-inputs</code>, <code>$ag-input-bottom-border</code>, <code>$ag-input-bottom-border-disabled</code>, <code>$ag-input-border-width</code>, <code>$ag-input-height</code>, <code>$ag-focused-textbox-border-bottom</code>. Use the new %ag-text-input placeholder selector to style text inputs instead.</li>
    <li><code>$ag-customize-buttons</code>, <code>$ag-button-color</code>, <code>$ag-button-text-transform</code>, <code>$ag-button-background-color</code>: Use a CSS rule like <code>.ag-standard-button { ... }</code> instead.</li>
    <li>All <code>$ag-dialog-*</code> variables: <code>$ag-dialog-background-color</code>, <code>$ag-dialog-border-color</code>, <code>$ag-dialog-border-size</code>, <code>$ag-dialog-border-style</code>, <code>$ag-dialog-title-background-color</code>, <code>$ag-dialog-title-font-family</code>, <code>$ag-dialog-title-font-size</code>, <code>$ag-dialog-title-font-weight</code>, <code>$ag-dialog-title-foreground-color</code>, <code>$ag-dialog-title-height</code>, <code>$ag-dialog-title-icon-size</code>, <code>$ag-dialog-title-padding</code></li>
    <li><code>$ag-editor-background-color</code></li>
    <li><code>$ag-filter-tool-panel-top-level-row-height</code> and <code>$ag-filter-tool-panel-sub-level-row-height</code>: se 
<code>.ag-filter-toolpanel-header</code> to style all headers, <code>.ag-filter-toolpanel-instance-header</code> for leaf level headers, and <code>.ag-filter-toolpanel-group-level-{X}-header</code> for a specific level of header, e.g. <code>.ag-filter-toolpanel-group-level-0-header</code> for the top level.</li>
    <li><code>$ag-font-weight</code>, <code>$ag-secondary-font-family</code>, <code>$ag-secondary-font-size</code>, <code>$ag-secondary-font-weight</code></li>
    <li><code>$ag-foreground-opacity</code></li>
    <li><code>$ag-group-component-background-color</code></li>
    <li><code>$ag-group-component-border-color</code></li>
    <li><code>$ag-group-component-border-color</code></li>
    <li><code>$ag-group-component-title-background-color</code></li>
    <li><code>$ag-group-component-toolbar-background-color</code></li>
    <li><code>$ag-header-background-image</code></li>
    <li><code>$ag-icon-color</code>: use a CSS rule like <code>.ag-icon { color: red; }</code></li>
    <li><code>$ag-panel-background-color</code></li>
    <li><code>$ag-rich-select-item-height</code>: note - this was removed because it caused issues if it was different to <code>list-item-height</code>, so use <code>list-item-height</code> instead.</li>
    <li><code>$ag-row-floating-background-color</code></li>
    <li><code>$row-border-width</code>: use <code>.ag-row { border-width: 2px }</code></li>
    <li><code>$ag-row-stub-background-color</code></li>
    <li><code>$ag-scroll-spacer-border</code></li>
    <li><code>$ag-tooltip-background-color</code>, <code>$ag-tooltip-border-color</code>, <code>$ag-tooltip-border-radius</code>, <code>$ag-tooltip-border-style</code>, <code>$ag-tooltip-border-width</code>, <code>$ag-tooltip-foreground-color</code>, <code>$ag-tooltip-padding</code>: use a CSS rule like <code>.ag-tooltip { padding: 10px; }</code></li>
</ul>

<h3 id="renamed-css-classes">4. Renamed CSS classes</h3>

<p>Throughout the grid, many css classes have been renamed to make them more consistent. For clarity and debuggability, we recommend that all themes update their css class name-based selectors to use the new names. In <code>$ag-compatibility-mode: &quot;legacy&quot;</code> these will be automatically aliased to the new names. If you want to achieve this aliasing without the rest of legacy compatibility mode, you can disable compatibility mode and add the line <code>@include ag-v22-to-v23-alias-renamed-classes();</code> to your custom theme.</p>

<p>Note: some of the css class name changes made in v23 are not simple renames, and so aren't covered by the mixin. This is especially true within the Filters Tool Panel. After using the mixin, test your theme and add/edit css rules as necessary.</p>

<ul>
    <li>ag-alignment-end &gt; ag-group-item-alignment-end</li>
    <li>ag-alignment-start &gt; ag-group-item-alignment-start</li>
    <li>ag-alignment-stretch &gt; ag-group-item-alignment-stretch</li>
    <li>ag-button &gt; ag-panel-title-bar-button</li>
    <li>ag-cell-with-height &gt; ag-cell-auto-height</li>
    <li>ag-chart-tabbed-menu &gt; ag-chart-menu-tabs</li>
    <li>ag-child-circle &gt; ag-angle-select-child-circle</li>
    <li>ag-column-drag &gt; ag-drag-handle</li>
    <li>ag-column-select-panel &gt; ag-column-select</li>
    <li>ag-column-tool-panel-column &gt; ag-column-select-column</li>
    <li>ag-column-tool-panel-column-group &gt; ag-column-select-column-group</li>
    <li>ag-column-tool-panel-column-label &gt; ag-column-select-column-label</li>
    <li>ag-faded &gt; ag-column-drop-empty</li>
    <li>ag-fill &gt; ag-spectrum-fill</li>
    <li>ag-group-component &gt; ag-group</li>
    <li>ag-group-component-container &gt; ag-group-container</li>
    <li>ag-group-component-title &gt; ag-group-title</li>
    <li>ag-group-component-title-bar &gt; ag-group-title-bar</li>
    <li>ag-group-component-title-bar-icon &gt; ag-group-title-bar-icon</li>
    <li>ag-group-component-toolbar &gt; ag-group-toolbar</li>
    <li>ag-hue-alpha &gt; ag-spectrum-tool</li>
    <li>ag-name-value &gt; ag-status-name-value</li>
    <li>ag-nav-card-item &gt; ag-chart-settings-card-item</li>
    <li>ag-nav-card-selector &gt; ag-chart-settings-card-selector</li>
    <li>ag-paging-button &gt; ag-paging-button-wrapper</li>
    <li>ag-paging-button &gt; ag-paging-button-wrapper</li>
    <li>ag-parent-circle &gt; ag-angle-select-parent-circle</li>
    <li>ag-picker-button &gt; ag-picker-field-button</li>
    <li>ag-primary-cols-filter &gt; ag-column-select-header-filter</li>
    <li>ag-primary-cols-filter-wrapper &gt; ag-column-select-header-filter-wrapper</li>
    <li>ag-primary-cols-header-panel &gt; ag-column-select-header</li>
    <li>ag-primary-cols-list-panel &gt; ag-column-select-list</li>
    <li>ag-row-stub &gt; ag-row-loading</li>
    <li>ag-stub-cell &gt; ag-loading</li>
    <li>ag-tab-body &gt; ag-tabs-body</li>
    <li>ag-tab-header &gt; ag-tabs-header</li>
    <li>ag-title-bar &gt; ag-panel-title-bar</li>
    <li>ag-title-bar-buttons &gt; ag-panel-title-bar-buttons</li>
    <li>ag-title-bar-title &gt; ag-panel-title-bar-title</li>
    <li>ag-toolpanel-add-group-indent &gt; ag-column-select-add-group-indent</li>
    <li>ag-toolpanel-indent-1 &gt; ag-column-select-indent-1</li>
    <li>ag-toolpanel-indent-2 &gt; ag-column-select-indent-2</li>
    <li>ag-toolpanel-indent-3 &gt; ag-column-select-indent-3</li>
    <li>ag-toolpanel-indent-4 &gt; ag-column-select-indent-4</li>
    <li>ag-toolpanel-indent-5 &gt; ag-column-select-indent-5</li>
    <li>ag-width-half &gt; ag-column-drop-horizontal-half-width</li>
</ul>

<h3 id="additional-css-classes">5. Additional CSS classes</h3>

<p>In v22 and earlier, components that appeared in multiple positions in the grid required nested CSS selectors to style. For example, to style groups in the chart settings tab subheadings, you'd need <code>.ag-chart-settings .ag-group-component-title-bar { ... }</code>. Now, generic components have multiple classes, one common to all instances and one that depends on the position in the grid. So you can use <code>.ag-charts-settings-group-title-bar { ... }</code> to style just the settings tab groups.</p>

<p>Nested selectors will continue to work, but new themes should use non-nested selectors, and existing themes may consider upgrading for clarity, performance, and less breaking changes when upgrading to new releases.</p>

<h3 id="deleted-placeholder-selectors">6. Deleted placeholder selectors</h3>

<p>v22 defined some placeholder selectors that could be extended by custom themes. In <code>$ag-compatibility-mode: &quot;legacy&quot;</code> these will be automatically aliased to the new names. If you want to achieve this aliasing without the rest of legacy compatibility mode, you can disable compatibility mode and add the line <code>@include ag-v22-to-v23-alias-deleted-placeholders();</code> to your custom theme.</p>

<ul>
    <li>%tab - use .ag-tab</li>
    <li>%selected-tab - use .ag-tab-selected</li>
    <li>%card - rounding and shadow of floating elements can be controlled by the card-radius or card-shadow parameters, or add CSS selectors to target specific elements.</li>
</ul>

<h2 id="backwards-compatibility-mode">Backwards compatibility mode</h2>

<p>We have implemented a backwards compatibility mode that will enable some apps to continue working with minimal changes. If you are extending a provided theme importing the main theme file, e.g. <code>ag-theme-balham.scss</code>, you will automatically be opted in to &quot;variables&quot; backwards compatibility mode.</p>

<snippet language="scss">
$ag-compatibility-mode: "variables"; // or "legacy"
// Set any legacy global variables before including the file. These will be
// picked up and used to generate theme parameters.
$ag-header-foreground-color: red;
@import "~ag-grid-community/src/styles/ag-theme-balham/sass/legacy/ag-theme-balham-v22-compat.scss";
</snippet>

<p>There are two supported values, <code>&quot;variables&quot;</code> and <code>&quot;legacy&quot;</code>.</p>

<ul>
    <li>variables mode: reads the global variables that were supported in v22 and converts them to the parameter maps used in v23, <em>only if there is an equivalent parameter for a variable</em> (most variables are supported). This mode:
<ul>
    <li>is a reliable mechanism and is safe to use long-term (although you may wish to update your themes anyway, to get the benefits of the new configuration system like better validation)</li>
    <li>does not support <a href="#variables-removed-with-no-equivalent-parameter">variables removed with no equivalent parameter</a> - if you were using one of these variables, you will need to write new CSS selectors to achieve the same effect. Generally, the reason why we have removed some variables is that it is simple to write CSS to achieve the same effect.</li>
    <li>does not modify your CSS selectors. If you are using any of the <a href="#renamed-CSS-classes">renamed CSS classes</a> you will need to update your CSS selectors.</li>
</ul>
</li>
    <li>legacy mode: attempts to make themes written for v22 and earlier work in v23. This mode:
<ul>
    <li>is intended to be used as a temporary solution for graceful migration to v23 for apps with many or complex themes, allowing these apps to update to v23 immediately and then gradually migrate their themes at a later date</li>
    <li>generates new CSS and uses Sass <code>@extend</code> directives to alias old names to new names</li>
    <li>is a &quot;best effort&quot; solution - it will support the majority of use cases for the majority of apps, but you may need to tweak the result by adding new CSS rules to cover edge cases where the automated conversion did not work perfectly</li>
</ul>
</li>
</ul>

<h3 id="advanced-control-of-backwards-compatibility-mode">Advanced control of backwards compatibility mode</h3>

<p>If the theme parameters generated by the backwards compatibility mode aren't right for you app, you can override them:</p>

<snippet language="scss">
// define this variable before including the theme file
$ag-theme-override-params: (
  header-background-color: blue
);
@import "~ag-grid-community/src/styles/ag-theme-balham/sass/legacy/ag-theme-balham-v22-compat.scss";
</snippet>

<p>Backwards- compatibility mode automatically renames old global variables, e.g. the variable <code>$ag-icon-color</code> used to be called <code>$icon-color</code>, and both names are supported. However, this process of renaming variables works but causes deprecation warnings in recent releases of Dart Sass. If you only use up-to-date v22 variable names (always prefixed with <code>$ag-</code>) then you can disable the renaming to remove the deprecation warnings:</p>

<snippet language="scss">
// define this variable before including the theme file
$ag-suppress-legacy-var-import: true;
@import "~ag-grid-community/src/styles/ag-theme-balham/sass/legacy/ag-theme-balham-v22-compat.scss";
</snippet>

<?php include '../documentation-main/documentation_footer.php';?>
