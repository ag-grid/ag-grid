import { Component } from './component';
import { Autowired, PostConstruct } from '../context/context';
import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { _ } from '../utils';

export interface VirtualListModel {
    getRowCount(): number;
    getRow(index: number): any;
}

export class VirtualList extends Component {
    private model: VirtualListModel;
    private eListContainer: HTMLElement;
    private renderedRows = new Map<number, { rowComponent: Component, eDiv: HTMLDivElement; }>();
    private componentCreator: (value: any) => Component;
    private rowHeight = 20;

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    constructor(private readonly cssIdentifier = 'default') {
        super(VirtualList.getTemplate(cssIdentifier));
    }

    @PostConstruct
    private init(): void {
        this.eListContainer = this.queryForHtmlElement('.ag-virtual-list-container');

        this.addScrollListener();
        this.rowHeight = this.getItemHeight();
    }

    private static getTemplate(cssIdentifier: string) {
        return /* html */`
            <div class="ag-virtual-list-viewport ag-${cssIdentifier}-virtual-list-viewport" tabindex="0">
                <div class="ag-virtual-list-container ag-${cssIdentifier}-virtual-list-container"></div>
            </div>`;
    }

    private getItemHeight(): number {
        return this.gridOptionsWrapper.getListItemHeight();
    }

    public ensureIndexVisible(index: number): void {
        const lastRow = this.model.getRowCount();

        if (typeof index !== 'number' || index < 0 || index >= lastRow) {
            console.warn('invalid row index for ensureIndexVisible: ' + index);
            return;
        }

        const rowTopPixel = index * this.rowHeight;
        const rowBottomPixel = rowTopPixel + this.rowHeight;
        const eGui = this.getGui();

        const viewportTopPixel = eGui.scrollTop;
        const viewportHeight = eGui.offsetHeight;
        const viewportBottomPixel = viewportTopPixel + viewportHeight;

        const viewportScrolledPastRow = viewportTopPixel > rowTopPixel;
        const viewportScrolledBeforeRow = viewportBottomPixel < rowBottomPixel;

        if (viewportScrolledPastRow) {
            // if row is before, scroll up with row at top
            eGui.scrollTop = rowTopPixel;
        } else if (viewportScrolledBeforeRow) {
            // if row is below, scroll down with row at bottom
            const newScrollPosition = rowBottomPixel - viewportHeight;
            eGui.scrollTop = newScrollPosition;
        }
    }

    public setComponentCreator(componentCreator: (value: any) => Component): void {
        this.componentCreator = componentCreator;
    }

    public getRowHeight(): number {
        return this.rowHeight;
    }

    public getScrollTop(): number {
        return this.getGui().scrollTop;
    }

    public setRowHeight(rowHeight: number): void {
        this.rowHeight = rowHeight;
        this.refresh();
    }

    public refresh(): void {
        if (this.model == null) { return; }

        this.eListContainer.style.height = `${this.model.getRowCount() * this.rowHeight}px`;

        // ensure height is applied before attempting to redraw rows
        setTimeout(() => {
            this.clearVirtualRows();
            this.drawVirtualRows();
        }, 0);
    }

    private clearVirtualRows() {
        this.renderedRows.forEach((_, rowIndex) => this.removeRow(rowIndex));
    }

    private drawVirtualRows() {
        const gui = this.getGui();
        const topPixel = gui.scrollTop;
        const bottomPixel = topPixel + gui.offsetHeight;
        const firstRow = Math.floor(topPixel / this.rowHeight);
        const lastRow = Math.floor(bottomPixel / this.rowHeight);

        this.ensureRowsRendered(firstRow, lastRow);
    }

    private ensureRowsRendered(start: number, finish: number) {
        // remove any rows that are no longer required
        this.renderedRows.forEach((_, rowIndex) => {
            if (rowIndex < start || rowIndex > finish) {
                this.removeRow(rowIndex);
            }
        });

        // insert any required new rows
        for (let rowIndex = start; rowIndex <= finish; rowIndex++) {
            if (this.renderedRows.has(rowIndex)) { continue; }

            // check this row actually exists (in case overflow buffer window exceeds real data)
            if (rowIndex < this.model.getRowCount()) {
                const value = this.model.getRow(rowIndex);
                this.insertRow(value, rowIndex);
            }
        }
    }

    private insertRow(value: any, rowIndex: number) {
        const eDiv = document.createElement('div');

        _.addCssClass(eDiv, 'ag-virtual-list-item');
        _.addCssClass(eDiv, `ag-${this.cssIdentifier}-virtual-list-item`);

        eDiv.style.height = `${this.rowHeight}px`;
        eDiv.style.top = `${this.rowHeight * rowIndex}px`;

        const rowComponent = this.componentCreator(value);

        eDiv.appendChild(rowComponent.getGui());

        this.eListContainer.appendChild(eDiv);
        this.renderedRows.set(rowIndex, { rowComponent, eDiv });
    }

    private removeRow(rowIndex: number) {
        const component = this.renderedRows.get(rowIndex);

        this.eListContainer.removeChild(component.eDiv);

        this.destroyBean(component.rowComponent);

        this.renderedRows.delete(rowIndex);
    }

    private addScrollListener() {
        this.addGuiEventListener('scroll', () => this.drawVirtualRows());
    }

    public setModel(model: VirtualListModel): void {
        this.model = model;
    }
}
