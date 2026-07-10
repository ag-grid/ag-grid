import { _areEqual, _clearElement, _last } from 'ag-stack';

import type {
    BeanCollection,
    ColAggFunc,
    ColDef,
    ColGroupDef,
    ColumnToolPanelAction,
    ColumnToolPanelState,
    IColumnToolPanel,
    IToolPanelColumnCompParams,
    IToolPanelComp,
    IToolPanelParams,
} from 'ag-grid-community';
import { Component, FilterButtonComp, _addGridCommonParams } from 'ag-grid-community';

import type { PivotDropZonePanel } from '../rowGrouping/columnDropZones/pivotDropZonePanel';
import type { RowGroupDropZonePanel } from '../rowGrouping/columnDropZones/rowGroupDropZonePanel';
import type { ValuesDropZonePanel } from '../rowGrouping/columnDropZones/valueDropZonePanel';
import { AgPrimaryCols } from './agPrimaryCols';
import columnToolPanelCSS from './columnToolPanel.css';
import type { ColumnToolPanelFactory } from './columnToolPanelFactory';
import type { PivotModePanel } from './pivotModePanel';
import { isDeferredMode } from './toolPanelDeferredUiUtils';

export interface ToolPanelColumnCompParams<TData = any, TContext = any>
    extends IToolPanelParams<TData, TContext, ColumnToolPanelState>, IToolPanelColumnCompParams {}

/** Captures full grid state for no-op detection (includes width to distinguish from resize). */
interface GridStateSnapshot {
    rowGroupColIds: string[];
    valueColIds: string[];
    pivotColIds: string[];
    pivotMode: boolean;
    columnOrder: string[];
    visibleColIds: string[];
    sortState: string[];
    aggFuncState: ColAggFunc[];
    widthState: string[];
}

