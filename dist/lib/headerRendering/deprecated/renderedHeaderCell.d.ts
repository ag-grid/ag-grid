// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "../../entities/column";
import { DropTarget } from "../../dragAndDrop/dragAndDropService";
import { Component } from "../../widgets/component";
export declare class RenderedHeaderCell extends Component {
    private context;
    private filterManager;
    private columnController;
    private $compile;
    private gridCore;
    private headerTemplateLoader;
    private horizontalDragService;
    private menuFactory;
    private gridOptionsWrapper;
    private dragAndDropService;
    private sortController;
    private $scope;
    private eRoot;
    private column;
    private childScope;
    private startWidth;
    private dragSourceDropTarget;
    private displayName;
    private eFilterIcon;
    private eSortAsc;
    private eSortDesc;
    private eSortNone;
    private pinned;
    constructor(column: Column, eRoot: HTMLElement, dragSourceDropTarget: DropTarget, pinned: string);
    getColumn(): Column;
    init(): void;
    private setupTooltip();
    private setupText();
    private setupFilterIcon();
    private onFilterChanged();
    private setupWidth();
    private onColumnWidthChanged();
    private createScope();
    private addAttributes();
    private setupMenu();
    showMenu(eventSource: HTMLElement): void;
    private setupMovingCss();
    private onColumnMovingChanged();
    private setupMove(eHeaderCellLabel);
    private setupTap();
    private setupResize();
    private useRenderer(headerNameValue, headerCellRenderer, eText);
    setupSort(eHeaderCellLabel: HTMLElement): void;
    private onSortChanged();
    onDragStart(): void;
    private normaliseDragChange(dragChange);
    onDragging(dragChange: number, finished: boolean): void;
}
