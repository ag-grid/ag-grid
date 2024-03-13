import { Component } from './component';
import { Autowired, PostConstruct } from '../context/context';
import { RefSelector } from './componentAnnotations';
import { getAriaPosInSet, setAriaSetSize, setAriaPosInSet, setAriaSelected, setAriaChecked, setAriaRole, setAriaLabel } from '../utils/aria';
import { KeyCode } from '../constants/keyCode';
import { ResizeObserverService } from "../misc/resizeObserverService";
import { waitUntil } from '../utils/function';
import { TabGuardComp } from './tabGuardComp';
import { Events } from '../eventKeys';
import { stopPropagationForAgGrid } from '../utils/event';
import { AnimationFrameService } from '../misc/animationFrameService';

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

export class VirtualList<C extends Component = Component> extends TabGuardComp {
    private readonly cssIdentifier: string;
    private readonly ariaRole: string;
    private listName?: string;

    private model: VirtualListModel;
    private renderedRows = new Map<number, { rowComponent: C; eDiv: HTMLDivElement; value: any; }>();
    private componentCreator: (value: any, listItemElement: HTMLElement) => C;
    private componentUpdater: (value: any, component: C) => void;
    private rowHeight = 20;
    private lastFocusedRowIndex: number | null;
    private isHeightFromTheme: boolean = true;

    @Autowired('resizeObserverService') private readonly resizeObserverService: ResizeObserverService;
    @Autowired('animationFrameService') private readonly animationFrameService: AnimationFrameService;
    @RefSelector('eContainer') private readonly eContainer: HTMLElement;

    constructor(params?: VirtualListParams) {
        super(VirtualList.getTemplate(params?.cssIdentifier || 'default'));

        const { cssIdentifier = 'default', ariaRole = 'listbox', listName } = params || {};

        this.cssIdentifier = cssIdentifier;
        this.ariaRole = ariaRole;
        this.listName = listName;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addScrollListener();
        this.rowHeight = this.getItemHeight();
        this.addResizeObserver();

        this.initialiseTabGuard({
            onFocusIn: (e: FocusEvent) => this.onFocusIn(e),
            onFocusOut: (e: FocusEvent) => this.onFocusOut(e),
            focusInnerElement: (fromBottom: boolean) => this.focusInnerElement(fromBottom),
            onTabKeyDown: e => this.onTabKeyDown(e),
            handleKeyDown: e => this.handleKeyDown(e)
        });

        this.setAriaProperties();
        this.addManagedListener(this.eventService, Events.EVENT_GRID_STYLES_CHANGED, this.onGridStylesChanged.bind(this));
    }

    private onGridStylesChanged(): void {
        this.rowHeight = this.getItemHeight();
        this.refresh();
    }

    private setAriaProperties(): void {
        const translate = this.localeService.getLocaleTextFunc();
        const listName = translate('ariaDefaultListName', this.listName || 'List');
        const ariaEl = this.eContainer;

        setAriaRole(ariaEl, this.ariaRole);
        setAriaLabel(ariaEl, listName);
    }

    private addResizeObserver(): void {
        // do this in an animation frame to prevent loops
        const listener = () => this.animationFrameService.requestAnimationFrame(() => this.drawVirtualRows());
        const destroyObserver = this.resizeObserverService.observeResize(this.getGui(), listener);
        this.addDestroyFunc(destroyObserver);
    }

    protected focusInnerElement(fromBottom: boolean): void {
        this.focusRow(fromBottom ? this.model.getRowCount() - 1 : 0);
    }

    protected onFocusIn(e: FocusEvent): void {
        const target = e.target as HTMLElement;

        if (target.classList.contains('ag-virtual-list-item')) {
            this.lastFocusedRowIndex = getAriaPosInSet(target) - 1;
        }
    }

    protected onFocusOut(e: FocusEvent): void {
        if (!this.getFocusableElement().contains(e.relatedTarget as HTMLElement)) {
            this.lastFocusedRowIndex = null;
        }
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        switch (e.key) {
            case KeyCode.UP:
            case KeyCode.DOWN:
                if (this.navigate(e.key === KeyCode.UP)) {
                    e.preventDefault();
                }

                break;
        }
    }

