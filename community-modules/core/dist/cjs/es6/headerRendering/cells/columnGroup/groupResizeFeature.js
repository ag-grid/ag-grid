/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupResizeFeature = void 0;
const beanStub_1 = require("../../../context/beanStub");
const context_1 = require("../../../context/context");
class GroupResizeFeature extends beanStub_1.BeanStub {
    constructor(comp, eResize, pinned, columnGroup) {
        super();
        this.eResize = eResize;
        this.comp = comp;
        this.pinned = pinned;
        this.columnGroup = columnGroup;
    }
    postConstruct() {
        if (!this.columnGroup.isResizable()) {
            this.comp.setResizableDisplayed(false);
            return;
        }
        const finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.eResize,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this, false),
            onResizeEnd: this.onResizing.bind(this, true)
        });
        this.addDestroyFunc(finishedWithResizeFunc);
        if (!this.gridOptionsService.is('suppressAutoSize')) {
            const skipHeaderOnAutoSize = this.gridOptionsService.is('skipHeaderOnAutoSize');
            this.eResize.addEventListener('dblclick', () => {
                // get list of all the column keys we are responsible for
                const keys = [];
                const leafCols = this.columnGroup.getDisplayedLeafColumns();
                leafCols.forEach((column) => {
                    // not all cols in the group may be participating with auto-resize
                    if (!column.getColDef().suppressAutoSize) {
                        keys.push(column.getColId());
                    }
                });
                if (keys.length > 0) {
                    this.columnModel.autoSizeColumns({
                        columns: keys,
                        skipHeader: skipHeaderOnAutoSize,
                        stopAtGroup: this.columnGroup,
                        source: 'uiColumnResized'
                    });
                }
                this.resizeLeafColumnsToFit();
            });
        }
    }
    onResizeStart(shiftKey) {
        this.calculateInitialValues();
        let takeFromGroup = null;
        if (shiftKey) {
            takeFromGroup = this.columnModel.getDisplayedGroupAfter(this.columnGroup);
        }
        if (takeFromGroup) {
            const takeFromLeafCols = takeFromGroup.getDisplayedLeafColumns();
            this.resizeTakeFromCols = takeFromLeafCols.filter(col => col.isResizable());
            this.resizeTakeFromStartWidth = 0;
            this.resizeTakeFromCols.forEach(col => this.resizeTakeFromStartWidth += col.getActualWidth());
            this.resizeTakeFromRatios = [];
            this.resizeTakeFromCols.forEach(col => this.resizeTakeFromRatios.push(col.getActualWidth() / this.resizeTakeFromStartWidth));
        }
        else {
            this.resizeTakeFromCols = null;
            this.resizeTakeFromStartWidth = null;
            this.resizeTakeFromRatios = null;
        }
        this.comp.addOrRemoveCssClass('ag-column-resizing', true);
    }
    onResizing(finished, resizeAmount) {
        const resizeAmountNormalised = this.normaliseDragChange(resizeAmount);
        const width = this.resizeStartWidth + resizeAmountNormalised;
        this.resizeColumns(width, finished);
    }
    resizeLeafColumnsToFit() {
        const preferredSize = this.autoWidthCalculator.getPreferredWidthForColumnGroup(this.columnGroup);
        this.calculateInitialValues();
        if (preferredSize > this.resizeStartWidth) {
            this.resizeColumns(preferredSize, true);
        }
    }
    resizeColumns(totalWidth, finished = true) {
        const resizeSets = [];
        resizeSets.push({
            columns: this.resizeCols,
            ratios: this.resizeRatios,
            width: totalWidth
        });
        if (this.resizeTakeFromCols) {
            const diff = totalWidth - this.resizeStartWidth;
            resizeSets.push({
                columns: this.resizeTakeFromCols,
                ratios: this.resizeTakeFromRatios,
                width: this.resizeTakeFromStartWidth - diff
            });
        }
        this.columnModel.resizeColumnSets({
            resizeSets,
            finished,
            source: 'uiColumnDragged'
        });
        if (finished) {
            this.comp.addOrRemoveCssClass('ag-column-resizing', false);
        }
    }
    calculateInitialValues() {
        const leafCols = this.columnGroup.getDisplayedLeafColumns();
        this.resizeCols = leafCols.filter(col => col.isResizable());
        this.resizeStartWidth = 0;
        this.resizeCols.forEach(col => this.resizeStartWidth += col.getActualWidth());
        this.resizeRatios = [];
        this.resizeCols.forEach(col => this.resizeRatios.push(col.getActualWidth() / this.resizeStartWidth));
    }
    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderCell - should refactor out?
    normaliseDragChange(dragChange) {
        let result = dragChange;
        if (this.gridOptionsService.is('enableRtl')) {
            // for RTL, dragging left makes the col bigger, except when pinning left
            if (this.pinned !== 'left') {
                result *= -1;
            }
        }
        else if (this.pinned === 'right') {
            // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
            result *= -1;
        }
        return result;
    }
}
__decorate([
    context_1.Autowired('horizontalResizeService')
], GroupResizeFeature.prototype, "horizontalResizeService", void 0);
__decorate([
    context_1.Autowired('autoWidthCalculator')
], GroupResizeFeature.prototype, "autoWidthCalculator", void 0);
__decorate([
    context_1.Autowired('columnModel')
], GroupResizeFeature.prototype, "columnModel", void 0);
__decorate([
    context_1.PostConstruct
], GroupResizeFeature.prototype, "postConstruct", null);
exports.GroupResizeFeature = GroupResizeFeature;
