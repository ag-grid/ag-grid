var columnDefs = [
    { field: "city", rowGroup: true, hide: true, },
    { field: 'laptop', rowGroup: true, hide: true, },
    { field: 'distro', sort: 'asc', comparator: myComparator},
    { field: 'value', enableCellChangeFlash: true, aggFunc: myAggFunc, filter: getMyFilter() }
];

var aggCallCount;
var compareCallCount;
var filterCallCount;
var myRowData = [];

var LINUX_DISTROS = ['Manjaro','MX Linux','Mint','elementary','Ubuntu','Debian','Fedora','Solus','openSUSE',
    'Zorin','ReactOS','CentOS','Arch','KDE neon','deepin','antiX','Antergos','Kali','Parrot','Lite',
    'ArcoLinux','FreeBSD','Ubuntu Kylin','Lubuntu','SparkyLinux','Peppermint','SmartOS','PCLinuxOS',
    'Mageia','Endless'];

var CITIES = ['Tokyo','Jakarta','Delhi','Manila','Seoul','Shanghai','Mumbai','New York',
                'Beijing','Sao Paulo','Mexico City','Guangzhou','Dhaka','Osaka-Kobe-Kyoto',
                'Moscow','Cairo','Bangkok','Los Angeles','Buenos Aires'];

var LAPTOPS = ['Hewlett Packard','Lenovo','Dell','Asus','Apple','Acer','Microsoft','Razer'];

function myAggFunc(values) {
    aggCallCount++;

    var total = 0;
    for (var i = 0; i<values.length; i++) {
        total += values[i];
    }
    return total;
}

function myComparator(a, b) {
    compareCallCount++;
    return a < b ? -1 : 1;
}

function getMyFilter() {

    function MyFilter() {}

    MyFilter.prototype.init = function(params) {
        this.valueGetter = params.valueGetter;
        this.filterValue = null;

        this.eGui = document.createElement('div');
        this.eGui.innerHTML = '<div>Greater Than: <input type="text"/></div>';
        this.eInput = this.eGui.querySelector('input');
        var that = this;
        this.eInput.addEventListener('input', function() {
            that.getValueFromInput();
            params.filterChangedCallback();
        });
    };

    MyFilter.prototype.getGui = function() {
        return this.eGui;
    };

    MyFilter.prototype.getValueFromInput = function() {
        var value = parseInt(this.eInput.value);
        this.filterValue = isNaN(value) ? null : value;
    };

    MyFilter.prototype.setModel = function(model) {
        this.eInput.value = model.value;
        this.getValueFromInput();
    };

    MyFilter.prototype.isFilterActive = function() {
        return this.filterValue !== null;
    };

    MyFilter.prototype.doesFilterPass = function(params) {
        filterCallCount++;

        var value = this.valueGetter(params);
        return value > this.filterValue;
    };
    return MyFilter;
}

function getRowNodeId(data) {
    return data.id;
}

function onBtDuplicate() {
    // get the first child of the
    var selectedRows = gridOptions.api.getSelectedRows();
    if (!selectedRows || selectedRows.length===0) {
        console.log('No rows selected!');
        return;
    }

    var newItems = [];
    selectedRows.forEach( function(selectedRow) {
        idCounter++;
        var newItem = createDataItem(idCounter, selectedRow.name, selectedRow.distro, selectedRow.laptop,
            selectedRow.city, selectedRow.value);
        newItems.push(newItem);
    });

    var gridApi = gridOptions.api;
    timeOperation('Duplicate', function() {
        gridApi.updateRowData({add: newItems});
    });
}

function onBtUpdate() {
    // get the first child of the
    var selectedRows = gridOptions.api.getSelectedRows();
    if (!selectedRows || selectedRows.length===0) {
        console.log('No rows selected!');
        return;
    }

    var updatedItems = [];
    selectedRows.forEach( function(oldItem) {
        var newValue = Math.floor(Math.random() * 100) + 10;
        var newItem = createDataItem(oldItem.id, oldItem.name, oldItem.distro, oldItem.laptop, oldItem.city, newValue);
        updatedItems.push(newItem);
    });

    var gridApi = gridOptions.api;
    timeOperation('Update', function() {
        gridApi.updateRowData({update: updatedItems});
    });
}

function onBtDelete() {

    // get the first child of the
    var selectedRows = gridOptions.api.getSelectedRows();
    if (!selectedRows || selectedRows.length===0) {
        console.log('No rows selected!');
        return;
    }

    var gridApi = gridOptions.api;
    timeOperation('Delete', function() {
        gridApi.updateRowData({remove: selectedRows});
    });
}

function onBtClearSelection() {
    gridOptions.api.deselectAll();
}

function timeOperation(name, operation) {
    aggCallCount = 0;
    compareCallCount = 0;
    filterCallCount = 0;
    var start = new Date().getTime();
    operation();
    var end = new Date().getTime();
    console.log(name + ' finished in ' + (end-start) + 'ms, aggCallCount = ' + aggCallCount + ', compareCallCount = '
        + compareCallCount + ', filterCallCount = ' + filterCallCount);
}

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        filter: true,
        sortable: true,
        resizable: true
    },
    getRowNodeId: getRowNodeId,
    rowSelection: 'multiple',
    groupSelectsChildren: true,
    animateRows: true,
    suppressAggAtRootLevel: true,
    suppressRowClickSelection: true,
    autoGroupColumnDef: {
        field: 'name',
        cellRendererParams: { checkbox: true }
    },
    onGridReady: function(params) {
        createRowData();

        timeOperation('Initialisation', function() {
            params.api.setRowData(myRowData);
        });

        params.api.getDisplayedRowAtIndex(2).setExpanded(true);
        params.api.getDisplayedRowAtIndex(4).setExpanded(true);
    }
};

function letter(i) {
    return 'abcdefghijklmnopqrstuvwxyz'.substr(i, 1);
}

function randomLetter() {
    return letter(Math.floor(Math.random()*26 + 1));
}

function createRowData() {
    for (var i = 0; i < 10000; i++) {
        var name = 'Mr ' + randomLetter().toUpperCase() + ' ' + randomLetter().toUpperCase() + randomLetter() + randomLetter() + randomLetter() + randomLetter();
        var city = CITIES[i%CITIES.length];
        var distro = LINUX_DISTROS[i%LINUX_DISTROS.length] + ' v' + Math.floor((Math.random()*100 + 1))/10;
        var university = LAPTOPS[i%LAPTOPS.length];
        var value = Math.floor(Math.random() * 100) + 10; // between 10 and 110
        idCounter++;
        myRowData.push(createDataItem(idCounter, name, distro, university, city, value));
    }
}

var idCounter = 0;

function createDataItem(id, name, distro, laptop, city, value) {
    return {
        id: id,
        name: name,
        city: city,
        distro: distro,
        laptop: laptop,
        value: value
    };
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
    gridOptions.api.setFilterModel({
        value: {value: '5'}
    });
});
