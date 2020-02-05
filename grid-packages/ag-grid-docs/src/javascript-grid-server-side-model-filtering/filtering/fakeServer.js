var countryMap = {"United States": "US", "Russia": "RU", "Australia": "AU", "Canada": "CA", "Norway": "NO", "China": "CN", "Zimbabwe": "ZW", "Venezuela": "VE", "Netherlands": "NL", "South Korea": "KR", "Croatia": "HR", "France": "FR", "Japan": "JP", "Hungary": "HU", "Germany": "DE", "Poland": "PL", "South Africa": "ZA", "Sweden": "SE", "Ukraine": "UA", "Italy": "IT", "Czech Republic": "CZ", "Austria": "AT", "Finland": "FI", "Romania": "RO", "Vietnam": "VN", "Great Britain": "GB", "Jamaica": "JM", "Singapore": "SG", "Belarus": "BY", "Chile": "CL", "Spain": "ES", "Tunisia": "TN", "Brazil": "BR", "Slovakia": "SK", "Costa Rica": "CR", "Bulgaria": "BG", "Switzerland": "CH", "New Zealand": "NZ", "Estonia": "EE", "Kenya": "KE", "Ethiopia": "ET", "Trinidad and Tobago": "TT", "Turkey": "TR", "Morocco": "MA", "Bahamas": "BS", "Slovenia": "SI", "Armenia": "AM", "Azerbaijan": "AZ", "India": "IN", "Puerto Rico": "PR", "Egypt": "EG", "Kazakhstan": "KZ", "Chinese Taipei": "ROC", "Georgia": "GE", "Lithuania": "LT", "Cuba": "CU", "Colombia": "CO", "Mongolia": "MN", "Uzbekistan": "UZ", "North Korea": "KP", "Tajikistan": "TJ", "Kyrgyzstan": "KG", "Greece": "GR", "Indonesia": "ID", "Thailand": "TH", "Latvia": "LV", "Mexico": "MX", "Nigeria": "NG", "Qatar": "QA", "Serbia": "RS", "Hong Kong": "HK", "Denmark": "DK", "Portugal": "PT", "Argentina": "AR", "Afghanistan": "AF", "Gabon": "GA", "Dominican Republic": "DO", "Belgium": "BE", "Kuwait": "KW", "United Arab Emirates": "AE", "Cyprus": "CY", "Israel": "IL", "Algeria": "DZ", "Montenegro": "ME", "Iceland": "IS", "Paraguay": "PY", "Cameroon": "CM", "Saudi Arabia": "SA", "Ireland": "IE", "Malaysia": "MY", "Uruguay": "UY", "Togo": "TG", "Mauritius": "MU", "Botswana": "BW", "Guatemala": "GT", "Bahrain": "BH", "Grenada": "GD", "Uganda": "UG", "Sudan": "SD", "Ecuador": "EC", "Panama": "PA", "Eritrea": "ER", "Sri Lanka": "LK", "Mozambique": "MZ", "Barbados": "BB"};

function FakeServer(data) {
    this.allData = data;

    // patch country data to use complex object
    this.allData.forEach(function (d) {
        d.country = {
            code: countryMap[d.country],
            name: d.country
        };
    });
}

FakeServer.prototype.getData = function (request) {
    var filteredData = this.doFilter(this.allData, request.filterModel);
    var filteredAndSortedData = this.doSort(filteredData, request.sortModel);

    var blockData = filteredAndSortedData.slice(request.startRow, request.endRow);

    var lastRowFound = (filteredAndSortedData.length <= request.endRow);

    return {
        data: blockData,
        lastRow: lastRowFound ? filteredAndSortedData.length : null
    };
};

FakeServer.prototype.doFilter = function(data, filterModel) {
    var filterPresent = filterModel && Object.keys(filterModel).length > 0;
    if (!filterPresent) return data;
    return data.filter(function(d) {
        return filterModel.country.values.indexOf(d.country.code) > -1;
    });
};

FakeServer.prototype.doSort = function (data, sortModel) {
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
};
