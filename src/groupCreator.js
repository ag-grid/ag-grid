define([
],function() {

    function GroupCreator() {
    }

    GroupCreator.prototype.group = function(rowDataWrappers, groupByFields, groupAggFunction, expandByDefault) {

        var topMostGroup = {
            level: -1,
            children: [],
            childrenMap: {}
        };

        var allGroups = [];
        allGroups.push(topMostGroup);

        var levelToInsertChild = groupByFields.length - 1;
        var i, currentLevel, rowDataWrapper, rowData, currentGroup, groupByField, groupKey, nextGroup;

        for (i = 0; i<rowDataWrappers.length; i++) {
            rowDataWrapper = rowDataWrappers[i];
            rowData = rowDataWrapper.rowData;

            for (currentLevel = 0; currentLevel<groupByFields.length; currentLevel++) {
                groupByField = groupByFields[currentLevel];
                groupKey = rowData[groupByField];

                if (currentLevel==0) {
                    currentGroup = topMostGroup;
                }

                //if group doesn't exist yet, create it
                nextGroup = currentGroup.childrenMap[groupKey];
                if (!nextGroup) {
                    nextGroup = {
                        group: true,
                        field: groupByField,
                        key: groupKey,
                        expanded: expandByDefault,
                        children: [],
                        allChildrenCount: 0,
                        level: currentGroup.level + 1,
                        childrenMap: {}//this is a temporary map, we remove at the end of this method
                    };
                    currentGroup.childrenMap[groupKey] = nextGroup;
                    currentGroup.children.push(nextGroup);
                    allGroups.push(nextGroup);
                }

                nextGroup.allChildrenCount++;

                if (currentLevel==levelToInsertChild) {
                    nextGroup.children.push(rowDataWrapper);
                } else {
                    currentGroup = nextGroup;
                }
            }

        }

        //remove the temporary map
        for (i = 0; i<allGroups.length; i++) {
            delete allGroups[i].childrenMap;
        }

        //create data items
        if (groupAggFunction) {
            this.createAggData(topMostGroup.children, groupAggFunction);
        }

        return topMostGroup.children;
    };

    GroupCreator.prototype.createAggData = function(rowNodes, groupAggFunction) {
        for (var i = 0, l = rowNodes.length; i<l; i++) {
            var node = rowNodes[i];
            if (node.group) {
                //agg function needs to start at the bottom, so traverse first
                this.createAggData(node.children, groupAggFunction);
                //after traversal, we can now do the agg at this level
                var rowData = groupAggFunction(node.children);
                node.rowData = rowData;
            }
        }
    };

    return new GroupCreator();

});