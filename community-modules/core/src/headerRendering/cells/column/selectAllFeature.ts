import { isColumnControlCol } from '../../../columns/columnUtils';
import { BeanStub } from '../../../context/beanStub';
import type { BeanCollection } from '../../../context/context';
import type { AgColumn } from '../../../entities/agColumn';
import type { SelectionEventSourceType } from '../../../events';
import type { IRowModel } from '../../../interfaces/iRowModel';
import type { ISelectionService } from '../../../interfaces/iSelectionService';
import { _setAriaHidden, _setAriaRole } from '../../../utils/aria';
import { _warnOnce } from '../../../utils/function';
import { AgCheckbox } from '../../../widgets/agCheckbox';
import type { HeaderCellCtrl } from './headerCellCtrl';

export class SelectAllFeature extends BeanStub {
    private rowModel: IRowModel;
    private selectionService: ISelectionService;

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel;
        this.selectionService = beans.selectionService;
    }

    private cbSelectAllVisible = false;
    private processingEventFromCheckbox = false;
    private column: AgColumn;
    private headerCellCtrl: HeaderCellCtrl;

    private cbSelectAll: AgCheckbox;

    constructor(column: AgColumn) {
        super();
        this.column = column;
    }

    /**
     * Select all is enabled by default when using the legacy selection API.
     * When using the new selection API, select all is only enabled for the checkbox column
     */
    private isEnabled(): boolean {
        return this.gos.get('selectionOptions') === undefined || isColumnControlCol(this.column);
    }

    public onSpaceKeyDown(e: KeyboardEvent): void {
        if (!this.isEnabled()) {
            return;
        }

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
        _setAriaRole(this.cbSelectAll.getGui(), 'presentation');
        this.showOrHideSelectAll();

        this.addManagedEventListeners({
            newColumnsLoaded: this.onNewColumnsLoaded.bind(this),
            displayedColumnsChanged: this.onDisplayedColumnsChanged.bind(this),
            selectionChanged: this.onSelectionChanged.bind(this),
            paginationChanged: this.onSelectionChanged.bind(this),
            modelUpdated: this.onModelChanged.bind(this),
        });

        this.addManagedListeners(this.cbSelectAll, { fieldValueChanged: this.onCbSelectAll.bind(this) });
        _setAriaHidden(this.cbSelectAll.getGui(), true);
        this.cbSelectAll.getInputElement().setAttribute('tabindex', '-1');
        this.refreshSelectAllLabel();
    }

    private onNewColumnsLoaded(): void {
        this.showOrHideSelectAll();
    }

    private onDisplayedColumnsChanged(): void {
        if (!this.isAlive()) {
            return;
        }
        this.showOrHideSelectAll();
    }

    private showOrHideSelectAll(): void {
        this.cbSelectAllVisible = this.isEnabled() && this.isCheckboxSelection();
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
        if (!this.cbSelectAllVisible) {
            return;
        }
        this.updateStateOfCheckbox();
    }

    private onSelectionChanged(): void {
        if (!this.cbSelectAllVisible) {
            return;
        }
        this.updateStateOfCheckbox();
    }

    private updateStateOfCheckbox(): void {
        if (this.processingEventFromCheckbox) {
            return;
        }

        this.processingEventFromCheckbox = true;

        const allSelected = this.selectionService.getSelectAllState(this.isFilteredOnly(), this.isCurrentPageOnly());

        this.cbSelectAll.setValue(allSelected!);
        const hasNodesToSelect = this.selectionService.hasNodesToSelect(
            this.isFilteredOnly(),
            this.isCurrentPageOnly()
        );
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
        const isMultiSelect = this.gos.getLegacySelectionOption('rowSelection') === 'multiple';

        if (!isMultiSelect) {
            _warnOnce(`${feature} is only available if using 'multiple' rowSelection.`);
            return false;
        }
        return true;
    }

    private checkRightRowModelType(feature: string): boolean {
        const rowModelType = this.rowModel.getType();
        const rowModelMatches = rowModelType === 'clientSide' || rowModelType === 'serverSide';

        if (!rowModelMatches) {
            _warnOnce(
                `${feature} is only available if using 'clientSide' or 'serverSide' rowModelType, you are using ${rowModelType}.`
            );
            return false;
        }
        return true;
    }

    private onCbSelectAll(): void {
        if (this.processingEventFromCheckbox) {
            return;
        }
        if (!this.cbSelectAllVisible) {
            return;
        }

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
        if (!this.isEnabled()) {
            return false;
        }

        const so = this.gos.get('selectionOptions');
        if (so !== undefined) {
            // handle new options
            if (so?.mode !== 'multiRow') {
                return false;
            }

            if (typeof so.headerCheckbox === 'boolean') {
                return so.headerCheckbox;
            }

            const result =
                so.headerCheckbox?.(
                    this.gos.addGridCommonParams({
                        column: this.column,
                        colDef: this.column.getColDef(),
                    })
                ) ?? false;

            return (
                result &&
                this.checkSelectionType('Header checkbox selection') &&
                this.checkRightRowModelType('Header checkbox selection')
            );
        } else {
            // handle legacy options
            const headerCheckboxSelection = this.column.getColDef().headerCheckboxSelection;
            let result = false;

            if (typeof headerCheckboxSelection === 'function') {
                result = headerCheckboxSelection(
                    this.gos.addGridCommonParams({
                        column: this.column,
                        colDef: this.column.getColDef(),
                    })
                );
            } else {
                result = !!headerCheckboxSelection;
            }

            if (result) {
                return (
                    this.checkRightRowModelType('headerCheckboxSelection') &&
                    this.checkSelectionType('headerCheckboxSelection')
                );
            }

            return false;
        }
    }

    private isFilteredOnly(): boolean {
        if (!this.isEnabled()) {
            return false;
        }

        const so = this.gos.get('selectionOptions');
        return so !== undefined
            ? so.mode === 'multiRow' && so.selectAll === 'filtered'
            : !!this.column.getColDef().headerCheckboxSelectionFilteredOnly;
    }

    private isCurrentPageOnly(): boolean {
        if (!this.isEnabled()) {
            return false;
        }

        const so = this.gos.get('selectionOptions');
        return so !== undefined
            ? so.mode === 'multiRow' && so.selectAll === 'currentPage'
            : !!this.column.getColDef().headerCheckboxSelectionCurrentPageOnly;
    }
}
