const gridOptions = {
    columnDefs: [
        {field: 'athlete', minWidth: 200},
        {field: 'country', minWidth: 200,},
        {field: 'sport', minWidth: 150},
        {field: 'gold'},
        {field: 'silver'},
        {field: 'bronze'},
        {field: 'total'}
    ],
    defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 100,
        flex: 1
    },

    popupParent: document.body
};

const getValues = type => {
    const value = document.querySelector('#' + type + 'Value').value;

    if (value == null) {
        return;
    }

    const obj = {
        value: value
    };

    obj.position = document.querySelector('#' + type + 'Position').value;

    const fontName = document.querySelector('#' + type + 'FontName').value;
    const fontSize = document.querySelector('#' + type + 'FontSize').value;
    const fontWeight = document.querySelector('#' + type + 'FontWeight').value;
    const underline = document.querySelector('#' + type + 'Underline').checked;

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

const getParams = () => {
    const header = getValues('header');
    const footer = getValues('footer');

    if (!header && !footer) {
        return;
    }

    const obj = {
        headerFooterConfig: {
            all: {}
        }
    };

    if (header) {
        obj.headerFooterConfig.all.header = [header];
    }

    if (footer) {
        obj.headerFooterConfig.all.footer = [footer];
    }

    return obj;
}

function onBtExport() {
    gridOptions.api.exportDataAsExcel(getParams());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json').then(response => response.json())
        .then(data =>
            gridOptions.api.setRowData(data.filter(rec => rec.country != null)));
});
