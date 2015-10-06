/// <reference path="utils.ts" />
/// <reference path="rendering/rowRenderer.ts" />

module ag.grid {

    var utils = Utils;

    // these constants are used for determining if groups should
    // be selected or deselected when selecting groups, and the group
    // then selects the children.
    var SELECTED = 0;
    var UNSELECTED = 1;
    var MIXED = 2;
    var DO_NOT_CARE = 3;

    export class SelectionController {

        private eParentsOfRows: HTMLElement[];
        private angularGrid: Grid;
        private gridOptionsWrapper: GridOptionsWrapper;
        private $scope: any;
        private rowRenderer: RowRenderer;
        private selectedRows: any;
        private selectedNodesById: any;
        private rowModel: any;
        private eventService: EventService;

        public init(angularGrid: Grid, gridPanel: GridPanel, gridOptionsWrapper: GridOptionsWrapper,
                    $scope: any, rowRenderer: RowRenderer, eventService: EventService) {
            this.eParentsOfRows = gridPanel.getRowsParent();
            this.angularGrid = angularGrid;
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.$scope = $scope;
            this.rowRenderer = rowRenderer;
            this.eventService = eventService;

            this.initSelectedNodesById();
            this.selectedRows = [];
        }

        private initSelectedNodesById() {
            this.selectedNodesById = {};
        }

        public getSelectedNodesById() {
            return this.selectedNodesById;
        }

        public getSelectedRows() {
            return this.selectedRows;
        }

        public getSelectedNodes() {
            var selectedNodes: any = [];
            var keys = Object.keys(this.selectedNodesById);
            for (var i = 0; i < keys.length; i++) {
                var id = keys[i];
                var selectedNode = this.selectedNodesById[id];
                selectedNodes.push(selectedNode);
            }
            return selectedNodes;
        }

        // returns a list of all nodes at 'best cost' - a feature to be used
        // with groups / trees. if a group has all it's children selected,
        // then the group appears in the result, but not the children.
        // Designed for use with 'children' as the group selection type,
        // where groups don't actually appear in the selection normally.
        public getBestCostNodeSelection() {

            if (typeof this.rowModel.getTopLevelNodes !== 'function') {
                throw 'selectAll not available when rows are on the server';
            }

            var topLevelNodes = this.rowModel.getTopLevelNodes();

            var result: any = [];
            var that = this;

            // recursive function, to find the selected nodes
            function traverse(nodes: any) {
                for (var i = 0, l = nodes.length; i < l; i++) {
                    var node = nodes[i];
                    if (that.isNodeSelected(node)) {
                        result.push(node);
                    } else {
                        // if not selected, then if it's a group, and the group
                        // has children, continue to search for selections
                        if (node.group && node.children) {
                            traverse(node.children);
                        }
                    }
                }
            }

            traverse(topLevelNodes);

            return result;
        }

        public setRowModel(rowModel: any) {
            this.rowModel = rowModel;
        }

        // this clears the selection, but doesn't clear down the css - when it is called, the
        // caller then gets the grid to refresh.
        public deselectAll() {
            this.initSelectedNodesById();
            //var keys = Object.keys(this.selectedNodesById);
            //for (var i = 0; i < keys.length; i++) {
            //    delete this.selectedNodesById[keys[i]];
            //}
            this.syncSelectedRowsAndCallListener();
        }

        // this selects everything, but doesn't clear down the css - when it is called, the
        // caller then gets the grid to refresh.
        public selectAll() {

            if (typeof this.rowModel.getTopLevelNodes !== 'function') {
                throw 'selectAll not available when rows are on the server';
            }

            var selectedNodesById = this.selectedNodesById;
            // if the selection is "don't include groups", then we don't include them!
            var includeGroups = !this.gridOptionsWrapper.isGroupSelectsChildren();

            function recursivelySelect(nodes: any) {
                if (nodes) {
                    for (var i = 0; i < nodes.length; i++) {
                        var node = nodes[i];
                        if (node.group) {
                            recursivelySelect(node.children);
                            if (includeGroups) {
                                selectedNodesById[node.id] = node;
                            }
                        } else {
                            selectedNodesById[node.id] = node;
                        }
                    }
                }
            }

            var topLevelNodes = this.rowModel.getTopLevelNodes();
            recursivelySelect(topLevelNodes);

            this.syncSelectedRowsAndCallListener();
        }

