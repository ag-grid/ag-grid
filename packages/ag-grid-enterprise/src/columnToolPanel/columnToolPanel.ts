import type {
    AgColumn,
    BeanCollection,
    ColDef,
    ColGroupDef,
    ColumnState,
    ColumnToolPanelState,
    IColumnToolPanel,
    IToolPanelColumnCompParams,
    IToolPanelComp,
    IToolPanelParams,
} from 'ag-grid-community';
import { Component, FilterButtonComp, _addGridCommonParams, _applyColumnState, _clearElement, _last } from 'ag-grid-community';

import type { PivotDropZonePanel } from '../rowGrouping/columnDropZones/pivotDropZonePanel';
import type { RowGroupDropZonePanel } from '../rowGrouping/columnDropZones/rowGroupDropZonePanel';
import type { ValuesDropZonePanel } from '../rowGrouping/columnDropZones/valueDropZonePanel';
import { AgPrimaryCols } from './agPrimaryCols';
import { columnToolPanelCSS } from './columnToolPanel.css-GENERATED';
import type { ColumnToolPanelDeferredState } from './columnToolPanelDeferredService';
import { ColumnToolPanelDeferredService } from './columnToolPanelDeferredService';
import type { ColumnToolPanelFactory } from './columnToolPanelFactory';
import type { PivotModePanel } from './pivotModePanel';

export interface ToolPanelColumnCompParams<TData = any, TContext = any>
    extends IToolPanelParams<TData, TContext, ColumnToolPanelState>,
        IToolPanelColumnCompParams {
    onDeferredPivotColumnStateUpdate?: (stateItems: ColumnState[]) => void;
    onDeferredVisibilityColumnStateUpdate?: (stateItems: ColumnState[]) => void;
    getToolPanelPivotMode?: () => boolean;
    isColumnCheckedInToolPanel?: (column: AgColumn, pivotMode: boolean) => boolean;
    getToolPanelColumnFunctionState?: (column: AgColumn) => {
        rowGroup: boolean;
        pivot: boolean;
        value: boolean;
    };
}

export class ColumnToolPanel extends Component implements IColumnToolPanel, IToolPanelComp {
    private initialised = false;
    private params: ToolPanelColumnCompParams;

    private readonly childDestroyFuncs: (() => void)[] = [];

    private pivotModePanel?: PivotModePanel;
    private primaryColsPanel: AgPrimaryCols;
    private rowGroupDropZonePanel?: RowGroupDropZonePanel;
    private valuesDropZonePanel?: ValuesDropZonePanel;
    private pivotDropZonePanel?: PivotDropZonePanel;
    private colToolPanelFactory?: ColumnToolPanelFactory;
    private readonly deferredService = new ColumnToolPanelDeferredService();
    private deferredButtonsComp?: FilterButtonComp;

    constructor() {
        super({ tag: 'div', cls: 'ag-column-panel' });
        this.registerCSS(columnToolPanelCSS);
    }

    public wireBeans(beans: BeanCollection): void {
        this.colToolPanelFactory = beans.colToolPanelFactory as ColumnToolPanelFactory;
    }

