import type {
    ColDef,
    ColGroupDef,
    ColumnToolPanelState,
    IColumnToolPanel,
    IToolPanelColumnCompParams,
    IToolPanelComp,
    IToolPanelParams,
} from 'ag-grid-community';
import { Component, _clearElement, _last } from 'ag-grid-community';

import { PivotDropZonePanel } from '../rowGrouping/columnDropZones/pivotDropZonePanel';
import { RowGroupDropZonePanel } from '../rowGrouping/columnDropZones/rowGroupDropZonePanel';
import { ValuesDropZonePanel } from '../rowGrouping/columnDropZones/valueDropZonePanel';
import { AgPrimaryCols } from './agPrimaryCols';
import { PivotModePanel } from './pivotModePanel';

export interface ToolPanelColumnCompParams<TData = any, TContext = any>
    extends IToolPanelParams<TData, TContext, ColumnToolPanelState>,
        IToolPanelColumnCompParams {}

export class ColumnToolPanel extends Component implements IColumnToolPanel, IToolPanelComp {
    private initialised = false;
    private params: ToolPanelColumnCompParams;

    private childDestroyFuncs: (() => void)[] = [];

    private pivotModePanel: PivotModePanel;
    private primaryColsPanel: AgPrimaryCols;
    private rowGroupDropZonePanel: RowGroupDropZonePanel;
    private valuesDropZonePanel: ValuesDropZonePanel;
    private pivotDropZonePanel: PivotDropZonePanel;

    constructor() {
        super(/* html */ `<div class="ag-column-panel"></div>`);
    }

    // lazy initialise the panel
    public override setVisible(visible: boolean): void {
        super.setDisplayed(visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    }

    public init(params: ToolPanelColumnCompParams): void {
        const defaultParams: Partial<ToolPanelColumnCompParams> = this.gos.addGridCommonParams({
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
        this.params = {
            ...defaultParams,
            ...params,
        };

        if (this.isRowGroupingModuleLoaded() && !this.params.suppressPivotMode) {
            // DO NOT CHANGE TO createManagedBean
            this.pivotModePanel = this.createBean(new PivotModePanel());
            this.childDestroyFuncs.push(() => this.destroyBean(this.pivotModePanel));
            this.appendChild(this.pivotModePanel);
        }

        // DO NOT CHANGE TO createManagedBean
        this.primaryColsPanel = this.createBean(new AgPrimaryCols());
        this.childDestroyFuncs.push(() => this.destroyBean(this.primaryColsPanel));

        this.primaryColsPanel.init(true, this.params, 'toolPanelUi');
        this.primaryColsPanel.addCssClass('ag-column-panel-column-select');
        this.appendChild(this.primaryColsPanel);

        if (this.isRowGroupingModuleLoaded()) {
            if (!this.params.suppressRowGroups) {
                // DO NOT CHANGE TO createManagedBean
                this.rowGroupDropZonePanel = this.createBean(new RowGroupDropZonePanel(false));
                this.childDestroyFuncs.push(() => this.destroyBean(this.rowGroupDropZonePanel));
                this.appendChild(this.rowGroupDropZonePanel);
            }

            if (!this.params.suppressValues) {
                // DO NOT CHANGE TO createManagedBean
                this.valuesDropZonePanel = this.createBean(new ValuesDropZonePanel(false));
                this.childDestroyFuncs.push(() => this.destroyBean(this.valuesDropZonePanel));
                this.appendChild(this.valuesDropZonePanel);
            }

            if (!this.params.suppressPivots) {
                // DO NOT CHANGE TO createManagedBean
                this.pivotDropZonePanel = this.createBean(new PivotDropZonePanel(false));
                this.childDestroyFuncs.push(() => this.destroyBean(this.pivotDropZonePanel));
                this.appendChild(this.pivotDropZonePanel);
            }

            this.setLastVisible();
            const [pivotModeListener] = this.addManagedEventListeners({
                columnPivotModeChanged: () => {
                    this.resetChildrenHeight();
                    this.setLastVisible();
                },
            });
            this.childDestroyFuncs.push(() => pivotModeListener!());
        }

        this.initialised = true;
    }

    public setPivotModeSectionVisible(visible: boolean): void {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }

        if (this.pivotModePanel) {
            this.pivotModePanel.setDisplayed(visible);
        } else if (visible) {
            this.pivotModePanel = this.createBean(new PivotModePanel());

            // ensure pivot mode panel is positioned at the top of the columns tool panel
            this.getGui().insertBefore(this.pivotModePanel.getGui(), this.getGui().firstChild);
            this.childDestroyFuncs.push(() => this.destroyBean(this.pivotModePanel));
        }
        this.setLastVisible();
    }

    public setRowGroupsSectionVisible(visible: boolean): void {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }

        if (this.rowGroupDropZonePanel) {
            this.rowGroupDropZonePanel.setDisplayed(visible);
        } else if (visible) {
            this.rowGroupDropZonePanel = this.createManagedBean(new RowGroupDropZonePanel(false));
            this.appendChild(this.rowGroupDropZonePanel);
        }
        this.setLastVisible();
    }

    public setValuesSectionVisible(visible: boolean): void {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }

        if (this.valuesDropZonePanel) {
            this.valuesDropZonePanel.setDisplayed(visible);
        } else if (visible) {
            this.valuesDropZonePanel = this.createManagedBean(new ValuesDropZonePanel(false));
            this.appendChild(this.valuesDropZonePanel);
        }
        this.setLastVisible();
    }

    public setPivotSectionVisible(visible: boolean): void {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }

        if (this.pivotDropZonePanel) {
            this.pivotDropZonePanel.setDisplayed(visible);
        } else if (visible) {
            this.pivotDropZonePanel = this.createManagedBean(new PivotDropZonePanel(false));
            this.appendChild(this.pivotDropZonePanel);
            this.pivotDropZonePanel.setDisplayed(visible);
        }
        this.setLastVisible();
    }

    private setResizers(): void {
        [this.primaryColsPanel, this.rowGroupDropZonePanel, this.valuesDropZonePanel, this.pivotDropZonePanel].forEach(
            (panel) => {
                if (!panel) {
                    return;
                }
                const eGui = panel.getGui();
                panel.toggleResizable(
                    !eGui.classList.contains('ag-last-column-drop') && !eGui.classList.contains('ag-hidden')
                );
            }
        );
    }

    private setLastVisible(): void {
        const eGui = this.getGui();

        const columnDrops: HTMLElement[] = Array.prototype.slice.call(eGui.querySelectorAll('.ag-column-drop'));

        columnDrops.forEach((columnDrop) => columnDrop.classList.remove('ag-last-column-drop'));

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
            const child = children[i] as HTMLElement;
            child.style.removeProperty('height');
            child.style.removeProperty('flex');
        }
    }

    private isRowGroupingModuleLoaded(): boolean {
        return this.gos.assertModuleRegistered('RowGroupingCoreModule', 'Row Grouping');
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
        this.childDestroyFuncs.forEach((func) => func());
        this.childDestroyFuncs.length = 0;
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

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so this must be public.
    public override destroy(): void {
        this.destroyChildren();
        super.destroy();
    }
}
