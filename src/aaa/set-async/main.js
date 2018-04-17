function irishAthletes() {
    return [
        'John Joe Nevin',
        'Katie Taylor',
        'Paddy Barnes',
        'Kenny Egan',
        'Darren Sutherland',
        'Margaret Thatcher',
        'Tony Blair',
        'Ronald Regan',
        'Barack Obama'
    ];
};

var columnDefs = [
    {
        headerName: 'Athlete',
        field: 'athlete',
        width: 150,
        filter: 'agSetColumnFilter',
        filterParams: {
            applyButton: true, // 엔터키를 처야 필터 시작
            values: function (params) {
              setTimeout(function () {  
                params.success(irishAthletes());
              }, 5000)  
            },
            //original code
            // fetch(url, {
            //     method: "GET",
            //     headers: {
            //         "Authorization": sessionStorage.getItem("jwt")
            //     }
            // }).then(function (response) {
            //     if (response.ok && response.status == 200) {
            //         response.json().then(function (data) {
            //             params.success(data);

            //         });
            //     }
            //     //TODO 예외처리 방안
            //     else {
            //         params.success(["Failed to get filter."]);
            //     }
            // });
            newRowsAction: 'keep'
          }
    }
];

var gridOptions = {
    components:{
        countryCellRenderer: countryCellRenderer
    },
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    enableColResize: true,
    floatingFilter: true
};

function countryCellRenderer(params) {
    return params.value.name + ' (' + params.value.code + ')';
}

function countryKeyCreator(params) {
    var countryObject = params.value;
    var key = countryObject.name;
    return key;
}

function onFilterChanged(value) {
    gridOptions.api.setQuickFilter(value);
}

function patchData(data) {
    // hack the data, replace each country with an object of country name and code
    data.forEach(function(row) {
        var countryName = row.country;
        var countryCode = countryName.substring(0, 2).toUpperCase();
        row.country = {
            name: countryName,
            code: countryCode
        };
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinnersSmall.json'}).then(function(data) {
        patchData(data);
        gridOptions.api.setRowData(data);
    });
});
