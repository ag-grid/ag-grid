import type { IComponent } from 'ag-stack';

import type { ToolbarItemComponentName } from '../context/context';
import type { IconName } from '../utils/icon';
import type { AgGridCommon } from './iCommon';
import type { DefaultMenuItem, MenuItemDef } from './menuItem';

/**
 * Configure the [Quick Access Toolbar](https://ag-grid.com/javascript-data-grid/toolbar/)
 */
export type Toolbar = {
    /** Default alignment for items in the toolbar. Defaults to `'left'`. Item-level `alignment` takes precedence. */
    alignment?: 'left' | 'right';
    /** Items to render in the toolbar. Each entry is either a shorthand string identifier or a full item definition object. */
    items: (ToolbarItemDef | ToolbarItemShorthand)[];
};

/**
 * Shorthand string identifiers that can be used in `Toolbar.items` or on a toolbar item's `toolbarItem`.
 * Includes the provided toolbar item components and `'separator'`.
 */
export type ToolbarItemShorthand =
    | ToolbarItemComponentName
    | 'separator'
    // Preserve the literal-union autocomplete while still allowing arbitrary registered component names
    | (string & {});

/**
 * A component reference for a toolbar item. Either a shorthand string identifier,
 * a component class (AG Grid / Angular / React class component), or a component
 * function (React functional component).
 */
export type ToolbarItemComponent<T> = ToolbarItemShorthand | T;

/** Params passed to a toolbar item's `action` callback when the item is activated. */
export interface ToolbarItemActionParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** The toolbar item `key` identifying which item triggered the action. */
    key: string;
}

/** Properties common to every toolbar item definition variant. */
interface ToolbarItemDefBase {
    /**
     * Unique identifier used to look up this item via `api.getToolbarItemInstance(key)`.
     * Optional — items without a key still render. Set a key only on items you want to
     * access via the API.
     */
    key?: string;
    /** Alignment within the toolbar. Falls back to the toolbar-level `alignment`. */
    alignment?: 'left' | 'right';
}

/**
 * Action Button shorthand — renders a default button using `label`, `icon` and `action`,
 * without requiring a component reference. Provide at least one of `label`, `icon` or `action`.
 */
export interface ToolbarButtonItemDef<TData = any, TContext = any> extends ToolbarItemDefBase {
    /** Visible text rendered next to the icon. Omit to render an icon-only button. */
    label?: string;
    /** Hover tooltip and `aria-label`. Falls back to `label` when omitted. */
    tooltip?: string;
    /** Icon displayed on the default button. */
    icon?: IconName;
    /** Function invoked when the default button is clicked. */
    action?: (params: ToolbarItemActionParams<TData, TContext>) => void;
    /** Not used for action buttons — set `toolbarItem` to use a built-in or custom component instead. */
    toolbarItem?: never;
    /** Not used for action buttons — set `toolbarItem` to use a built-in or custom component instead. */
    toolbarItemParams?: never;
}

/** Params accepted by the `agMenuToolbarItem` built-in toolbar item. */
export interface ToolbarMenuItemParams<TData = any, TContext = any> {
    /** Items shown in the dropdown. Accepts `MenuItemDef` objects or built-in string names (e.g. `'copy'`, `'export'`, `'separator'`). */
    menuItems?: (MenuItemDef<TData, TContext> | DefaultMenuItem)[];
}

/**
 * Reference to a built-in toolbar item component (or `'separator'`) that does not accept params.
 */
export interface ToolbarBuiltInItemDef extends ToolbarItemDefBase {
    /** A built-in toolbar item component name, or `'separator'`. */
    toolbarItem: Exclude<ToolbarItemComponentName, 'agMenuToolbarItem'> | 'separator';
    /** Built-in items (other than `agMenuToolbarItem`) do not accept params. */
    toolbarItemParams?: never;
    /** Not used for built-in items — use the Action Button variant for label/icon/action. */
    label?: never;
    /** Not used for built-in items — use the Action Button variant for label/icon/action. */
    icon?: never;
    /** Not used for built-in items — use the Action Button variant for label/icon/action. */
    action?: never;
}

/**
 * Reference to the `agMenuToolbarItem` built-in toolbar item — a button that opens a dropdown
 * menu. Configure `label`, `icon`, and `tooltip` at the top level; `toolbarItemParams` carries
 * the menu contents.
 */
