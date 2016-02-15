/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var columnGroup_1 = require("../entities/columnGroup");
var renderedHeaderGroupCell_1 = require("./renderedHeaderGroupCell");
var renderedHeaderCell_1 = require("./renderedHeaderCell");
var HeaderRenderer = (function () {
    function HeaderRenderer() {
        this.headerElements = [];
    }
    HeaderRenderer.prototype.init = function (gridOptionsWrapper, columnController, gridPanel, grid, filterManager, $scope, $compile, headerTemplateLoader, dragService) {
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.columnController = columnController;
        this.grid = grid;
        this.filterManager = filterManager;
        this.$scope = $scope;
        this.$compile = $compile;
        this.headerTemplateLoader = headerTemplateLoader;
        this.dragService = dragService;
        this.gridPanel = gridPanel;
        this.findAllElements();
    };
    HeaderRenderer.prototype.findAllElements = function () {
        this.ePinnedLeftHeader = this.gridPanel.getPinnedLeftHeader();
        this.ePinnedRightHeader = this.gridPanel.getPinnedRightHeader();
        this.eHeaderContainer = this.gridPanel.getHeaderContainer();
        this.eHeaderViewport = this.gridPanel.getHeaderViewport();
        this.eRoot = this.gridPanel.getRoot();
        this.eHeaderOverlay = this.gridPanel.getHeaderOverlay();
    };
    HeaderRenderer.prototype.refreshHeader = function () {
        utils_1.default.removeAllChildren(this.ePinnedLeftHeader);
        utils_1.default.removeAllChildren(this.ePinnedRightHeader);
        utils_1.default.removeAllChildren(this.eHeaderContainer);
        this.headerElements.forEach(function (headerElement) {
            headerElement.destroy();
        });
        this.headerElements = [];
        this.insertHeaderRowsIntoContainer(this.columnController.getLeftDisplayedColumnGroups(), this.ePinnedLeftHeader);
        this.insertHeaderRowsIntoContainer(this.columnController.getRightDisplayedColumnGroups(), this.ePinnedRightHeader);
        this.insertHeaderRowsIntoContainer(this.columnController.getCenterDisplayedColumnGroups(), this.eHeaderContainer);
    };
    HeaderRenderer.prototype.addChildToOverlay = function (child) {
        if (this.eHeaderOverlay) {
            this.eHeaderOverlay.appendChild(child);
        }
    };
    HeaderRenderer.prototype.removeChildFromOverlay = function (child) {
        if (this.eHeaderOverlay) {
            this.eHeaderOverlay.removeChild(child);
        }
    };
    HeaderRenderer.prototype.addTreeNodesAtDept = function (cellTree, dept, result) {
        var _this = this;
        cellTree.forEach(function (abstractColumn) {
            if (dept === 0) {
                result.push(abstractColumn);
            }
            else if (abstractColumn instanceof columnGroup_1.default) {
                var columnGroup = abstractColumn;
                _this.addTreeNodesAtDept(columnGroup.getDisplayedChildren(), dept - 1, result);
            }
            else {
            }
        });
    };
    HeaderRenderer.prototype.setPinnedColContainerWidth = function () {
        if (this.gridOptionsWrapper.isForPrint()) {
            // pinned col doesn't exist when doing forPrint
            return;
        }
        var pinnedLeftWidth = this.columnController.getPinnedLeftContainerWidth() + 'px';
        this.eHeaderViewport.style.marginLeft = pinnedLeftWidth;
        var pinnedRightWidth = this.columnController.getPinnedRightContainerWidth() + 'px';
        this.eHeaderViewport.style.marginRight = pinnedRightWidth;
    };
    HeaderRenderer.prototype.getRightPinnedStartPixel = function () {
        var rightStart = this.ePinnedRightHeader.getBoundingClientRect().left;
        var parentStart = this.eHeaderOverlay.getBoundingClientRect().left;
        return rightStart - parentStart;
    };
    HeaderRenderer.prototype.insertHeaderRowsIntoContainer = function (cellTree, eContainerToAddTo) {
        var _this = this;
        // if we are displaying header groups, then we have many rows here.
        // go through each row of the header, one by one.
        var rowHeight = this.gridOptionsWrapper.getHeaderHeight();
        for (var dept = 0;; dept++) {
            var nodesAtDept = [];
            this.addTreeNodesAtDept(cellTree, dept, nodesAtDept);
            // we want to break the for loop when we get to an empty set of cells,
            // that's how we know we have finished rendering the last row.
            if (nodesAtDept.length === 0) {
                break;
            }
            var eRow = document.createElement('div');
            eRow.className = 'ag-header-row';
            eRow.style.top = (dept * rowHeight) + 'px';
            eRow.style.height = rowHeight + 'px';
            nodesAtDept.forEach(function (child) {
                // skip groups that have no displayed children. this can happen when the group is broken,
                // and this section happens to have nothing to display for the open / closed state
                if (child instanceof columnGroup_1.default && child.getDisplayedChildren().length == 0) {
                    return;
                }
                var renderedHeaderElement = _this.createHeaderElement(child);
                _this.headerElements.push(renderedHeaderElement);
                eRow.appendChild(renderedHeaderElement.getGui());
            });
            eContainerToAddTo.appendChild(eRow);
        }
        // if forPrint, overlay is missing
        if (this.eHeaderOverlay) {
            this.eHeaderOverlay.style.height = rowHeight + 'px';
            this.eHeaderOverlay.style.top = ((dept - 1) * rowHeight) + 'px';
        }
    };
    HeaderRenderer.prototype.createHeaderElement = function (columnGroupChild) {
        if (columnGroupChild instanceof columnGroup_1.default) {
            return new renderedHeaderGroupCell_1.default(columnGroupChild, this.gridOptionsWrapper, this.columnController, this.eRoot, this.$scope, this.filterManager, this.$compile, this.dragService);
        }
        else {
            return new renderedHeaderCell_1.default(columnGroupChild, null, this.gridOptionsWrapper, this.$scope, this.filterManager, this.columnController, this.$compile, this.grid, this.eRoot, this.headerTemplateLoader, this, this.dragService, this.gridPanel);
        }
    };
    HeaderRenderer.prototype.updateSortIcons = function () {
        this.headerElements.forEach(function (headerElement) {
            headerElement.refreshSortIcon();
        });
    };
    HeaderRenderer.prototype.updateFilterIcons = function () {
        this.headerElements.forEach(function (headerElement) {
            headerElement.refreshFilterIcon();
        });
    };
    HeaderRenderer.prototype.onIndividualColumnResized = function (column) {
        this.headerElements.forEach(function (headerElement) {
            headerElement.onIndividualColumnResized(column);
        });
    };
    return HeaderRenderer;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HeaderRenderer;
