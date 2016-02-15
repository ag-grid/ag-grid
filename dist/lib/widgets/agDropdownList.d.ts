// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import PopupService from "./agPopupService";
import DragAndDropService from "../dragAndDrop/dragAndDropService";
export default class AgDropdownList {
    private itemSelectedListeners;
    private eValue;
    private agList;
    private eGui;
    private hidePopupCallback;
    private selectedItem;
    private cellRenderer;
    private popupService;
    constructor(popupService: PopupService, dragAndDropService: DragAndDropService);
    setWidth(width: any): void;
    addItemSelectedListener(listener: any): void;
    fireItemSelected(item: any): void;
    setupComponents(dragAndDropService: DragAndDropService): void;
    itemSelected(item: any): void;
    onClick(): void;
    getGui(): any;
    setSelected(item: any): void;
    setCellRenderer(cellRenderer: any): void;
    refreshView(): void;
    setModel(model: any): void;
}
