import { Column, Component, ProvidedColumnGroup } from "@ag-grid-community/core";
export declare class ToolPanelContextMenu extends Component {
    private readonly column;
    private readonly mouseEvent;
    private readonly parentEl;
    private columns;
    private allowGrouping;
    private allowValues;
    private allowPivoting;
    private menuItemMap;
    private displayName;
    private readonly columnModel;
    private readonly popupService;
    private readonly focusService;
    constructor(column: Column | ProvidedColumnGroup, mouseEvent: MouseEvent, parentEl: HTMLElement);
    private postConstruct;
    private initializeProperties;
    private buildMenuItemMap;
    private addColumnsToList;
    private removeColumnsFromList;
    private displayContextMenu;
    private isActive;
    private getMappedMenuItems;
}
