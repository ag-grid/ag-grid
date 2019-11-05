var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Component, Events, ModuleNames, ModuleRegistry } from "@ag-grid-community/core";
import { PivotModePanel } from "./pivotModePanel";
import { RowGroupDropZonePanel, ValuesDropZonePanel, PivotDropZonePanel } from "@ag-grid-enterprise/row-grouping";
var ColumnToolPanel = /** @class */ (function (_super) {
    __extends(ColumnToolPanel, _super);
    function ColumnToolPanel() {
        var _this = _super.call(this, ColumnToolPanel.TEMPLATE) || this;
        _this.initialised = false;
        _this.childDestroyFuncs = [];
        return _this;
    }
    // lazy initialise the panel
    ColumnToolPanel.prototype.setVisible = function (visible) {
        _super.prototype.setDisplayed.call(this, visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    };
    ColumnToolPanel.prototype.init = function (params) {
        var defaultParams = {
            suppressSideButtons: false,
            suppressColumnSelectAll: false,
            suppressColumnFilter: false,
            suppressColumnExpandAll: false,
            contractColumnSelection: false,
            suppressPivotMode: false,
            suppressRowGroups: false,
            suppressValues: false,
            suppressPivots: false,
            suppressSyncLayoutWithGrid: false,
            api: this.gridApi
        };
        _.mergeDeep(defaultParams, params);
        this.params = defaultParams;
        if (this.isRowGroupingModuleLoaded() && !this.params.suppressPivotMode) {
            this.pivotModePanel = new PivotModePanel();
            this.addComponent(this.pivotModePanel);
        }
        this.primaryColsPanel = this.getContext().createComponent('AG-PRIMARY-COLS');
        this.primaryColsPanel.init(true, this.params);
        this.addComponent(this.primaryColsPanel);
        if (this.isRowGroupingModuleLoaded()) {
            if (!this.params.suppressRowGroups) {
                this.rowGroupDropZonePanel = new RowGroupDropZonePanel(false);
                this.addComponent(this.rowGroupDropZonePanel);
            }
            if (!this.params.suppressValues) {
                this.valuesDropZonePanel = new ValuesDropZonePanel(false);
                this.addComponent(this.valuesDropZonePanel);
            }
            if (!this.params.suppressPivots) {
                this.pivotDropZonePanel = new PivotDropZonePanel(false);
                this.addComponent(this.pivotDropZonePanel);
            }
            this.setLastVisible();
            this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.setLastVisible.bind(this));
        }
        this.initialised = true;
    };
    ColumnToolPanel.prototype.setPivotModeSectionVisible = function (visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        ;
        if (this.pivotModePanel) {
            this.pivotModePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.pivotModePanel = new PivotModePanel();
            this.getContext().wireBean(this.pivotModePanel);
            // ensure pivot mode panel is positioned at the top of the columns tool panel
            this.getGui().insertBefore(this.pivotModePanel.getGui(), this.getGui().firstChild);
            this.childDestroyFuncs.push(this.pivotModePanel.destroy.bind(this.pivotModePanel));
        }
        this.setLastVisible();
    };
    ColumnToolPanel.prototype.setRowGroupsSectionVisible = function (visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        ;
        if (this.rowGroupDropZonePanel) {
            this.rowGroupDropZonePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.rowGroupDropZonePanel = new RowGroupDropZonePanel(false);
            this.addComponent(new RowGroupDropZonePanel(false));
        }
        this.setLastVisible();
    };
    ColumnToolPanel.prototype.setValuesSectionVisible = function (visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        ;
        if (this.valuesDropZonePanel) {
            this.valuesDropZonePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.valuesDropZonePanel = new ValuesDropZonePanel(false);
            this.addComponent(this.valuesDropZonePanel);
        }
        this.setLastVisible();
    };
    ColumnToolPanel.prototype.setPivotSectionVisible = function (visible) {
        if (!this.isRowGroupingModuleLoaded()) {
            return;
        }
        ;
        if (this.pivotDropZonePanel) {
            this.pivotDropZonePanel.setDisplayed(visible);
        }
        else if (visible) {
            this.pivotDropZonePanel = new PivotDropZonePanel(false);
            this.addComponent(this.pivotDropZonePanel);
            this.pivotDropZonePanel.setDisplayed(visible);
        }
        this.setLastVisible();
    };
    ColumnToolPanel.prototype.setLastVisible = function () {
        var eGui = this.getGui();
        var columnDrops = Array.prototype.slice.call(eGui.querySelectorAll('.ag-column-drop'));
        columnDrops.forEach(function (columnDrop) { return _.removeCssClass(columnDrop, 'ag-last-column-drop'); });
        var lastVisible = _.last(eGui.querySelectorAll('.ag-column-drop:not(.ag-hidden)'));
        if (lastVisible) {
            _.addCssClass(lastVisible, 'ag-last-column-drop');
        }
    };
    ColumnToolPanel.prototype.isRowGroupingModuleLoaded = function () {
        return ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Row Grouping');
    };
    ColumnToolPanel.prototype.expandColumnGroups = function (groupIds) {
        this.primaryColsPanel.expandGroups(groupIds);
    };
    ColumnToolPanel.prototype.collapseColumnGroups = function (groupIds) {
        this.primaryColsPanel.collapseGroups(groupIds);
    };
    ColumnToolPanel.prototype.setColumnLayout = function (colDefs) {
        this.primaryColsPanel.setColumnLayout(colDefs);
    };
    ColumnToolPanel.prototype.syncLayoutWithGrid = function () {
        this.primaryColsPanel.syncLayoutWithGrid();
    };
    ColumnToolPanel.prototype.addComponent = function (component) {
        this.getContext().wireBean(component);
        this.getGui().appendChild(component.getGui());
        this.childDestroyFuncs.push(component.destroy.bind(component));
    };
    ColumnToolPanel.prototype.destroyChildren = function () {
        this.childDestroyFuncs.forEach(function (func) { return func(); });
        this.childDestroyFuncs.length = 0;
        _.clearElement(this.getGui());
    };
    ColumnToolPanel.prototype.refresh = function () {
        this.destroyChildren();
        this.init(this.params);
    };
    ColumnToolPanel.prototype.destroy = function () {
        this.destroyChildren();
        _super.prototype.destroy.call(this);
    };
    ColumnToolPanel.TEMPLATE = "<div class=\"ag-column-panel\"></div>";
    __decorate([
        Autowired("gridOptionsWrapper")
    ], ColumnToolPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired("gridApi")
    ], ColumnToolPanel.prototype, "gridApi", void 0);
    __decorate([
        Autowired("eventService")
    ], ColumnToolPanel.prototype, "eventService", void 0);
    return ColumnToolPanel;
}(Component));
export { ColumnToolPanel };
