import type { IMenuItem, IMenuItemParams } from 'ag-grid-community';
import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomMenuItemCallbacks, CustomMenuItemProps } from './interfaces';
export declare class MenuItemComponentWrapper extends CustomComponentWrapper<IMenuItemParams, CustomMenuItemProps, CustomMenuItemCallbacks> implements IMenuItem {
    private active;
    private expanded;
    private readonly onActiveChange;
    setActive(active: boolean): void;
    setExpanded(expanded: boolean): void;
    protected getOptionalMethods(): string[];
    private awaitSetActive;
    private updateActive;
    protected getProps(): CustomMenuItemProps;
}
