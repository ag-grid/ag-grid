/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var utils_1 = require('../utils');
var columnGroup_1 = require("../entities/columnGroup");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var context_1 = require("../context/context");
var column_1 = require("../entities/column");
var context_2 = require("../context/context");
var renderedHeaderGroupCell_1 = require("./renderedHeaderGroupCell");
var renderedHeaderCell_1 = require("./renderedHeaderCell");
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var moveColumnController_1 = require("./moveColumnController");
var columnController_1 = require("../columnController/columnController");
var gridPanel_1 = require("../gridPanel/gridPanel");
var context_3 = require("../context/context");
var HeaderContainer = (function () {
    function HeaderContainer(eContainer, eViewport, eRoot, pinned) {
        this.headerElements = [];
        this.eContainer = eContainer;
        this.eRoot = eRoot;
        this.pinned = pinned;
        this.eViewport = eViewport;
    }
    HeaderContainer.prototype.init = function () {
        var moveColumnController = new moveColumnController_1.MoveColumnController(this.pinned);
        this.context.wireBean(moveColumnController);
        var secondaryContainers;
        switch (this.pinned) {
            case column_1.Column.PINNED_LEFT:
                secondaryContainers = this.gridPanel.getDropTargetLeftContainers();
                break;
            case column_1.Column.PINNED_RIGHT:
                secondaryContainers = this.gridPanel.getDropTargetPinnedRightContainers();
                break;
            default:
                secondaryContainers = this.gridPanel.getDropTargetBodyContainers();
                break;
        }
        var icon = this.pinned ? dragAndDropService_1.DragAndDropService.ICON_PINNED : dragAndDropService_1.DragAndDropService.ICON_MOVE;
        this.dropTarget = {
            eContainer: this.eViewport ? this.eViewport : this.eContainer,
            iconName: icon,
            eSecondaryContainers: secondaryContainers,
            onDragging: moveColumnController.onDragging.bind(moveColumnController),
            onDragEnter: moveColumnController.onDragEnter.bind(moveColumnController),
            onDragLeave: moveColumnController.onDragLeave.bind(moveColumnController),
            onDragStop: moveColumnController.onDragStop.bind(moveColumnController)
        };
        this.dragAndDropService.addDropTarget(this.dropTarget);
    };
    HeaderContainer.prototype.removeAllChildren = function () {
        this.headerElements.forEach(function (headerElement) {
            headerElement.destroy();
        });
        this.headerElements.length = 0;
        utils_1.Utils.removeAllChildren(this.eContainer);
    };
    HeaderContainer.prototype.insertHeaderRowsIntoContainer = function () {
        var _this = this;
        var cellTree = this.columnController.getDisplayedColumnGroups(this.pinned);
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
                if (child instanceof columnGroup_1.ColumnGroup && child.getDisplayedChildren().length == 0) {
                    return;
                }
                var renderedHeaderElement = _this.createHeaderElement(child);
                _this.headerElements.push(renderedHeaderElement);
                var eGui = renderedHeaderElement.getGui();
                eRow.appendChild(eGui);
            });
            this.eContainer.appendChild(eRow);
        }
    };
    HeaderContainer.prototype.addTreeNodesAtDept = function (cellTree, dept, result) {
        var _this = this;
        cellTree.forEach(function (abstractColumn) {
            if (dept === 0) {
                result.push(abstractColumn);
            }
            else if (abstractColumn instanceof columnGroup_1.ColumnGroup) {
                var columnGroup = abstractColumn;
                _this.addTreeNodesAtDept(columnGroup.getDisplayedChildren(), dept - 1, result);
            }
            else {
            }
        });
    };
    HeaderContainer.prototype.createHeaderElement = function (columnGroupChild) {
        var result;
        if (columnGroupChild instanceof columnGroup_1.ColumnGroup) {
            result = new renderedHeaderGroupCell_1.RenderedHeaderGroupCell(columnGroupChild, this.eRoot, this.$scope);
        }
        else {
            result = new renderedHeaderCell_1.RenderedHeaderCell(columnGroupChild, this.$scope, this.eRoot, this.dropTarget);
        }
        this.context.wireBean(result);
        return result;
    };
    HeaderContainer.prototype.onIndividualColumnResized = function (column) {
        this.headerElements.forEach(function (headerElement) {
            headerElement.onIndividualColumnResized(column);
        });
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], HeaderContainer.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('context'), 
        __metadata('design:type', context_2.Context)
    ], HeaderContainer.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('$scope'), 
        __metadata('design:type', Object)
    ], HeaderContainer.prototype, "$scope", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService'), 
        __metadata('design:type', dragAndDropService_1.DragAndDropService)
    ], HeaderContainer.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], HeaderContainer.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('gridPanel'), 
        __metadata('design:type', gridPanel_1.GridPanel)
    ], HeaderContainer.prototype, "gridPanel", void 0);
    __decorate([
        context_3.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], HeaderContainer.prototype, "init", null);
    return HeaderContainer;
})();
exports.HeaderContainer = HeaderContainer;
