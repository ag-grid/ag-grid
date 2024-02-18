import { Component } from './component';
import { TabGuardComp } from './tabGuardComp';
export interface VirtualListModel {
    getRowCount(): number;
    getRow(index: number): any;
    /** Required if using soft refresh. If rows are equal, componentUpdater will be called instead of remove/create */
    areRowsEqual?(oldRow: any, newRow: any): boolean;
}
interface VirtualListParams {
    cssIdentifier?: string;
    ariaRole?: string;
    listName?: string;
}
export declare class VirtualList<C extends Component = Component> extends TabGuardComp {
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
    private readonly animationFrameService;
    private readonly eContainer;
    constructor(params?: VirtualListParams);
    private postConstruct;
    private onGridStylesChanged;
    private setAriaProperties;
    private addResizeObserver;
    protected focusInnerElement(fromBottom: boolean): void;
    protected onFocusIn(e: FocusEvent): void;
    protected onFocusOut(e: FocusEvent): void;
    protected handleKeyDown(e: KeyboardEvent): void;
    protected onTabKeyDown(e: KeyboardEvent): void;
    private navigate;
    getLastFocusedRow(): number | null;
    focusRow(rowNumber: number): void;
    getComponentAt(rowIndex: number): C | undefined;
    forEachRenderedRow(func: (comp: C, idx: number) => void): void;
    private static getTemplate;
    private getItemHeight;
    /**
     * Returns true if the view had to be scrolled, otherwise, false.
     */
    ensureIndexVisible(index: number, scrollPartialIntoView?: boolean): boolean;
    setComponentCreator(componentCreator: (value: any, listItemElement: HTMLElement) => C): void;
    setComponentUpdater(componentUpdater: (value: any, component: C) => void): void;
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
    getAriaElement(): Element;
    destroy(): void;
}
export {};
