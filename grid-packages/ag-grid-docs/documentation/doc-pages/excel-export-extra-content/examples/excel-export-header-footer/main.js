var columnDefs = [
        { field: 'athlete', minWidth: 200 },
        { field: 'country', minWidth: 200, },
        { field: 'sport', minWidth: 150 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' }
];

var gridOptions = {
    defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 100,
        flex: 1
    },

    popupParent: document.body,

    columnDefs: columnDefs,

    rowData: [
        { 'athlete': 'Eamon Sullivan', 'country': 'Australia', 'sport': 'Swimming', 'gold': 0,' silver': 2, 'bronze': 1, 'total':3 },
        { 'athlete': 'Dara Torres', 'country': 'United States', 'sport': 'Swimming', 'gold': 0,' silver': 3, 'bronze': 0, 'total':3 },
        { 'athlete': 'Amanda Beard', 'country': 'United States', 'sport': 'Swimming', 'gold': 1,' silver': 2, 'bronze': 0, 'total':3 },
        { 'athlete': 'Antje Buschschulte', 'country': 'Germany', 'sport': 'Swimming', 'gold': 0,' silver': 0, 'bronze': 3, 'total':3 },
        { 'athlete': 'Kirsty Coventry', 'country': 'Zimbabwe', 'sport': 'Swimming', 'gold': 1,' silver': 1, 'bronze': 1, 'total':3 },
        { 'athlete': 'Ian Crocker', 'country': 'United States', 'sport': 'Swimming', 'gold': 1,' silver': 1, 'bronze': 1, 'total':3 },
        { 'athlete': 'Grant Hackett', 'country': 'Australia', 'sport': 'Swimming', 'gold': 1,' silver': 2, 'bronze': 0, 'total':3 },
        { 'athlete': 'Brendan Hansen', 'country': 'United States', 'sport': 'Swimming', 'gold': 1,' silver': 1, 'bronze': 1, 'total':3 },
        { 'athlete': 'Jodie Henry', 'country': 'Australia', 'sport': 'Swimming', 'gold': 3,' silver': 0, 'bronze': 0, 'total':3 },
        { 'athlete': 'Otylia Jedrzejczak', 'country': 'Poland', 'sport': 'Swimming', 'gold': 1,' silver': 2, 'bronze': 0, 'total':3 },
        { 'athlete': 'Leisel Jones', 'country': 'Australia', 'sport': 'Swimming', 'gold': 1,' silver': 1, 'bronze': 1, 'total':3 },
        { 'athlete': 'Kosuke Kitajima', 'country': 'Japan', 'sport': 'Swimming', 'gold': 2,' silver': 0, 'bronze': 1, 'total': 3}
    ]
};

function getValues(type) {
    var value = document.querySelector('#' + type + 'Value').value;
    if (value == null) { return; }

    var obj = { 
        value: value
    };

    obj.position = document.querySelector('#' + type + 'Position').value;
    var fontName = document.querySelector('#' + type + 'FontName').value;
    var fontSize = document.querySelector('#' + type + 'FontSize').value;
    var fontWeight = document.querySelector('#' + type + 'FontWeight').value;
    var underline = document.querySelector('#' + type + 'Underline').checked;

    if (fontName !== 'Calibri' || fontSize != 11 || fontWeight !== 'Regular' || underline) {
        obj.font = {};
        if (fontName !== 'Calibri') {
            obj.font.fontName = fontName;
        }
        if (fontSize != 11) {
            obj.font.size = fontSize;
        }
        if (fontWeight !== 'Regular') {
            if (fontWeight.indexOf('Bold') !== -1) {
                obj.font.bold = true;
            }
            if (fontWeight.indexOf('Italic') !== -1) {
                obj.font.italic = true;
            }
        }

        if (underline) {
            obj.font.underline = 'Single';
        }
    }

    return obj;
}

function getParams() {
    var header = getValues('header'),
        footer = getValues('footer');

    if (!header && !footer) { return; }

    obj  = {
        sheetHeaderFooterConfig: {
            all: {}
        }
    };

    if (header){
        obj.sheetHeaderFooterConfig.all.header = [header];
    }

    if (footer) {
        obj.sheetHeaderFooterConfig.all.footer = [footer];
    }

    return obj;
}

function onBtExport() {
    gridOptions.api.exportDataAsExcel(getParams());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
