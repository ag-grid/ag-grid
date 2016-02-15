/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var FloatingRowModel = (function () {
    function FloatingRowModel() {
    }
    FloatingRowModel.prototype.init = function (gridOptionsWrapper) {
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.setFloatingTopRowData(gridOptionsWrapper.getFloatingTopRowData());
        this.setFloatingBottomRowData(gridOptionsWrapper.getFloatingBottomRowData());
    };
    FloatingRowModel.prototype.setFloatingTopRowData = function (rowData) {
        this.floatingTopRows = this.createNodesFromData(rowData, false);
    };
    FloatingRowModel.prototype.setFloatingBottomRowData = function (rowData) {
        this.floatingBottomRows = this.createNodesFromData(rowData, false);
    };
    FloatingRowModel.prototype.createNodesFromData = function (allData, isTop) {
        var _this = this;
        var rowNodes = [];
        if (allData) {
            var nextRowTop = 0;
            allData.forEach(function (dataItem) {
                var rowNode = {
                    data: dataItem,
                    floating: true,
                    floatingTop: isTop,
                    floatingBottom: !isTop,
                    rowTop: nextRowTop,
                    rowHeight: null
                };
                rowNode.rowHeight = _this.gridOptionsWrapper.getRowHeightForNode(rowNode);
                nextRowTop += rowNode.rowHeight;
                rowNodes.push(rowNode);
            });
        }
        return rowNodes;
    };
    FloatingRowModel.prototype.getFloatingTopRowData = function () {
        return this.floatingTopRows;
    };
    FloatingRowModel.prototype.getFloatingBottomRowData = function () {
        return this.floatingBottomRows;
    };
    FloatingRowModel.prototype.getFloatingTopTotalHeight = function () {
        return this.getTotalHeight(this.floatingTopRows);
    };
    FloatingRowModel.prototype.getFloatingBottomTotalHeight = function () {
        return this.getTotalHeight(this.floatingBottomRows);
    };
    FloatingRowModel.prototype.getTotalHeight = function (rowNodes) {
        if (!rowNodes || rowNodes.length === 0) {
            return 0;
        }
        else {
            var lastNode = rowNodes[rowNodes.length - 1];
            return lastNode.rowTop + lastNode.rowHeight;
        }
    };
    return FloatingRowModel;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FloatingRowModel;
