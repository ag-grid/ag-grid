define(['./utils'], function(utils) {

    // these constants are used for determining if groups should
    // be selected or deselected when selecting groups, and the group
    // then selects the children.
    var SELECTED = 0;
    var UNSELECTED = 1;
    var MIXED = 2;
    var DO_NOT_CARE = 3;

    function SelectionController() {}

    SelectionController.prototype.init = function(angularGrid, eRowsParent, gridOptionsWrapper, rowModel, $scope, rowRenderer) {
        this.eRowsParent = eRowsParent;
        this.angularGrid = angularGrid;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.rowModel = rowModel;
        this.$scope = $scope;
        this.rowRenderer = rowRenderer;

        this.selectedNodesById = {};
        this.selectedRows = [];

        gridOptionsWrapper.setSelectedRows(this.selectedRows);
        gridOptionsWrapper.setSelectedNodesById(this.selectedNodesById);
    };

    // public
    SelectionController.prototype.clearSelection = function() {
        this.selectedRows.length = 0;
        var keys = Object.keys(this.selectedNodesById);
        for (var i = 0; i<keys.length; i++) {
            delete this.selectedNodesById[keys[i]];
        }
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

        if (this.gridOptionsWrapper.isGroupCheckboxSelectionChildren() && node.group) {
            // don't select the group, select the children instead
            atLeastOneItemSelected = this.recursivelySelectAllChildren(node);
        } else {
            // see if row needs to be selected
            atLeastOneItemSelected = this.doWorkOfSelectNode(node);
        }

        if (atLeastOneItemUnselected || atLeastOneItemSelected) {
            this.syncSelectedRowsAndCallListener();
        }

        this.updateGroupParentsIfNeeded();
    };

    SelectionController.prototype.recursivelySelectAllChildren = function(node) {
        var atLeastOne = false;
        if (node.children) {
            for (var i = 0; i<node.children.length; i++) {
                var child = node.children[i];
                if (child.group) {
                    if(this.recursivelySelectAllChildren(child)) {
                        atLeastOne = true;
                    }
                } else {
                    if (this.doWorkOfSelectNode(child)) {
                        atLeastOne = true;
                    }
                }
            }
        }
        return atLeastOne;
    };

    SelectionController.prototype.recursivelyDeselectAllChildren = function(node) {
        if (node.children) {
            for (var i = 0; i<node.children.length; i++) {
                var child = node.children[i];
                if (child.group) {
                    this.recursivelyDeselectAllChildren(child);
                } else {
                    this.deselectNode(child);
                }
            }
        }
    };

    // private
    // 1 - selects a node
    // 2 - updates the UI
    // 3 - calls callbacks
    SelectionController.prototype.doWorkOfSelectNode = function (node) {
        if (this.selectedNodesById[node.id]) {
            return false;
        }

        this.selectedNodesById[node.id] = node;

        // set css class on selected row
        var virtualRenderedRowIndex = this.rowRenderer.getIndexOfRenderedNode(node);
        if (virtualRenderedRowIndex >= 0) {
            utils.querySelectorAll_addCssClass(this.eRowsParent, '[row="' + virtualRenderedRowIndex + '"]', 'ag-row-selected');

            // inform virtual row listener
            this.angularGrid.onVirtualRowSelected(virtualRenderedRowIndex, true);
        }

        // inform the rowSelected listener, if any
        if (typeof this.gridOptionsWrapper.getRowSelected() === "function") {
            this.gridOptionsWrapper.getRowSelected()(node.data, node);
        }

        return true;
    };

    // private
    // 1 - un-selects a node
    // 2 - updates the UI
    // 3 - calls callbacks
    SelectionController.prototype.doWorkOfDeselectAllNodes = function (nodeToKeepSelected) {
        // not doing multi-select, so deselect everything other than the 'just selected' row
        var atLeastOneSelectionChange;
        var selectedNodeKeys = Object.keys(this.selectedNodesById);
        for (var i = 0; i < selectedNodeKeys.length; i++) {
            // skip the 'just selected' row
            var key = selectedNodeKeys[i];
            var nodeToDeselect = this.selectedNodesById[key];
            if (nodeToDeselect === nodeToKeepSelected) {
                continue;
            } else {
                this.deselectNode(nodeToDeselect);
                atLeastOneSelectionChange = true;
            }
        }
        return atLeastOneSelectionChange;
    };

    // private
    SelectionController.prototype.deselectNode = function (node) {
        // deselect the css
        var virtualRenderedRowIndex = this.rowRenderer.getIndexOfRenderedNode(node);
        if (virtualRenderedRowIndex >= 0) {
            utils.querySelectorAll_removeCssClass(this.eRowsParent, '[row="' + virtualRenderedRowIndex + '"]', 'ag-row-selected');
            // inform virtual row listener
            this.angularGrid.onVirtualRowSelected(virtualRenderedRowIndex, false);
        }

        // remove the row
        this.selectedNodesById[node.id] = undefined;
    };

    // public (selectionRendererFactory)
    SelectionController.prototype.deselectIndex = function (rowIndex) {
        var node = this.rowModel.getVirtualRow(rowIndex);
        if (node) {
            if (this.gridOptionsWrapper.isGroupCheckboxSelectionChildren() && node.group) {
                // want to deselect children, not this node, so recursively deselect
                this.recursivelyDeselectAllChildren(node);
            } else {
                this.deselectNode(node);
            }
        }
        this.syncSelectedRowsAndCallListener();
        this.updateGroupParentsIfNeeded();
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
        // clear selected rows
        selectedRows.length = 0;
        var keys = Object.keys(this.selectedNodesById);
        for (var i = 0; i<keys.length; i++) {
            if (this.selectedNodesById[keys[i]] !== undefined) {
                var selectedNode = this.selectedNodesById[keys[i]];
                selectedRows.push(selectedNode.data);
            }
        }

        if (typeof this.gridOptionsWrapper.getSelectionChanged() === "function") {
            this.gridOptionsWrapper.getSelectionChanged()();
        }

        var that = this;
        setTimeout(function () { that.$scope.$apply(); }, 0);
    };

    // private
    SelectionController.prototype.recursivelyCheckIfSelected = function(node) {
        var foundSelected = false;
        var foundUnselected = false;

        if (node.children) {
            for (var i = 0; i<node.children.length; i++) {
                var child = node.children[i];
                var result;
                if (child.group) {
                    result = this.recursivelyCheckIfSelected(child);
                    switch (result) {
                        case SELECTED : foundSelected = true; break;
                        case UNSELECTED : foundUnselected = true; break;
                        case MIXED:
                            foundSelected = true;
                            foundUnselected = true;
                            break;
                        // we can ignore the DO_NOT_CARE, as it doesn't impact, means the child
                        // has no children and shouldn't be considered when deciding
                    }
                } else {
                    if (this.isNodeSelected(child)) {
                        foundSelected = true;
                    } else {
                        foundUnselected = true;
                    }
                }

                if (foundSelected && foundUnselected) {
                    // if mixed, then no need to go further, just return up the chain
                    return MIXED;
                }
            }
        }

        // got this far, so no conflicts, either all children selected, unselected, or neither
        if (foundSelected) {
            return SELECTED;
        } else if (foundUnselected) {
            return UNSELECTED;
        } else {
            return DO_NOT_CARE;
        }
    };

    // public (selectionRendererFactory)
    // returns:
    // true: if selected
    // false: if unselected
    // undefined: if it's a group and 'children selection' is sued adn 'children' are a mix of selected and unselected
    SelectionController.prototype.isNodeSelected = function(node) {
        if (this.gridOptionsWrapper.isGroupCheckboxSelectionChildren() && node.group) {
            // doing child selection, we need to traverse the children
            var resultOfChildren = this.recursivelyCheckIfSelected(node);
            switch (resultOfChildren) {
                case SELECTED : return true;
                case UNSELECTED : return false;
                default : return undefined;
            }
        } else {
            return this.selectedNodesById[node.id] !== undefined;
        }
    };

    SelectionController.prototype.updateGroupParentsIfNeeded = function() {
        // we only do this if parent nodes are responsible
        // for selecting their children.
        if (!this.gridOptionsWrapper.isGroupCheckboxSelectionChildren()) {
            return;
        }

        var firstRow = this.rowRenderer.getFirstVirtualRenderedRow();
        var lastRow = this.rowRenderer.getLastVirtualRenderedRow();
        for (var rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
            // see if node is a group
            var node = this.rowModel.getVirtualRow(rowIndex);
            if (node.group) {
                var selected = this.isNodeSelected(node);
                this.angularGrid.onVirtualRowSelected(rowIndex, selected);

                if (selected) {
                    utils.querySelectorAll_addCssClass(this.eRowsParent, '[row="' + rowIndex + '"]', 'ag-row-selected');
                } else {
                    utils.querySelectorAll_removeCssClass(this.eRowsParent, '[row="' + rowIndex + '"]', 'ag-row-selected');
                }
            }
        }
    };

    return SelectionController;

});