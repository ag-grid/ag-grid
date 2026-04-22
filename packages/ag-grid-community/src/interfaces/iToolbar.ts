import type { IComponent } from '../agStack/interfaces/iComponent';
import type { ToolbarItemComponentName } from '../context/context';
import type { IconName } from '../utils/icon';
import type { AgGridCommon } from './iCommon';

export type Toolbar = {
    alignment?: 'left' | 'right';
    items: (ToolbarItemDef | ToolbarItemShorthand)[];
};

/**
 * Shorthand string identifiers that can be used in `Toolbar.items` or `ToolbarItemDef.toolbarItem`.
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

export interface ToolbarItemDef<TData = any, TContext = any, TParams = any, TCustom = any> {
    /**
     * Provide a custom component for the toolbar item.
     * If omitted, the grid renders a default button using `label`, `icon` and `action`.
     */
    toolbarItem?: ToolbarItemComponent<TCustom>;
    /** Parameters to be passed to the custom component specified in `toolbarItem`. */
    toolbarItemParams?: TParams;
    alignment?: 'left' | 'right';
    key?: string;
    /** Text used for the button tooltip and `aria-label`. */
    label?: string;
    /** Icon displayed on the default button. */
    icon?: IconName;
    /** Function invoked when the default button is clicked. */
    action?: (params: ToolbarItemActionParams<TData, TContext>) => void;
}

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
