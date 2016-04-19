// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { OldToolPanelDragAndDropService } from "../dragAndDrop/oldToolPanelDragAndDropService";
export declare class AgList {
    private eGui;
    private uniqueId;
    private modelChangedListeners;
    private itemSelectedListeners;
    private beforeDropListeners;
    private itemMovedListeners;
    private dragSources;
    private emptyMessage;
    private eFilterValueTemplate;
    private eListParent;
    private model;
    private cellRenderer;
    private readOnly;
    private dragAndDropService;
    constructor(dragAndDropService: OldToolPanelDragAndDropService);
    setReadOnly(readOnly: boolean): void;
    setEmptyMessage(emptyMessage: any): void;
    getUniqueId(): any;
    addStyles(styles: any): void;
    addCssClass(cssClass: any): void;
    addDragSource(dragSource: any): void;
    addModelChangedListener(listener: Function): void;
    addItemSelectedListener(listener: any): void;
    addItemMovedListener(listener: any): void;
    addBeforeDropListener(listener: any): void;
    private fireItemMoved(fromIndex, toIndex);
    private fireModelChanged();
    private fireItemSelected(item);
    private fireBeforeDrop(item);
    private setupComponents();
    setModel(model: any): void;
    getModel(): any;
    setCellRenderer(cellRenderer: any): void;
    refreshView(): void;
    private insertRows();
    private insertBlankMessage();
    private setupAsDropTarget();
    private externalAcceptDrag(dragEvent);
    private externalDrop(dragEvent);
    private externalNoDrop();
    private addItemToList(newItem);
    private addDragAndDropToListItem(eListItem, item);
    private internalAcceptDrag(targetColumn, dragItem, eListItem);
    private internalDrop(targetColumn, draggedColumn);
    private internalNoDrop(eListItem);
    private dragAfterThisItem(targetColumn, draggedColumn);
    private setDropCssClasses(eListItem, state);
    getGui(): any;
}