        public selectNode(node: any, tryMulti: any, suppressEvents?: any) {
            var multiSelect = this.gridOptionsWrapper.isRowSelectionMulti() && tryMulti;

            // if the node is a group, then selecting this is the same as selecting the parent,
            // so to have only one flow through the below, we always select the header parent
            // (which then has the side effect of selecting the child).
            var nodeToSelect: any;
            if (node.footer) {
                nodeToSelect = node.sibling;
            } else {
                nodeToSelect = node;
            }

            // at the end, if this is true, we inform the callback
            var atLeastOneItemUnselected = false;
            var atLeastOneItemSelected = false;

            // see if rows to be deselected
            if (!multiSelect) {
                atLeastOneItemUnselected = this.doWorkOfDeselectAllNodes(null, suppressEvents);
            }

            if (this.gridOptionsWrapper.isGroupSelectsChildren() && nodeToSelect.group) {
                // don't select the group, select the children instead
                atLeastOneItemSelected = this.recursivelySelectAllChildren(nodeToSelect);
            } else {
                // see if row needs to be selected
                atLeastOneItemSelected = this.doWorkOfSelectNode(nodeToSelect, suppressEvents);
            }

            if (atLeastOneItemUnselected || atLeastOneItemSelected) {
                this.syncSelectedRowsAndCallListener(suppressEvents);
            }

            this.updateGroupParentsIfNeeded();
        }

        private recursivelySelectAllChildren(node: any, suppressEvents?: any) {
            var atLeastOne = false;
            if (node.children) {
                for (var i = 0; i < node.children.length; i++) {
                    var child = node.children[i];
                    if (child.group) {
                        if (this.recursivelySelectAllChildren(child)) {
                            atLeastOne = true;
                        }
                    } else {
                        if (this.doWorkOfSelectNode(child, suppressEvents)) {
                            atLeastOne = true;
                        }
                    }
                }
            }
            return atLeastOne;
        }

        private recursivelyDeselectAllChildren(node: RowNode, suppressEvents: boolean) {
            if (node.children) {
                for (var i = 0; i < node.children.length; i++) {
                    var child = node.children[i];
                    if (child.group) {
                        this.recursivelyDeselectAllChildren(child, suppressEvents);
                    } else {
                        this.deselectRealNode(child, suppressEvents);
                    }
                }
            }
        }

        // 1 - selects a node
        // 2 - updates the UI
        // 3 - calls callbacks
        private doWorkOfSelectNode(node: any, suppressEvents: any) {
            if (this.selectedNodesById[node.id]) {
                return false;
            }

            this.selectedNodesById[node.id] = node;

            this.addCssClassForNode_andInformVirtualRowListener(node);

            // also color in the footer if there is one
            if (node.group && node.expanded && node.sibling) {
                this.addCssClassForNode_andInformVirtualRowListener(node.sibling);
            }

            // inform the rowSelected listener, if any
            if (!suppressEvents) {
                var event: any = {node: node};
                this.eventService.dispatchEvent(Events.EVENT_ROW_SELECTED, event)
            }

            return true;
        }

        // 1 - selects a node
        // 2 - updates the UI
        // 3 - calls callbacks
        // wow - what a big name for a method, exception case, it's saying what the method does
        private addCssClassForNode_andInformVirtualRowListener(node: any) {
            var virtualRenderedRowIndex = this.rowRenderer.getIndexOfRenderedNode(node);
            if (virtualRenderedRowIndex >= 0) {
                this.eParentsOfRows.forEach( function(rowContainer: HTMLElement) {
                    utils.querySelectorAll_addCssClass(rowContainer, '[row="' + virtualRenderedRowIndex + '"]', 'ag-row-selected');
                });

                // inform virtual row listener
                this.angularGrid.onVirtualRowSelected(virtualRenderedRowIndex, true);
            }
        }

        // 1 - un-selects a node
        // 2 - updates the UI
        // 3 - calls callbacks
        private doWorkOfDeselectAllNodes(nodeToKeepSelected: RowNode, suppressEvents: boolean) {
            // not doing multi-select, so deselect everything other than the 'just selected' row
            var atLeastOneSelectionChange: any;
            var selectedNodeKeys = Object.keys(this.selectedNodesById);
            for (var i = 0; i < selectedNodeKeys.length; i++) {
                // skip the 'just selected' row
                var key = selectedNodeKeys[i];
                var nodeToDeselect = this.selectedNodesById[key];
                if (nodeToDeselect === nodeToKeepSelected) {
                    continue;
                } else {
                    this.deselectRealNode(nodeToDeselect, suppressEvents);
                    atLeastOneSelectionChange = true;
                }
            }
            return atLeastOneSelectionChange;
        }

        private deselectRealNode(node: any, suppressEvents: boolean) {
            // deselect the css
            this.removeCssClassForNode(node);

            // if node is a header, and if it has a sibling footer, deselect the footer also
            if (node.group && node.expanded && node.sibling) { // also check that it's expanded, as sibling could be a ghost
                this.removeCssClassForNode(node.sibling);
            }

            // remove the row
            delete this.selectedNodesById[node.id];

            if (!suppressEvents) {
                var event: any = {node: node};
                this.eventService.dispatchEvent(Events.EVENT_ROW_DESELECTED, event)
            }
        }

