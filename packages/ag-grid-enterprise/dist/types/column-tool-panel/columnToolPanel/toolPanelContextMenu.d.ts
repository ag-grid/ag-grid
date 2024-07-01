import type { AgColumn, AgProvidedColumnGroup, BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
export declare class ToolPanelContextMenu extends Component {
    private readonly column;
    private readonly mouseEvent;
    private readonly parentEl;
    private columnModel;
    private columnNameService;
    private funcColsService;
    private popupService;
    private focusService;
    wireBeans(beans: BeanCollection): void;
    private columns;
    private allowGrouping;
    private allowValues;
    private allowPivoting;
    private menuItemMap;
    private displayName;
    constructor(column: AgColumn | AgProvidedColumnGroup, mouseEvent: MouseEvent, parentEl: HTMLElement);
    postConstruct(): void;
    private initializeProperties;
    private buildMenuItemMap;
    private addColumnsToList;
    private removeColumnsFromList;
    private displayContextMenu;
    private isActive;
    private getMappedMenuItems;
}
