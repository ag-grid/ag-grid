var columnDefs = [
    { field: 'company' },
    { field: 'url', headerName: 'URL', cellClass: 'hyperlinks' }
];

var gridOptions = {
    defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 100,
        flex: 1
    },

    excelStyles: [
        {
            id: 'hyperlinks',
            font: {
                underline: 'Subscript',
                color: '#358ccb'
            }
        }
    ],

    popupParent: document.body,
    columnDefs: columnDefs,

    rowData: [
        { 'company': 'Quantcast', 'url': 'https://www.quantcast.com' }, 
        { 'company': 'Watson Media', 'url': 'https://video.ibm.com/' }, 
        { 'company': 'Google', 'url': 'https://www.google.com' },
        { 'company': 'Facebook', 'url': 'https://www.facebook.com' },
        { 'company': 'The Business Journals', 'url': 'https://www.bizjournals.com' }, 
        { 'company': 'Adobe', 'url': 'https://www.adobe.com' }, 
        { 'company': 'TinyPic', 'url': 'https://www.tinypic.com' }, 
        { 'company': 'The New York Times', 'url': 'https://www.nytimes.com' }, 
        { 'company': 'Bandcamp’s', 'url': 'https://www.bandcamp.com' }, 
        { 'company': 'ClickBank', 'url': 'https://www.clickbank.com/' }, 
        { 'company': 'Twitter', 'url': 'https://www.twitter.com' }, 
        { 'company': 'StackOverflow', 'url': 'https://stackoverflow.com/' }, 
        { 'company': 'iStock', 'url': 'https://www.istockphoto.com' }, 
        { 'company': 'Reddit', 'url': 'https://www.reddit.com' }, 
        { 'company': 'Creative Commons', 'url': 'https://www.creativecommons.org' }, 
        { 'company': 'Github', 'url': 'https://www.github.com' }, 
        { 'company': 'Microsoft', 'url': 'https://www.microsoft.com' }, 
        { 'company': 'Drupal', 'url': 'https://www.drupal.org/' }, 
        { 'company': 'Gizmodo', 'url': 'https://www.gizmodo.com' }, 
        { 'company': 'LinkedIN', 'url': 'https://www.linkedin.com' }
    ]
};

function onBtExport() {
    gridOptions.api.exportDataAsExcel({
        autoConvertFormulas: true,
        processCellCallback: function(params) {
            if (params.column.getColDef().field === 'url') {
                return '=HYPERLINK("' + params.value + '")';
            }
            return params.value;
        }
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
