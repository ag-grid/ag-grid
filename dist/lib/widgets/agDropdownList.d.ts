// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { PopupService } from "./popupService";
import { OldToolPanelDragAndDropService } from "../dragAndDrop/oldToolPanelDragAndDropService";
export declare class AgDropdownList {
    private itemSelectedListeners;
    private eValue;
    private agList;
    private eGui;
    private hidePopupCallback;
    private selectedItem;
    private cellRenderer;
    private popupService;
    constructor(popupService: PopupService, dragAndDropService: OldToolPanelDragAndDropService);
    setWidth(width: any): void;
    addItemSelectedListener(listener: any): void;
    fireItemSelected(item: any): void;
    setupComponents(dragAndDropService: OldToolPanelDragAndDropService): void;
    itemSelected(item: any): void;
    onClick(): void;
    getGui(): any;
    setSelected(item: any): void;
    setCellRenderer(cellRenderer: any): void;
    refreshView(): void;
    setModel(model: any): void;
}
