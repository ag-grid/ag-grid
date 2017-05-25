
import {AgCheckbox} from "../../widgets/agCheckbox";
import {BeanStub} from "../../context/beanStub";
import {PostConstruct, Autowired} from "../../context/context";
import {ColumnApi} from "../../columnController/columnController";
import {GridApi} from "../../gridApi";
import {Events} from "../../events";
import {EventService} from "../../eventService";
import {IRowModel} from "../../interfaces/iRowModel";
import {Constants} from "../../constants";
import {Column} from "../../entities/column";
import {RowNode} from "../../entities/rowNode";
import {SelectionController} from "../../selectionController";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";

export class SelectAllFeature extends BeanStub {

    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private cbSelectAllVisible = false;
    private processingEventFromCheckbox = false;
    private column: Column;

    private filteredOnly: boolean;
    private cbSelectAll: AgCheckbox;

    constructor(cbSelectAll: AgCheckbox, column: Column) {
        super();
        this.cbSelectAll = cbSelectAll;
        this.column = column;

        let colDef = column.getColDef();
        this.filteredOnly = colDef ? !!colDef.headerCheckboxSelectionFilteredOnly : false;
    }

    @PostConstruct
    private postConstruct(): void {

        this.showOrHideSelectAll();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.showOrHideSelectAll.bind(this));

        this.addDestroyableEventListener(this.eventService, Events.EVENT_SELECTION_CHANGED, this.onSelectionChanged.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onModelChanged.bind(this));

        this.addDestroyableEventListener(this.cbSelectAll, AgCheckbox.EVENT_CHANGED, this.onCbSelectAll.bind(this));
    }

    private showOrHideSelectAll(): void {

        this.cbSelectAllVisible = this.isCheckboxSelection();
        this.cbSelectAll.setVisible(this.cbSelectAllVisible);

        if (this.cbSelectAllVisible) {
            // in case user is trying this feature with the wrong model type
            this.checkRightRowModelType();
            // make sure checkbox is showing the right state
            this.updateStateOfCheckbox();
        }
    }

    private onModelChanged(): void {
        if (!this.cbSelectAllVisible) { return; }
        this.updateStateOfCheckbox();
    }

    private onSelectionChanged(): void {
        if (!this.cbSelectAllVisible) { return; }
        this.updateStateOfCheckbox();
    }

    private getNextCheckboxState(selectionCount: SelectionCount): boolean {
        if (selectionCount.selected===0 && selectionCount.notSelected===0) {
            // if no rows, always have it unselected
            return false;
        } else if (selectionCount.selected>0 && selectionCount.notSelected>0) {
            // if mix of selected and unselected, this is the tri-state
            return null;
        } else if (selectionCount.selected>0) {
            // only selected
            return true;
        } else {
            // nothing selected
            return false;
        }
    }

    private updateStateOfCheckbox(): void {

        if (this.processingEventFromCheckbox) { return; }

        this.processingEventFromCheckbox = true;

        let selectionCount = this.getSelectionCount();

        let allSelected = this.getNextCheckboxState(selectionCount);

        this.cbSelectAll.setSelected(allSelected);

        this.processingEventFromCheckbox = false;
    }

    private getSelectionCount(): SelectionCount {
        let selectedCount = 0;
        let notSelectedCount = 0;

        let callback = (node: RowNode) => {
            if (node.isSelected()) {
                selectedCount++;
            } else {
                notSelectedCount++;
            }
        };

        if (this.filteredOnly) {
            this.gridApi.forEachNodeAfterFilter(callback);
        } else {
            this.gridApi.forEachNode(callback);
        }

        return {
            notSelected: notSelectedCount,
            selected: selectedCount
        };
    }

    private checkRightRowModelType(): void {
        let rowModelType = this.rowModel.getType();
        let rowModelMatches = rowModelType===Constants.ROW_MODEL_TYPE_NORMAL || Constants.ROW_MODEL_TYPE_PAGINATION;
        if (!rowModelMatches) {
            console.log(`ag-Grid: selectAllCheckbox is only available if using normal or pagination row models, you are using ${rowModelType}`);
        }
    }

    private onCbSelectAll(): void {
        if (this.processingEventFromCheckbox) { return; }
        if (!this.cbSelectAllVisible) { return; }

        let value = this.cbSelectAll.isSelected();
        if (value) {
            this.selectionController.selectAllRowNodes(this.filteredOnly);
        } else {
            this.selectionController.deselectAllRowNodes(this.filteredOnly);
        }
    }

    private isCheckboxSelection(): boolean {
        let result = this.column.getColDef().headerCheckboxSelection;

        if (typeof result === 'function') {
            let func = <(params: any)=>boolean> result;
            result = func({
                column: this.column,
                colDef: this.column.getColDef(),
                columnApi: this.columnApi,
                api: this.gridApi
            });
        }

        if (result) {
            if (this.gridOptionsWrapper.isRowModelEnterprise()) {
                console.warn('headerCheckboxSelection is not supported for Enterprise Row Model');
                return false;
            }
            if (this.gridOptionsWrapper.isRowModelInfinite()) {
                console.warn('headerCheckboxSelection is not supported for Infinite Row Model');
                return false;
            }
            if (this.gridOptionsWrapper.isRowModelViewport()) {
                console.warn('headerCheckboxSelection is not supported for Viewport Row Model');
                return false;
            }
            // otherwise the row model is compatible, so return true
            return true;
        } else {
            return false;
        }
    }

}

interface SelectionCount {
    selected: number;
    notSelected: number;
}