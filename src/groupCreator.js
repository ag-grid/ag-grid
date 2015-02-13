define([
],function() {

    function GroupCreator() {
    }

    GroupCreator.prototype.group = function(rowData, groupByFields, groupAggFunction, expandByDefault) {

        var topMostGroup = {
            level: -1,
            children: [],
            childrenMap: {}
        };

        var allGroups = [];
        allGroups.push(topMostGroup);

        var levelToInsertChild = groupByFields.length - 1;
        var i, currentLevel, item, currentGroup, groupByField, groupKey, nextGroup;

        for (i = 0; i<rowData.length; i++) {
            item = rowData[i];

            for (currentLevel = 0; currentLevel<groupByFields.length; currentLevel++) {
                groupByField = groupByFields[currentLevel];
                groupKey = item[groupByField];

                if (currentLevel==0) {
                    currentGroup = topMostGroup;
                }

                //if group doesn't exist yet, create it
                nextGroup = currentGroup.childrenMap[groupKey];
                if (!nextGroup) {
                    nextGroup = {
                        _angularGrid_group: true,
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
                    nextGroup.children.push(item);
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

    GroupCreator.prototype.createAggData = function(children, groupAggFunction) {
        for (var i = 0, l = children.length; i<l; i++) {
            var item = children[i];
            var itemIsAGroup = item._angularGrid_group;
            if (itemIsAGroup) {
                //agg function needs to start at the bottom, so traverse first
                this.createAggData(item.children, groupAggFunction);
                //after traversal, we can now do the agg at this level
                var data = groupAggFunction(item.children);
                item.aggData = data;
            }
        }
    };

    return new GroupCreator();

});