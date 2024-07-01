import type { BeanCollection, FilterChangedEvent, IFloatingFilterComp, IFloatingFilterParams } from 'ag-grid-community';
import { AgPromise, Component } from 'ag-grid-community';
import type { GroupFilter } from './groupFilter';
export declare class GroupFloatingFilterComp extends Component implements IFloatingFilterComp<GroupFilter> {
    private columnNameService;
    private filterManager?;
    wireBeans(beans: BeanCollection): void;
    private readonly eFloatingFilter;
    private params;
    private eFloatingFilterText;
    private parentFilterInstance;
    private underlyingFloatingFilter;
    private showingUnderlyingFloatingFilter;
    private haveAddedColumnListeners;
    constructor();
    init(params: IFloatingFilterParams<GroupFilter>): AgPromise<void>;
    onParamsUpdated(params: IFloatingFilterParams<GroupFilter>): void;
    refresh(params: IFloatingFilterParams<GroupFilter>): void;
    private setParams;
    private setupReadOnlyFloatingFilterElement;
    private setupUnderlyingFloatingFilterElement;
    private onColumnVisibleChanged;
    private onColDefChanged;
    onParentModelChanged(_model: null, event: FilterChangedEvent): void;
    private updateDisplayedValue;
    private onSelectedColumnChanged;
    private onColumnRowGroupChanged;
    destroy(): void;
}