        private removeCssClassForNode(node: any) {
            var virtualRenderedRowIndex = this.rowRenderer.getIndexOfRenderedNode(node);
            if (virtualRenderedRowIndex >= 0) {
                this.eParentsOfRows.forEach( function(rowContainer: HTMLElement) {
                    utils.querySelectorAll_removeCssClass(rowContainer, '[row="' + virtualRenderedRowIndex + '"]', 'ag-row-selected');
                });
                // inform virtual row listener
                this.angularGrid.onVirtualRowSelected(virtualRenderedRowIndex, false);
            }
        }

        // used by selectionRendererFactory
        public deselectIndex(rowIndex: any, suppressEvents: boolean = false) {
            var node = this.rowModel.getVirtualRow(rowIndex);
            this.deselectNode(node, suppressEvents);
        }

        // used by api
        public deselectNode(node: any, suppressEvents: boolean = false) {
            if (node) {
                if (this.gridOptionsWrapper.isGroupSelectsChildren() && node.group) {
                    // want to deselect children, not this node, so recursively deselect
                    this.recursivelyDeselectAllChildren(node, suppressEvents);
                } else {
                    this.deselectRealNode(node, suppressEvents);
                }
            }
            this.syncSelectedRowsAndCallListener();
            this.updateGroupParentsIfNeeded();
        }

        // used by selectionRendererFactory & api
        public selectIndex(index: any, tryMulti: boolean, suppressEvents: boolean = false) {
            var node = this.rowModel.getVirtualRow(index);
            this.selectNode(node, tryMulti, suppressEvents);
        }

        // updates the selectedRows with the selectedNodes and calls selectionChanged listener
        private syncSelectedRowsAndCallListener(suppressEvents?: any) {
            // update selected rows
            var selectedRows = this.selectedRows;
            var oldCount = selectedRows.length;
            // clear selected rows
            selectedRows.length = 0;
            var keys = Object.keys(this.selectedNodesById);
            for (var i = 0; i < keys.length; i++) {
                if (this.selectedNodesById[keys[i]] !== undefined) {
                    var selectedNode = this.selectedNodesById[keys[i]];
                    selectedRows.push(selectedNode.data);
                }
            }

            // this stop the event firing the very first the time grid is initialised. without this, the documentation
            // page had a popup in the 'selection' page as soon as the page was loaded!!
            var nothingChangedMustBeInitialising = oldCount === 0 && selectedRows.length === 0;

            if (!nothingChangedMustBeInitialising && !suppressEvents) {
                var event = {
                    selectedNodesById: this.selectedNodesById,
                    selectedRows: this.selectedRows
                };
                this.eventService.dispatchEvent(Events.EVENT_SELECTION_CHANGED, event);
            }

            var that = this;
            if (this.$scope) {
                setTimeout(function () {
                    that.$scope.$apply();
                }, 0);
            }
        }

        private recursivelyCheckIfSelected(node: any) {
            var foundSelected = false;
            var foundUnselected = false;

            if (node.children) {
                for (var i = 0; i < node.children.length; i++) {
                    var child = node.children[i];
                    var result: any;
                    if (child.group) {
                        result = this.recursivelyCheckIfSelected(child);
                        switch (result) {
                            case SELECTED:
                                foundSelected = true;
                                break;
                            case UNSELECTED:
                                foundUnselected = true;
                                break;
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
        }

        // used by selectionRendererFactory
        // returns:
        // true: if selected
        // false: if unselected
        // undefined: if it's a group and 'children selection' is used and 'children' are a mix of selected and unselected
        public isNodeSelected(node: any) {
            if (this.gridOptionsWrapper.isGroupSelectsChildren() && node.group) {
                // doing child selection, we need to traverse the children
                var resultOfChildren = this.recursivelyCheckIfSelected(node);
                switch (resultOfChildren) {
                    case SELECTED:
                        return true;
                    case UNSELECTED:
                        return false;
                    default:
                        return undefined;
                }
            } else {
                return this.selectedNodesById[node.id] !== undefined;
            }
        }

        private updateGroupParentsIfNeeded() {
            // we only do this if parent nodes are responsible
            // for selecting their children.
            if (!this.gridOptionsWrapper.isGroupSelectsChildren()) {
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

                    this.eParentsOfRows.forEach( function(rowContainer: HTMLElement) {
                        if (selected) {
                            utils.querySelectorAll_addCssClass(rowContainer, '[row="' + rowIndex + '"]', 'ag-row-selected');
                        } else {
                            utils.querySelectorAll_removeCssClass(rowContainer, '[row="' + rowIndex + '"]', 'ag-row-selected');
                        }
                    });
                }
            }
        }
    }
}

