import type {
    ColumnEvent,
    ColumnNameService,
    FilterChangedEvent,
    FilterManager,
    IFloatingFilterComp,
    IFloatingFilterParams,
    UserCompDetails} from '@ag-grid-community/core';
import {
    AgInputTextField,
    AgPromise,
    Autowired,
    Column,
    Component,
    RefSelector,
    _clearElement,
} from '@ag-grid-community/core';

import { GroupFilter } from './groupFilter';

export class GroupFloatingFilterComp extends Component implements IFloatingFilterComp<GroupFilter> {
    @Autowired('columnNameService') private columnNameService: ColumnNameService;
    @Autowired('filterManager') private readonly filterManager: FilterManager;

    @RefSelector('eFloatingFilter') private readonly eFloatingFilter: HTMLElement;

    private params: IFloatingFilterParams<GroupFilter>;
    private eFloatingFilterText: AgInputTextField;
    private parentFilterInstance: GroupFilter;
    private underlyingFloatingFilter: IFloatingFilterComp | undefined;
    private showingUnderlyingFloatingFilter: boolean;
    private compDetails: UserCompDetails;
    private haveAddedColumnListeners: boolean = false;

    constructor() {
        super(/* html */ `
            <div ref="eFloatingFilter" class="ag-group-floating-filter ag-floating-filter-input" role="presentation"></div>
        `);
    }

    public init(params: IFloatingFilterParams<GroupFilter>): AgPromise<void> {
        this.params = params;

        // we only support showing the underlying floating filter for multiple group columns
        const canShowUnderlyingFloatingFilter = this.gos.get('groupDisplayType') === 'multipleColumns';

        return new AgPromise<void>((resolve) => {
            this.params.parentFilterInstance((parentFilterInstance) => {
                this.parentFilterInstance = parentFilterInstance;

                if (canShowUnderlyingFloatingFilter) {
                    this.setupUnderlyingFloatingFilterElement().then(() => resolve());
                } else {
                    this.setupReadOnlyFloatingFilterElement();
                    resolve();
                }
            });
        }).then(() => {
            this.addManagedListener(this.parentFilterInstance, GroupFilter.EVENT_SELECTED_COLUMN_CHANGED, () =>
                this.onSelectedColumnChanged()
            );
            this.addManagedListener(this.parentFilterInstance, GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED, () =>
                this.onColumnRowGroupChanged()
            );
        });
    }

    public onParamsUpdated(params: IFloatingFilterParams<GroupFilter>): void {
        this.refresh(params);
    }

    public refresh(params: IFloatingFilterParams<GroupFilter>): void {
        this.params = params;
        this.setParams();
    }

    private setParams(): void {
        const displayName = this.columnNameService.getDisplayNameForColumn(this.params.column, 'header', true);
        const translate = this.localeService.getLocaleTextFunc();
        this.eFloatingFilterText?.setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`);
    }

    private setupReadOnlyFloatingFilterElement(): void {
        if (!this.eFloatingFilterText) {
            this.eFloatingFilterText = this.createManagedBean(new AgInputTextField());

            this.eFloatingFilterText
                .setDisabled(true)
                .addGuiEventListener('click', () => this.params.showParentFilter());

            this.setParams();
        }

        this.updateDisplayedValue();

        this.eFloatingFilter.appendChild(this.eFloatingFilterText.getGui());
    }

    private setupUnderlyingFloatingFilterElement(): AgPromise<void> {
        this.showingUnderlyingFloatingFilter = false;
        this.underlyingFloatingFilter = undefined;
        _clearElement(this.eFloatingFilter);
        const column = this.parentFilterInstance.getSelectedColumn();
        // we can only show the underlying filter if there is one instance (e.g. the underlying column is not visible)
        if (column && !column.isVisible()) {
            const compDetails = this.filterManager.getFloatingFilterCompDetails(column, this.params.showParentFilter);
            if (compDetails) {
                this.compDetails = compDetails;
                if (!this.haveAddedColumnListeners) {
                    this.haveAddedColumnListeners = true;
                    this.addManagedListener(
                        column,
                        Column.EVENT_VISIBLE_CHANGED,
                        this.onColumnVisibleChanged.bind(this)
                    );
                    this.addManagedListener(column, Column.EVENT_COL_DEF_CHANGED, this.onColDefChanged.bind(this));
                }
                return compDetails.newAgStackInstance().then((floatingFilter) => {
                    this.underlyingFloatingFilter = floatingFilter;
                    this.underlyingFloatingFilter?.onParentModelChanged(
                        this.parentFilterInstance.getSelectedFilter()?.getModel()
                    );
                    this.appendChild(floatingFilter.getGui());
                    this.showingUnderlyingFloatingFilter = true;
                });
            }
        }
        // fallback to the read-only version
        this.setupReadOnlyFloatingFilterElement();
        return AgPromise.resolve();
    }

    private onColumnVisibleChanged(): void {
        this.setupUnderlyingFloatingFilterElement();
    }

    private onColDefChanged(event: ColumnEvent): void {
        if (!event.column) {
            return;
        }
        const compDetails = this.filterManager.getFloatingFilterCompDetails(event.column, this.params.showParentFilter);
        if (compDetails) {
            if (this.underlyingFloatingFilter?.refresh) {
                this.underlyingFloatingFilter.refresh(compDetails.params);
            } else {
                this.underlyingFloatingFilter?.onParamsUpdated?.(compDetails.params);
            }
        }
    }

    public onParentModelChanged(_model: null, event: FilterChangedEvent): void {
        if (this.showingUnderlyingFloatingFilter) {
            this.underlyingFloatingFilter?.onParentModelChanged(
                this.parentFilterInstance.getSelectedFilter()?.getModel(),
                event
            );
        } else {
            this.updateDisplayedValue();
        }
    }

    private updateDisplayedValue(): void {
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
        } else {
            this.eFloatingFilterText.setValue('');
        }
    }

    private onSelectedColumnChanged(): void {
        if (!this.showingUnderlyingFloatingFilter) {
            this.updateDisplayedValue();
        }
    }

    private onColumnRowGroupChanged(): void {
        if (!this.showingUnderlyingFloatingFilter) {
            this.updateDisplayedValue();
        }
    }

    public destroy(): void {
        super.destroy();
    }
}