const DEFERRED_TOOL_PANEL_CLASS = 'ag-column-panel-deferred';

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
    private deferredButtonsComp?: FilterButtonComp;
    private isDeferModeEnabled = false;
    private isCommitting = false;
    private lastKnownGridState?: GridStateSnapshot;

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
        });
        const mergedParams = {
            ...defaultParams,
            ...params,
        };
        this.params = mergedParams;

        const { childDestroyFuncs, colToolPanelFactory, gos } = this;

        const hasPivotModule = gos.isModuleRegistered('SharedPivot');
        const hasRowGroupingModule = hasPivotModule || gos.isModuleRegistered('SharedRowGrouping');

        this.isDeferModeEnabled = isDeferredMode(mergedParams);
        this.toggleCss(DEFERRED_TOOL_PANEL_CLASS, this.isDeferModeEnabled);

        if (!mergedParams.suppressPivotMode && colToolPanelFactory && hasPivotModule) {
            this.pivotModePanel = colToolPanelFactory.createPivotModePanel(
                this,
                childDestroyFuncs,
                mergedParams,
                this.onPivotModePanelValueChanged
            );
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
                this.rowGroupDropZonePanel = colToolPanelFactory.createRowGroupPanel(
                    this,
                    childDestroyFuncs,
                    mergedParams
                );
            }

            if (!mergedParams.suppressValues && hasRowGroupingModule) {
                this.valuesDropZonePanel = colToolPanelFactory.createValuesPanel(this, childDestroyFuncs, mergedParams);
            }

            if (!mergedParams.suppressPivots && hasPivotModule) {
                this.pivotDropZonePanel = colToolPanelFactory.createPivotPanel(this, childDestroyFuncs, mergedParams);
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

        if (this.isDeferModeEnabled) {
            const resetListener = this.onExternalGridChange;

            childDestroyFuncs.push(
                ...this.addManagedEventListeners({
                    columnEverythingChanged: this.onColumnEverythingChanged,
                    sortChanged: resetListener,
                    columnVisible: resetListener,
                    columnRowGroupChanged: resetListener,
                    columnValueChanged: resetListener,
                    columnPivotChanged: resetListener,
                    columnPivotModeChanged: resetListener,
                    newColumnsLoaded: resetListener,
                    ...(mergedParams.suppressSyncLayoutWithGrid ? {} : { columnMoved: resetListener }),
                })
            );
        }

        if (mergedParams.buttons) {
            if (!mergedParams.buttons.includes('apply')) {
                this.beans.log.warn(298);
            }
            if (mergedParams.buttons.length) {
                this.initDeferredButtons(mergedParams.buttons);
            }
        }

        this.initialised = true;
    }

    private initDeferredButtons(buttons: ColumnToolPanelAction[]): void {
        const buttonComp = this.createBean(new FilterButtonComp({ className: 'ag-column-panel-buttons' }));
        this.deferredButtonsComp = buttonComp;
        this.childDestroyFuncs.push(() => {
            this.deferredButtonsComp = this.destroyBean(this.deferredButtonsComp);
        });

        const translate = this.getLocaleTextFunc();

        const buttonDefs = buttons.map((type) => ({
            type,
            label: translate(
                type === 'apply' ? 'applyColumnToolPanel' : 'cancelColumnToolPanel',
                type === 'apply' ? 'Apply' : 'Cancel'
            ),
        }));
        buttonComp.updateButtons(buttonDefs);
        buttonComp.updateValidity(false);
        buttonComp.addManagedListeners(buttonComp, {
            apply: this.onDeferredApply,
            cancel: this.onDeferredCancel,
        });

        this.appendChild(buttonComp);
    }

    private readonly onDeferredApply = (): void => {
        this.isCommitting = true;
        try {
            this.beans.columnStateUpdateStrategy.commit(this.isDeferModeEnabled);
        } finally {
            this.isCommitting = false;
        }
        this.deferredButtonsComp?.updateValidity(false);
        this.lastKnownGridState = this.captureGridState();
    };

    private readonly onDeferredCancel = (): void => {
        this.beans.columnStateUpdateStrategy.reset(this.isDeferModeEnabled);
        this.deferredButtonsComp?.updateValidity(false);
        this.refreshToolPanelLayouts();
        this.pivotModePanel?.refreshEditStrategy();
        this.lastKnownGridState = this.captureGridState();
    };

    private readonly onPivotModePanelValueChanged = (): void => {
        this.refreshToolPanelLayouts();
        this.setLastVisible();
        this.deferredButtonsComp?.updateValidity(
            this.beans.columnStateUpdateStrategy.hasPendingChanges(this.isDeferModeEnabled)
        );
    };

    /** Handles columnEverythingChanged — only resets staged changes on true no-ops. */
    private readonly onColumnEverythingChanged = (): void => {
        if (!this.isDeferModeEnabled || this.isCommitting) {
            return;
        }
        const currentState = this.captureGridState();
        if (!this.beans.columnStateUpdateStrategy.hasPendingChanges(this.isDeferModeEnabled)) {
            this.lastKnownGridState = currentState;
            return;
        }
        const isNoOp = this.lastKnownGridState && this.isGridStateEqual(this.lastKnownGridState, currentState);
        this.lastKnownGridState = currentState;
        if (!isNoOp) {
            return;
        }
        this.resetDeferredState();
    };

    private readonly onExternalGridChange = (): void => {
        if (!this.isDeferModeEnabled || this.isCommitting) {
            return;
        }
        if (!this.beans.columnStateUpdateStrategy.hasPendingChanges(this.isDeferModeEnabled)) {
            return;
        }
        this.resetDeferredState();
        this.lastKnownGridState = this.captureGridState();
    };

    private resetDeferredState(): void {
        this.beans.columnStateUpdateStrategy.reset(this.isDeferModeEnabled);
        this.deferredButtonsComp?.updateValidity(false);
        this.refreshToolPanelLayouts();
        this.pivotModePanel?.refreshEditStrategy();
    }

    private captureGridState(): GridStateSnapshot {
        const { beans } = this;
        const getColIds = (cols: { getColId(): string }[] | undefined) => (cols ?? []).map((c) => c.getColId());
        return {
            rowGroupColIds: getColIds(beans.rowGroupColsSvc?.columns),
            valueColIds: getColIds(beans.valueColsSvc?.columns),
            pivotColIds: getColIds(beans.pivotColsSvc?.columns),
            pivotMode: beans.colModel.pivotMode,
            columnOrder: beans.colModel.getCols().map((c) => c.colId),
            visibleColIds: beans.colModel
                .getCols()
                .filter((c) => c.isVisible())
                .map((c) => c.colId),
            sortState: beans.colModel
                .getCols()
                .filter((c) => c.getSort())
                .map((c) => `${c.colId}:${c.getSort()}:${c.getSortIndex()}`),
            aggFuncState: (beans.valueColsSvc?.columns ?? []).map((c) => c.aggFunc),
            widthState: beans.colModel.getCols().map((c) => `${c.colId}:${c.getActualWidth()}`),
        };
    }

    private isGridStateEqual(a: GridStateSnapshot, b: GridStateSnapshot): boolean {
        return (
            _areEqual(a.rowGroupColIds, b.rowGroupColIds) &&
            _areEqual(a.valueColIds, b.valueColIds) &&
            _areEqual(a.pivotColIds, b.pivotColIds) &&
            a.pivotMode === b.pivotMode &&
            _areEqual(a.columnOrder, b.columnOrder) &&
            _areEqual(a.visibleColIds, b.visibleColIds) &&
            _areEqual(a.sortState, b.sortState) &&
            _areEqual(a.aggFuncState, b.aggFuncState) &&
            _areEqual(a.widthState, b.widthState)
        );
    }

    public refreshDeferredUi(): void {
        this.refreshToolPanelLayouts();
        this.setLastVisible();
        this.pivotModePanel?.refreshEditStrategy();
        this.deferredButtonsComp?.updateValidity(
            this.beans.columnStateUpdateStrategy.hasPendingChanges(this.isDeferModeEnabled)
        );
    }

    private refreshToolPanelLayouts(): void {
        this.primaryColsPanel.syncLayoutWithGrid();
        this.rowGroupDropZonePanel?.refreshGui();
        this.valuesDropZonePanel?.refreshGui();
        this.pivotDropZonePanel?.refresh();
    }

    public setPivotModeSectionVisible(visible: boolean): void {
        const colToolPanelFactory = this.colToolPanelFactory;
        if (!colToolPanelFactory) {
            return;
        }

        this.pivotModePanel = colToolPanelFactory.setPanelVisible(
            this.pivotModePanel,
            visible,
            colToolPanelFactory.createPivotModePanel.bind(
                colToolPanelFactory,
                this,
                this.childDestroyFuncs,
                this.params,
                this.onPivotModePanelValueChanged,
                true
            )
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
            colToolPanelFactory.createRowGroupPanel.bind(colToolPanelFactory, this, this.childDestroyFuncs, this.params)
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
            colToolPanelFactory.createValuesPanel.bind(colToolPanelFactory, this, this.childDestroyFuncs, this.params)
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
            colToolPanelFactory.createPivotPanel.bind(colToolPanelFactory, this, this.childDestroyFuncs, this.params)
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
                !eGui.classList.contains('ag-last-column-drop') &&
                    !eGui.classList.contains('ag-hidden') &&
                    !eGui.classList.contains('ag-last-visible-child')
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

        this.primaryColsPanel.getGui().classList.toggle('ag-last-visible-child', !lastVisible);
        this.setResizers();
    }

    private resetChildrenHeight(): void {
        const eGui = this.getGui();
        const children = eGui.children;

        for (let i = 0; i < children.length; i++) {
            const style = (children[i] as HTMLElement | undefined)?.style;
            style?.removeProperty('height');
            style?.removeProperty('flex');
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
        return true;
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