    // lazy initialise the panel
    public override setVisible(visible: boolean): void {
        super.setDisplayed(visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    }

    public init(params: ToolPanelColumnCompParams): void {
        const defaultParams: Partial<ToolPanelColumnCompParams> = _addGridCommonParams(this.gos, {
            suppressColumnMove: false,
            suppressColumnSelectAll: false,
            suppressColumnFilter: false,
            suppressColumnExpandAll: false,
            contractColumnSelection: false,
            suppressPivotMode: false,
            suppressRowGroups: false,
            suppressValues: false,
            suppressPivots: false,
            suppressSyncLayoutWithGrid: false,
            deferApply: false,
            buttons: ['apply', 'cancel'],
        });
        const mergedParams = {
            ...defaultParams,
            ...params,
        };
        this.params = mergedParams;
        if (mergedParams.deferApply) {
            this.deferredService.initialiseFromApplied(this.getCurrentStateForDeferredMode());
            this.params.onDeferredPivotColumnStateUpdate = this.onDeferredPivotColumnStateUpdate.bind(this);
            this.params.onDeferredVisibilityColumnStateUpdate = this.onDeferredVisibilityColumnStateUpdate.bind(this);
            this.params.getToolPanelPivotMode = this.getToolPanelPivotMode.bind(this);
            this.params.isColumnCheckedInToolPanel = this.isColumnCheckedInToolPanel.bind(this);
            this.params.getToolPanelColumnFunctionState = this.getToolPanelColumnFunctionState.bind(this);
        }

        const { childDestroyFuncs, colToolPanelFactory, gos } = this;

        const hasPivotModule = gos.isModuleRegistered('SharedPivot');
        const hasRowGroupingModule = hasPivotModule || gos.isModuleRegistered('SharedRowGrouping');
        const onTogglePivotMode = mergedParams.deferApply ? this.onDeferredPivotModeToggle.bind(this) : undefined;

        if (!mergedParams.suppressPivotMode && colToolPanelFactory && hasPivotModule) {
            this.pivotModePanel = onTogglePivotMode
                ? colToolPanelFactory.createPivotModePanelWithToggleHandler(
                      this,
                      childDestroyFuncs,
                      onTogglePivotMode,
                      this.getToolPanelPivotMode.bind(this)
                  )
                : colToolPanelFactory.createPivotModePanel(this, childDestroyFuncs);
        }

        // DO NOT CHANGE TO createManagedBean
        const primaryColsPanel = this.createBean(new AgPrimaryCols());
        this.primaryColsPanel = primaryColsPanel;
        childDestroyFuncs.push(() => this.destroyBean(this.primaryColsPanel));

        primaryColsPanel.init(true, mergedParams, 'toolPanelUi');
        primaryColsPanel.addCss('ag-column-panel-column-select');
        this.appendChild(primaryColsPanel);

        if (colToolPanelFactory) {
            if (!mergedParams.suppressRowGroups && hasRowGroupingModule) {
                this.rowGroupDropZonePanel = mergedParams.deferApply
                    ? colToolPanelFactory.createRowGroupPanelWithUpdateHandler(
                          this,
                          childDestroyFuncs,
                          this.onDeferredRowGroupColumnsUpdate.bind(this),
                          this.getDeferredPendingRowGroupColumns.bind(this)
                      )
                    : colToolPanelFactory.createRowGroupPanel(this, childDestroyFuncs);
            }

            if (!mergedParams.suppressValues && hasRowGroupingModule) {
                this.valuesDropZonePanel = mergedParams.deferApply
                    ? colToolPanelFactory.createValuesPanelWithUpdateHandler(
                          this,
                          childDestroyFuncs,
                          this.onDeferredValueColumnsUpdate.bind(this),
                          this.getDeferredPendingValueColumns.bind(this),
                          this.onDeferredValueColumnAggFuncUpdate.bind(this),
                          this.getDeferredPendingAggregationFunction.bind(this)
                      )
                    : colToolPanelFactory.createValuesPanel(this, childDestroyFuncs);
            }

            if (!mergedParams.suppressPivots && hasPivotModule) {
                this.pivotDropZonePanel = mergedParams.deferApply
                    ? colToolPanelFactory.createPivotPanelWithUpdateHandler(
                          this,
                          childDestroyFuncs,
                          this.onDeferredPivotColumnsUpdate.bind(this),
                          this.getDeferredPendingPivotColumns.bind(this)
                      )
                    : colToolPanelFactory.createPivotPanel(this, childDestroyFuncs);
            }

            this.setLastVisible();
            const [pivotModeListener] = this.addManagedEventListeners({
                columnPivotModeChanged: () => {
                    this.resetChildrenHeight();
                    this.setLastVisible();
                },
            });
            childDestroyFuncs.push(() => pivotModeListener());
        }

        if (mergedParams.deferApply) {
            const [deferredSyncListener] = this.addManagedEventListeners({
                newColumnsLoaded: this.syncDeferredFromAppliedIfNoPending.bind(this),
                columnPivotModeChanged: this.syncDeferredFromAppliedIfNoPending.bind(this),
                columnRowGroupChanged: this.syncDeferredFromAppliedIfNoPending.bind(this),
                columnPivotChanged: this.syncDeferredFromAppliedIfNoPending.bind(this),
                columnValueChanged: this.syncDeferredFromAppliedIfNoPending.bind(this),
                columnVisible: this.syncDeferredFromAppliedIfNoPending.bind(this),
            });
            childDestroyFuncs.push(() => deferredSyncListener());
        }

        this.initDeferredButtonsIfNeeded();

        this.initialised = true;
    }

    public setPivotModeSectionVisible(visible: boolean): void {
        const colToolPanelFactory = this.colToolPanelFactory;
        if (!colToolPanelFactory) {
            return;
        }

        this.pivotModePanel = colToolPanelFactory.setPanelVisible(
            this.pivotModePanel,
            visible,
            this.params.deferApply
                ? colToolPanelFactory.createPivotModePanelWithToggleHandler.bind(
                      colToolPanelFactory,
                      this,
                      this.childDestroyFuncs,
                      this.onDeferredPivotModeToggle.bind(this),
                      this.getToolPanelPivotMode.bind(this),
                      true
                  )
                : colToolPanelFactory.createPivotModePanel.bind(colToolPanelFactory, this, this.childDestroyFuncs, true)
        );
        this.setLastVisible();
    }

    public setRowGroupsSectionVisible(visible: boolean): void {
        const colToolPanelFactory = this.colToolPanelFactory;
        if (!colToolPanelFactory) {
            return;
        }

        this.rowGroupDropZonePanel = colToolPanelFactory.setPanelVisible(
            this.rowGroupDropZonePanel,
            visible,
            this.params.deferApply
                ? colToolPanelFactory.createRowGroupPanelWithUpdateHandler.bind(
                      colToolPanelFactory,
                      this,
                      this.childDestroyFuncs,
                      this.onDeferredRowGroupColumnsUpdate.bind(this),
                      this.getDeferredPendingRowGroupColumns.bind(this)
                  )
                : colToolPanelFactory.createRowGroupPanel.bind(colToolPanelFactory, this, this.childDestroyFuncs)
        );
        this.setLastVisible();
    }

    public setValuesSectionVisible(visible: boolean): void {
        const colToolPanelFactory = this.colToolPanelFactory;
        if (!colToolPanelFactory) {
            return;
        }

        this.valuesDropZonePanel = colToolPanelFactory.setPanelVisible(
            this.valuesDropZonePanel,
            visible,
            this.params.deferApply
                ? colToolPanelFactory.createValuesPanelWithUpdateHandler.bind(
                      colToolPanelFactory,
                      this,
                      this.childDestroyFuncs,
                      this.onDeferredValueColumnsUpdate.bind(this),
                      this.getDeferredPendingValueColumns.bind(this),
                      this.onDeferredValueColumnAggFuncUpdate.bind(this),
                      this.getDeferredPendingAggregationFunction.bind(this)
                  )
                : colToolPanelFactory.createValuesPanel.bind(colToolPanelFactory, this, this.childDestroyFuncs)
        );
        this.setLastVisible();
    }

    public setPivotSectionVisible(visible: boolean): void {
        const colToolPanelFactory = this.colToolPanelFactory;
        if (!colToolPanelFactory) {
            return;
        }

        this.pivotDropZonePanel = colToolPanelFactory.setPanelVisible(
            this.pivotDropZonePanel,
            visible,
            this.params.deferApply
                ? colToolPanelFactory.createPivotPanelWithUpdateHandler.bind(
                      colToolPanelFactory,
                      this,
                      this.childDestroyFuncs,
                      this.onDeferredPivotColumnsUpdate.bind(this),
                      this.getDeferredPendingPivotColumns.bind(this)
                  )
                : colToolPanelFactory.createPivotPanel.bind(colToolPanelFactory, this, this.childDestroyFuncs)
        );
        this.pivotDropZonePanel?.setDisplayed(visible);
        this.setLastVisible();
    }

    private setResizers(): void {
        for (const panel of [
            this.primaryColsPanel,
            this.rowGroupDropZonePanel,
            this.valuesDropZonePanel,
            this.pivotDropZonePanel,
        ]) {
            if (!panel) {
                continue;
            }
            const eGui = panel.getGui();
            panel.toggleResizable(
                !eGui.classList.contains('ag-last-column-drop') && !eGui.classList.contains('ag-hidden')
            );
        }
    }

    private setLastVisible(): void {
        const eGui = this.getGui();

        const columnDrops: HTMLElement[] = Array.prototype.slice.call(eGui.querySelectorAll('.ag-column-drop'));

        for (const columnDrop of columnDrops) {
            columnDrop.classList.remove('ag-last-column-drop');
        }

        const columnDropEls = eGui.querySelectorAll('.ag-column-drop:not(.ag-hidden)');
        const lastVisible = _last(columnDropEls) as HTMLElement;

        if (lastVisible) {
            lastVisible.classList.add('ag-last-column-drop');
        }

        this.setResizers();
    }

    private resetChildrenHeight(): void {
        const eGui = this.getGui();
        const children = eGui.children;

        for (let i = 0; i < children.length; i++) {
            const { style } = children[i] as HTMLElement;
            style.removeProperty('height');
            style.removeProperty('flex');
        }
    }

    public expandColumnGroups(groupIds?: string[]): void {
        this.primaryColsPanel.expandGroups(groupIds);
    }

    public collapseColumnGroups(groupIds?: string[]): void {
        this.primaryColsPanel.collapseGroups(groupIds);
    }

    public setColumnLayout(colDefs: (ColDef | ColGroupDef)[]): void {
        this.primaryColsPanel.setColumnLayout(colDefs);
    }

    public syncLayoutWithGrid(): void {
        this.primaryColsPanel.syncLayoutWithGrid();
    }

    public destroyChildren(): void {
        const childDestroyFuncs = this.childDestroyFuncs;
        for (const func of childDestroyFuncs) {
            func();
        }
        childDestroyFuncs.length = 0;
        _clearElement(this.getGui());
    }

    public refresh(params: ToolPanelColumnCompParams): boolean {
        this.destroyChildren();
        this.init(params);
        if (this.params.deferApply) {
            this.deferredService.reconcileFromApplied(this.getCurrentStateForDeferredMode());
        }
        return true;
    }

    private getCurrentStateForDeferredMode(): ColumnToolPanelDeferredState {
        const { colModel, rowGroupColsSvc, pivotColsSvc, valueColsSvc } = this.beans;
        const colDefCols = colModel.getColDefCols() ?? [];
        return {
            pivotMode: colModel.isPivotMode(),
            rowGroupColIds: rowGroupColsSvc?.columns.map((col) => col.getColId()) ?? [],
            pivotColIds: pivotColsSvc?.columns.map((col) => col.getColId()) ?? [],
            valueCols: (valueColsSvc?.columns ?? []).map((col) => ({
                colId: col.getColId(),
                aggFunc: col.getAggFunc() ?? null,
            })),
            visibleColIds: colDefCols.filter((col) => col.isVisible()).map((col) => col.getColId()),
        };
    }

    private onDeferredPivotModeToggle(newValue: boolean): boolean {
        const pendingState = this.deferredService.getPendingState();
        pendingState.pivotMode = newValue;
        this.deferredService.setPendingState(pendingState);
        this.primaryColsPanel?.syncLayoutWithGrid();
        this.refreshDeferredButtonsState();
        return true;
    }

    private onDeferredPivotColumnStateUpdate(stateItems: ColumnState[]): void {
        this.deferredService.applyPivotColumnStateToPending(stateItems);
        this.primaryColsPanel?.syncLayoutWithGrid();
        this.refreshDeferredButtonsState();
    }

    private onDeferredVisibilityColumnStateUpdate(stateItems: ColumnState[]): void {
        this.deferredService.applyVisibilityColumnStateToPending(stateItems);
        this.primaryColsPanel?.syncLayoutWithGrid();
        this.refreshDeferredButtonsState();
    }

    private onDeferredRowGroupColumnsUpdate(columns: AgColumn[]): boolean {
        this.deferredService.setPendingRowGroupColumns(columns.map((column) => column.getColId()));
        this.primaryColsPanel?.syncLayoutWithGrid();
        this.refreshDeferredButtonsState();
        return true;
    }

    private onDeferredPivotColumnsUpdate(columns: AgColumn[]): boolean {
        this.deferredService.setPendingPivotColumns(columns.map((column) => column.getColId()));
        this.primaryColsPanel?.syncLayoutWithGrid();
        this.refreshDeferredButtonsState();
        return true;
    }

    private onDeferredValueColumnsUpdate(columns: AgColumn[]): boolean {
        const pendingAggFuncMap = new Map(
            this.deferredService.getPendingState().valueCols.map((valueCol) => [valueCol.colId, valueCol.aggFunc] as const)
        );
        this.deferredService.setPendingValueColumns(
            columns.map((column) => ({
                colId: column.getColId(),
                aggFunc: pendingAggFuncMap.get(column.getColId()) ?? column.getAggFunc() ?? null,
            }))
        );
        this.primaryColsPanel?.syncLayoutWithGrid();
        this.refreshDeferredButtonsState();
        return true;
    }

    private onDeferredValueColumnAggFuncUpdate(column: AgColumn, aggFunc: string): boolean {
        const pendingState = this.deferredService.getPendingState();
        const colId = column.getColId();
        const existing = pendingState.valueCols.find((valueCol) => valueCol.colId === colId);
        if (existing) {
            existing.aggFunc = aggFunc;
        } else {
            pendingState.valueCols.push({ colId, aggFunc });
        }
        this.deferredService.setPendingState(pendingState);
        this.valuesDropZonePanel?.refreshGui();
        this.refreshDeferredButtonsState();
        return true;
    }

    private getDeferredPendingRowGroupColumns(): AgColumn[] {
        return this.getColumnsByColIds(this.deferredService.getPendingState().rowGroupColIds);
    }

    private getDeferredPendingPivotColumns(): AgColumn[] {
        return this.getColumnsByColIds(this.deferredService.getPendingState().pivotColIds);
    }

    private getDeferredPendingValueColumns(): AgColumn[] {
        return this.getColumnsByColIds(this.deferredService.getPendingState().valueCols.map((valueCol) => valueCol.colId));
    }

    private getDeferredPendingAggregationFunction(column: AgColumn): string | null | undefined {
        const valueCol = this.deferredService
            .getPendingState()
            .valueCols.find((pendingValueCol) => pendingValueCol.colId === column.getColId());
        return typeof valueCol?.aggFunc === 'string' ? valueCol.aggFunc : null;
    }

    private getColumnsByColIds(colIds: string[]): AgColumn[] {
        const { colModel } = this.beans;
        return colIds
            .map((colId) => colModel.getColDefCol(colId))
            .filter((column): column is AgColumn => !!column);
    }

    private syncDeferredFromAppliedIfNoPending(): void {
        if (this.deferredService.hasPendingChanges()) {
            return;
        }
        this.deferredService.reconcileFromApplied(this.getCurrentStateForDeferredMode());
        this.refreshDeferredButtonsState();
    }

    private getToolPanelPivotMode(): boolean {
        return this.params.deferApply ? this.deferredService.getPendingState().pivotMode : this.beans.colModel.isPivotMode();
    }

    private isColumnCheckedInToolPanel(column: AgColumn, pivotMode: boolean): boolean {
        if (!this.params.deferApply) {
            if (pivotMode) {
                return column.isPivotActive() || column.isRowGroupActive() || column.isValueActive();
            }
            return column.isVisible();
        }

        if (!this.deferredService.hasPendingChanges()) {
            if (pivotMode) {
                return column.isPivotActive() || column.isRowGroupActive() || column.isValueActive();
            }
            return column.isVisible();
        }

        const pendingState = this.deferredService.getPendingState();
        const colId = column.getColId();
        if (pivotMode) {
            return (
                pendingState.pivotColIds.includes(colId) ||
                pendingState.rowGroupColIds.includes(colId) ||
                pendingState.valueCols.some((valueCol) => valueCol.colId === colId)
            );
        }
        return pendingState.visibleColIds.includes(colId);
    }

    private getToolPanelColumnFunctionState(column: AgColumn): { rowGroup: boolean; pivot: boolean; value: boolean } {
        if (!this.params.deferApply || !this.deferredService.hasPendingChanges()) {
            return {
                rowGroup: column.isRowGroupActive(),
                pivot: column.isPivotActive(),
                value: column.isValueActive(),
            };
        }

        const pendingState = this.deferredService.getPendingState();
        const colId = column.getColId();
        return {
            rowGroup: pendingState.rowGroupColIds.includes(colId),
            pivot: pendingState.pivotColIds.includes(colId),
            value: pendingState.valueCols.some((valueCol) => valueCol.colId === colId),
        };
    }

    private initDeferredButtonsIfNeeded(): void {
        if (!this.params.deferApply || !this.params.buttons?.length) {
            return;
        }

        const buttonComp = this.createBean(new FilterButtonComp({ className: 'ag-column-panel-buttons' }));
        this.deferredButtonsComp = buttonComp;

        const localeTextFunc = this.getLocaleTextFunc();
        const buttons = this.params.buttons.map((type) => ({
            type,
            label: localeTextFunc(type === 'apply' ? 'applyFilter' : 'cancelFilter', type === 'apply' ? 'Apply' : 'Cancel'),
        }));
        buttonComp.updateButtons(buttons);
        this.appendChild(buttonComp);

        this.addManagedListeners(buttonComp, {
            apply: this.onDeferredApply.bind(this),
            cancel: this.onDeferredCancel.bind(this),
        });

        this.childDestroyFuncs.push(() => {
            if (this.deferredButtonsComp) {
                this.deferredButtonsComp = this.destroyBean(this.deferredButtonsComp);
            }
        });

        this.refreshDeferredButtonsState();
    }

    private refreshDeferredButtonsState(): void {
        this.deferredButtonsComp?.updateValidity(this.deferredService.hasPendingChanges());
    }

    private onDeferredApply(): void {
        const pendingState = this.deferredService.getPendingState();
        this.applyDeferredState(pendingState);
        this.deferredService.reconcileFromApplied(this.getCurrentStateForDeferredMode());
        this.refreshDeferredButtonsState();
    }

    private onDeferredCancel(): void {
        this.deferredService.cancelPending();
        this.refresh(this.params);
    }

    private applyDeferredState(state: ColumnToolPanelDeferredState): void {
        const { colModel, gos, ctrlsSvc } = this.beans;
        if (colModel.isPivotMode() !== state.pivotMode) {
            gos.updateGridOptions({ options: { pivotMode: state.pivotMode }, source: 'toolPanelUi' as any });
            for (const ctrl of ctrlsSvc.getHeaderRowContainerCtrls()) {
                ctrl.refresh();
            }
        }

        const allColumns = colModel.getColDefCols() ?? [];
        const rowGroupIndexMap = new Map(state.rowGroupColIds.map((colId, index) => [colId, index] as const));
        const pivotIndexMap = new Map(state.pivotColIds.map((colId, index) => [colId, index] as const));
        const valueAggMap = new Map(state.valueCols.map((valueCol) => [valueCol.colId, valueCol.aggFunc] as const));
        const visibleColIdSet = new Set(state.visibleColIds);

        const columnState: ColumnState[] = allColumns.map((column) => {
                const colId = column.getColId();
                const rowGroupIndex = rowGroupIndexMap.get(colId);
                const pivotIndex = pivotIndexMap.get(colId);
                const aggFunc = valueAggMap.has(colId) ? valueAggMap.get(colId)! : null;
                return {
                    colId,
                    rowGroup: rowGroupIndex != null,
                    rowGroupIndex: rowGroupIndex ?? null,
                    pivot: pivotIndex != null,
                    pivotIndex: pivotIndex ?? null,
                    aggFunc,
                    hide: !visibleColIdSet.has(colId),
                };
            });

        _applyColumnState(this.beans, { state: columnState }, 'toolPanelUi');

        // Preserve deferred value column ordering (aggregation order) from the tool panel state.
        const valueColumnsInOrder = this.getColumnsByColIds(state.valueCols.map((valueCol) => valueCol.colId));
        this.beans.valueColsSvc?.setColumns(valueColumnsInOrder, 'toolPanelUi');
    }

    public getState(): ColumnToolPanelState {
        return {
            expandedGroupIds: this.primaryColsPanel.getExpandedGroups(),
        };
    }

    public override destroy(): void {
        this.destroyChildren();
        super.destroy();
    }
}
