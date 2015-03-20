define(['./utils'], function(utils) {

    function SelectionController(angularGrid, eRowsParent, gridOptionsWrapper, rowModel, $scope) {
        this.eRowsParent = eRowsParent;
        this.angularGrid = angularGrid;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.rowModel = rowModel;
        this.$scope = $scope;

        this.selectedNodes = [];
        this.selectedRows = [];

        gridOptionsWrapper.setSelectedRows(this.selectedRows);
        gridOptionsWrapper.setSelectedNodes(this.selectedNodes);
    }

    // public
    SelectionController.prototype.clearSelection = function() {
        this.selectedRows.length = 0;
        this.selectedNodes.length = 0;
    };

    // public
    SelectionController.prototype.selectNode = function (node, tryMulti) {
        var multiSelect = this.gridOptionsWrapper.isRowSelectionMulti() && tryMulti;

        // at the end, if this is true, we inform the callback
        var atLeastOneItemUnselected = false;
        var atLeastOneItemSelected = false;

        // see if rows to be deselected
        if (!multiSelect) {
            atLeastOneItemUnselected = this.doWorkOfDeselectAllNodes();
        }

        // see if row needs to be selected
        if (this.selectedNodes.indexOf(node) < 0) {
            this.doWorkOfSelectNode(node);
            atLeastOneItemSelected = true;
        }

        if (atLeastOneItemUnselected || atLeastOneItemSelected) {
            this.syncSelectedRowsAndCallListener();
        }
    };

    // private
    // 1 - selects a node
    // 2 - updates the UI
    // 3 - calls callbacks
    SelectionController.prototype.doWorkOfSelectNode = function (node) {
        this.selectedNodes.push(node);

        // set css class on selected row
        var virtualRowIndex = this.rowModel.getVirtualIndex(node);
        // NOTE: should also check the row renderer - that this row is actually rendered,
        // ie not outside the scrolling viewport
        if (virtualRowIndex >= 0) {
            utils.querySelectorAll_addCssClass(this.eRowsParent, '[row="' + virtualRowIndex + '"]', 'ag-row-selected');

            // inform virtual row listener
            this.angularGrid.onVirtualRowSelected(virtualRowIndex, true);
        }

        // inform the rowSelected listener, if any
        if (typeof this.gridOptionsWrapper.getRowSelected() === "function") {
            this.gridOptionsWrapper.getRowSelected()(node.rowData, node);
        }
    };

    // private
    // 1 - un-selects a node
    // 2 - updates the UI
    // 3 - calls callbacks
    SelectionController.prototype.doWorkOfDeselectAllNodes = function (nodeToKeepSelected) {
        // not doing multi-select, so deselect everything other than the 'just selected' row
        var atLeastOneSelectionChange;
        for (var i = (this.selectedNodes.length - 1); i>=0; i--) {
            // skip the 'just selected' row
            if (this.selectedNodes[i] === nodeToKeepSelected) {
                continue;
            }

            this.deselectNode(this.selectedNodes[i]);

            atLeastOneSelectionChange = true;
        }
        return atLeastOneSelectionChange;
    };

    // private
    SelectionController.prototype.deselectNode = function (node) {
        // deselect the css
        var rowIndex = this.rowModel.getVirtualIndex(node);
        utils.querySelectorAll_removeCssClass(this.eRowsParent, '[row="' + rowIndex + '"]', 'ag-row-selected');

        // remove the row
        var indexToRemove = this.selectedNodes.indexOf(node);
        this.selectedNodes.splice(indexToRemove, 1);

        // inform virtual row listener
        this.angularGrid.onVirtualRowSelected(rowIndex, false);
    };

    // public (selectionRendererFactory)
    SelectionController.prototype.deselectIndex = function (rowIndex) {
        var node = this.rowModel.getVirtualRow(rowIndex);
        if (node) {
            this.deselectNode(node);
            this.syncSelectedRowsAndCallListener();
        }
    };

    // public (selectionRendererFactory & api)
    SelectionController.prototype.selectIndex = function (index, tryMulti) {
        var node = this.rowModel.getVirtualRow(index);
        this.selectNode(node, tryMulti);
    };

    // private
    // updates the selectedRows with the selectedNodes and calls selectionChanged listener
    SelectionController.prototype.syncSelectedRowsAndCallListener = function () {
        // update selected rows
        var selectedRows = this.selectedRows;
        var selectedNodes = this.selectedNodes;

        selectedRows.length = 0;
        selectedNodes.forEach(function (node) {
            selectedRows.push(node.rowData);
        });

        if (typeof this.gridOptionsWrapper.getSelectionChanged() === "function") {
            this.gridOptionsWrapper.getSelectionChanged()();
        }

        var that = this;
        setTimeout(function () { that.$scope.$apply(); }, 0);
    };

    // public (selectionRendererFactory)
    SelectionController.prototype.isNodeSelected = function(node) {
        return this.selectedNodes.indexOf(node) >= 0;
    };

    return SelectionController;

});