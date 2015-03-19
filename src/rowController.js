define([
    "./groupCreator",
    "./utils",
    "./constants"
], function(groupCreator, utils, constants) {

    function RowController(gridOptionsWrapper, rowModel, colModel, angularGrid, filterManager) {
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.rowModel = rowModel;
        this.colModel = colModel;
        this.angularGrid = angularGrid;
        this.filterManager = filterManager;
    }

    RowController.prototype.updateModel = function(step) {

        //fallthrough in below switch is on purpose
        switch (step) {
            case constants.STEP_EVERYTHING :
                this.doGrouping();
            case constants.STEP_FILTER :
                this.doFilter();
            case constants.STEP_SORT :
                this.doSort();
            case constants.STEP_MAP :
                this.doGroupMapping();
        }

    };

    RowController.prototype.doSort = function () {
        //see if there is a col we are sorting by
        var colDefWrapperForSorting = null;
        this.colModel.getColDefWrappers().forEach(function (colDefWrapper) {
            if (colDefWrapper.sort) {
                colDefWrapperForSorting = colDefWrapper;
            }
        });

        var rowNodesBeforeSort = this.rowModel.getRowsAfterFilter().slice(0);

        if (colDefWrapperForSorting) {
            var ascending = colDefWrapperForSorting.sort === constants.ASC;
            var inverter = ascending ? 1 : -1;

            this.sortList(rowNodesBeforeSort, colDefWrapperForSorting.colDef, inverter);
        } else {
            //if no sorting, set all group children after sort to the original list
            this.resetSortInGroups(rowNodesBeforeSort);
        }

        this.rowModel.setRowsAfterSort(rowNodesBeforeSort);
    };

    RowController.prototype.resetSortInGroups = function(rowNodes) {
        for (var i = 0, l = rowNodes.length; i<l; i++) {
            var item = rowNodes[i];
            if (item.group) {
                item.childrenAfterSort = item.children;
                this.resetSortInGroups(item.children);
            }
        }
    };

    RowController.prototype.sortList = function (nodes, colDefForSorting, inverter) {

        // sort any groups recursively
        for (var i = 0, l = nodes.length; i<l; i++) { // critical section, no functional programming
            var node = nodes[i];
            if (node.group) {
                node.childrenAfterSort = node.children.slice(0);
                this.sortList(node.childrenAfterSort, colDefForSorting, inverter);
            }
        }

        nodes.sort(function (objA, objB) {
            var keyForSort = colDefForSorting.field;
            var valueA = objA.rowData ? objA.rowData[keyForSort] : null;
            var valueB = objB.rowData ? objB.rowData[keyForSort] : null;

            if (colDefForSorting.comparator) {
                //if comparator provided, use it
                return colDefForSorting.comparator(valueA, valueB) * inverter;
            } else {
                //otherwise do our own comparison
                return utils.defaultComparator(valueA, valueB) * inverter;
            }

        });
    };

    RowController.prototype.doGrouping = function () {
        var rowsAfterGroup;
        if (this.gridOptionsWrapper.isDoInternalGrouping()) {
            var expandByDefault = this.gridOptionsWrapper.isGroupDefaultExpanded();
            rowsAfterGroup = groupCreator.group(this.rowModel.getAllRows(), this.gridOptionsWrapper.getGroupKeys(),
                this.gridOptionsWrapper.getGroupAggFunction(), expandByDefault);
        } else {
            rowsAfterGroup = this.rowModel.getAllRows();
        }
        this.rowModel.setRowsAfterGroup(rowsAfterGroup);
    };

    RowController.prototype.doFilter = function () {
        var quickFilterPresent = this.angularGrid.getQuickFilter() !== null;
        var advancedFilterPresent = this.filterManager.isFilterPresent();
        var filterPresent = quickFilterPresent || advancedFilterPresent;

        var rowsAfterFilter;
        if (filterPresent) {
            rowsAfterFilter = this.filterItems(this.rowModel.getRowsAfterGroup(), quickFilterPresent, advancedFilterPresent);
        } else {
            rowsAfterFilter = this.rowModel.getRowsAfterGroup();
        }
        this.rowModel.setRowsAfterFilter(rowsAfterFilter);
    };

    RowController.prototype.filterItems = function (rowNodes, quickFilterPresent, advancedFilterPresent) {
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

    RowController.prototype.setAllRows = function(allRows) {
        if (this.gridOptionsWrapper.isRowsAlreadyGrouped()) {
            this.rowModel.setAllRows(allRows);
        } else {
            // place each row into a wrapper
            var allRowsWrapped = [];
            for (var i = 0; i < allRows.length; i++) { // could be lots of rows, don't use functional programming
                allRowsWrapped.push({
                    rowData: allRows[i]
                });
            }
            this.rowModel.setAllRows(allRowsWrapped);
        }
    };

    RowController.prototype.getTotalChildCount = function(rowNodes) {
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

    RowController.prototype.copyGroupNode = function (groupNode, children, allChildrenCount) {
        return {
            group: true,
            field: groupNode.field,
            key: groupNode.key,
            expanded: groupNode.expanded,
            children: children,
            allChildrenCount: allChildrenCount,
            level: groupNode.level
        };
    };

    RowController.prototype.doGroupMapping = function () {
        var rowsAfterMap;

        // took this 'if' statement out to allow user to provide items already grouped.
        // want to keep an eye on performance, if grid still performs with this 'additional'
        // step, then will leave as below.
        //if (this.gridOptionsWrapper.getGroupKeys()) {
            rowsAfterMap = [];
            this.addToMap(rowsAfterMap, this.rowModel.getRowsAfterSort());
        //} else {
        //    rowsAfterMap = this.rowModel.getRowsAfterSort();
        //}
        this.rowModel.setRowsAfterMap(rowsAfterMap);
    };

    RowController.prototype.addToMap = function (mappedData, originalNodes) {
        for (var i = 0; i<originalNodes.length; i++) {
            var node = originalNodes[i];
            mappedData.push(node);
            if (node.group && node.expanded) {
                this.addToMap(mappedData, node.childrenAfterSort);
            }
        }
    };

    RowController.prototype.doesRowPassFilter = function(rowNode, quickFilterPresent, advancedFilterPresent) {
        //first up, check quick filter
        if (quickFilterPresent) {
            if (!rowNode.quickFilterAggregateText) {
                this.aggregateRowForQuickFilter(rowNode);
            }
            if (rowNode.quickFilterAggregateText.indexOf(this.angularGrid.getQuickFilter()) < 0) {
                //quick filter fails, so skip item
                return false;
            }
        }

        //second, check advanced filter
        if (advancedFilterPresent) {
            if (!this.filterManager.doesFilterPass(rowNode.rowData)) {
                return false;
            }
        }

        //got this far, all filters pass
        return true;
    };

    RowController.prototype.aggregateRowForQuickFilter = function (rowDataWrapper) {
        var aggregatedText = '';
        this.colModel.getColDefWrappers().forEach(function (colDefWrapper) {
            var rowData = rowDataWrapper.rowData;
            var value = rowData ? rowData[colDefWrapper.colDef.field] : null;
            if (value && value !== '') {
                aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
            }
        });
        rowDataWrapper.quickFilterAggregateText = aggregatedText;
    };

    return RowController;
});