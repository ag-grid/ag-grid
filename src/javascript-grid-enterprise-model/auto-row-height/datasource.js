function SimpleDatasource() {}

SimpleDatasource.prototype.getRows = function(params) {
    var groupKeys = params.request.groupKeys;
    var topLevel = groupKeys.length === 0;

    var listToReturn;
    if (topLevel) {
        listToReturn = rowData;
    } else {
        var groupKey = groupKeys[0];
        rowData.forEach( function(data) {
            if (data.group===groupKey) {
                listToReturn = data.children;
            }
        });
    }

    var sectionToReturn = listToReturn.slice(params.request.startRow, params.request.endRow);

    params.successCallback(sectionToReturn, listToReturn.length);
};