    protected onTabKeyDown(e: KeyboardEvent): void {
        if (this.navigate(e.shiftKey)) {
            e.preventDefault();
        } else {
            stopPropagationForAgGrid(e);
            this.forceFocusOutOfContainer(e.shiftKey);
        }
    }

    private navigate(up: boolean): boolean {
        if (this.lastFocusedRowIndex == null) { return false; }

        const nextRow = this.lastFocusedRowIndex + (up ? -1 : 1);

        if (nextRow < 0 || nextRow >= this.model.getRowCount()) { return false; }

        this.focusRow(nextRow);

        return true;
    }

    public getLastFocusedRow(): number | null {
        return this.lastFocusedRowIndex;
    }

    public focusRow(rowNumber: number): void {
        this.ensureIndexVisible(rowNumber);

        window.setTimeout(() => {
            if (!this.isAlive()) { return; }
            const renderedRow = this.renderedRows.get(rowNumber);

            if (renderedRow) {
                renderedRow.eDiv.focus();
            }
        }, 10);
    }

    public getComponentAt(rowIndex: number): C | undefined {
        const comp = this.renderedRows.get(rowIndex);

        return comp && comp.rowComponent;
    }

    public forEachRenderedRow(func: (comp: C, idx: number) => void): void {
        this.renderedRows.forEach((value, key)  => func(value.rowComponent, key));
    }

    private static getTemplate(cssIdentifier: string) {
        return (/* html */
            `<div class="ag-virtual-list-viewport ag-${cssIdentifier}-virtual-list-viewport" role="presentation">
                <div class="ag-virtual-list-container ag-${cssIdentifier}-virtual-list-container" ref="eContainer"></div>
            </div>`
        );
    }

    private getItemHeight(): number {
        if (!this.isHeightFromTheme) {
            return this.rowHeight;
        }
        return this.environment.getListItemHeight();
    }

    /**
     * Returns true if the view had to be scrolled, otherwise, false.
     */
    public ensureIndexVisible(index: number, scrollPartialIntoView: boolean = true): boolean {
        const lastRow = this.model.getRowCount();

        if (typeof index !== 'number' || index < 0 || index >= lastRow) {
            console.warn('AG Grid: invalid row index for ensureIndexVisible: ' + index);
            return false;
        }

        const rowTopPixel = index * this.rowHeight;
        const rowBottomPixel = rowTopPixel + this.rowHeight;
        const eGui = this.getGui();

        const viewportTopPixel = eGui.scrollTop;
        const viewportHeight = eGui.offsetHeight;
        const viewportBottomPixel = viewportTopPixel + viewportHeight;

        const diff = scrollPartialIntoView ? 0 : this.rowHeight;
        const viewportScrolledPastRow = viewportTopPixel > rowTopPixel + diff;
        const viewportScrolledBeforeRow = viewportBottomPixel < rowBottomPixel - diff;

        if (viewportScrolledPastRow) {
            // if row is before, scroll up with row at top
            eGui.scrollTop = rowTopPixel;
            return true;
        }
        
        if (viewportScrolledBeforeRow) {
            // if row is below, scroll down with row at bottom
            const newScrollPosition = rowBottomPixel - viewportHeight;
            eGui.scrollTop = newScrollPosition;
            return true;
        }

        return false;
    }

    public setComponentCreator(componentCreator: (value: any, listItemElement: HTMLElement) => C): void {
        this.componentCreator = componentCreator;
    }

    public setComponentUpdater(componentUpdater: (value: any, component: C) => void): void {
        this.componentUpdater = componentUpdater;
    }

    public getRowHeight(): number {
        return this.rowHeight;
    }

    public getScrollTop(): number {
        return this.getGui().scrollTop;
    }

    public setRowHeight(rowHeight: number): void {
        this.isHeightFromTheme = false;
        this.rowHeight = rowHeight;
        this.refresh();
    }

    public refresh(softRefresh?: boolean): void {
        if (this.model == null || !this.isAlive()) { return; }

        const rowCount = this.model.getRowCount();
        this.eContainer.style.height = `${rowCount * this.rowHeight}px`;

        // ensure height is applied before attempting to redraw rows
        waitUntil(() => this.eContainer.clientHeight >= rowCount * this.rowHeight,
            () => {
                if (!this.isAlive()) { return; }

                if (this.canSoftRefresh(softRefresh)) {
                    this.drawVirtualRows(true);
                } else {
                    this.clearVirtualRows();
                    this.drawVirtualRows();
                }
            }
        );
    }

