var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
        var _this = this;
        var defaultParams = {
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
        this.params = __assign(__assign(__assign({}, defaultParams), params), { context: this.gridOptionsService.context });
        if (this.isRowGroupingModuleLoaded() && !this.params.suppressPivotMode) {
            // DO NOT CHANGE TO createManagedBean
            this.pivotModePanel = this.createBean(new PivotModePanel());
            this.childDestroyFuncs.push(function () { return _this.destroyBean(_this.pivotModePanel); });
            this.appendChild(this.pivotModePanel);
        }
        // DO NOT CHANGE TO createManagedBean
        this.primaryColsPanel = this.createBean(new PrimaryColsPanel());
        this.childDestroyFuncs.push(function () { return _this.destroyBean(_this.primaryColsPanel); });
        this.primaryColsPanel.init(true, this.params, "toolPanelUi");
        this.primaryColsPanel.addCssClass('ag-column-panel-column-select');
        this.appendChild(this.primaryColsPanel);
        if (this.isRowGroupingModuleLoaded()) {
            if (!this.params.suppressRowGroups) {
                // DO NOT CHANGE TO createManagedBean
                this.rowGroupDropZonePanel = this.createBean(new RowGroupDropZonePanel(false));
                this.childDestroyFuncs.push(function () { return _this.destroyBean(_this.rowGroupDropZonePanel); });
                this.appendChild(this.rowGroupDropZonePanel);
            }
            if (!this.params.suppressValues) {
                // DO NOT CHANGE TO createManagedBean
                this.valuesDropZonePanel = this.createBean(new ValuesDropZonePanel(false));
                this.childDestroyFuncs.push(function () { return _this.destroyBean(_this.valuesDropZonePanel); });
                this.appendChild(this.valuesDropZonePanel);
            }
            if (!this.params.suppressPivots) {
                // DO NOT CHANGE TO createManagedBean
                this.pivotDropZonePanel = this.createBean(new PivotDropZonePanel(false));
                this.childDestroyFuncs.push(function () { return _this.destroyBean(_this.pivotDropZonePanel); });
                this.appendChild(this.pivotDropZonePanel);
            }
            this.setLastVisible();
            var pivotModeListener_1 = this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, function () {
                _this.resetChildrenHeight();
                _this.setLastVisible();
            });
            this.childDestroyFuncs.push(function () { return pivotModeListener_1(); });
        }
        this.initialised = true;
    };
    ColumnToolPanel.prototype.setPivotModeSectionVisible = function (visible) {
        var _this = this;
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
            this.childDestroyFuncs.push(function () { return _this.destroyBean(_this.pivotModePanel); });
        }
        this.setLastVisible();
    };
    ColumnToolPanel.prototype.setRowGroupsSectionVisible = function (visible) {
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
    };
    ColumnToolPanel.prototype.setValuesSectionVisible = function (visible) {
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
    };
    ColumnToolPanel.prototype.setPivotSectionVisible = function (visible) {
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
    };
    ColumnToolPanel.prototype.setResizers = function () {
        [
            this.primaryColsPanel,
            this.rowGroupDropZonePanel,
            this.valuesDropZonePanel,
            this.pivotDropZonePanel
        ].forEach(function (panel) {
            if (!panel) {
                return;
            }
            var eGui = panel.getGui();
            panel.toggleResizable(!eGui.classList.contains('ag-last-column-drop') && !eGui.classList.contains('ag-hidden'));
        });
    };
    ColumnToolPanel.prototype.setLastVisible = function () {
        var eGui = this.getGui();
        var columnDrops = Array.prototype.slice.call(eGui.querySelectorAll('.ag-column-drop'));
        columnDrops.forEach(function (columnDrop) { return columnDrop.classList.remove('ag-last-column-drop'); });
        var columnDropEls = eGui.querySelectorAll('.ag-column-drop:not(.ag-hidden)');
        var lastVisible = _.last(columnDropEls);
        if (lastVisible) {
            lastVisible.classList.add('ag-last-column-drop');
        }
        this.setResizers();
    };
    ColumnToolPanel.prototype.resetChildrenHeight = function () {
        var eGui = this.getGui();
        var children = eGui.children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            child.style.removeProperty('height');
            child.style.removeProperty('flex');
        }
    };
    ColumnToolPanel.prototype.isRowGroupingModuleLoaded = function () {
        return ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Row Grouping', this.context.getGridId());
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
    ColumnToolPanel.prototype.destroyChildren = function () {
        this.childDestroyFuncs.forEach(function (func) { return func(); });
        this.childDestroyFuncs.length = 0;
        _.clearElement(this.getGui());
    };
    ColumnToolPanel.prototype.refresh = function () {
        this.destroyChildren();
        this.init(this.params);
    };
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so this must be public.
    ColumnToolPanel.prototype.destroy = function () {
        this.destroyChildren();
        _super.prototype.destroy.call(this);
    };
    ColumnToolPanel.TEMPLATE = "<div class=\"ag-column-panel\"></div>";
    __decorate([
        Autowired("gridApi")
    ], ColumnToolPanel.prototype, "gridApi", void 0);
    __decorate([
        Autowired("columnApi")
    ], ColumnToolPanel.prototype, "columnApi", void 0);
    return ColumnToolPanel;
}(Component));
export { ColumnToolPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uVG9vbFBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbHVtblRvb2xQYW5lbC9jb2x1bW5Ub29sUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUNELFNBQVMsRUFJVCxTQUFTLEVBQ1QsTUFBTSxFQUtOLFdBQVcsRUFDWCxjQUFjLEVBQ2pCLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxxQkFBcUIsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ2xILE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXREO0lBQXFDLG1DQUFTO0lBa0IxQztRQUFBLFlBQ0ksa0JBQU0sZUFBZSxDQUFDLFFBQVEsQ0FBQyxTQUNsQztRQWJPLGlCQUFXLEdBQUcsS0FBSyxDQUFDO1FBR3BCLHVCQUFpQixHQUFtQixFQUFFLENBQUM7O0lBVS9DLENBQUM7SUFFRCw0QkFBNEI7SUFDckIsb0NBQVUsR0FBakIsVUFBa0IsT0FBZ0I7UUFDOUIsaUJBQU0sWUFBWSxZQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVCLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMxQjtJQUNMLENBQUM7SUFFTSw4QkFBSSxHQUFYLFVBQVksTUFBaUM7UUFBN0MsaUJBbUVDO1FBbEVHLElBQU0sYUFBYSxHQUErQztZQUM5RCxrQkFBa0IsRUFBRSxLQUFLO1lBQ3pCLHVCQUF1QixFQUFFLEtBQUs7WUFDOUIsb0JBQW9CLEVBQUUsS0FBSztZQUMzQix1QkFBdUIsRUFBRSxLQUFLO1lBQzlCLHVCQUF1QixFQUFFLEtBQUs7WUFDOUIsaUJBQWlCLEVBQUUsS0FBSztZQUN4QixpQkFBaUIsRUFBRSxLQUFLO1lBQ3hCLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLDBCQUEwQixFQUFFLEtBQUs7WUFDakMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ2pCLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztTQUM1QixDQUFDO1FBQ0YsSUFBSSxDQUFDLE1BQU0sa0NBQ0osYUFBYSxHQUNiLE1BQU0sS0FDVCxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sR0FDM0MsQ0FBQztRQUVGLElBQUksSUFBSSxDQUFDLHlCQUF5QixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFO1lBQ3BFLHFDQUFxQztZQUNyQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsS0FBSSxDQUFDLGNBQWMsQ0FBQyxFQUFyQyxDQUFxQyxDQUFDLENBQUM7WUFDekUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDekM7UUFFRCxxQ0FBcUM7UUFDckMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLFdBQVcsQ0FBQyxLQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBdkMsQ0FBdUMsQ0FBQyxDQUFDO1FBRTNFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFeEMsSUFBSSxJQUFJLENBQUMseUJBQXlCLEVBQUUsRUFBRTtZQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRTtnQkFDaEMscUNBQXFDO2dCQUNyQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQy9FLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsS0FBSSxDQUFDLHFCQUFxQixDQUFDLEVBQTVDLENBQTRDLENBQUMsQ0FBQztnQkFDaEYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQzthQUNoRDtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRTtnQkFDN0IscUNBQXFDO2dCQUNyQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzNFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsS0FBSSxDQUFDLG1CQUFtQixDQUFDLEVBQTFDLENBQTBDLENBQUMsQ0FBQztnQkFDOUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzthQUM5QztZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRTtnQkFDN0IscUNBQXFDO2dCQUNyQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3pFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsS0FBSSxDQUFDLGtCQUFrQixDQUFDLEVBQXpDLENBQXlDLENBQUMsQ0FBQztnQkFDN0UsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQzthQUM3QztZQUVELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN0QixJQUFNLG1CQUFpQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQywrQkFBK0IsRUFBRTtnQkFDekcsS0FBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQzNCLEtBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsY0FBTSxPQUFBLG1CQUFrQixFQUFFLEVBQXBCLENBQW9CLENBQUMsQ0FBQztTQUMzRDtRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzVCLENBQUM7SUFFTSxvREFBMEIsR0FBakMsVUFBa0MsT0FBZ0I7UUFBbEQsaUJBYUM7UUFaRyxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFFbEQsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzdDO2FBQU0sSUFBSSxPQUFPLEVBQUU7WUFDaEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksY0FBYyxFQUFFLENBQUMsQ0FBQztZQUU1RCw2RUFBNkU7WUFDN0UsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsV0FBVyxDQUFDLEtBQUksQ0FBQyxjQUFjLENBQUMsRUFBckMsQ0FBcUMsQ0FBQyxDQUFDO1NBQzVFO1FBQ0QsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFTSxvREFBMEIsR0FBakMsVUFBa0MsT0FBZ0I7UUFDOUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxFQUFFO1lBQUUsT0FBTztTQUFFO1FBRWxELElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFO1lBQzVCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDcEQ7YUFBTSxJQUFJLE9BQU8sRUFBRTtZQUNoQixJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUkscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN0RixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1NBQ2hEO1FBQ0QsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFTSxpREFBdUIsR0FBOUIsVUFBK0IsT0FBZ0I7UUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxFQUFFO1lBQUUsT0FBTztTQUFFO1FBRWxELElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQzFCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbEQ7YUFBTSxJQUFJLE9BQU8sRUFBRTtZQUNoQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQzlDO1FBQ0QsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFTSxnREFBc0IsR0FBN0IsVUFBOEIsT0FBZ0I7UUFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxFQUFFO1lBQUUsT0FBTztTQUFFO1FBRWxELElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQ3pCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDakQ7YUFBTSxJQUFJLE9BQU8sRUFBRTtZQUNoQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDakQ7UUFDRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVPLHFDQUFXLEdBQW5CO1FBQ0k7WUFDSSxJQUFJLENBQUMsZ0JBQWdCO1lBQ3JCLElBQUksQ0FBQyxxQkFBcUI7WUFDMUIsSUFBSSxDQUFDLG1CQUFtQjtZQUN4QixJQUFJLENBQUMsa0JBQWtCO1NBQzFCLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSztZQUNYLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQUUsT0FBTzthQUFFO1lBQ3ZCLElBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM1QixLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDcEgsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sd0NBQWMsR0FBdEI7UUFDSSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFM0IsSUFBTSxXQUFXLEdBQWtCLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBRXhHLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQSxVQUFVLElBQUksT0FBQSxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxFQUFsRCxDQUFrRCxDQUFDLENBQUM7UUFFdEYsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDL0UsSUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQWdCLENBQUM7UUFFekQsSUFBSSxXQUFXLEVBQUU7WUFDYixXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1NBQ3BEO1FBRUQsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFTyw2Q0FBbUIsR0FBM0I7UUFDSSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDM0IsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUUvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN0QyxJQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFnQixDQUFDO1lBQ3pDLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3RDO0lBQ0wsQ0FBQztJQUVPLG1EQUF5QixHQUFqQztRQUNJLE9BQU8sY0FBYyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQ3BILENBQUM7SUFFTSw0Q0FBa0IsR0FBekIsVUFBMEIsUUFBbUI7UUFDekMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRU0sOENBQW9CLEdBQTNCLFVBQTRCLFFBQW1CO1FBQzNDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVNLHlDQUFlLEdBQXRCLFVBQXVCLE9BQWlDO1FBQ3BELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVNLDRDQUFrQixHQUF6QjtRQUNJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQy9DLENBQUM7SUFFTSx5Q0FBZSxHQUF0QjtRQUNJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLEVBQUUsRUFBTixDQUFNLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFTSxpQ0FBTyxHQUFkO1FBQ0ksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCw0RkFBNEY7SUFDNUYsMEJBQTBCO0lBQ25CLGlDQUFPLEdBQWQ7UUFDSSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkIsaUJBQU0sT0FBTyxXQUFFLENBQUM7SUFDcEIsQ0FBQztJQWxPYyx3QkFBUSxHQUFHLHVDQUFxQyxDQUFDO0lBRTFDO1FBQXJCLFNBQVMsQ0FBQyxTQUFTLENBQUM7b0RBQTBCO0lBQ3ZCO1FBQXZCLFNBQVMsQ0FBQyxXQUFXLENBQUM7c0RBQThCO0lBZ096RCxzQkFBQztDQUFBLEFBck9ELENBQXFDLFNBQVMsR0FxTzdDO1NBck9ZLGVBQWUifQ==