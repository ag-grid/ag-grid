/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { Autowired, Bean, PostConstruct } from "../context/context";
import { HeaderWrapperComp } from "../headerRendering/header/headerWrapperComp";
import { BeanStub } from "../context/beanStub";
import { containsClass, addCssClass } from "../utils/dom";
var AutoWidthCalculator = /** @class */ (function (_super) {
    __extends(AutoWidthCalculator, _super);
    function AutoWidthCalculator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AutoWidthCalculator.prototype.postConstruct = function () {
        var _this = this;
        this.controllersService.whenReady(function (p) {
            _this.centerRowContainerCon = p.centerRowContainerCon;
        });
    };
    AutoWidthCalculator.prototype.registerHeaderRootComp = function (headerRootComp) {
        this.headerRootComp = headerRootComp;
    };
    // this is the trick: we create a dummy container and clone all the cells
    // into the dummy, then check the dummy's width. then destroy the dummy
    // as we don't need it any more.
    // drawback: only the cells visible on the screen are considered
    AutoWidthCalculator.prototype.getPreferredWidthForColumn = function (column, skipHeader) {
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
        var eBodyContainer = this.centerRowContainerCon.getContainerElement();
        eBodyContainer.appendChild(eDummyContainer);
        // get all the cells that are currently displayed (this only brings back
        // rendered cells, rows not rendered due to row visualisation will not be here)
        this.putRowCellsIntoDummyContainer(column, eDummyContainer);
        if (!skipHeader) {
            // we only consider the lowest level cell, not the group cell. in 99% of the time, this
            // will be enough. if we consider groups, then it gets too complicated for what it's worth,
            // as the groups can span columns and this class only considers one column at a time.
            this.cloneItemIntoDummy(eHeaderCell, eDummyContainer);
        }
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
            if (headerElement instanceof HeaderWrapperComp) {
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
        if (containsClass(eCellClone, 'ag-header-cell')) {
            addCssClass(eCloneParent, 'ag-header');
            addCssClass(eCloneParent, 'ag-header-row');
            eCloneParent.style.position = 'static';
        }
        else {
            addCssClass(eCloneParent, 'ag-row');
        }
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
        Autowired('rowRenderer')
    ], AutoWidthCalculator.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('controllersService')
    ], AutoWidthCalculator.prototype, "controllersService", void 0);
    __decorate([
        PostConstruct
    ], AutoWidthCalculator.prototype, "postConstruct", null);
    AutoWidthCalculator = __decorate([
        Bean('autoWidthCalculator')
    ], AutoWidthCalculator);
    return AutoWidthCalculator;
}(BeanStub));
export { AutoWidthCalculator };
