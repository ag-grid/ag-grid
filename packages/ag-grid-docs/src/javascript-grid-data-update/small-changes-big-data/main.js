var columnDefs = [
    { field: "city", enableRowGroup: true, rowGroup: true, hide: true, },
    { field: 'laptop', enableRowGroup: true, rowGroup: true, hide: true, },
    { field: 'distro', headerName: 'Linux Distro',
        width: 150,
        sort: 'asc',
        comparator: myComparator
    },
    { field: 'value', enableCellChangeFlash: true,
        width: 150,
        aggFunc: myAggFunc,
        filter: getMyFilter()
    }
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
        let value = parseInt(this.eInput.value);
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

function isFirstColumn(params) {
    let displayedColumns = params.columnApi.getAllDisplayedColumns();
    let thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;
}

var defaultColDef = {
    filter: true,
    sortable: true,
    resizable: true
};

function getRowNodeId(data) {
    return data.id;
}

function onBtDuplicate() {
    // get the first child of the
    var selectedList = gridOptions.api.getSelectedNodes();
    if (!selectedList || selectedList.length===0) {
        console.log('No rows selected!');
        return;
    }

    myRowData = myRowData.slice();
    selectedList.forEach( function(rowNode) {
        var oldData = rowNode.data;
        idCounter++;
        var newItem = createDataItem(idCounter, oldData.name, oldData.distro, oldData.laptop, oldData.city, oldData.value);
        myRowData.push(newItem);
    });

    timeSetRowData('Update', gridOptions.api);
}

function onBtUpdate() {
    // get the first child of the
    var selectedList = gridOptions.api.getSelectedNodes();
    if (!selectedList || selectedList.length===0) {
        console.log('No rows selected!');
        return;
    }

    myRowData = myRowData.slice();
    selectedList.forEach( function(rowNode) {
        var oldData = rowNode.data;
        var newValue = Math.floor(Math.random() * 100) + 10;
        var newItem = createDataItem(oldData.id, oldData.name, oldData.distro, oldData.laptop, oldData.city, newValue);
        var index = myRowData.indexOf(oldData);
        myRowData[index] = newItem;
    });

    timeSetRowData('Update', gridOptions.api);
}

function onBtDelete() {

    // get the first child of the
    var selectedList = gridOptions.api.getSelectedNodes();
    if (!selectedList || selectedList.length===0) {
        console.log('No rows selected!');
        return;
    }

    var selectedMap = {};
    selectedList.forEach( function(item) {selectedMap[item.id] = true; } );

    myRowData = myRowData.filter( function(item) {
        return !selectedMap[item.id];
    });

    timeSetRowData('Delete', gridOptions.api);
}

function onBtClearSelection() {
    gridOptions.api.deselectAll();
}

function timeSetRowData(name, api) {
    aggCallCount = 0;
    compareCallCount = 0;
    filterCallCount = 0;
    var start = new Date().getTime();
    api.setRowData(myRowData);
    var end = new Date().getTime();
    console.log(name + ' finished in ' + (end-start) + 'ms, aggCallCount = ' + aggCallCount + ', compareCallCount = '
        + compareCallCount + ', filterCallCount = ' + filterCallCount);
}

var gridOptions = {
    defaultColDef: defaultColDef,
    columnDefs: columnDefs,
    getRowNodeId: getRowNodeId,
    deltaRowDataMode: true,
    rowSelection: 'multiple',
    groupSelectsChildren: true,
    animateRows: true,
    rowGroupPanelShow: 'always',
    suppressMaintainUnsortedOrder: true,
    suppressAggAtRootLevel: true,
    suppressRowClickSelection: true,
    autoGroupColumnDef: {
        field: 'name',
        cellRendererParams: { checkbox: true }
    },
    onGridReady: function(params) {
        createRowData();

        timeSetRowData('Initial', params.api);

        setTimeout( function() {
            params.api.getDisplayedRowAtIndex(4).setExpanded(true);
        }, 1000);
        setTimeout( function() {
            params.api.getDisplayedRowAtIndex(7).setExpanded(true);
        }, 1400);
    }
};

function letter(i) {
    return 'abcdefghijklmnopqrstuvwxyz'.substr(i, 1);
}

function randomLetter() {
    return letter(Math.floor(Math.random()*26 + 1));
}

function createRowData() {
    var nextGroup = 0;
    for (let i = 0; i < 10000; i++) {
        if (i % 2 === 0) {
            nextGroup++;
        }
        var name = 'Mr ' + randomLetter().toUpperCase() + ' ' + randomLetter().toUpperCase() + randomLetter() + randomLetter() + randomLetter() + randomLetter();
        var city = CITIES[i%CITIES.length];
        var distro = LINUX_DISTROS[i%LINUX_DISTROS.length];
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
