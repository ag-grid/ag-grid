import { Component } from './component';
import { TabGuardComp } from './tabGuardComp';
export interface VirtualListModel {
    getRowCount(): number;
    getRow(index: number): any;
    isRowSelected?(index: number): boolean | undefined;
    /** Required if using soft refresh. If rows are equal, componentUpdater will be called instead of remove/create */
    areRowsEqual?(oldRow: any, newRow: any): boolean;
}
export declare class VirtualList extends TabGuardComp {
    private readonly cssIdentifier;
    private readonly ariaRole;
    private listName?;
    private model;
    private renderedRows;
    private componentCreator;
    private componentUpdater;
    private rowHeight;
    private lastFocusedRowIndex;
    private readonly resizeObserverService;
    private readonly eContainer;
    constructor(cssIdentifier?: string, ariaRole?: string, listName?: string | undefined);
    private postConstruct;
    private onGridStylesChanged;
    private setAriaProperties;
    private addResizeObserver;
    protected focusInnerElement(fromBottom: boolean): void;
    protected onFocusIn(e: FocusEvent): boolean;
    protected onFocusOut(e: FocusEvent): boolean;
    protected handleKeyDown(e: KeyboardEvent): void;
    protected onTabKeyDown(e: KeyboardEvent): void;
    private navigate;
    getLastFocusedRow(): number | null;
    focusRow(rowNumber: number): void;
    getComponentAt(rowIndex: number): Component | undefined;
    forEachRenderedRow(func: (comp: Component, idx: number) => void): void;
    private static getTemplate;
    private getItemHeight;
    ensureIndexVisible(index: number): void;
    setComponentCreator(componentCreator: (value: any, listItemElement: HTMLElement) => Component): void;
    setComponentUpdater(componentUpdater: (value: any, component: Component) => void): void;
    getRowHeight(): number;
    getScrollTop(): number;
    setRowHeight(rowHeight: number): void;
    refresh(softRefresh?: boolean): void;
    private canSoftRefresh;
    private clearVirtualRows;
    private drawVirtualRows;
    private ensureRowsRendered;
    private insertRow;
    private removeRow;
    private refreshRows;
    private addScrollListener;
    setModel(model: VirtualListModel): void;
    destroy(): void;
}
