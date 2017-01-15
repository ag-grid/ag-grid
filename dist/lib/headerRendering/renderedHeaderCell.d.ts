// Type definitions for ag-grid v7.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "../entities/column";
import { IRenderedHeaderElement } from "./iRenderedHeaderElement";
import { DropTarget } from "../dragAndDrop/dragAndDropService";
export declare class RenderedHeaderCell implements IRenderedHeaderElement {
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
    private eHeaderCell;
    private eRoot;
    private column;
    private childScope;
    private startWidth;
    private dragSourceDropTarget;
    private displayName;
    private destroyFunctions;
    private pinned;
    constructor(column: Column, eRoot: HTMLElement, dragSourceDropTarget: DropTarget, pinned: string);
    getColumn(): Column;
    init(): void;
    private setupTooltip();
    private setupText();
    private setupFilterIcon();
    private setupWidth();
    getGui(): HTMLElement;
    destroy(): void;
    private createScope();
    private addAttributes();
    private setupMenu();
    showMenu(eventSource: HTMLElement): void;
    private setupMovingCss();
    private setupMove(eHeaderCellLabel);
    private setupTap();
    private setupResize();
    private useRenderer(headerNameValue, headerCellRenderer, eText);
    setupSort(eHeaderCellLabel: HTMLElement): void;
    onDragStart(): void;
    private normaliseDragChange(dragChange);
    onDragging(dragChange: number, finished: boolean): void;
    onIndividualColumnResized(column: Column): void;
}