export interface ToolbarMenuBuiltInItemDef<TData = any, TContext = any> extends ToolbarItemDefBase {
    /** The `agMenuToolbarItem` built-in component. */
    toolbarItem: 'agMenuToolbarItem';
    /** Configuration for the menu button (menu items). */
    toolbarItemParams?: ToolbarMenuItemParams<TData, TContext>;
    /** Visible text rendered next to the icon. Omit to render an icon-only button. */
    label?: string;
    /** Hover tooltip and `aria-label`. Falls back to `label`, then to the locale "Menu" text. */
    tooltip?: string;
    /** Icon displayed on the button. Defaults to the `menu` icon. */
    icon?: IconName;
    /** Not used for menu items. */
    action?: never;
}

/**
 * Reference to a user-provided custom toolbar item component.
 * `toolbarItem` is a component class/function, or the name of a registered custom component.
 */
export interface ToolbarCustomItemDef<TParams = any, TCustom = any> extends ToolbarItemDefBase {
    /** Custom component reference, or the name of a registered custom component. */
    toolbarItem: TCustom;
    /** Parameters forwarded to the custom component. */
    toolbarItemParams?: TParams;
    /** Not used for custom items — use the Action Button variant for label/icon/action. */
    label?: never;
    /** Not used for custom items — use the Action Button variant for label/icon/action. */
    icon?: never;
    /** Not used for custom items — use the Action Button variant for label/icon/action. */
    action?: never;
}

/**
 * A toolbar item definition. One of the following variants:
 * - {@link ToolbarButtonItemDef} — action button shorthand (`label`/`icon`/`action`)
 * - {@link ToolbarBuiltInItemDef} — reference to a built-in component or `'separator'`
 * - {@link ToolbarMenuBuiltInItemDef} — reference to the `agMenuToolbarItem` dropdown menu button
 * - {@link ToolbarCustomItemDef} — reference to a custom component
 */
export type ToolbarItemDef<TData = any, TContext = any, TParams = any, TCustom = any> =
    | ToolbarButtonItemDef<TData, TContext>
    | ToolbarBuiltInItemDef
    | ToolbarMenuBuiltInItemDef<TData, TContext>
    | ToolbarCustomItemDef<TParams, TCustom>;

/**
 * Params delivered to a toolbar item component. Mirrors the runtime shape produced by the
 * grid: a flat object containing the item-definition fields the grid forwards, merged with
 * `AgGridCommon`. The `toolbarItem` reference itself is intentionally not forwarded — the
 * component already knows what it is.
 */
export interface IToolbarItemParams<TData = any, TContext = any, TParams = any> extends AgGridCommon<TData, TContext> {
    /**
     * Identifier for the item. Mirrors the `key` set on the item definition, or an
     * auto-generated key when none was provided. Used internally; only items with an
     * explicit key on the definition are reachable via `api.getToolbarItemInstance(key)`.
     */
    key: string;
    /** Explicit alignment, when set on the item definition. */
    alignment?: 'left' | 'right';
    /** Custom params forwarded from the item definition's `toolbarItemParams`. */
    toolbarItemParams?: TParams;
    /** Label, when set on the item definition (action-button shorthand or `agMenuToolbarItem`). */
    label?: string;
    /** Tooltip / aria-label, when set on the item definition. */
    tooltip?: string;
    /** Icon name, when set on the item definition. */
    icon?: IconName;
    /** Action callback, when using the action-button shorthand. */
    action?: (params: ToolbarItemActionParams<TData, TContext>) => void;
}

/**
 * Interface that custom toolbar item components may implement to receive lifecycle callbacks from the grid.
 * Implement `refresh` to update in-place when the `toolbar` option changes, avoiding a full destroy/recreate cycle.
 */
export interface IToolbarItem<TData = any, TContext = any> {
    /**
     * Called when the `toolbar` grid option updates.
     * Return `true` if the component updates itself with the new params.
     * Return `false` (or omit) to have the grid destroy and recreate the component.
     */
    refresh?(params: IToolbarItemParams<TData, TContext>): boolean;
}

/**
 * Full interface for toolbar item components: combines `IToolbarItem` (optional `refresh` callback)
 * with the standard AG Grid component lifecycle (`IComponent`).
 * Custom toolbar components that are class-based should implement this interface.
 */
export interface IToolbarItemComp<TData = any, TContext = any>
    extends IToolbarItem<TData, TContext>, IComponent<IToolbarItemParams<TData, TContext>> {}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IToolbarService {
    setToolbar(toolbar: IToolbarComp): void;
    clearToolbar(toolbar: IToolbarComp): void;
    getToolbarItemInstance<T = IToolbarItem>(key: string): T | undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IToolbarComp {
    getToolbarItemInstance<T = IToolbarItem>(key: string): T | undefined;
}
