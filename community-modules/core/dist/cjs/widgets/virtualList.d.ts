// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from './component';
import { ManagedFocusComponent } from './managedFocusComponent';
export interface VirtualListModel {
    getRowCount(): number;
    getRow(index: number): any;
    isRowSelected?(index: number): boolean | undefined;
}
export declare class VirtualList extends ManagedFocusComponent {
    private readonly cssIdentifier;
    private readonly ariaRole;
    private model;
    private renderedRows;
    private componentCreator;
    private rowHeight;
    private lastFocusedRowIndex;
    private isDestroyed;
    private readonly resizeObserverService;
    private readonly eContainer;
    constructor(cssIdentifier?: string, ariaRole?: string);
    protected postConstruct(): void;
    private addResizeObserver;
    protected focusInnerElement(fromBottom: boolean): void;
    protected onFocusIn(e: FocusEvent): void;
    protected onFocusOut(e: FocusEvent): void;
    protected handleKeyDown(e: KeyboardEvent): void;
    protected onTabKeyDown(e: KeyboardEvent): void;
    private navigate;
    getLastFocusedRow(): number | null;
    focusRow(rowNumber: number): void;
    getComponentAt(rowIndex: number): Component | undefined;
    private static getTemplate;
    private getItemHeight;
    ensureIndexVisible(index: number): void;
    setComponentCreator(componentCreator: (value: any, listItemElement: HTMLElement) => Component): void;
    getRowHeight(): number;
    getScrollTop(): number;
    setRowHeight(rowHeight: number): void;
    refresh(): void;
    private clearVirtualRows;
    private drawVirtualRows;
    private ensureRowsRendered;
    private insertRow;
    private removeRow;
    private addScrollListener;
    setModel(model: VirtualListModel): void;
    destroy(): void;
}
