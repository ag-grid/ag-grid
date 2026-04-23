import type { IComponent } from '../agStack/interfaces/iComponent';
import type { ToolbarItemComponentName } from '../context/context';
import type { IconName } from '../utils/icon';
import type { AgGridCommon } from './iCommon';

export type Toolbar = {
    alignment?: 'left' | 'right';
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
    // eslint-disable-next-line @typescript-eslint/ban-types
    | (string & {});

/**
 * A component reference for a toolbar item. Either a shorthand string identifier,
 * a component class (AG Grid / Angular / React class component), or a component
 * function (React functional component).
 */
export type ToolbarItemComponent<T> = ToolbarItemShorthand | T;

export interface ToolbarItemActionParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** The toolbar item `key` identifying which item triggered the action. */
    key: string;
}

/** Properties common to every toolbar item definition variant. */
interface ToolbarItemDefBase {
    /** Unique identifier for the item. Auto-generated if omitted. */
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

/**
 * Reference to a built-in toolbar item component (or `'separator'`).
 */
export interface ToolbarBuiltInItemDef extends ToolbarItemDefBase {
    /** A built-in toolbar item component name, or `'separator'`. */
    toolbarItem: ToolbarItemComponentName | 'separator';
    /** Built-in items do not accept params. */
    toolbarItemParams?: never;
    /** Not used for built-in items — use the Action Button variant for label/icon/action. */
    label?: never;
    /** Not used for built-in items — use the Action Button variant for label/icon/action. */
    icon?: never;
    /** Not used for built-in items — use the Action Button variant for label/icon/action. */
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
 * A toolbar item definition. One of three variants:
 * - {@link ToolbarButtonItemDef} — action button shorthand (`label`/`icon`/`action`)
 * - {@link ToolbarBuiltInItemDef} — reference to a built-in component or `'separator'`
 * - {@link ToolbarCustomItemDef} — reference to a custom component
 */
export type ToolbarItemDef<TData = any, TContext = any, TParams = any, TCustom = any> =
    | ToolbarButtonItemDef<TData, TContext>
    | ToolbarBuiltInItemDef
    | ToolbarCustomItemDef<TParams, TCustom>;

export interface IToolbarItemParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    key: string;
}

export interface IToolbarItem<TData = any, TContext = any> {
    /**
     * Called when the `toolbar` grid option is updated.
     * If this method returns `true`,
     * the grid assumes that the toolbar item has updated with the latest params,
     * and takes no further action.
     * If this method returns `false`, or is not implemented,
     * the grid will destroy and recreate the toolbar item.
     */
    refresh?(params: IToolbarItemParams<TData, TContext>): boolean;
}

export interface IToolbarItemComp<TData = any, TContext = any>
    extends IToolbarItem<TData, TContext>,
        IComponent<IToolbarItemParams<TData, TContext>> {}
