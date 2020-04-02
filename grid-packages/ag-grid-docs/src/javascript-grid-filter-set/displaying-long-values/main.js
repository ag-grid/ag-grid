var data = [
    {
        a: 'Duis eget laoreet leo. Quisque finibus turpis et dui lobortis.',
        b: 'Vestibulum id pellentesque neque. Ut ornare risus ac diam consectetur.',
        c: 'Mauris eu lorem egestas, ullamcorper odio id, porttitor sem. Fusce.',
    },
    {
        a: 'Praesent eget gravida nulla. Maecenas at convallis augue. Nulla elit.',
        b: 'Maecenas eget magna sed sapien posuere tempus. Praesent erat mi.',
        c: 'Aenean finibus elementum lobortis. Nulla facilisi. Donec efficitur mi ullamcorper.',
    },
    {
        a: 'Mauris vulputate condimentum ante, ut condimentum felis blandit ac. Cras.',
        b: 'Pellentesque feugiat magna eu auctor maximus. Donec nibh justo, faucibus.',
        c: 'Fusce ullamcorper posuere massa eget iaculis. Maecenas non neque lorem.',
    },
];

var gridOptions = {
    columnDefs: [
        {
            field: 'a',
            tooltipField: 'a',
            headerName: 'Column 1',
            filter: 'agSetColumnFilter',
            filterParams: {
            }
        },
        {
            field: 'b',
            tooltipField: 'b',
            headerName: 'Column 2',
            filter: 'agSetColumnFilter',
            filterParams: {
                showTooltips: true,
            }
        },
        {
            field: 'c',
            tooltipField: 'c',
            headerName: 'Column 3',
            filter: 'agSetColumnFilter',
            filterParams: {
            }
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 180,
        editable: true,
        resizable: true,
    },
    rowData: data
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
