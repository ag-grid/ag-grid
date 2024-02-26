---
title: "Menu Item Component"
enterprise: true
---

Menu Item Components allow you to customise the menu items shown in the [Column Menu](/column-menu/) and [Context Menu](/context-menu/). Use these when the provided menu items do not meet your requirements.

The following example demonstrates a custom menu item component in both the column menu and context menu.

<grid-example title='Custom Menu Item Component' name='custom-menu-item' type='mixed' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel", "clipboard", "range"] }'></grid-example>

<framework-specific-section frameworks="javascript,angular,vue">
|Implement this interface to provide a custom menu item.
</framework-specific-section>
<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|interface extends IMenuItemAngularComp {
|    // mandatory methods
|
|    // The agInit(params) method is called on the menu item once.
|    agInit(params: IMenuItemParams);
|
|    // optional methods
|
|    // Configure the default grid behaviour for this item, including styling,
|    // and mouse and keyboard interactions.
|    // Return `true` to use all default behaviour, `false` to use no default behaviour
|    // (equivalent to `configureDefaults` not being defined),
|    // or `IMenuConfigParams` to choose what default behaviour to use.
|    configureDefaults(): boolean | IMenuConfigParams;
|
|    // Called when the item is activated/deactivated, either via mouseover or keyboard navigation.
|    setActive(active: boolean): void;
|
|    // If the item has a sub menu, called when the sub menu is opened/closed.
|    setExpanded(expanded: boolean): void;
|
|    // Called when the item is selected, e.g. clicked or Enter is pressed.
|    select(): void;
|}
</snippet>
</framework-specific-section>
<framework-specific-section frameworks="javascript">
<snippet transform={false} language="ts">
|interface IMenuItemComp {
|    // mandatory methods
|
|    // Returns the DOM element for this menu item
|    getGui(): HTMLElement;
|
|    // optional methods
|
|    // The init(params) method is called on the menu item once. See below for details on the parameters.
|    init(params: IMenuItemParams): void;
|
|    // Configure the default grid behaviour for this item, including styling,
|    // and mouse and keyboard interactions.
|    // Return `true` to use all default behaviour, `false` to use no default behaviour
|    // (equivalent to `configureDefaults` not being defined),
|    // or `IMenuConfigParams` to choose what default behaviour to use.
|    configureDefaults(): boolean | IMenuConfigParams;
|
|    // Called when the item is activated/deactivated, either via mouseover or keyboard navigation.
|    setActive(active: boolean): void;
|
|    // If the item has a sub menu, called when the sub menu is opened/closed.
|    setExpanded(expanded: boolean): void;
|
|    // Called when the item is selected, e.g. clicked or Enter is pressed.
|    select(): void;
|}
</snippet>
</framework-specific-section>
<framework-specific-section frameworks="vue">
<snippet transform={false} language="ts">
|interface IMenuItem {
|    // optional methods
|
|    // Configure the default grid behaviour for this item, including styling,
|    // and mouse and keyboard interactions.
|    // Return `true` to use all default behaviour, `false` to use no default behaviour
|    // (equivalent to `configureDefaults` not being defined),
|    // or `IMenuConfigParams` to choose what default behaviour to use.
|    configureDefaults(): boolean | IMenuConfigParams;
|
|    // Called when the item is activated/deactivated, either via mouseover or keyboard navigation.
|    setActive(active: boolean): void;
|
|    // If the item has a sub menu, called when the sub menu is opened/closed.
|    setExpanded(expanded: boolean): void;
|
|    // Called when the item is selected, e.g. clicked or Enter is pressed.
|    select(): void;
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
|To configure custom menu items, first enable the grid option `reactiveCustomComponents`.
</framework-specific-section>
<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default ({ name, icon, shortcut, subMenu }) => {
|    useGridMenuItem(() => {
|        configureDefaults: () => true;
|    });
|    return (
|        &lt;div>
|            &lt;span className="ag-menu-option-part ag-menu-option-icon">{icon}&lt;/span>
|            &lt;span className="ag-menu-option-part ag-menu-option-text">{name}&lt;/span>
|            &lt;span className="ag-menu-option-part ag-menu-option-shortcut">{shortcut}&lt;/span>
|            &lt;span className="ag-menu-option-part ag-menu-option-popup-pointer">{subMenu ? '>': ''}&lt;/span>
|        &lt;/div>
|    );
|};
</snippet>
</framework-specific-section>
<framework-specific-section frameworks="react">
<note>Enabling `reactiveCustomComponents` affects all custom components. If you have custom components built in an imperative way instead of setting the `reactiveCustomComponents` option, they may need to be rebuilt to take advantage of the new features that `reactiveCustomComponents` offers. Using custom components built in an imperative way is now deprecated, and in AG Grid v32 the `reactiveCustomComponents` option will be `true` by default. See [Migrating to Use reactiveCustomComponents](../upgrading-to-ag-grid-31-1/#migrating-to-use-reactivecustomcomponents). For the legacy imperative documentation, see [Imperative Menu Item Component](../component-menu-item-imperative-react/).</note>
</framework-specific-section>

<framework-specific-section frameworks="javascript,angular,vue">
|To enable the default menu item behaviour, implement the `configureDefaults` method and return `true` (see [Providing Custom Behaviour](/component-menu-item/#providing-custom-behaviour)).
</framework-specific-section>
<framework-specific-section frameworks="react">
|To enable the default menu item behaviour, pass the callback `configureDefaults` to the `useGridMenuItem` hook and return `true` (see [Providing Custom Behaviour](/component-menu-item/#providing-custom-behaviour)).
</framework-specific-section>

<framework-specific-section frameworks="angular">
|The `agInit(params)` method takes a params object with the items listed below:
</framework-specific-section>
<framework-specific-section frameworks="javascript">
|The interface for the menu item parameters is as follows:
</framework-specific-section>
<framework-specific-section frameworks="vue">
|When a menu item is instantiated, the following will be made available on `this.params`:
</framework-specific-section>
<framework-specific-section frameworks="javascript,angular,vue">
<interface-documentation interfaceName='IMenuItemParams'></interface-documentation>
</framework-specific-section>

<framework-specific-section frameworks="react">
<h2 id="custom-menu-item-parameters">Custom Menu Item Parameters</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
|### Menu Item Props
|
|The following props are passed to the custom menu item components (`CustomMenuItemProps` interface).
</framework-specific-section>

<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomMenuItemProps' config='{ "description": "" }'></interface-documentation>
</framework-specific-section>

<framework-specific-section frameworks="react">
|### Menu Item Callbacks
|
|The following callbacks can be passed to the `useGridMenuItem` hook (`CustomMenuItemCallbacks` interface). All the callbacks are optional, and the hook only needs to be used if callbacks are provided.
</framework-specific-section>

<framework-specific-section frameworks="react">
<interface-documentation interfaceName='CustomMenuItemCallbacks' config='{ "description": "" }'></interface-documentation>
</framework-specific-section>

## Default Styling

In order for the menu to size dynamically, the default styling is provided via `display: table`. This means that if custom menu item components are used alongside grid-provided menu items, then they must adhere to a certain structure, or the grid styles must be overridden.

The default structure consists of a parent element with `display: table-row`, and four children with `display: table-cell`. This can be seen in the example above. If using `configureDefaults` and not suppressing root styling, the grid will automatically add the correct styling to the parent element.

This format can be overridden by [Styling the Menu](/global-style-customisation-popups/), notably `ag-menu-list`, `ag-menu-option`, `ag-menu-option-part`, `ag-menu-separator` and `ag-menu-separator-part`. This is demonstrated in the [Providing Custom Behaviour](/component-menu-item/#providing-custom-behaviour) example below.

## Providing Custom Behaviour

As described above, the easiest way to configure the behaviour of a custom menu item is returning `true` from `configureDefaults`.

If this is not done, then the custom menu item will need to implement all of the required behaviour itself.

It is also possible to disable certain parts of the behaviour by returning an object of type `IMenuConfigParams` from `configureDefaults`:

<interface-documentation interfaceName='IMenuConfigParams' config='{ "description": "" }'></interface-documentation>

The following example demonstrates providing custom behaviour (in the column menu only) by including a filter as a menu item. To allow for a full-width custom menu item alongside grid-provided ones, the default menu styling is overridden (see [Default Styling](/component-menu-item/#default-styling)).

<grid-example title='Menu Item Component Without Defaults' name='menu-item-without-defaults' type='mixed' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel", "clipboard", "range"] }'></grid-example>

Note this shows a column filter in the custom menu item as an example for how complex items can be added. It is not meant to be used as a complete solution.
