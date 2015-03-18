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

        var rowsAfterSort = this.rowModel.getRowsAfterFilter().slice(0);

        if (colDefWrapperForSorting) {
            var ascending = colDefWrapperForSorting.sort === constants.ASC;
            var inverter = ascending ? 1 : -1;

            this.sortList(rowsAfterSort, colDefWrapperForSorting.colDef, inverter);
        } else {
            //if no sorting, set all group children after sort to the original list
            this.resetSortInGroups(rowsAfterSort);
        }

        this.rowModel.setRowsAfterSort(rowsAfterSort);
    };

    RowController.prototype.resetSortInGroups = function(items) {
        for (var i = 0, l = items.length; i<l; i++) {
            var item = items[i];
            var rowIsAGroup = item._angularGrid_group; //_angularGrid_group is set to true on groups
            if (rowIsAGroup) {
                item.childrenAfterSort = item.children;
                this.resetSortInGroups(item.children);
            }
        }
    };

    RowController.prototype.sortList = function (listForSorting, colDefForSorting, inverter) {

        //sort any groups recursively
        for (var i = 0, l = listForSorting.length; i<l; i++) { // critical section, no functional programming
            var item = listForSorting[i];
            var rowIsAGroup = item._angularGrid_group; //_angularGrid_group is set to true on groups
            if (rowIsAGroup) {
                item.childrenAfterSort = item.children.slice(0);
                this.sortList(item.childrenAfterSort, colDefForSorting, inverter);
            }
        }

        listForSorting.sort(function (objA, objB) {
            var keyForSort = colDefForSorting.field;
            var valueA = objA[keyForSort];
            var valueB = objB[keyForSort];

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
        if (this.gridOptionsWrapper.getGroupKeys()) {
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

    RowController.prototype.filterItems = function (items, quickFilterPresent, advancedFilterPresent) {
        var result = [];

        for (var i = 0, l = items.length; i < l; i++) {
            var item = items[i];

            var itemIsAGroup = item._angularGrid_group;
            if (itemIsAGroup) {
                //deal with group
                var filteredChildren = this.filterItems(item.children, quickFilterPresent, advancedFilterPresent);
                if (filteredChildren.length>0) {
                    var allChildrenCount = this.getTotalChildCount(filteredChildren);
                    var newGroup = this.copyGroup(item, filteredChildren, allChildrenCount);
                    result.push(newGroup);
                }
            } else {
                if (this.doesRowPassFilter(item, quickFilterPresent, advancedFilterPresent)) {
                    result.push(item);
                }
            }
        }

        return result;
    };

    RowController.prototype.getTotalChildCount = function(items) {
        var count = 0;
        for (var i = 0, l = items.length; i<l; i++) {
            var item = items[i];
            var itemIsAGroup = item._angularGrid_group;
            if (itemIsAGroup) {
                count += item.allChildrenCount;
            } else {
                count++;
            }
        }
        return count;
    };

    RowController.prototype.copyGroup = function (group, children, allChildrenCount) {
        return {
            _angularGrid_group: true,
            field: group.field,
            key: group.key,
            expanded: group.expanded,
            children: children,
            allChildrenCount: allChildrenCount,
            level: group.level
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

    RowController.prototype.addToMap = function (mappedData, originalList) {
        for (var i = 0; i<originalList.length; i++) {
            var data = originalList[i];
            mappedData.push(data);
            var rowIsAGroup = data._angularGrid_group; //_angularGrid_group is set to true on groups
            if (rowIsAGroup && data.expanded) {
                this.addToMap(mappedData, data.childrenAfterSort);
            }
        }
    };

    RowController.prototype.doesRowPassFilter = function(item, quickFilterPresent, advancedFilterPresent) {
        //first up, check quick filter
        if (quickFilterPresent) {
            if (!item._quickFilterAggregateText) {
                this.aggregateRowForQuickFilter(item);
            }
            if (item._quickFilterAggregateText.indexOf(this.angularGrid.getQuickFilter()) < 0) {
                //quick filter fails, so skip item
                return false;
            }
        }

        //second, check advanced filter
        if (advancedFilterPresent) {
            if (!this.filterManager.doesFilterPass(item)) {
                return false;
            }
        }

        //got this far, all filters pass
        return true;
    };

    RowController.prototype.aggregateRowForQuickFilter = function (rowItem) {
        var aggregatedText = "";
        this.colModel.getColDefWrappers().forEach(function (colDefWrapper) {
            var value = rowItem[colDefWrapper.colDef.field];
            if (value && value !== "") {
                aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
            }
        });
        rowItem._quickFilterAggregateText = aggregatedText;
    };

    return RowController;
});