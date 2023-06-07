var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, Events, PostConstruct, _ } from "@ag-grid-community/core";
import { RowGroupDropZonePanel } from "./rowGroupDropZonePanel";
import { PivotDropZonePanel } from "./pivotDropZonePanel";
export class GridHeaderDropZones extends Component {
    constructor() {
        super();
    }
    postConstruct() {
        this.setGui(this.createNorthPanel());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onRowGroupChanged.bind(this));
        this.addManagedPropertyListener('rowGroupPanelShow', this.onRowGroupChanged.bind(this));
        this.onRowGroupChanged();
    }
    createNorthPanel() {
        const topPanelGui = document.createElement('div');
        const dropPanelVisibleListener = this.onDropPanelVisible.bind(this);
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
    }
    onDropPanelVisible() {
        const bothDisplayed = this.rowGroupComp.isDisplayed() && this.pivotComp.isDisplayed();
        this.rowGroupComp.addOrRemoveCssClass('ag-column-drop-horizontal-half-width', bothDisplayed);
        this.pivotComp.addOrRemoveCssClass('ag-column-drop-horizontal-half-width', bothDisplayed);
    }
    onRowGroupChanged() {
        if (!this.rowGroupComp) {
            return;
        }
        const rowGroupPanelShow = this.gridOptionsService.get('rowGroupPanelShow');
        if (rowGroupPanelShow === 'always') {
            this.rowGroupComp.setDisplayed(true);
        }
        else if (rowGroupPanelShow === 'onlyWhenGrouping') {
            const grouping = !this.columnModel.isRowGroupEmpty();
            this.rowGroupComp.setDisplayed(grouping);
        }
        else {
            this.rowGroupComp.setDisplayed(false);
        }
    }
}
__decorate([
    Autowired('columnModel')
], GridHeaderDropZones.prototype, "columnModel", void 0);
__decorate([
    PostConstruct
], GridHeaderDropZones.prototype, "postConstruct", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZEhlYWRlckRyb3Bab25lcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9yb3dHcm91cGluZy9jb2x1bW5Ecm9wWm9uZXMvZ3JpZEhlYWRlckRyb3Bab25lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUVULFNBQVMsRUFDVCxNQUFNLEVBQ04sYUFBYSxFQUNiLENBQUMsRUFDSixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRTFELE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxTQUFTO0lBTzlDO1FBQ0ksS0FBSyxFQUFFLENBQUM7SUFDWixDQUFDO0lBR08sYUFBYTtRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFFckMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLDhCQUE4QixFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNySCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9HLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFeEYsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVPLGdCQUFnQjtRQUNwQixNQUFNLFdBQVcsR0FBRyxRQUFR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