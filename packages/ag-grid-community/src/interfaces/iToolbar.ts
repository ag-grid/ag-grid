import type { IComponent } from '../agStack/interfaces/iComponent';
import type { AgGridCommon } from './iCommon';

export type ToolbarDisplay = 'icon' | 'iconAndLabel';

export type Toolbar = {
    display?: ToolbarDisplay;
    items: (ToolbarItemDef | string)[];
};

export interface ToolbarItemDef {
    component?: any;
    alignment?: 'left' | 'right';
    display?: ToolbarDisplay;
    key?: string;
    toolbarItemParams?: any;
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
