define([
    "./group"
],function(Group) {

    function GroupCreator() {
    }

    GroupCreator.prototype.createGroup = function(rowData, groupBy) {
        //iterate through items
        var groupByCol = groupBy[0];

        var groups = {};

        rowData.forEach(function (item) {
            var groupKey = item[groupByCol.field];
            //if group doesn't exist yet, create it
            var group = groups[groupKey];
            if (!group) {
                group = new Group(groupByCol, groupKey);
                groups[groupKey] = group;
            }
            group.addChild(item);
        });

        var result = [];
        Object.keys(groups).forEach(function(item){
            result.push(item);
        });

        return result;
    };

    return function() {
        return new GroupCreator();
    };

});