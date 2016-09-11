// Type definitions for ag-grid v5.4.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
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
    constructor(column: Column, eRoot: HTMLElement, dragSourceDropTarget: DropTarget);
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
    private setupResize();
    private useRenderer(headerNameValue, headerCellRenderer, eText);
    setupSort(eHeaderCellLabel: HTMLElement): void;
    onDragStart(): void;
    onDragging(dragChange: number, finished: boolean): void;
    onIndividualColumnResized(column: Column): void;
}
