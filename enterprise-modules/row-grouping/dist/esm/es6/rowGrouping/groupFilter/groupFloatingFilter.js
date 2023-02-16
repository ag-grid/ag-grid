var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgInputTextField, AgPromise, Autowired, Column, Component, RefSelector, } from '@ag-grid-community/core';
import { GroupFilter } from './groupFilter';
export class GroupFloatingFilterComp extends Component {
    constructor() {
        super(/* html */ `
            <div ref="eFloatingFilter" class="ag-group-floating-filter ag-floating-filter-input" role="presentation"></div>
        `);
    }
    init(params) {
        this.params = params;
        // we only support showing the underlying floating filter for multiple group columns
        const canShowUnderlyingFloatingFilter = this.gridOptionsService.get('groupDisplayType') === 'multipleColumns';
        return new AgPromise(resolve => {
            this.params.parentFilterInstance(parentFilterInstance => {
                this.parentFilterInstance = parentFilterInstance;
                if (canShowUnderlyingFloatingFilter) {
                    this.setupUnderlyingFloatingFilterElement().then(() => resolve());
                }
                else {
                    this.setupReadOnlyFloatingFilterElement();
                    resolve();
                }
            });
        }).then(() => {
            this.addManagedListener(this.parentFilterInstance, GroupFilter.EVENT_SELECTED_COLUMN_CHANGED, () => this.onSelectedColumnChanged());
            this.addManagedListener(this.parentFilterInstance, GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.onColumnRowGroupChanged());
        });
        ;
    }
    setupReadOnlyFloatingFilterElement() {
        if (!this.eFloatingFilterText) {
            this.eFloatingFilterText = this.createManagedBean(new AgInputTextField());
            const displayName = this.columnModel.getDisplayNameForColumn(this.params.column, 'header', true);
            const translate = this.localeService.getLocaleTextFunc();
            this.eFloatingFilterText
                .setDisabled(true)
                .setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`)
                .addGuiEventListener('click', () => this.params.showParentFilter());
        }
        this.updateDisplayedValue();
        this.eFloatingFilter.appendChild(this.eFloatingFilterText.getGui());
    }
    setupUnderlyingFloatingFilterElement() {
        this.showingUnderlyingFloatingFilter = false;
        this.underlyingFloatingFilter = undefined;
        _.clearElement(this.eFloatingFilter);
        const column = this.parentFilterInstance.getSelectedColumn();
        // we can only show the underlying filter if there is one instance (e.g. the underlying column is not visible)
        if (column && !column.isVisible()) {
            const compDetails = this.filterManager.getFloatingFilterCompDetails(column, this.params.showParentFilter);
            if (compDetails) {
                if (!this.columnVisibleChangedListener) {
                    this.columnVisibleChangedListener = this.addManagedListener(column, Column.EVENT_VISIBLE_CHANGED, this.onColumnVisibleChanged.bind(this));
                }
                return compDetails.newAgStackInstance().then(floatingFilter => {
                    var _a, _b;
                    this.underlyingFloatingFilter = floatingFilter;
                    (_a = this.underlyingFloatingFilter) === null || _a === void 0 ? void 0 : _a.onParentModelChanged((_b = this.parentFilterInstance.getSelectedFilter()) === null || _b === void 0 ? void 0 : _b.getModel());
                    this.appendChild(floatingFilter.getGui());
                    this.showingUnderlyingFloatingFilter = true;
                });
            }
        }
        // fallback to the read-only version
        this.setupReadOnlyFloatingFilterElement();
        return AgPromise.resolve();
    }
    onColumnVisibleChanged() {
        this.setupUnderlyingFloatingFilterElement();
    }
    onParentModelChanged(_model, event) {
        var _a, _b;
        if (this.showingUnderlyingFloatingFilter) {
            (_a = this.underlyingFloatingFilter) === null || _a === void 0 ? void 0 : _a.onParentModelChanged((_b = this.parentFilterInstance.getSelectedFilter()) === null || _b === void 0 ? void 0 : _b.getModel(), event);
        }
        else {
            this.updateDisplayedValue();
        }
    }
    updateDisplayedValue() {
        if (!this.parentFilterInstance || !this.eFloatingFilterText) {
            return;
        }
        const selectedFilter = this.parentFilterInstance.getSelectedFilter();
        if (!selectedFilter) {
            this.eFloatingFilterText.setValue('');
            this.eFloatingFilterText.setDisplayed(false);
            return;
        }
        this.eFloatingFilterText.setDisplayed(true);
        if (selectedFilter.getModelAsString) {
            const filterModel = selectedFilter.getModel();
            this.eFloatingFilterText.setValue(filterModel == null ? '' : selectedFilter.getModelAsString(filterModel));
        }
        else {
            this.eFloatingFilterText.setValue('');
        }
    }
    onSelectedColumnChanged() {
        if (!this.showingUnderlyingFloatingFilter) {
            this.updateDisplayedValue();
        }
    }
    onColumnRowGroupChanged() {
        if (!this.showingUnderlyingFloatingFilter) {
            this.updateDisplayedValue();
        }
    }
    destroy() {
        super.destroy();
    }
}
__decorate([
    Autowired('columnModel')
], GroupFloatingFilterComp.prototype, "columnModel", void 0);
__decorate([
    Autowired('filterManager')
], GroupFloatingFilterComp.prototype, "filterManager", void 0);
__decorate([
    RefSelector('eFloatingFilter')
], GroupFloatingFilterComp.prototype, "eFloatingFilter", void 0);
