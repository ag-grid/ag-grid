import type {
    BeanCollection,
    ColDef,
    ColGroupDef,
    ColumnToolPanelState,
    ElementParams,
    GridCheckbox,
    IColumnToolPanel,
    IToolPanelColumnCompParams,
    IToolPanelComp,
    IToolPanelParams,
} from 'ag-grid-community';
import {
    AgToggleButtonSelector,
    Component,
    FilterButtonComp,
    RefPlaceholder,
    _addGridCommonParams,
    _clearElement,
    _last,
} from 'ag-grid-community';

import type { PivotDropZonePanel } from '../rowGrouping/columnDropZones/pivotDropZonePanel';
import type { RowGroupDropZonePanel } from '../rowGrouping/columnDropZones/rowGroupDropZonePanel';
import type { ValuesDropZonePanel } from '../rowGrouping/columnDropZones/valueDropZonePanel';
import { AgPrimaryCols } from './agPrimaryCols';
import columnToolPanelCSS from './columnToolPanel.css';
import type { ColumnToolPanelFactory } from './columnToolPanelFactory';
import type { PivotModePanel } from './pivotModePanel';

export interface ToolPanelColumnCompParams<TData = any, TContext = any>
    extends IToolPanelParams<TData, TContext, ColumnToolPanelState>,
        IToolPanelColumnCompParams {}

const DEFERRED_TOOL_PANEL_CLASS = 'ag-column-panel-deferred';

const DeferModeToggleElement: ElementParams = {
    tag: 'div',
    cls: 'ag-column-panel-defer-mode-toggle',
    children: [
        {
            tag: 'ag-toggle-button',
            ref: 'cbDeferMode',
            cls: 'ag-column-panel-defer-mode-select',
        },
    ],
};

class DeferModeToggleComp extends Component {
    private readonly cbDeferMode: GridCheckbox = RefPlaceholder;

    constructor(
        private readonly isDeferModeEnabled: () => boolean,
        private readonly onDeferModeChanged: (nextDeferMode: boolean) => void
    ) {
        super();
    }

    public postConstruct(): void {
        this.setTemplate(DeferModeToggleElement, [AgToggleButtonSelector]);
        const cbDeferMode = this.cbDeferMode;

        cbDeferMode.setValue(this.isDeferModeEnabled());
        cbDeferMode.setLabel(this.getLocaleTextFunc()('deferMode', 'Defer mode'));
        this.addManagedListeners(cbDeferMode, {
            fieldValueChanged: () => this.onDeferModeChanged(!!cbDeferMode.getValue()),
        });
    }

    public sync(value: boolean): void {
        this.cbDeferMode.setValue(value);
    }
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
    private deferModeToggleComp?: DeferModeToggleComp;
    private deferredButtonsComp?: FilterButtonComp;
    private deferredButtonDefs: Array<{ type: 'cancel' | 'apply'; label: string }> = [];
    private isDeferModeEnabled = false;

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
        });
        const mergedParams = {
            ...defaultParams,
            ...params,
        };
        this.params = mergedParams;

        const { childDestroyFuncs, colToolPanelFactory, gos } = this;

        const hasPivotModule = gos.isModuleRegistered('SharedPivot');
        const hasRowGroupingModule = hasPivotModule || gos.isModuleRegistered('SharedRowGrouping');

        this.isDeferModeEnabled = !!mergedParams.deferApply;
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

        if (this.params.deferApply) {
            this.initDeferredButtons();
        }

        this.initialised = true;
    }

    private initDeferredButtons(): void {
        this.deferModeToggleComp = this.createBean(
            new DeferModeToggleComp(
                () => this.isDeferModeEnabled,
                (nextDeferMode) => this.onDeferModeChanged(nextDeferMode)
            )
        );
        this.appendChild(this.deferModeToggleComp);

        const buttonComp = this.createBean(new FilterButtonComp({ className: 'ag-column-panel-buttons' }));
        this.deferredButtonsComp = buttonComp;
        this.childDestroyFuncs.push(() => {
            this.deferModeToggleComp = this.destroyBean(this.deferModeToggleComp);
            this.deferredButtonsComp = this.destroyBean(this.deferredButtonsComp);
        });

        const translate = this.getLocaleTextFunc();

        this.deferredButtonDefs = (['cancel', 'apply'] as const).map((type) => ({
            type,
            label: translate(
                type === 'apply' ? 'applyColumnToolPanel' : 'cancelColumnToolPanel',
                type === 'apply' ? 'Apply' : 'Cancel'
            ),
        }));
        buttonComp.updateButtons(this.isDeferModeEnabled ? this.deferredButtonDefs : []);
        buttonComp.addManagedListeners(buttonComp, {
            apply: this.onDeferredApply,
            cancel: this.onDeferredCancel,
        });

        this.appendChild(buttonComp);
    }

    private readonly onDeferredApply = (): void => {
        this.beans.columnStateUpdateStrategy.commit(this.isDeferModeEnabled);
    };

    private readonly onDeferModeChanged = (nextDeferMode: boolean): void => {
        if (nextDeferMode === this.isDeferModeEnabled) {
            return;
        }

        if (this.isDeferModeEnabled) {
            this.beans.columnStateUpdateStrategy.reset(this.isDeferModeEnabled);
        }

        this.isDeferModeEnabled = nextDeferMode;
        this.params.deferApply = nextDeferMode;
        this.toggleCss(DEFERRED_TOOL_PANEL_CLASS, nextDeferMode);
        this.deferModeToggleComp?.sync(nextDeferMode);
        this.deferredButtonsComp?.updateButtons(nextDeferMode ? this.deferredButtonDefs : []);

        this.refreshToolPanelLayouts();
        this.pivotModePanel?.refreshEditStrategy();
    };

    private readonly onDeferredCancel = (): void => {
        this.beans.columnStateUpdateStrategy.reset(this.isDeferModeEnabled);
        this.refreshToolPanelLayouts();
        this.pivotModePanel?.refreshEditStrategy();
    };

    private readonly onPivotModePanelValueChanged = (): void => {
        this.refreshToolPanelLayouts();
        this.setLastVisible();
    };

    public refreshDeferredUi(): void {
        this.refreshToolPanelLayouts();
        this.setLastVisible();
        this.pivotModePanel?.refreshEditStrategy();
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
