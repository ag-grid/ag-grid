import {Component} from "./component";
import {PostConstruct, Autowired, Context} from "../context/context";
import {Utils as _} from '../utils';

export interface VirtualListModel {
    getRowCount(): number;
    getRow(index: number): any;
}

export class VirtualList extends Component {

    private static TEMPLATE =
        '<div class="ag-filter-list-viewport">'+
        '<div class="ag-filter-list-container">'+
        '</div>'+
        '</div>';

    @Autowired('context') private context: Context;

    private model: VirtualListModel;

    private eListContainer: HTMLElement;
    private rowsInBodyContainer: any = {};

    private componentCreator: (value:any)=>Component;

    private rowHeight = 20;

    constructor() {
        super(null);
    }

    @PostConstruct
    private init(): void {
        this.setTemplate(VirtualList.TEMPLATE);

        this.eListContainer = this.queryForHtmlElement(".ag-filter-list-container");

        this.addScrollListener();
    }

    public setComponentCreator(componentCreator: (value:any)=>Component): void {
        this.componentCreator = componentCreator;
    }

    public setRowHeight(rowHeight: number): void {
        this.rowHeight = rowHeight;
        this.refresh();
    }

    public refresh(): void {
        if (_.missing(this.model)) {
            return;
        }
        this.eListContainer.style.height = (this.model.getRowCount() * this.rowHeight) + "px";
        this.clearVirtualRows();
        this.drawVirtualRows();
    }

    private clearVirtualRows() {
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);
        this.removeVirtualRows(rowsToRemove);
    }

    private drawVirtualRows() {
        var topPixel = this.getGui().scrollTop;
        var bottomPixel = topPixel + this.getGui().offsetHeight;

        var firstRow = Math.floor(topPixel / this.rowHeight);
        var lastRow = Math.floor(bottomPixel / this.rowHeight);

        this.ensureRowsRendered(firstRow, lastRow);
    }

    private ensureRowsRendered(start: any, finish: any) {

        // at the end, this array will contain the items we need to remove
        var rowsToRemove = Object.keys(this.rowsInBodyContainer);

        // add in new rows
        for (var rowIndex = start; rowIndex <= finish; rowIndex++) {
            // see if item already there, and if yes, take it out of the 'to remove' array
            if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
                rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
                continue;
            }
            // check this row actually exists (in case overflow buffer window exceeds real data)
            if (this.model.getRowCount() > rowIndex) {
                var value = this.model.getRow(rowIndex);
                this.insertRow(value, rowIndex);
            }
        }

        // at this point, everything in our 'rowsToRemove' . . .
        this.removeVirtualRows(rowsToRemove);
    }

    // takes array of row id's
    private removeVirtualRows(rowsToRemove: any) {
        rowsToRemove.forEach( (index: number) => {
            var component = this.rowsInBodyContainer[index];
            this.eListContainer.removeChild(component.getGui());
            if (component.destroy) {
                component.destroy();
            }
            delete this.rowsInBodyContainer[index];
        });
    }

    private insertRow(value: any, rowIndex: any) {

        // var richListItem = new SetFilterListItem(value, this.cellRenderer);

        var rowComponent = this.componentCreator(value);

        // richListItem.setSelected(this.model.isRowSelected(value));

        // this.addDestroyableEventListener(
        //     richListItem,
        //     SetFilterListItem.EVENT_SELECTED,
        //     () => this.dispatchEvent(VirtualList.EVENT_SELECTED, {
        //         value: value,
        //         selected: richListItem.isSelected()
        //     })
        // );

        rowComponent.getGui().style.top = (this.rowHeight * rowIndex) + "px";

        this.eListContainer.appendChild(rowComponent.getGui());
        this.rowsInBodyContainer[rowIndex] = rowComponent;
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