var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../../../context/beanStub.mjs";
import { Autowired, PostConstruct } from "../../../context/context.mjs";
export class GroupResizeFeature extends BeanStub {
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
        if (!this.gridOptionsService.get('suppressAutoSize')) {
            const skipHeaderOnAutoSize = this.gridOptionsService.get('skipHeaderOnAutoSize');
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
                this.resizeLeafColumnsToFit('uiColumnResized');
            });
        }
    }
    onResizeStart(shiftKey) {
        const initialValues = this.getInitialValues(shiftKey);
        this.storeLocalValues(initialValues);
        this.toggleColumnResizing(true);
    }
    onResizing(finished, resizeAmount, source = 'uiColumnResized') {
        const resizeAmountNormalised = this.normaliseDragChange(resizeAmount);
        const width = this.resizeStartWidth + resizeAmountNormalised;
        this.resizeColumnsFromLocalValues(width, source, finished);
    }
    getInitialValues(shiftKey) {
        const columnsToResize = this.getColumnsToResize();
        const resizeStartWidth = this.getInitialSizeOfColumns(columnsToResize);
        const resizeRatios = this.getSizeRatiosOfColumns(columnsToResize, resizeStartWidth);
        const columnSizeAndRatios = {
            columnsToResize,
            resizeStartWidth,
            resizeRatios
        };
        let groupAfter = null;
        if (shiftKey) {
            groupAfter = this.columnModel.getDisplayedGroupAfter(this.columnGroup);
        }
        if (groupAfter) {
            const takeFromLeafCols = groupAfter.getDisplayedLeafColumns();
            const groupAfterColumns = columnSizeAndRatios.groupAfterColumns = takeFromLeafCols.filter(col => col.isResizable());
            const groupAfterStartWidth = columnSizeAndRatios.groupAfterStartWidth = this.getInitialSizeOfColumns(groupAfterColumns);
            columnSizeAndRatios.groupAfterRatios = this.getSizeRatiosOfColumns(groupAfterColumns, groupAfterStartWidth);
        }
        else {
            columnSizeAndRatios.groupAfterColumns = undefined;
            columnSizeAndRatios.groupAfterStartWidth = undefined;
            columnSizeAndRatios.groupAfterRatios = undefined;
        }
        return columnSizeAndRatios;
    }
    storeLocalValues(initialValues) {
        const { columnsToResize, resizeStartWidth, resizeRatios, groupAfterColumns, groupAfterStartWidth, groupAfterRatios } = initialValues;
        this.resizeCols = columnsToResize;
        this.resizeStartWidth = resizeStartWidth;
        this.resizeRatios = resizeRatios;
        this.resizeTakeFromCols = groupAfterColumns;
        this.resizeTakeFromStartWidth = groupAfterStartWidth;
        this.resizeTakeFromRatios = groupAfterRatios;
    }
    clearLocalValues() {
        this.resizeCols = undefined;
        this.resizeRatios = undefined;
        this.resizeTakeFromCols = undefined;
        this.resizeTakeFromRatios = undefined;
    }
    resizeLeafColumnsToFit(source) {
        const preferredSize = this.autoWidthCalculator.getPreferredWidthForColumnGroup(this.columnGroup);
        const initialValues = this.getInitialValues();
        if (preferredSize > initialValues.resizeStartWidth) {
            this.resizeColumns(initialValues, preferredSize, source, true);
        }
    }
    resizeColumnsFromLocalValues(totalWidth, source, finished = true) {
        var _a, _b, _c;
        if (!this.resizeCols || !this.resizeRatios) {
            return;
        }
        const initialValues = {
            columnsToResize: this.resizeCols,
            resizeStartWidth: this.resizeStartWidth,
            resizeRatios: this.resizeRatios,
            groupAfterColumns: (_a = this.resizeTakeFromCols) !== null && _a !== void 0 ? _a : undefined,
            groupAfterStartWidth: (_b = this.resizeTakeFromStartWidth) !== null && _b !== void 0 ? _b : undefined,
            groupAfterRatios: (_c = this.resizeTakeFromRatios) !== null && _c !== void 0 ? _c : undefined
        };
        this.resizeColumns(initialValues, totalWidth, source, finished);
    }
    resizeColumns(initialValues, totalWidth, source, finished = true) {
        const { columnsToResize, resizeStartWidth, resizeRatios, groupAfterColumns, groupAfterStartWidth, groupAfterRatios } = initialValues;
        const resizeSets = [];
        resizeSets.push({
            columns: columnsToResize,
            ratios: resizeRatios,
            width: totalWidth
        });
        if (groupAfterColumns) {
            const diff = totalWidth - resizeStartWidth;
            resizeSets.push({
                columns: groupAfterColumns,
                ratios: groupAfterRatios,
                width: groupAfterStartWidth - diff
            });
        }
        this.columnModel.resizeColumnSets({
            resizeSets,
            finished,
            source: source
        });
        if (finished) {
            this.toggleColumnResizing(false);
        }
    }
    toggleColumnResizing(resizing) {
        this.comp.addOrRemoveCssClass('ag-column-resizing', resizing);
    }
    getColumnsToResize() {
        const leafCols = this.columnGroup.getDisplayedLeafColumns();
        return leafCols.filter(col => col.isResizable());
    }
    getInitialSizeOfColumns(columns) {
        return columns.reduce((totalWidth, column) => totalWidth + column.getActualWidth(), 0);
    }
    getSizeRatiosOfColumns(columns, initialSizeOfColumns) {
        return columns.map(column => column.getActualWidth() / initialSizeOfColumns);
    }
    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderCell - should refactor out?
    normaliseDragChange(dragChange) {
        let result = dragChange;
        if (this.gridOptionsService.get('enableRtl')) {
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
    destroy() {
        super.destroy();
        this.clearLocalValues();
    }
}
__decorate([
    Autowired('horizontalResizeService')
], GroupResizeFeature.prototype, "horizontalResizeService", void 0);
__decorate([
    Autowired('autoWidthCalculator')
], GroupResizeFeature.prototype, "autoWidthCalculator", void 0);
__decorate([
    Autowired('columnModel')
], GroupResizeFeature.prototype, "columnModel", void 0);
__decorate([
    PostConstruct
], GroupResizeFeature.prototype, "postConstruct", null);
