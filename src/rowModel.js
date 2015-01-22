define([
    "./groupCreator",
    "./utils",
    "./constants"
], function(groupCreator, utils, constants) {

    function RowModel(gridOptions, angularGrid, filterManager) {
        this.gridOptions = gridOptions;
        this.angularGrid = angularGrid;
        this.filterManager = filterManager;
    }

    RowModel.prototype.setupRows = function(step) {

        switch (step) {
            case constants.STEP_EVERYTHING :
                this.doGrouping(); //populates rowDataAfterGroup
            case constants.STEP_FILTER :
                this.doFilter(); //populates rowDataAfterGroupAndFilter
            case constants.STEP_SORT :
                this.doSort(); //populates rowDataAfterGroupAndFilterAndSort
            case constants.STEP_MAP :
                this.doGroupMapping(); //rowDataAfterGroupAndFilterAndSortAndMap
        }

    };

    RowModel.prototype.doSort = function () {
        //see if there is a col we are sorting by
        var colDefForSorting = null;
        this.gridOptions.columnDefs.forEach(function (colDef) {
            if (colDef.sort) {
                colDefForSorting = colDef;
            }
        });

        this.gridOptions.rowDataAfterGroupAndFilterAndSort = this.gridOptions.rowDataAfterGroupAndFilter.slice(0);

        if (colDefForSorting) {
            var keyForSort = colDefForSorting.field;
            var ascending = colDefForSorting.sort === ASC;
            var inverter = ascending ? 1 : -1;

            this.sortList(this.gridOptions.rowDataAfterGroupAndFilterAndSort, keyForSort, colDefForSorting, inverter);
        } else {
            //if no sorting, set all group children after sort to the original list
            this.resetSortInGroups(this.gridOptions.rowDataAfterGroupAndFilterAndSort);
        }
    };

    RowModel.prototype.resetSortInGroups = function(items) {
        for (var i = 0, l = items.length; i<l; i++) {
            var item = items[i];
            var rowIsAGroup = item._angularGrid_group; //_angularGrid_group is set to true on groups
            if (rowIsAGroup) {
                item.childrenAfterSort = item.children;
                this.resetSortInGroups(item.children);
            }
        }
    };

    RowModel.prototype.sortList = function (listForSorting, keyForSort, colDefForSorting, inverter) {

        //sort any groups recursively
        for (var i = 0, l = listForSorting.length; i<l; i++) {
            var item = listForSorting[i];
            var rowIsAGroup = item._angularGrid_group; //_angularGrid_group is set to true on groups
            if (rowIsAGroup) {
                item.childrenAfterSort = item.children.slice(0);
                this.sortList(item.childrenAfterSort, keyForSort, colDefForSorting, inverter);
            }
        }

        listForSorting.sort(function (objA, objB) {
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

    RowModel.prototype.doGrouping = function () {
        var groupedData;
        if (this.gridOptions.groupKeys) {
            var expandByDefault = this.gridOptions.groupDefaultExpanded===true;
            groupedData = groupCreator.group(this.gridOptions.rowData, this.gridOptions.groupKeys,
                this.gridOptions.aggFunction, expandByDefault);
        } else {
            groupedData = this.gridOptions.rowData;
        }
        this.gridOptions.rowDataAfterGroup = groupedData;
    };

    RowModel.prototype.doFilter = function () {
        var quickFilterPresent = this.angularGrid.getQuickFilter() !== null;
        var advancedFilterPresent = this.filterManager.isFilterPresent();
        var filterPresent = quickFilterPresent || advancedFilterPresent;

        if (filterPresent) {
            this.gridOptions.rowDataAfterGroupAndFilter = this.filterItems(this.gridOptions.rowDataAfterGroup, quickFilterPresent, advancedFilterPresent);
        } else {
            this.gridOptions.rowDataAfterGroupAndFilter = this.gridOptions.rowDataAfterGroup;
        }
    };

    RowModel.prototype.filterItems = function (items, quickFilterPresent, advancedFilterPresent) {
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

    RowModel.prototype.getTotalChildCount = function(items) {
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

    RowModel.prototype.copyGroup = function (group, children, allChildrenCount) {
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

    RowModel.prototype.doGroupMapping = function () {
        var mappedData;
        if (this.gridOptions.groupKeys) {
            mappedData = [];
            this.addToMap(mappedData, this.gridOptions.rowDataAfterGroupAndFilterAndSort);
        } else {
            mappedData = this.gridOptions.rowDataAfterGroupAndFilterAndSort;
        }
        this.gridOptions.rowDataAfterGroupAndFilterAndSortAndMap = mappedData;
    };

    RowModel.prototype.addToMap = function (mappedData, originalList) {
        for (var i = 0; i<originalList.length; i++) {
            var data = originalList[i];
            mappedData.push(data);
            var rowIsAGroup = data._angularGrid_group; //_angularGrid_group is set to true on groups
            if (rowIsAGroup && data.expanded) {
                this.addToMap(mappedData, data.childrenAfterSort);
            }
        }
    };

    RowModel.prototype.doesRowPassFilter = function(item, quickFilterPresent, advancedFilterPresent) {
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

    RowModel.prototype.aggregateRowForQuickFilter = function (rowItem) {
        var aggregatedText = "";
        this.gridOptions.columnDefs.forEach(function (colDef) {
            var value = rowItem[colDef.field];
            if (value && value !== "") {
                aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
            }
        });
        rowItem._quickFilterAggregateText = aggregatedText;
    };

    return RowModel;
});