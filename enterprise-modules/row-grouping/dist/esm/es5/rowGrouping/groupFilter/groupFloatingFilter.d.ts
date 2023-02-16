import { AgPromise, Component, FilterChangedEvent, IFloatingFilterComp, IFloatingFilterParams } from '@ag-grid-community/core';
import { GroupFilter } from './groupFilter';
export declare class GroupFloatingFilterComp extends Component implements IFloatingFilterComp<GroupFilter> {
    private readonly columnModel;
    private readonly filterManager;
    private readonly eFloatingFilter;
    private params;
    private eFloatingFilterText;
    private parentFilterInstance;
    private underlyingFloatingFilter;
    private showingUnderlyingFloatingFilter;
    private columnVisibleChangedListener;
    constructor();
    init(params: IFloatingFilterParams<GroupFilter>): AgPromise<void>;
    private setupReadOnlyFloatingFilterElement;
    private setupUnderlyingFloatingFilterElement;
    private onColumnVisibleChanged;
    onParentModelChanged(_model: null, event: FilterChangedEvent): void;
    private updateDisplayedValue;
    private onSelectedColumnChanged;
    private onColumnRowGroupChanged;
    destroy(): void;
}
