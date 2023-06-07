var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, _, SelectionHandleType } from "@ag-grid-community/core";
export class AbstractSelectionHandle extends Component {
    constructor() {
        super(...arguments);
        this.changedCalculatedValues = false;
        this.dragging = false;
        this.shouldDestroyOnEndDragging = false;
    }
    init() {
        this.dragService.addDragSource({
            dragStartPixels: 0,
            eElement: this.getGui(),
            onDragStart: this.onDragStart.bind(this),
            onDragging: (e) => {
                this.dragging = true;
                this.rangeService.autoScrollService.check(e);
                if (this.changedCalculatedValues) {
                    this.onDrag(e);
                    this.changedCalculatedValues = false;
                }
            },
            onDragStop: (e) => {
                this.dragging = false;
                this.onDragEnd(e);
                this.clearValues();
                this.rangeService.autoScrollService.ensureCleared();
                // TODO: this causes a bug where if there are multiple grids in the same page, all of them will
                // be affected by a drag on any. Move it to the root element.
                document.body.classList.remove(this.getDraggingCssClass());
                if (this.shouldDestroyOnEndDragging) {
                    this.destroy();
                }
            }
        });
        this.addManagedListener(this.getGui(), 'mousedown', this.preventRangeExtension.bind(this));
    }
    isDragging() {
        return this.dragging;
    }
    getCellCtrl() {
        return this.cellCtrl;
    }
    setCellCtrl(cellComp) {
        this.cellCtrl = cellComp;
    }
    getCellRange() {
        return this.cellRange;
    }
    setCellRange(range) {
        this.cellRange = range;
    }
    getRangeStartRow() {
        return this.rangeStartRow;
    }
    setRangeStartRow(row) {
        this.rangeStartRow = row;
    }
    getRangeEndRow() {
        return this.rangeEndRow;
    }
    setRangeEndRow(row) {
        this.rangeEndRow = row;
    }
    getLastCellHovered() {
        return this.lastCellHovered;
    }
    preventRangeExtension(e) {
        e.stopPropagation();
    }
    onDragStart(e) {
        this.cellHoverListener = this.addManagedListener(this.ctrlsService.getGridCtrl().getGui(), 'mousemove', this.updateValuesOnMove.bind(this));
        document.body.classList.add(this.getDraggingCssClass());
    }
    getDraggingCssClass() {
        return `ag-dragging-${this.type === SelectionHandleType.FILL ? 'fill' : 'range'}-handle`;
    }
    updateValuesOnMove(e) {
        const cell = this.mouseEventService.getCellPositionForEvent(e);
        if (!cell || (this.lastCellHovered && this.cellPositionUtils.equals(cell, this.lastCellHovered))) {
            return;
        }
        this.lastCellHovered = cell;
        this.changedCalculatedValues = true;
    }
    getType() {
        return this.type;
    }
    refresh(cellCtrl) {
        const oldCellComp = this.getCellCtrl();
        const eGui = this.getGui();
        const cellRange = _.last(this.rangeService.getCellRanges());
        const start = cellRange.startRow;
        const end = cellRange.endRow;
        if (start && end) {
            const isBefore = this.rowPositionUtils.before(end, start);
            if (isBefore) {
                this.setRangeStartRow(end);
                this.setRangeEndRow(start);
            }
            else {
                this.setRangeStartRow(start);
                this.setRangeEndRow(end);
            }
        }
        if (oldCellComp !== cellCtrl || !_.isVisible(eGui)) {
            this.setCellCtrl(cellCtrl);
            const eParentOfValue = cellCtrl.getComp().getParentOfValue();
            if (eParentOfValue) {
                eParentOfValue.appendChild(eGui);
            }
        }
        this.setCellRange(cellRange);
    }
    clearValues() {
        this.lastCellHovered = undefined;
        this.removeListeners();
    }
    removeListeners() {
        if (this.cellHoverListener) {
            this.cellHoverListener();
            this.cellHoverListener = undefined;
        }
    }
    destroy() {
        if (!this.shouldDestroyOnEndDragging && this.isDragging()) {
            _.setDisplayed(this.getGui(), false);
            this.shouldDestroyOnEndDragging = true;
            return;
        }
        this.shouldDestroyOnEndDragging = false;
        super.destroy();
        this.removeListeners();
        const eGui = this.getGui();
        if (eGui.parentElement) {
            eGui.parentElement.removeChild(eGui);
        }
    }
}
__decorate([
    Autowired("rowRenderer")
], AbstractSelectionHandle.prototype, "rowRenderer", void 0);
__decorate([
    Autowired("dragService")
], AbstractSelectionHandle.prototype, "dragService", void 0);
__decorate([
    Autowired("rangeService")
], AbstractSelectionHandle.prototype, "rangeService", void 0);
__decorate([
    Autowired("mouseEventService")
], AbstractSelectionHandle.prototype, "mouseEventService", void 0);
__decorate([
    Autowired("columnModel")
], AbstractSelectionHandle.prototype, "columnModel", void 0);
__decorate([
    Autowired("cellNavigationService")
], AbstractSelectionHandle.prototype, "cellNavigationService", void 0);
__decorate([
    Autowired("navigationService")
], AbstractSelectionHandle.prototype, "navigationService", void 0);
__decorate([
    Autowired('rowPositionUtils')
], AbstractSelectionHandle.prototype, "rowPositionUtils", void 0);
__decorate([
    Autowired('cellPositionUtils')
], AbstractSelectionHandle.prototype, "cellPositionUtils", void 0);
__decorate([
    Autowired('ctrlsService')
], AbstractSelectionHandle.prototype, "ctrlsService", void 0);
__decorate([
    PostConstruct
], AbstractSelectionHandle.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RTZWxlY3Rpb25IYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcmFuZ2VTZWxlY3Rpb24vYWJzdHJhY3RTZWxlY3Rpb25IYW5kbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFJVCxTQUFTLEVBT1QsYUFBYSxFQUdiLENBQUMsRUFDRCxtQkFBbUIsRUFJdEIsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQyxNQUFNLE9BQWdCLHVCQUF3QixTQUFRLFNBQVM7SUFBL0Q7O1FBcUJjLDRCQUF1QixHQUFZLEtBQUssQ0FBQztRQUMzQyxhQUFRLEdBQVksS0FBSyxDQUFDO1FBR3hCLCtCQUEwQixHQUFZLEtBQUssQ0FBQztJQWdMMUQsQ0FBQztJQTdLVyxJQUFJO1FBQ1IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUM7WUFDM0IsZUFBZSxFQUFFLENBQUM7WUFDbEIsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDdkIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN4QyxVQUFVLEVBQUUsQ0FBQyxDQUFxQixFQUFFLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUNyQixJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFlLENBQUMsQ0FBQztnQkFFM0QsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7b0JBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2YsSUFBSSxDQUFDLHVCQUF1QixHQUFHLEtBQUssQ0FBQztpQkFDeEM7WUFDTCxDQUFDO1lBQ0QsVUFBVSxFQUFFLENBQUMsQ0FBcUIsRUFBRSxFQUFFO2dCQUNsQyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztnQkFDdEIsSUFBSSxD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