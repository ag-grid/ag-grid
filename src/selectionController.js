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

        this.selectedNodes = [];
        this.selectedRows = [];

        gridOptionsWrapper.setSelectedRows(this.selectedRows);
        gridOptionsWrapper.setSelectedNodes(this.selectedNodes);
    };

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

        if (this.gridOptionsWrapper.isGroupSelectionChildren() && node.group) {
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
        if (this.selectedNodes.indexOf(node) >= 0) {
            return false;
        }

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

        return true;
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
            if (this.gridOptionsWrapper.isGroupSelectionChildren() && node.group) {
                // want to deselect children, not this node, so recursively deselect
                this.recursivelyDeselectAllChildren(node);
            } else {
                this.deselectNode(node);
                this.syncSelectedRowsAndCallListener();
            }
        }
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
    // NOTE: This method is very slow. Need to speed it up.
    SelectionController.prototype.isNodeSelected = function(node) {
        if (this.gridOptionsWrapper.isGroupSelectionChildren() && node.group) {
            // doing child selection, we need to traverse the children
            var resultOfChildren = this.recursivelyCheckIfSelected(node);
            switch (resultOfChildren) {
                case SELECTED : return true;
                case UNSELECTED : return false;
                default : return undefined;
            }
        } else {
            return this.selectedNodes.indexOf(node) >= 0;
        }
    };

    SelectionController.prototype.updateGroupParentsIfNeeded = function() {
        // we only do this if parent nodes are responsible
        // for selecting their children.
        if (!this.gridOptionsWrapper.isGroupSelectionChildren()) {
            return;
        }

        var firstRow = this.rowRenderer.getFirstVirtualRenderedRow();
        var lastRow = this.rowRenderer.getLastVirtualRenderedRow();
        for (var rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
            // see if node is a group
            var node = this.rowModel.getVirtualRow(rowIndex);
            // node could be null, if we are within the buffer region and
            // no row for this location, eg negative rows
            if (node && node.group) {
                var selected = this.isNodeSelected(node);
                this.angularGrid.onVirtualRowSelected(rowIndex, selected);
            }
        }
    };

    return SelectionController;

});