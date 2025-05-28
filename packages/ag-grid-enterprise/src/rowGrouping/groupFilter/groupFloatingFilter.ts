import type {
    AgColumn,
    ColumnEvent,
    ElementParams,
    FilterChangedEvent,
    FloatingFilterDisplayParams,
    IFloatingFilterComp,
    IFloatingFilterParams,
} from 'ag-grid-community';
import {
    AgInputTextField,
    AgPromise,
    Component,
    RefPlaceholder,
    _clearElement,
    _isGroupMultiAutoColumn,
} from 'ag-grid-community';

import type { GroupFilter } from './groupFilter';
import type { GroupFilterHandler } from './groupFilterHandler';

const GroupFloatingFilterElement: ElementParams = {
    tag: 'div',
    ref: 'eFloatingFilter',
    cls: 'ag-group-floating-filter ag-floating-filter-input',
    role: 'presentation',
};

export class GroupFloatingFilterComp extends Component implements IFloatingFilterComp<GroupFilter> {
    private readonly eFloatingFilter: HTMLElement = RefPlaceholder;

    private params: IFloatingFilterParams<GroupFilter>;
    private eFloatingFilterText: AgInputTextField;
    private parentFilterInstance: GroupFilter;
    private underlyingFloatingFilter: IFloatingFilterComp | undefined;
    private showingUnderlyingFloatingFilter: boolean;
    private haveAddedColumnListeners: boolean = false;

    constructor() {
        super(GroupFloatingFilterElement);
    }

    public init(params: IFloatingFilterParams<GroupFilter>): AgPromise<void> {
        this.params = params;

        // we only support showing the underlying floating filter for multiple group columns
        const canShowUnderlyingFloatingFilter = _isGroupMultiAutoColumn(this.gos);
        const onColChange = this.onColChange.bind(this);
        const setupFilterElement = (resolve: () => void) => {
            if (canShowUnderlyingFloatingFilter) {
                this.setupUnderlyingFloatingFilterElement().then(() => resolve());
            } else {
                this.setupReadOnlyFloatingFilterElement();
                resolve();
            }
        };
        if (this.gos.get('enableFilterHandlers')) {
            return new AgPromise<void>((resolve) => setupFilterElement(resolve)).then(() => {
                this.addHandlerListeners(params as any, onColChange);
            });
        } else {
            return new AgPromise<void>((resolve) => {
                this.params.parentFilterInstance((parentFilterInstance) => {
                    this.parentFilterInstance = parentFilterInstance;
                    setupFilterElement(resolve);
                });
            }).then(() => {
                this.addManagedListeners(this.parentFilterInstance, {
                    columnsChanged: onColChange,
                });
            });
        }
    }

    public refresh(params: IFloatingFilterParams<GroupFilter>): void {
        this.params = params;
        this.setParams();
        if (this.gos.get('enableFilterHandlers')) {
            if (this.showingUnderlyingFloatingFilter) {
                const column = this.getSelectedColumn()!;
                const compDetails = this.beans.colFilter!.getFloatingFilterCompDetails(
                    column,
                    this.params.showParentFilter
                );
                this.underlyingFloatingFilter?.refresh?.(compDetails?.params);
            } else {
                this.updateDisplayedValue();
            }
        }
    }

    private setParams(): void {
        const displayName = this.beans.colNames.getDisplayNameForColumn(this.params.column as AgColumn, 'header', true);
        const translate = this.getLocaleTextFunc();
        this.eFloatingFilterText?.setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`);
    }

    private addHandlerListeners(params: FloatingFilterDisplayParams, listener: () => void): void {
        const destroyFunctions = this.addManagedListeners(params.getHandler() as GroupFilterHandler, {
            selectedColumnChanged: listener,
            sourceColumnsChanged: listener,
            destroyed: () => {
                destroyFunctions.forEach((func) => func());
                // resubscribe
                this.addHandlerListeners(this.params as any, listener);
            },
        });
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
        const column = this.getSelectedColumn();
        // we can only show the underlying filter if there is one instance (e.g. the underlying column is not visible)
        if (column && !column.isVisible()) {
            const colFilter = this.beans.colFilter!;
            const compDetails = colFilter.getFloatingFilterCompDetails(column, this.params.showParentFilter);
            if (compDetails) {
                if (!this.haveAddedColumnListeners) {
                    this.haveAddedColumnListeners = true;
                    this.addManagedListeners(column, {
                        visibleChanged: this.onColumnVisibleChanged.bind(this),
                        colDefChanged: this.onColDefChanged.bind(this),
                    });
                }
                return compDetails.newAgStackInstance().then((floatingFilter) => {
                    this.underlyingFloatingFilter = floatingFilter;
                    this.underlyingFloatingFilter?.onParentModelChanged(colFilter.getModelForColumn(column));
                    this.appendChild(floatingFilter.getGui());
                    this.showingUnderlyingFloatingFilter = true;
                });
            }
        }
        // fallback to the read-only version
        this.setupReadOnlyFloatingFilterElement();
        return AgPromise.resolve();
    }

    private getSelectedColumn(): AgColumn | undefined {
        if (this.gos.get('enableFilterHandlers')) {
            const reactiveParams = this.params as unknown as FloatingFilterDisplayParams;
            return (reactiveParams.getHandler() as GroupFilterHandler).selectedColumn;
        } else {
            return this.parentFilterInstance.getSelectedColumn();
        }
    }

    private onColumnVisibleChanged(): void {
        this.setupUnderlyingFloatingFilterElement();
    }

    private onColDefChanged(event: ColumnEvent): void {
        if (!event.column) {
            return;
        }
        const compDetails = this.beans.colFilter!.getFloatingFilterCompDetails(
            event.column as AgColumn,
            this.params.showParentFilter
        );
        if (compDetails) {
            this.underlyingFloatingFilter?.refresh?.(compDetails.params);
        }
    }

    public onParentModelChanged(_model: null, event: FilterChangedEvent): void {
        if (this.showingUnderlyingFloatingFilter) {
            this.underlyingFloatingFilter?.onParentModelChanged(
                this.beans.colFilter!.getModelForColumn(this.getSelectedColumn()!),
                event
            );
        } else {
            this.updateDisplayedValue();
        }
    }

    private updateDisplayedValue(): void {
        const eFloatingFilterText = this.eFloatingFilterText;
        if (!eFloatingFilterText) {
            return;
        }
        const colFilter = this.beans.colFilter!;
        const column = this.getSelectedColumn();
        const updateText = (filterOrHandler?: { getModelAsString?: (model: any) => string } | null) => {
            if (!filterOrHandler) {
                eFloatingFilterText.setValue('');
                eFloatingFilterText.setDisplayed(false);
            } else {
                const model = column ? colFilter.getModelForColumn(column) : null;
                eFloatingFilterText.setValue(model == null ? '' : filterOrHandler.getModelAsString?.(model) ?? '');
                eFloatingFilterText.setDisplayed(true);
            }
        };
        if (this.gos.get('enableFilterHandlers')) {
            updateText(colFilter.getHandler(column!));
        } else {
            colFilter.getOrCreateFilterUi(column!)?.then((filter) => {
                updateText(filter);
            });
        }
    }

    private onColChange(): void {
        if (!this.showingUnderlyingFloatingFilter) {
            this.updateDisplayedValue();
        }
    }
}
