import { IDoesFilterPassParams, SetFilterParams, ProvidedFilter, IAfterGuiAttachedParams, AgPromise, ISetFilter, SetFilterModel, SetFilterModelValue } from 'ag-grid-community';
import { SetValueModel } from './setValueModel';
/** @param V type of value in the Set Filter */
export declare class SetFilter<V = string> extends ProvidedFilter<SetFilterModel, V> implements ISetFilter<V> {
    private readonly eMiniFilter;
    private readonly eFilterLoading;
    private readonly eSetFilterList;
    private readonly eNoMatches;
    private readonly valueFormatterService;
    private readonly columnModel;
    private readonly valueService;
    private valueModel;
    private setFilterParams;
    private virtualList;
    private positionableFeature;
    private caseSensitive;
    private convertValuesToStrings;
    private treeDataTreeList;
    private getDataPath?;
    private groupingTreeList;
    private hardRefreshVirtualList;
    private appliedModelKeys;
    private noAppliedModelKeys;
    private createKey;
    private valueFormatter;
    constructor();
    protected postConstruct(): void;
    protected updateUiVisibility(): void;
    protected createBodyTemplate(): string;
    protected handleKeyDown(e: KeyboardEvent): void;
    private handleKeySpace;
    private handleKeyEnter;
    private handleKeyLeft;
    private handleKeyRight;
    private getComponentForKeyEvent;
    protected getCssIdentifier(): string;
    setModel(model: SetFilterModel | null): AgPromise<void>;
    private setModelAndRefresh;
    protected resetUiToDefaults(): AgPromise<void>;
    protected setModelIntoUi(model: SetFilterModel | null): AgPromise<void>;
    getModelFromUi(): SetFilterModel | null;
    getFilterType(): 'set';
    getValueModel(): SetValueModel<V> | null;
    protected areModelsEqual(a: SetFilterModel, b: SetFilterModel): boolean;
    setParams(params: SetFilterParams<any, V>): void;
    private setValueFormatter;
    private generateCreateKey;
    getFormattedValue(key: string | null): string | null;
    private applyExcelModeOptions;
    private addEventListenersForDataChanges;
    private syncAfterDataChange;
    private setIsLoading;
    private initialiseFilterBodyUi;
    private initVirtualList;
    private getSelectAllLabel;
    private createSetListItem;
    private updateSetListItem;
    private isSelectedExpanded;
    private isSetFilterModelTreeItem;
    private initMiniFilter;
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    applyModel(): boolean;
    protected isModelValid(model: SetFilterModel): boolean;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    private doesFilterPassForConvertValuesToString;
    private doesFilterPassForTreeData;
    private doesFilterPassForGrouping;
    private checkMakeNullDataPath;
    private isInAppliedModel;
    private getValueFromNode;
    private getKeyCreatorParams;
    onNewRowsLoaded(): void;
    private isValuesTakenFromGrid;
    /**
     * Public method provided so the user can change the value of the filter once
     * the filter has been already started
     * @param values The values to use.
     */
    setFilterValues(values: (V | null)[]): void;
    /**
     * Public method provided so the user can reset the values of the filter once that it has started.
     */
    resetFilterValues(): void;
    refreshFilterValues(): void;
    onAnyFilterChanged(): void;
    private onMiniFilterInput;
    private updateUiAfterMiniFilterChange;
    private showOrHideResults;
    private resetUiToActiveModel;
    private onMiniFilterKeyPress;
    private filterOnAllVisibleValues;
    private focusRowIfAlive;
    private onSelectAll;
    private onGroupItemSelected;
    private onItemSelected;
    private selectItem;
    private onExpandAll;
    private onExpandedChanged;
    private refreshAfterExpansion;
    private refreshAfterSelection;
    setMiniFilter(newMiniFilter: string | null): void;
    getMiniFilter(): string | null;
    private refresh;
    getFilterKeys(): SetFilterModelValue;
    getFilterValues(): (V | null)[];
    getValues(): SetFilterModelValue;
    refreshVirtualList(): void;
    private translateForSetFilter;
    private isSelectAllSelected;
    private areAllChildrenSelected;
    destroy(): void;
    private caseFormat;
    private resetExpansion;
}
