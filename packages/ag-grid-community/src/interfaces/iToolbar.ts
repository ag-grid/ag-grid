import type { IComponent } from '../agStack/interfaces/iComponent';
import type { ToolbarItemComponentName } from '../context/context';
import type { IconName } from '../utils/icon';
import type { AgGridCommon } from './iCommon';

export type ToolbarDisplay = 'icon' | 'iconAndLabel';

export type Toolbar = {
    display?: ToolbarDisplay;
    alignment?: 'left' | 'right';
    items: (ToolbarItemDef | ToolbarItemShorthand)[];
};

/**
 * Shorthand string identifiers that can be used in `Toolbar.items` or `ToolbarItemDef.toolbarItem`.
 * Includes the provided toolbar item components, `'separator'`, and the built-in shorthand keys
 * (`'find'`, `'pivotPanel'`, `'quickFilter'`, `'rowGroupPanel'`).
 */
export type ToolbarItemShorthand =
    | ToolbarItemComponentName
    | 'separator'
    | 'find'
    | 'pivotPanel'
    | 'quickFilter'
    | 'rowGroupPanel'
    // Preserve the literal-union autocomplete while still allowing arbitrary registered component names
    // eslint-disable-next-line @typescript-eslint/ban-types
    | (string & {});

export interface ToolbarItemActionParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** The toolbar item `key` identifying which item triggered the action. */
    key: string;
}

export interface ToolbarItemDef<TData = any, TContext = any> {
    /**
     * Provide a custom component for the toolbar item.
     * If omitted, the grid renders a default button using `label`, `icon` and `action`.
     */
    toolbarItem?: any;
    alignment?: 'left' | 'right';
    display?: ToolbarDisplay;
    key?: string;
    /** Parameters to be passed to the custom component specified in `toolbarItem`. */
    toolbarItemParams?: any;
    /** Text used for the button tooltip and, when `display` is `'iconAndLabel'`, for the button label. */
    label?: string;
    /** Icon displayed on the default button. */
    icon?: IconName;
    /** Function invoked when the default button is clicked. */
    action?: (params: ToolbarItemActionParams<TData, TContext>) => void;
}

export interface IToolbarItemParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    key: string;
    display: ToolbarDisplay;
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
