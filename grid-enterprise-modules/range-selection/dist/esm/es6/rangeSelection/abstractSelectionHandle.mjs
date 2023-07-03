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
