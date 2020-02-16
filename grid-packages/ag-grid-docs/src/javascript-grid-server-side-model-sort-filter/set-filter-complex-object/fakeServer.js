function FakeServer(allData) {

    // patch country data to use complex object
    allData.forEach(function (d) {
        d.country = {
            code: countryMap[d.country],
            name: d.country
        };
    });

    function doFilter(data, filterModel) {
        var filterPresent = filterModel && Object.keys(filterModel).length > 0;
        if (!filterPresent) return data;
        return data.filter(function(d) {
            return filterModel.country.values.indexOf(d.country.code) > -1;
        });
    }

    function doSort(data, sortModel) {
        var sortPresent = sortModel && sortModel.length > 0;
        if (!sortPresent) return data;

        var sortedData = data.slice();
        sortedData.sort(function (a, b) {
            for (var k = 0; k < sortModel.length; k++) {
                var sortColModel = sortModel[k];

                var valueA = a[sortColModel.colId];
                if (valueA instanceof Object) {
                    valueA = valueA.name;
                }

                var valueB = b[sortColModel.colId];
                if (valueB instanceof Object) {
                    valueB = valueB.name;
                }

                if (valueA === valueB) {
                    continue;
                }
                var sortDirection = sortColModel.sort === 'asc' ? 1 : -1;
                return valueA > valueB ? sortDirection : sortDirection * -1;
            }
            return 0;
        });
        return sortedData;
    }

    return {
        getResponse: function(request) {
            console.log('fetching rows: ' + request.startRow + ' to ' + request.endRow);

            var filteredData = doFilter(allData, request.filterModel);
            var filteredAndSortedData = doSort(filteredData, request.sortModel);

            // take a slice of the rows for requested block
            var rowsForBlock = filteredAndSortedData.slice(request.startRow, request.endRow);

            // if on or after the last page, work out the last row.
            var lastRow = allData.length <= request.endRow ? allData.length : -1;

            return {
                success: true,
                rows: rowsForBlock,
                lastRow: lastRow
            };
        }
    };
}
