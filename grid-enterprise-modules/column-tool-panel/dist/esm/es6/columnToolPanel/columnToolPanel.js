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
        return ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Row Grouping', this.context.getGridId());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uVG9vbFBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbHVtblRvb2xQYW5lbC9jb2x1bW5Ub29sUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBSVQsU0FBUyxFQUNULE1BQU0sRUFLTixXQUFXLEVBQ1gsY0FBYyxFQUNqQixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUscUJBQXFCLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUNsSCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUV0RCxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxTQUFTO0lBa0IxQztRQUNJLEtBQUssQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7UUFaNUIsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFHcEIsc0JBQWlCLEdBQW1CLEVBQUUsQ0FBQztJQVUvQyxDQUFDO0lBRUQsNEJBQTRCO0lBQ3JCLFVBQVUsQ0FBQyxPQUFnQjtRQUM5QixLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVCLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMxQjtJQUNMLENBQUM7SUFFTSxJQUFJLENBQUMsTUFBaUM7UUFDekMsTUFBTSxhQUFhLEdBQStDO1lBQzlELGtCQUFrQixFQUFFLEtBQUs7WUFDekIsdUJBQXVCLEVBQUUsS0FBSztZQUM5QixvQkFBb0IsRUFBRSxLQUFLO1lBQzNCLHVCQUF1QixFQUFFLEtBQUs7WUFDOUIsdUJBQXVCLEVBQUUsS0FBSztZQUM5Qixp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