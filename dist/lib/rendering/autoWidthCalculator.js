/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var rowRenderer_1 = require("./rowRenderer");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var headerWrapperComp_1 = require("../headerRendering/header/headerWrapperComp");
var AutoWidthCalculator = /** @class */ (function () {
    function AutoWidthCalculator() {
    }
    AutoWidthCalculator.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
    };
    AutoWidthCalculator.prototype.registerHeaderRootComp = function (headerRootComp) {
        this.headerRootComp = headerRootComp;
    };
    // this is the trick: we create a dummy container and clone all the cells
    // into the dummy, then check the dummy's width. then destroy the dummy
    // as we don't need it any more.
    // drawback: only the cells visible on the screen are considered
    AutoWidthCalculator.prototype.getPreferredWidthForColumn = function (column) {
        var eHeaderCell = this.getHeaderCellForColumn(column);
        // cell isn't visible
        if (!eHeaderCell) {
            return -1;
        }
        var eDummyContainer = document.createElement('span');
        // position fixed, so it isn't restricted to the boundaries of the parent
        eDummyContainer.style.position = 'fixed';
        // we put the dummy into the body container, so it will inherit all the
        // css styles that the real cells are inheriting
        var eBodyContainer = this.gridPanel.getCenterContainer();
        eBodyContainer.appendChild(eDummyContainer);
        // get all the cells that are currently displayed (this only brings back
        // rendered cells, rows not rendered due to row visualisation will not be here)
        this.putRowCellsIntoDummyContainer(column, eDummyContainer);
        // also put header cell in
        // we only consider the lowest level cell, not the group cell. in 99% of the time, this
        // will be enough. if we consider groups, then it gets to complicated for what it's worth,
        // as the groups can span columns and this class only considers one column at a time.
        this.cloneItemIntoDummy(eHeaderCell, eDummyContainer);
        // at this point, all the clones are lined up vertically with natural widths. the dummy
        // container will have a width wide enough just to fit the largest.
        var dummyContainerWidth = eDummyContainer.offsetWidth;
        // we are finished with the dummy container, so get rid of it
        eBodyContainer.removeChild(eDummyContainer);
        // we add padding as I found sometimes the gui still put '...' after some of the texts. so the
        // user can configure the grid to add a few more pixels after the calculated width
        var autoSizePadding = this.gridOptionsWrapper.getAutoSizePadding();
        return dummyContainerWidth + autoSizePadding;
    };
    AutoWidthCalculator.prototype.getHeaderCellForColumn = function (column) {
        var comp = null;
        // find the rendered header cell
        this.headerRootComp.forEachHeaderElement(function (headerElement) {
            if (headerElement instanceof headerWrapperComp_1.HeaderWrapperComp) {
                var headerWrapperComp = headerElement;
                if (headerWrapperComp.getColumn() === column) {
                    comp = headerWrapperComp;
                }
            }
        });
        return comp ? comp.getGui() : null;
    };
    AutoWidthCalculator.prototype.putRowCellsIntoDummyContainer = function (column, eDummyContainer) {
        var _this = this;
        var eCells = this.rowRenderer.getAllCellsForColumn(column);
        eCells.forEach(function (eCell) { return _this.cloneItemIntoDummy(eCell, eDummyContainer); });
    };
    AutoWidthCalculator.prototype.cloneItemIntoDummy = function (eCell, eDummyContainer) {
        // make a deep clone of the cell
        var eCellClone = eCell.cloneNode(true);
        // the original has a fixed width, we remove this to allow the natural width based on content
        eCellClone.style.width = '';
        // the original has position = absolute, we need to remove this so it's positioned normally
        eCellClone.style.position = 'static';
        eCellClone.style.left = '';
        // we put the cell into a containing div, as otherwise the cells would just line up
        // on the same line, standard flow layout, by putting them into divs, they are laid
        // out one per line
        var eCloneParent = document.createElement('div');
        // table-row, so that each cell is on a row. i also tried display='block', but this
        // didn't work in IE
        eCloneParent.style.display = 'table-row';
        // the twig on the branch, the branch on the tree, the tree in the hole,
        // the hole in the bog, the bog in the clone, the clone in the parent,
        // the parent in the dummy, and the dummy down in the vall-e-ooo, OOOOOOOOO! Oh row the rattling bog....
        eCloneParent.appendChild(eCellClone);
        eDummyContainer.appendChild(eCloneParent);
    };
    __decorate([
        context_1.Autowired('rowRenderer'),
        __metadata("design:type", rowRenderer_1.RowRenderer)
    ], AutoWidthCalculator.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], AutoWidthCalculator.prototype, "gridOptionsWrapper", void 0);
    AutoWidthCalculator = __decorate([
        context_1.Bean('autoWidthCalculator')
    ], AutoWidthCalculator);
    return AutoWidthCalculator;
}());
exports.AutoWidthCalculator = AutoWidthCalculator;
