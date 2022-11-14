import { AgCheckbox } from "../../../widgets/agCheckbox";
import { BeanStub } from "../../../context/beanStub";
import { Autowired } from "../../../context/context";
import { ColumnApi } from "../../../columns/columnApi";
import { GridApi } from "../../../gridApi";
import { Events } from "../../../events";
import { IRowModel } from "../../../interfaces/iRowModel";
import { Constants } from "../../../constants/constants";
import { Column } from "../../../entities/column";
import { RowNode } from "../../../entities/rowNode";
import { SelectionService } from "../../../selectionService";
import { HeaderCellCtrl } from "./headerCellCtrl";
import { setAriaHidden, setAriaRole } from "../../../utils/aria";
import { HeaderCheckboxSelectionCallbackParams } from "../../../entities/colDef";

export class SelectAllFeature extends BeanStub {

    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('selectionService') private selectionService: SelectionService;

    private cbSelectAllVisible = false;
    private processingEventFromCheckbox = false;
    private column: Column;
    private headerCellCtrl: HeaderCellCtrl;

    private filteredOnly: boolean;
    private cbSelectAll: AgCheckbox;

    constructor(column: Column) {
        super();
        this.column = column;

        const colDef = column.getColDef();
        this.filteredOnly = colDef ? !!colDef.headerCheckboxSelectionFilteredOnly : false;
    }

    public onSpaceKeyPressed(e: KeyboardEvent): void {
        const checkbox = this.cbSelectAll;
        const eDocument = this.gridOptionsWrapper.getDocument();

        if (checkbox.isDisplayed() && !checkbox.getGui().contains(eDocument.activeElement)) {
            e.preventDefault();
            checkbox.setValue(!checkbox.getValue());
        }
    }

    public getCheckboxGui(): HTMLElement {
        return this.cbSelectAll.getGui();
    }

    public setComp(ctrl: HeaderCellCtrl): void {
        this.headerCellCtrl = ctrl;
        this.cbSelectAll = this.createManagedBean(new AgCheckbox());
        this.cbSelectAll.addCssClass('ag-header-select-all');
        setAriaRole(this.cbSelectAll.getGui(), 'presentation');
        this.showOrHideSelectAll();

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideSelectAll.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.showOrHideSelectAll.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SELECTION_CHANGED, this.onSelectionChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onModelChanged.bind(this));
        this.addManagedListener(this.cbSelectAll, AgCheckbox.EVENT_CHANGED, this.onCbSelectAll.bind(this));
        setAriaHidden(this.cbSelectAll.getGui(), true);
        this.cbSelectAll.getInputElement().setAttribute('tabindex', '-1');
        this.refreshSelectAllLabel();
    }

    private showOrHideSelectAll(): void {
        this.cbSelectAllVisible = this.isCheckboxSelection();
        this.cbSelectAll.setDisplayed(this.cbSelectAllVisible, { skipAriaHidden: true });

        if (this.cbSelectAllVisible) {
            // in case user is trying this feature with the wrong model type
            this.checkRightRowModelType('selectAllCheckbox');
            // make sure checkbox is showing the right state
            this.updateStateOfCheckbox();
        }
        this.refreshSelectAllLabel();
    }

    private onModelChanged(): void {
        if (!this.cbSelectAllVisible) { return; }
        this.updateStateOfCheckbox();
    }

    private onSelectionChanged(): void {
        if (!this.cbSelectAllVisible) { return; }
        this.updateStateOfCheckbox();
    }

    private getNextCheckboxState(selectionCount: SelectionCount): boolean | null {
        // if no rows, always have it unselected
        if (selectionCount.selected === 0 && selectionCount.notSelected === 0) {
            return false;
        }

        // if mix of selected and unselected, this is the tri-state
        if (selectionCount.selected > 0 && selectionCount.notSelected > 0) {
            return null;
        }

        // only selected
        if (selectionCount.selected > 0) {
            return true;
        }

        // nothing selected
        return false;
    }

    private updateStateOfCheckbox(): void {
        if (this.processingEventFromCheckbox) { return; }

        this.processingEventFromCheckbox = true;

        const selectionCount = this.getSelectionCount();
        const allSelected = this.getNextCheckboxState(selectionCount);

        this.cbSelectAll.setValue(allSelected!);
        this.refreshSelectAllLabel();

        this.processingEventFromCheckbox = false;
    }

    private refreshSelectAllLabel(): void {
        if (!this.cbSelectAllVisible) {
            this.headerCellCtrl.setAriaDescriptionProperty('selectAll', null);
            this.cbSelectAll.setInputAriaLabel(null);
        } else {
            const translate = this.gridOptionsWrapper.getLocaleTextFunc();
            const checked = this.cbSelectAll.getValue();
            const ariaStatus = checked ? translate('ariaChecked', 'checked') : translate('ariaUnchecked', 'unchecked');
            const ariaLabel = translate('ariaRowSelectAll', 'Press Space to toggle all rows selection');

            this.headerCellCtrl.setAriaDescriptionProperty('selectAll', `${ariaLabel} (${ariaStatus})`);
            this.cbSelectAll.setInputAriaLabel(`${ariaLabel} (${ariaStatus})`);
        }

        this.headerCellCtrl.refreshAriaDescription();
    }

    private getSelectionCount(): SelectionCount {
        let selectedCount = 0;
        let notSelectedCount = 0;

        const callback = (node: RowNode) => {

            if (this.gridOptionsWrapper.isGroupSelectsChildren() && node.group) { return; }

            if (node.isSelected()) {
                selectedCount++;
            } else if (!node.selectable) {
                // don't count non-selectable nodes!
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

    private checkRightRowModelType(feature: string): boolean {
        const rowModelType = this.rowModel.getType();
        const rowModelMatches = rowModelType === Constants.ROW_MODEL_TYPE_CLIENT_SIDE;

        if (!rowModelMatches) {
            console.warn(`AG Grid: ${feature} is only available if using 'clientSide' rowModelType, you are using ${rowModelType}.`);
            return false;
        }
        return true;
    }

    private onCbSelectAll(): void {
        if (this.processingEventFromCheckbox) { return; }
        if (!this.cbSelectAllVisible) { return; }

        const value = this.cbSelectAll.getValue();

        if (value) {
            this.selectionService.selectAllRowNodes(this.filteredOnly);
        } else {
            this.selectionService.deselectAllRowNodes(this.filteredOnly);
        }
    }

    private isCheckboxSelection(): boolean {
        let result = this.column.getColDef().headerCheckboxSelection;

        if (typeof result === 'function') {
            const func = result as (params: HeaderCheckboxSelectionCallbackParams) => boolean;
            const params: HeaderCheckboxSelectionCallbackParams = {
                column: this.column,
                colDef: this.column.getColDef(),
                columnApi: this.columnApi,
                api: this.gridApi,
                context: this.gridOptionsWrapper.getContext()
            };
            result = func(params);
        }

        if (result) {
            return this.checkRightRowModelType('headerCheckboxSelection');
        }

        return false;
    }

}

interface SelectionCount {
    selected: number;
    notSelected: number;
}
