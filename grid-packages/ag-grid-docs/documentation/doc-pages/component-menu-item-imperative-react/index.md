---
title: "Menu Item Component - Imperative"
frameworks: ["react"]
---

<warning>
|This page describes the old imperative way of declaring custom menu item components when the grid option `reactiveCustomComponents` is not set. This behaviour is deprecated, and you should instead use the new behaviour described on the [Custom Menu Item](../component-menu-item) page.
</warning>

If you are not [Providing Custom Behaviour](/component-menu-item/#providing-custom-behaviour), then declaring custom menu item components imperatively is similar to with `reactiveCustomComponents` enabled. However the props will be slightly different (see [Custom Menu Item Parameters](/component-menu-item-imperative-react/#custom-menu-item-parameters)).

If providing custom behaviour, then the component setup will be different, and is demonstrated in the following example.

<grid-example title='Menu Item Without Defaults' name='menu-item-without-defaults' type='mixed' options='{ "enterprise": true, "modules": ["clientside", "menu", "excel", "clipboard", "range"] }'></grid-example>

## Custom Menu Item Interface

The interface for a custom menu item component is as follows:

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

<note>
|Note that you will need to expose the lifecycle/callback methods (for example, the `setActive` callback) with
|`forwardRef` and `useImperativeHandle`.
</note>

## Custom Menu Item Parameters

When a React component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell and row values available to you via `props` - the interface for what is provided is documented below.

If custom params are provided via the `menuItemDef.menuItemParams` property, these will be additionally added to the params object, overriding items of the same name if a name clash exists.

<interface-documentation interfaceName='IMenuItemParams' ></interface-documentation>