    private canSoftRefresh(softRefresh: boolean | undefined): boolean {
        return !!(softRefresh && this.renderedRows.size && typeof this.model.areRowsEqual === 'function' && this.componentUpdater);
    }

    private clearVirtualRows() {
        this.renderedRows.forEach((_, rowIndex) => this.removeRow(rowIndex));
    }

    private drawVirtualRows(softRefresh?: boolean) {
        if (!this.isAlive() || !this.model) { return; }

        const gui = this.getGui();
        const topPixel = gui.scrollTop;
        const bottomPixel = topPixel + gui.offsetHeight;
        const firstRow = Math.floor(topPixel / this.rowHeight);
        const lastRow = Math.floor(bottomPixel / this.rowHeight);

        this.ensureRowsRendered(firstRow, lastRow, softRefresh);
    }

    private ensureRowsRendered(start: number, finish: number, softRefresh?: boolean) {
        // remove any rows that are no longer required
        this.renderedRows.forEach((_, rowIndex) => {
            if ((rowIndex < start || rowIndex > finish) && rowIndex !== this.lastFocusedRowIndex) {
                this.removeRow(rowIndex);
            }
        });

        if (softRefresh) {
            // refresh any existing rows
            this.refreshRows();
        }

        // insert any required new rows
        for (let rowIndex = start; rowIndex <= finish; rowIndex++) {
            if (this.renderedRows.has(rowIndex)) { continue; }

            // check this row actually exists (in case overflow buffer window exceeds real data)
            if (rowIndex < this.model.getRowCount()) {
                this.insertRow(rowIndex);
            }
        }
    }

    private insertRow(rowIndex: number): void {
        const value = this.model.getRow(rowIndex);
        const eDiv = document.createElement('div');

        eDiv.classList.add('ag-virtual-list-item', `ag-${this.cssIdentifier}-virtual-list-item`);
        setAriaRole(eDiv, this.ariaRole === 'tree' ? 'treeitem' : 'option');
        setAriaSetSize(eDiv, this.model.getRowCount());
        setAriaPosInSet(eDiv, rowIndex + 1);
        eDiv.setAttribute('tabindex', '-1');

        eDiv.style.height = `${this.rowHeight}px`;
        eDiv.style.top = `${this.rowHeight * rowIndex}px`;

        const rowComponent = this.componentCreator(value, eDiv);

        rowComponent.addGuiEventListener('focusin', () => this.lastFocusedRowIndex = rowIndex);

        eDiv.appendChild(rowComponent.getGui());

        // keep the DOM order consistent with the order of the rows
        if (this.renderedRows.has(rowIndex - 1)) {
            this.renderedRows.get(rowIndex - 1)!.eDiv.insertAdjacentElement('afterend', eDiv);
        } else if (this.renderedRows.has(rowIndex + 1)) {
            this.renderedRows.get(rowIndex + 1)!.eDiv.insertAdjacentElement('beforebegin', eDiv);
        } else {
            this.eContainer.appendChild(eDiv);
        }

        this.renderedRows.set(rowIndex, { rowComponent, eDiv, value });
    }

    private removeRow(rowIndex: number) {
        const component = this.renderedRows.get(rowIndex)!;

        this.eContainer.removeChild(component.eDiv);
        this.destroyBean(component.rowComponent);
        this.renderedRows.delete(rowIndex);
    }

    private refreshRows(): void {
        const rowCount = this.model.getRowCount();
        this.renderedRows.forEach((row, rowIndex) => {
            if (rowIndex >= rowCount) {
                this.removeRow(rowIndex);
            } else {
                const newValue = this.model.getRow(rowIndex);
                if (this.model.areRowsEqual?.(row.value, newValue)) {
                    this.componentUpdater(newValue, row.rowComponent);
                } else {
                    // to be replaced later
                    this.removeRow(rowIndex);
                }
            }
        });
    }

    private addScrollListener() {
        this.addGuiEventListener('scroll', () => this.drawVirtualRows(), { passive: true });
    }

    public setModel(model: VirtualListModel): void {
        this.model = model;
    }

    public getAriaElement(): Element {
        return this.eContainer;
    }

    public destroy(): void {
        if (!this.isAlive()) { return; }

        this.clearVirtualRows();
        super.destroy();
    }
}
