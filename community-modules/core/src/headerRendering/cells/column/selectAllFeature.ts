import { BeanStub } from "../../../context/beanStub";
import { Autowired } from "../../../context/context";
import { HeaderCheckboxSelectionCallbackParams } from "../../../entities/colDef";
import { Column } from "../../../entities/column";
import { Events, SelectionEventSourceType } from "../../../events";
import { IRowModel } from "../../../interfaces/iRowModel";
import { ISelectionService } from "../../../interfaces/iSelectionService";
import { setAriaHidden, setAriaRole } from "../../../utils/aria";
import { AgCheckbox } from "../../../widgets/agCheckbox";
import { HeaderCellCtrl } from "./headerCellCtrl";

export class SelectAllFeature extends BeanStub {

    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('selectionService') private selectionService: ISelectionService;

    private cbSelectAllVisible = false;
    private processingEventFromCheckbox = false;
    private column: Column;
    private headerCellCtrl: HeaderCellCtrl;

    private cbSelectAll: AgCheckbox;

    constructor(column: Column) {
        super();
        this.column = column;
    }

    public onSpaceKeyDown(e: KeyboardEvent): void {
        const checkbox = this.cbSelectAll;

        if (checkbox.isDisplayed() && !checkbox.getGui().contains(this.gos.getActiveDomElement())) {
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

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SELECTION_CHANGED, this.onSelectionChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, this.onSelectionChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onModelChanged.bind(this));
        this.addManagedListener(this.cbSelectAll, Events.EVENT_FIELD_VALUE_CHANGED, this.onCbSelectAll.bind(this));
        setAriaHidden(this.cbSelectAll.getGui(), true);
        this.cbSelectAll.getInputElement().setAttribute('tabindex', '-1');
        this.refreshSelectAllLabel();
    }

    private onNewColumnsLoaded(): void {
        this.showOrHideSelectAll();
    }

    private onDisplayedColumnsChanged(): void {
        if (!this.isAlive()) { return; }
        this.showOrHideSelectAll();
    }

    private showOrHideSelectAll(): void {
        this.cbSelectAllVisible = this.isCheckboxSelection();
        this.cbSelectAll.setDisplayed(this.cbSelectAllVisible, { skipAriaHidden: true });
        if (this.cbSelectAllVisible) {
            // in case user is trying this feature with the wrong model type
            this.checkRightRowModelType('selectAllCheckbox');
            // in case user is trying this feature with the wrong model type
            this.checkSelectionType('selectAllCheckbox');
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

    private updateStateOfCheckbox(): void {
        if (this.processingEventFromCheckbox) { return; }

        this.processingEventFromCheckbox = true;

        const allSelected = this.selectionService.getSelectAllState(
            this.isFilteredOnly(),
            this.isCurrentPageOnly()
        );

        this.cbSelectAll.setValue(allSelected!);
        const hasNodesToSelect = this.selectionService.hasNodesToSelect(this.isFilteredOnly(), this.isCurrentPageOnly());
        this.cbSelectAll.setDisabled(!hasNodesToSelect);
        this.refreshSelectAllLabel();

        this.processingEventFromCheckbox = false;
    }

    private refreshSelectAllLabel(): void {
        const translate = this.localeService.getLocaleTextFunc();
        const checked = this.cbSelectAll.getValue();
        const ariaStatus = checked ? translate('ariaChecked', 'checked') : translate('ariaUnchecked', 'unchecked');
        const ariaLabel = translate('ariaRowSelectAll', 'Press Space to toggle all rows selection');


        if (!this.cbSelectAllVisible) {
            this.headerCellCtrl.setAriaDescriptionProperty('selectAll', null);
        } else {
            this.headerCellCtrl.setAriaDescriptionProperty('selectAll', `${ariaLabel} (${ariaStatus})`);
        }

        this.cbSelectAll.setInputAriaLabel(`${ariaLabel} (${ariaStatus})`);
        this.headerCellCtrl.announceAriaDescription();
    }

    private checkSelectionType(feature: string): boolean {
        const isMultiSelect = this.gos.get('rowSelection') === 'multiple';

        if (!isMultiSelect) {
            console.warn(`AG Grid: ${feature} is only available if using 'multiple' rowSelection.`);
            return false;
        }
        return true;
    }

    private checkRightRowModelType(feature: string): boolean {
        const rowModelType = this.rowModel.getType();
        const rowModelMatches = rowModelType === 'clientSide' || rowModelType === 'serverSide';

        if (!rowModelMatches) {
            console.warn(`AG Grid: ${feature} is only available if using 'clientSide' or 'serverSide' rowModelType, you are using ${rowModelType}.`);
            return false;
        }
        return true;
    }

    private onCbSelectAll(): void {
        if (this.processingEventFromCheckbox) { return; }
        if (!this.cbSelectAllVisible) { return; }

        const value = this.cbSelectAll.getValue();
        const justFiltered = this.isFilteredOnly();
        const justCurrentPage = this.isCurrentPageOnly();

        let source: SelectionEventSourceType = 'uiSelectAll';
        if (justCurrentPage) {
            source = 'uiSelectAllCurrentPage';
        } else if (justFiltered) {
            source = 'uiSelectAllFiltered';
        }

        const params = {
            source,
            justFiltered,
            justCurrentPage,
        };
        if (value) {
            this.selectionService.selectAllRowNodes(params);
        } else {
            this.selectionService.deselectAllRowNodes(params);
        }
    }

    private isCheckboxSelection(): boolean {
        let result = this.column.getColDef().headerCheckboxSelection;

        if (typeof result === 'function') {
            const func = result as (params: HeaderCheckboxSelectionCallbackParams) => boolean;
            const params: HeaderCheckboxSelectionCallbackParams = this.gos.addGridCommonParams({
                column: this.column,
                colDef: this.column.getColDef()
            });
            result = func(params);
        }

        if (result) {
            return this.checkRightRowModelType('headerCheckboxSelection') && this.checkSelectionType('headerCheckboxSelection');
        }

        return false;
    }

    private isFilteredOnly(): boolean {
        return !!this.column.getColDef().headerCheckboxSelectionFilteredOnly;
    }

    private isCurrentPageOnly(): boolean {
        return !!this.column.getColDef().headerCheckboxSelectionCurrentPageOnly;
    }
}
