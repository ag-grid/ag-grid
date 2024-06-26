import type { AnimationFrameService, BeanCollection, Component, ComponentEvent } from 'ag-grid-community';
import { TabGuardComp } from 'ag-grid-community';
import type { VirtualListModel } from './iVirtualList';
interface VirtualListParams {
    cssIdentifier?: string;
    ariaRole?: string;
    listName?: string;
}
export declare class VirtualList<C extends Component<any> = Component<any>, TEventType extends string = ComponentEvent> extends TabGuardComp<TEventType> {
    private resizeObserverService;
    protected animationFrameService: AnimationFrameService;
    private environment;
    wireBeans(beans: BeanCollection): void;
    private readonly cssIdentifier;
    private readonly ariaRole;
    private listName?;
    private model;
    private renderedRows;
    private componentCreator;
    private componentUpdater;
    private rowHeight;
    private pageSize;
    private isScrolling;
    private lastFocusedRowIndex;
    private isHeightFromTheme;
    private readonly eContainer;
    constructor(params?: VirtualListParams);
    postConstruct(): void;
    private onGridStylesChanged;
    private setAriaProperties;
    private addResizeObserver;
    protected focusInnerElement(fromBottom: boolean): void;
    protected onFocusIn(e: FocusEvent): void;
    protected onFocusOut(e: FocusEvent): void;
    protected handleKeyDown(e: KeyboardEvent): void;
    protected onTabKeyDown(e: KeyboardEvent): void;
    private navigate;
    navigateToPage(key: 'Home' | 'PageUp' | 'PageDown' | 'End', fromItem?: number | 'focused'): number | null;
    getLastFocusedRow(): number | null;
    focusRow(rowNumber: number): void;
    getComponentAt(rowIndex: number): C | undefined;
    forEachRenderedRow(func: (comp: C, idx: number) => void): void;
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
    protected drawVirtualRows(softRefresh?: boolean): void;
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
