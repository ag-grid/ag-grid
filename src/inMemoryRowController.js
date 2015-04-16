define([
    "./groupCreator",
    "./utils",
    "./constants"
], function(groupCreator, utils, constants) {

    function InMemoryRowController() {
        this.createModel();
    }

    InMemoryRowController.prototype.init = function (gridOptionsWrapper, columnModel, angularGrid, filterManager, $scope) {
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.columnModel = columnModel;
        this.angularGrid = angularGrid;
        this.filterManager = filterManager;
        this.$scope = $scope;

        this.allRows = null;
        this.rowsAfterGroup = null;
        this.rowsAfterFilter = null;
        this.rowsAfterSort = null;
        this.rowsAfterMap = null;
    };

    // private
    InMemoryRowController.prototype.createModel = function() {
        var that = this;
        this.model = {
            // this method is implemented by the inMemory model only,
            // it gives the top level of the selection. used by the selection
            // controller, when it needs to do a full traversal
            getTopLevelNodes: function() {
                return that.rowsAfterGroup;
            },
            getVirtualRow: function(index) {
                return that.rowsAfterMap[index];
            },
            getVirtualRowCount: function() {
                if (that.rowsAfterMap) {
                    return that.rowsAfterMap.length;
                } else {
                    return 0;
                }
            }
        };
    };

    // public
    InMemoryRowController.prototype.getModel = function() {
        return this.model;
    };

    // public
    InMemoryRowController.prototype.updateModel = function(step) {

        // fallthrough in below switch is on purpose
        switch (step) {
            case constants.STEP_EVERYTHING :
                this.doGrouping();
            case constants.STEP_FILTER :
                this.doFilter();
                this.doAggregate();
            case constants.STEP_SORT :
                this.doSort();
            case constants.STEP_MAP :
                this.doGroupMapping();
        }

        if (typeof this.gridOptionsWrapper.getModelUpdated() === 'function') {
            this.gridOptionsWrapper.getModelUpdated()();
            var $scope = this.$scope;
            if ($scope) {
                setTimeout(function () {
                    $scope.$apply();
                }, 0);
            }
        }

    };

    // public - it's possible to recompute the aggregate without doing the other parts
    InMemoryRowController.prototype.doAggregate = function () {

        var groupAggFunction = this.gridOptionsWrapper.getGroupAggFunction();
        if (typeof groupAggFunction !== 'function') {
            return;
        }

        this.recursivelyCreateAggData(this.rowsAfterFilter, groupAggFunction);
    };

    // public
    InMemoryRowController.prototype.expandOrCollapseAll = function(expand, rowNodes) {
        // if first call in recursion, we set list to parent list
        if (rowNodes === null) { rowNodes = this.rowsAfterGroup; }

        if (!rowNodes) { return; }

        var _this = this;
        rowNodes.forEach(function(node) {
            if (node.group) {
                node.expanded = expand;
                _this.expandOrCollapseAll(expand, node.children);
            }
        });
    };

    // private
    InMemoryRowController.prototype.recursivelyCreateAggData = function (nodes, groupAggFunction) {
        for (var i = 0, l = nodes.length; i<l; i++) {
            var node = nodes[i];
            if (node.group) {
                // agg function needs to start at the bottom, so traverse first
                this.recursivelyCreateAggData(node.children, groupAggFunction);
                // after traversal, we can now do the agg at this level
                var data = groupAggFunction(node.children);
                node.data = data;
                // if we are grouping, then it's possible there is a sibling footer
                // to the group, so update the data here also if thers is one
                if (node.sibling) {
                    node.sibling.data = data;
                }
            }
        }
    };

    // private
    InMemoryRowController.prototype.doSort = function () {
        //see if there is a col we are sorting by
        var colDefWrapperForSorting = null;
        this.columnModel.getAllColumns().forEach(function (colDefWrapper) {
            if (colDefWrapper.sort) {
                colDefWrapperForSorting = colDefWrapper;
            }
        });

        var rowNodesBeforeSort = this.rowsAfterFilter.slice(0);

        if (colDefWrapperForSorting) {
            var ascending = colDefWrapperForSorting.sort === constants.ASC;
            var inverter = ascending ? 1 : -1;

            this.sortList(rowNodesBeforeSort, colDefWrapperForSorting.colDef, inverter);
        } else {
            //if no sorting, set all group children after sort to the original list
            this.resetSortInGroups(rowNodesBeforeSort);
        }

        this.rowsAfterSort = rowNodesBeforeSort;
    };

    // private
    InMemoryRowController.prototype.resetSortInGroups = function(rowNodes) {
        for (var i = 0, l = rowNodes.length; i<l; i++) {
            var item = rowNodes[i];
            if (item.group && item.children) {
                item.childrenAfterSort = item.children;
                this.resetSortInGroups(item.children);
            }
        }
    };

    // private
    InMemoryRowController.prototype.sortList = function (nodes, colDefForSorting, inverter) {

        // sort any groups recursively
        for (var i = 0, l = nodes.length; i<l; i++) { // critical section, no functional programming
            var node = nodes[i];
            if (node.group && node.children) {
                node.childrenAfterSort = node.children.slice(0);
                this.sortList(node.childrenAfterSort, colDefForSorting, inverter);
            }
        }

        nodes.sort(function (objA, objB) {
            var keyForSort = colDefForSorting.field;
            var valueA = objA.data ? objA.data[keyForSort] : null;
            var valueB = objB.data ? objB.data[keyForSort] : null;

            if (colDefForSorting.comparator) {
                //if comparator provided, use it
                return colDefForSorting.comparator(valueA, valueB) * inverter;
            } else {
                //otherwise do our own comparison
                return utils.defaultComparator(valueA, valueB) * inverter;
            }

        });
    };

    // private
    InMemoryRowController.prototype.doGrouping = function () {
        var rowsAfterGroup;
        if (this.gridOptionsWrapper.isDoInternalGrouping()) {
            var expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
            rowsAfterGroup = groupCreator.group(this.allRows, this.gridOptionsWrapper.getGroupKeys(),
                this.gridOptionsWrapper.getGroupAggFunction(), expandByDefault);
        } else {
            rowsAfterGroup = this.allRows;
        }
        this.rowsAfterGroup = rowsAfterGroup;
    };

    // private
    InMemoryRowController.prototype.doFilter = function () {
        var quickFilterPresent = this.angularGrid.getQuickFilter() !== null;
        var advancedFilterPresent = this.filterManager.isFilterPresent();
        var filterPresent = quickFilterPresent || advancedFilterPresent;

        var rowsAfterFilter;
        if (filterPresent) {
            rowsAfterFilter = this.filterItems(this.rowsAfterGroup, quickFilterPresent, advancedFilterPresent);
        } else {
            rowsAfterFilter = this.rowsAfterGroup;
        }
        this.rowsAfterFilter = rowsAfterFilter;
    };

    // private
    InMemoryRowController.prototype.filterItems = function (rowNodes, quickFilterPresent, advancedFilterPresent) {
        var result = [];

        for (var i = 0, l = rowNodes.length; i < l; i++) {
            var node = rowNodes[i];

            if (node.group) {
                // deal with group
                var filteredChildren = this.filterItems(node.children, quickFilterPresent, advancedFilterPresent);
                if (filteredChildren.length>0) {
                    var allChildrenCount = this.getTotalChildCount(filteredChildren);
                    var newGroup = this.copyGroupNode(node, filteredChildren, allChildrenCount);

                    result.push(newGroup);
                }
            } else {
                if (this.doesRowPassFilter(node, quickFilterPresent, advancedFilterPresent)) {
                    result.push(node);
                }
            }
        }

        return result;
    };

    // private
    // rows: the rows to put into the model
    // firstId: the first id to use, used for paging, where we are not on the first page
    InMemoryRowController.prototype.setAllRows = function(rows, firstId) {
        var nodes;
        if (this.gridOptionsWrapper.isRowsAlreadyGrouped()) {
            nodes = rows;
            this.recursivelyCheckUserProvidedNodes(nodes, null, 0);
        } else {
            // place each row into a wrapper
            var nodes = [];
            if (rows) {
                for (var i = 0; i < rows.length; i++) { // could be lots of rows, don't use functional programming
                    nodes.push({
                        data: rows[i]
                    });
                }
            }
        }

        // if firstId provided, use it, otherwise start at 0
        var firstIdToUse = firstId ? firstId : 0;
        this.recursivelyAddIdToNodes(nodes, firstIdToUse);
        this.allRows = nodes;
    };

    // add in index - this is used by the selectionController - so quick
    // to look up selected rows
    InMemoryRowController.prototype.recursivelyAddIdToNodes = function(nodes, index) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            node.id = index++;
            if (node.group && node.children) {
                index = this.recursivelyAddIdToNodes(node.children, index);
            }
        }
        return index;
    };

    // add in index - this is used by the selectionController - so quick
    // to look up selected rows
    InMemoryRowController.prototype.recursivelyCheckUserProvidedNodes = function(nodes, parent, level) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (parent) {
                node.parent = parent;
            }
            node.level = level;
            if (node.group && node.children) {
                this.recursivelyCheckUserProvidedNodes(node.children, node, level + 1);
            }
        }
    };

    // private
    InMemoryRowController.prototype.getTotalChildCount = function(rowNodes) {
        var count = 0;
        for (var i = 0, l = rowNodes.length; i<l; i++) {
            var item = rowNodes[i];
            if (item.group) {
                count += item.allChildrenCount;
            } else {
                count++;
            }
        }
        return count;
    };

    // private
    InMemoryRowController.prototype.copyGroupNode = function (groupNode, children, allChildrenCount) {
        return {
            group: true,
            data: groupNode.data,
            field: groupNode.field,
            key: groupNode.key,
            expanded: groupNode.expanded,
            children: children,
            allChildrenCount: allChildrenCount,
            level: groupNode.level
        };
    };

    // private
    InMemoryRowController.prototype.doGroupMapping = function () {
        // even if not going grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        var rowsAfterMap = [];
        this.addToMap(rowsAfterMap, this.rowsAfterSort);
        this.rowsAfterMap = rowsAfterMap;
    };

    // private
    InMemoryRowController.prototype.addToMap = function (mappedData, originalNodes) {
        if (!originalNodes) {
            return;
        }
        for (var i = 0; i<originalNodes.length; i++) {
            var node = originalNodes[i];
            mappedData.push(node);
            if (node.group && node.expanded) {
                this.addToMap(mappedData, node.childrenAfterSort);

                // put a footer in if user is looking for it
                if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
                    var footerNode = this.createFooterNode(node);
                    mappedData.push(footerNode);
                }
            }
        }
    };

    // private
    InMemoryRowController.prototype.createFooterNode = function (groupNode) {
        var footerNode = {};
        Object.keys(groupNode).forEach(function (key) {
            footerNode[key] = groupNode[key];
        });
        footerNode.footer = true;
        // get both header and footer to reference each other as siblings. this is never undone,
        // only overwritten. so if a group is expanded, then contracted, it will have a ghost
        // sibling - but that's fine, as we can ignore this if the header is contracted.
        footerNode.sibling = groupNode;
        groupNode.sibling = footerNode;
        return footerNode;
    };

    // private
    InMemoryRowController.prototype.doesRowPassFilter = function(node, quickFilterPresent, advancedFilterPresent) {
        //first up, check quick filter
        if (quickFilterPresent) {
            if (!node.quickFilterAggregateText) {
                this.aggregateRowForQuickFilter(node);
            }
            if (node.quickFilterAggregateText.indexOf(this.angularGrid.getQuickFilter()) < 0) {
                //quick filter fails, so skip item
                return false;
            }
        }

        //second, check advanced filter
        if (advancedFilterPresent) {
            if (!this.filterManager.doesFilterPass(node)) {
                return false;
            }
        }

        //got this far, all filters pass
        return true;
    };

    // private
    InMemoryRowController.prototype.aggregateRowForQuickFilter = function (node) {
        var aggregatedText = '';
        this.columnModel.getAllColumns().forEach(function (colDefWrapper) {
            var data = node.data;
            var value = data ? data[colDefWrapper.colDef.field] : null;
            if (value && value !== '') {
                aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
            }
        });
        node.quickFilterAggregateText = aggregatedText;
    };

    return InMemoryRowController;
});