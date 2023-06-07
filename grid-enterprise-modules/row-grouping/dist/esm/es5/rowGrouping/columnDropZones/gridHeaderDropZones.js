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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, Events, PostConstruct, _ } from "@ag-grid-community/core";
import { RowGroupDropZonePanel } from "./rowGroupDropZonePanel";
import { PivotDropZonePanel } from "./pivotDropZonePanel";
var GridHeaderDropZones = /** @class */ (function (_super) {
    __extends(GridHeaderDropZones, _super);
    function GridHeaderDropZones() {
        return _super.call(this) || this;
    }
    GridHeaderDropZones.prototype.postConstruct = function () {
        this.setGui(this.createNorthPanel());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onRowGroupChanged.bind(this));
        this.addManagedPropertyListener('rowGroupPanelShow', this.onRowGroupChanged.bind(this));
        this.onRowGroupChanged();
    };
    GridHeaderDropZones.prototype.createNorthPanel = function () {
        var topPanelGui = document.createElement('div');
        var dropPanelVisibleListener = this.onDropPanelVisible.bind(this);
        topPanelGui.classList.add('ag-column-drop-wrapper');
        _.setAriaRole(topPanelGui, 'presentation');
        this.rowGroupComp = new RowGroupDropZonePanel(true);
        this.createManagedBean(this.rowGroupComp);
        this.pivotComp = new PivotDropZonePanel(true);
        this.createManagedBean(this.pivotComp);
        topPanelGui.appendChild(this.rowGroupComp.getGui());
        topPanelGui.appendChild(this.pivotComp.getGui());
        this.addManagedListener(this.rowGroupComp, Component.EVENT_DISPLAYED_CHANGED, dropPanelVisibleListener);
        this.addManagedListener(this.pivotComp, Component.EVENT_DISPLAYED_CHANGED, dropPanelVisibleListener);
        this.onDropPanelVisible();
        return topPanelGui;
    };
    GridHeaderDropZones.prototype.onDropPanelVisible = function () {
        var bothDisplayed = this.rowGroupComp.isDisplayed() && this.pivotComp.isDisplayed();
        this.rowGroupComp.addOrRemoveCssClass('ag-column-drop-horizontal-half-width', bothDisplayed);
        this.pivotComp.addOrRemoveCssClass('ag-column-drop-horizontal-half-width', bothDisplayed);
    };
    GridHeaderDropZones.prototype.onRowGroupChanged = function () {
        if (!this.rowGroupComp) {
            return;
        }
        var rowGroupPanelShow = this.gridOptionsService.get('rowGroupPanelShow');
        if (rowGroupPanelShow === 'always') {
            this.rowGroupComp.setDisplayed(true);
        }
        else if (rowGroupPanelShow === 'onlyWhenGrouping') {
            var grouping = !this.columnModel.isRowGroupEmpty();
            this.rowGroupComp.setDisplayed(grouping);
        }
        else {
            this.rowGroupComp.setDisplayed(false);
        }
    };
    __decorate([
        Autowired('columnModel')
    ], GridHeaderDropZones.prototype, "columnModel", void 0);
    __decorate([
        PostConstruct
    ], GridHeaderDropZones.prototype, "postConstruct", null);
    return GridHeaderDropZones;
}(Component));
export { GridHeaderDropZones };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZEhlYWRlckRyb3Bab25lcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9yb3dHcm91cGluZy9jb2x1bW5Ecm9wWm9uZXMvZ3JpZEhlYWRlckRyb3Bab25lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUVULFNBQVMsRUFDVCxNQUFNLEVBQ04sYUFBYSxFQUNiLENBQUMsRUFDSixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRTFEO0lBQXlDLHVDQUFTO0lBTzlDO2VBQ0ksaUJBQU87SUFDWCxDQUFDO0lBR08sMkNBQWEsR0FBckI7UUFDSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFFckMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLDhCQUE4QixFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNySCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9HLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFeEYsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVPLDhDQUFnQixHQUF4QjtRQUNJLElBQU0sV0FBVyxHQUFHLFFB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