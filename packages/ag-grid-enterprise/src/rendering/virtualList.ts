import { Autowired, Component, Environment, GridOptionsWrapper, PostConstruct, _ } from "ag-grid-community";

export interface VirtualListModel {
    getRowCount(): number;
    getRow(index: number): any;
}

export class VirtualList extends Component {

    private static TEMPLATE =
        `<div class="ag-virtual-list-viewport">
            <div class="ag-virtual-list-container"></div>
        </div>`;

    private model: VirtualListModel;

    private eListContainer: HTMLElement;
    private rowsInBodyContainer: any = {};

    private componentCreator: (value: any) => Component;

    private rowHeight = 20;

    @Autowired('environment') private environment: Environment;
    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    constructor() {
        super(undefined);
    }

    @PostConstruct
    private init(): void {
        this.setTemplate(VirtualList.TEMPLATE);

        this.eListContainer = this.queryForHtmlElement(".ag-virtual-list-container");

        this.addScrollListener();
        const item = document.createElement('div');
        _.addCssClass(item, 'ag-virtual-list-item');
        this.rowHeight = this.getItemHeight();
    }

    private getItemHeight(): number {
        return this.gridOptionsWrapper.getVirtualItemHeight();
    }

    public ensureIndexVisible(index: number): void {
        const lastRow = this.model.getRowCount();
        if (typeof index !== 'number' || index < 0 || index >= lastRow) {
            console.warn('invalid row index for ensureIndexVisible: ' + index);
            return;
        }

        // let nodeAtIndex = this.rowModel.getRow(index);
        const rowTopPixel = index * this.rowHeight;
        const rowBottomPixel = rowTopPixel + this.rowHeight;

        const viewportTopPixel = this.getGui().scrollTop;
        const viewportHeight = this.getGui().offsetHeight;
        const viewportBottomPixel = viewportTopPixel + viewportHeight;

        const viewportScrolledPastRow = viewportTopPixel > rowTopPixel;
        const viewportScrolledBeforeRow = viewportBottomPixel < rowBottomPixel;

        if (viewportScrolledPastRow) {
            // if row is before, scroll up with row at top
            this.getGui().scrollTop = rowTopPixel;
        } else if (viewportScrolledBeforeRow) {
            // if row is below, scroll down with row at bottom
            const newScrollPosition = rowBottomPixel - viewportHeight;
            this.getGui().scrollTop = newScrollPosition;
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
        if (_.missing(this.model)) { return; }
        this.eListContainer.style.height = (this.model.getRowCount() * this.rowHeight) + "px";
        this.clearVirtualRows();
        this.drawVirtualRows();
    }

    private clearVirtualRows() {
        const rowsToRemove = Object.keys(this.rowsInBodyContainer);
        this.removeVirtualRows(rowsToRemove);
    }

    private drawVirtualRows() {
        const topPixel = this.getGui().scrollTop;
        const bottomPixel = topPixel + this.getGui().offsetHeight;

        const firstRow = Math.floor(topPixel / this.rowHeight);
        const lastRow = Math.floor(bottomPixel / this.rowHeight);

        this.ensureRowsRendered(firstRow, lastRow);
    }

    private ensureRowsRendered(start: any, finish: any) {

        // at the end, this array will contain the items we need to remove
        const rowsToRemove = Object.keys(this.rowsInBodyContainer);

        // add in new rows
        for (let rowIndex = start; rowIndex <= finish; rowIndex++) {
            // see if item already there, and if yes, take it out of the 'to remove' array
            if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                continue;
            }
            // check this row actually exists (in case overflow buffer window exceeds real data)
            if (this.model.getRowCount() > rowIndex) {
                const value = this.model.getRow(rowIndex);
                this.insertRow(value, rowIndex);
            }
        }

        // at this point, everything in our 'rowsToRemove' . . .
        this.removeVirtualRows(rowsToRemove);
    }

    // takes array of row id's
    private removeVirtualRows(rowsToRemove: any) {
        rowsToRemove.forEach((index: number) => {
            const component = this.rowsInBodyContainer[index];
            this.eListContainer.removeChild(component.eDiv);
            if (component.rowComponent.destroy) {
                component.rowComponent.destroy();
            }
            delete this.rowsInBodyContainer[index];
        });
    }

    private insertRow(value: any, rowIndex: any) {

        const eDiv = document.createElement('div');
        _.addCssClass(eDiv, 'ag-virtual-list-item');
        eDiv.style.top = (this.rowHeight * rowIndex) + "px";

        const rowComponent = this.componentCreator(value);
        eDiv.appendChild(rowComponent.getGui());

        this.eListContainer.appendChild(eDiv);
        this.rowsInBodyContainer[rowIndex] = {
            rowComponent: rowComponent,
            eDiv: eDiv
        };
    }

    private addScrollListener() {
        this.addGuiEventListener('scroll', () => {
            this.drawVirtualRows();
        });
    }

    public setModel(model: VirtualListModel): void {
        this.model = model;
    }
}
