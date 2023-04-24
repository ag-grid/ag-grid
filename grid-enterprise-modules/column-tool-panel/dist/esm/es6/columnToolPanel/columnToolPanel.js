var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Component, Events, ModuleNames, ModuleRegistry } from "@ag-grid-community/core";
import { PivotModePanel } from "./pivotModePanel";
import { PivotDropZonePanel, RowGroupDropZonePanel, ValuesDropZonePanel } from "@ag-grid-enterprise/row-grouping";
import { PrimaryColsPanel } from "./primaryColsPanel";
export class ColumnToolPanel extends Component {
    constructor() {
        super(ColumnToolPanel.TEMPLATE);
        this.initialised = false;
        this.childDestroyFuncs = [];
    }
    // lazy initialise the panel
    setVisible(visible) {
        super.setDisplayed(visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    }
    init(params) {
        const defaultParams = {
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
            api: this.gridApi,
            columnApi: this.columnApi,
        };
        this.params = Object.assign(Object.assign(Object.assign({}, defaultParams), params), { context: this.gridOptionsService.context });
        if (this.isRowGroupingModuleLoaded() && !this.params.suppressPivotMode) {
            // DO NOT CHANGE TO createManagedBean
            this.pivotModePanel = this.createBean(new PivotModePanel());
            this.childDestroyFuncs.push(() => this.destroyBean(this.pivotModePanel));
            this.appendChild(this.pivotModePanel);
        }
        // DO NOT CHANGE TO createManagedBean
        this.primaryColsPanel = this.createBean(new PrimaryColsPanel());
        this.childDestroyFuncs.push(() => this.destroyBean(this.primaryColsPanel));
        this.primaryColsPanel.init(true, this.params, "toolPanelUi");
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
            const pivotModeListener = this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => {
                this.resetChildrenHeight();
                this.setLastVisible();
            });
            this.childDestroyFuncs.push(() => pivotModeListener());
        }
        this.initialised = true;
    }
    setPivotModeSectionVisible(visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        if (this.pivotModePanel) {
            this.pivotModePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.pivotModePanel = this.createBean(new PivotModePanel());
            // ensure pivot mode panel is positioned at the top of the columns tool panel
            this.getGui().insertBefore(this.pivotModePanel.getGui(), this.getGui().firstChild);
            this.childDestroyFuncs.push(() => this.destroyBean(this.pivotModePanel));
        }
        this.setLastVisible();
    }
    setRowGroupsSectionVisible(visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        if (this.rowGroupDropZonePanel) {
            this.rowGroupDropZonePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.rowGroupDropZonePanel = this.createManagedBean(new RowGroupDropZonePanel(false));
            this.appendChild(this.rowGroupDropZonePanel);
        }
        this.setLastVisible();
    }
    setValuesSectionVisible(visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        if (this.valuesDropZonePanel) {
            this.valuesDropZonePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.valuesDropZonePanel = this.createManagedBean(new ValuesDropZonePanel(false));
            this.appendChild(this.valuesDropZonePanel);
        }
        this.setLastVisible();
    }
    setPivotSectionVisible(visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        if (this.pivotDropZonePanel) {
            this.pivotDropZonePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.pivotDropZonePanel = this.createManagedBean(new PivotDropZonePanel(false));
            this.appendChild(this.pivotDropZonePanel);
            this.pivotDropZonePanel.setDisplayed(visible);
        }
        this.setLastVisible();
    }
    setResizers() {
        [
            this.primaryColsPanel,
            this.rowGroupDropZonePanel,
            this.valuesDropZonePanel,
            this.pivotDropZonePanel
        ].forEach(panel => {
            if (!panel) {
                return;
            }
            const eGui = panel.getGui();
            panel.toggleResizable(!eGui.classList.contains('ag-last-column-drop') && !eGui.classList.contains('ag-hidden'));
        });
    }
    setLastVisible() {
        const eGui = this.getGui();
        const columnDrops = Array.prototype.slice.call(eGui.querySelectorAll('.ag-column-drop'));
        columnDrops.forEach(columnDrop => columnDrop.classList.remove('ag-last-column-drop'));
        const columnDropEls = eGui.querySelectorAll('.ag-column-drop:not(.ag-hidden)');
        const lastVisible = _.last(columnDropEls);
        if (lastVisible) {
            lastVisible.classList.add('ag-last-column-drop');
        }
        this.setResizers();
    }
    resetChildrenHeight() {
        const eGui = this.getGui();
        const children = eGui.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            child.style.removeProperty('height');
            child.style.removeProperty('flex');
        }
    }
    isRowGroupingModuleLoaded() {
        return ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Row Grouping');
    }
    expandColumnGroups(groupIds) {
        this.primaryColsPanel.expandGroups(groupIds);
    }
    collapseColumnGroups(groupIds) {
        this.primaryColsPanel.collapseGroups(groupIds);
    }
    setColumnLayout(colDefs) {
        this.primaryColsPanel.setColumnLayout(colDefs);
    }
    syncLayoutWithGrid() {
        this.primaryColsPanel.syncLayoutWithGrid();
    }
    destroyChildren() {
        this.childDestroyFuncs.forEach(func => func());
        this.childDestroyFuncs.length = 0;
        _.clearElement(this.getGui());
    }
    refresh() {
        this.destroyChildren();
        this.init(this.params);
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so this must be public.
    destroy() {
        this.destroyChildren();
        super.destroy();
    }
}
ColumnToolPanel.TEMPLATE = `<div class="ag-column-panel"></div>`;
__decorate([
    Autowired("gridApi")
], ColumnToolPanel.prototype, "gridApi", void 0);
__decorate([
    Autowired("columnApi")
], ColumnToolPanel.prototype, "columnApi", void 0);
