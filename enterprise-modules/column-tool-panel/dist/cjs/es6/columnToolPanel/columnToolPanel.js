"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const pivotModePanel_1 = require("./pivotModePanel");
const row_grouping_1 = require("@ag-grid-enterprise/row-grouping");
const primaryColsPanel_1 = require("./primaryColsPanel");
class ColumnToolPanel extends core_1.Component {
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
            context: this.gridOptionsWrapper.getContext()
        };
        core_1._.mergeDeep(defaultParams, params);
        this.params = defaultParams;
        if (this.isRowGroupingModuleLoaded() && !this.params.suppressPivotMode) {
            // DO NOT CHANGE TO createManagedBean
            this.pivotModePanel = this.createBean(new pivotModePanel_1.PivotModePanel());
            this.childDestroyFuncs.push(() => this.destroyBean(this.pivotModePanel));
            this.appendChild(this.pivotModePanel);
        }
        // DO NOT CHANGE TO createManagedBean
        this.primaryColsPanel = this.createBean(new primaryColsPanel_1.PrimaryColsPanel());
        this.childDestroyFuncs.push(() => this.destroyBean(this.primaryColsPanel));
        this.primaryColsPanel.init(true, this.params, "toolPanelUi");
        this.primaryColsPanel.addCssClass('ag-column-panel-column-select');
        this.appendChild(this.primaryColsPanel);
        if (this.isRowGroupingModuleLoaded()) {
            if (!this.params.suppressRowGroups) {
                // DO NOT CHANGE TO createManagedBean
                this.rowGroupDropZonePanel = this.createBean(new row_grouping_1.RowGroupDropZonePanel(false));
                this.childDestroyFuncs.push(() => this.destroyBean(this.rowGroupDropZonePanel));
                this.appendChild(this.rowGroupDropZonePanel);
            }
            if (!this.params.suppressValues) {
                // DO NOT CHANGE TO createManagedBean
                this.valuesDropZonePanel = this.createBean(new row_grouping_1.ValuesDropZonePanel(false));
                this.childDestroyFuncs.push(() => this.destroyBean(this.valuesDropZonePanel));
                this.appendChild(this.valuesDropZonePanel);
            }
            if (!this.params.suppressPivots) {
                // DO NOT CHANGE TO createManagedBean
                this.pivotDropZonePanel = this.createBean(new row_grouping_1.PivotDropZonePanel(false));
                this.childDestroyFuncs.push(() => this.destroyBean(this.pivotDropZonePanel));
                this.appendChild(this.pivotDropZonePanel);
            }
            this.setLastVisible();
            const pivotModeListener = this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => {
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
            this.pivotModePanel = this.createBean(new pivotModePanel_1.PivotModePanel());
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
            this.rowGroupDropZonePanel = this.createManagedBean(new row_grouping_1.RowGroupDropZonePanel(false));
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
            this.valuesDropZonePanel = this.createManagedBean(new row_grouping_1.ValuesDropZonePanel(false));
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
            this.pivotDropZonePanel = this.createManagedBean(new row_grouping_1.PivotDropZonePanel(false));
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
        const lastVisible = core_1._.last(columnDropEls);
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
        return core_1.ModuleRegistry.assertRegistered(core_1.ModuleNames.RowGroupingModule, 'Row Grouping');
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
        core_1._.clearElement(this.getGui());
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
    core_1.Autowired("gridApi")
], ColumnToolPanel.prototype, "gridApi", void 0);
__decorate([
    core_1.Autowired("columnApi")
], ColumnToolPanel.prototype, "columnApi", void 0);
exports.ColumnToolPanel = ColumnToolPanel;
