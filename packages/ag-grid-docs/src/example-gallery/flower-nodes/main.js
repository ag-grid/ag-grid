var rowData = [
    {
        // these attributes appear in the top level rows of the grid
        name: 'Ireland',
        continent: 'Europe',
        language: 'English',
        code: 'ie',
        // these are used in the panel
        population: 4000000,
        summary: 'Master Drinkers'
    },
    // and then repeat for all the other countries
    {
        name: 'Spain',
        continent: 'Europe',
        language: 'Spanish',
        code: 'es',
        population: 4000000,
        summary: 'Bull Fighters'
    },
    {
        name: 'United Kingdom',
        continent: 'Europe',
        language: 'English',
        code: 'gb',
        population: 4000000,
        summary: 'Center of the World'
    },
    {name: 'France', continent: 'Europe', language: 'French', code: 'fr', population: 4000000, summary: 'Best Lovers'},
    {
        name: 'Germany',
        continent: 'Europe',
        language: 'German',
        code: 'de',
        population: 4000000,
        summary: 'Always on Time'
    },
    {
        name: 'Sweden',
        continent: 'Europe',
        language: 'Swedish',
        code: 'se',
        population: 4000000,
        summary: 'Home of Vikings'
    },
    {
        name: 'Norway',
        continent: 'Europe',
        language: 'Norwegian',
        code: 'no',
        population: 4000000,
        summary: 'Best Vikings'
    },
    {name: 'Italy', continent: 'Europe', language: 'Italian', code: 'it', population: 4000000, summary: 'Pizza Pizza'},
    {name: 'Greece', continent: 'Europe', language: 'Greek', code: 'gr', population: 4000000, summary: 'Many Gods'},
    {
        name: 'Iceland',
        continent: 'Europe',
        language: 'Icelandic',
        code: 'is',
        population: 4000000,
        summary: 'Exploding Volcano'
    },
    {
        name: 'Portugal',
        continent: 'Europe',
        language: 'Portuguese',
        code: 'pt',
        population: 4000000,
        summary: 'Ship Builders'
    },
    {name: 'Malta', continent: 'Europe', language: 'Maltese', code: 'mt', population: 4000000, summary: 'Fishermen'},
    {
        name: 'Brazil',
        continent: 'South America',
        language: 'Portuguese',
        code: 'br',
        population: 4000000,
        summary: 'Best Footballers'
    },
    {
        name: 'Argentina',
        continent: 'South America',
        language: 'Spanish',
        code: 'ar',
        population: 4000000,
        summary: 'Beef Steaks'
    },
    {
        name: 'Colombia',
        continent: 'South America',
        language: 'Spanish',
        code: 'co',
        population: 4000000,
        summary: 'Wonderful Hospitality'
    },
    {
        name: 'Peru',
        continent: 'South America',
        language: 'Spanish',
        code: 'pe',
        population: 4000000,
        summary: 'Paddington Bear'
    },
    {
        name: 'Venezuela',
        continent: 'South America',
        language: 'Spanish',
        code: 've',
        population: 4000000,
        summary: 'Never Been, Dunno'
    },
    {
        name: 'Uruguay',
        continent: 'South America',
        language: 'Spanish',
        code: 'uy',
        population: 4000000,
        summary: 'Excellent Food'
    }
];

function getColumnDefs() {
    var columnDefs = [
        {
            headerName: 'Name',
            field: 'name',
            width: 150,
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                innerRenderer: function (params) {
                    var flag =
                        '<img border="0" width="15" height="10" src="https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/images/flags/' +
                        params.data.code +
                        '.png">';
                    return '<span style="cursor: default;">' + flag + ' ' + params.value + '</span>'
                }
            }
        },
        {headerName: 'Continent', field: 'continent', width: 150},
        {headerName: 'Language', field: 'language', width: 150}
    ];

    // put in some more dummy columns, just to fill space
    for (var i = 0; i < 10; i++) {
        columnDefs.push({headerName: 'More Data ' + i, valueGetter: 'Math.random()', width: 150});
    }
    return columnDefs;
}

function getFullWidthCellRenderer() {
    function FullWidthCellRenderer() {
    }

    FullWidthCellRenderer.prototype.init = function (params) {
        // trick to convert string of html into dom object
        var eTemp = document.createElement('div');
        eTemp.innerHTML = this.getTemplate(params);
        this.eGui = eTemp.firstElementChild;

        this.consumeMouseWheelOnCenterText();
    };

    FullWidthCellRenderer.prototype.getTemplate = function (params) {
        // the flower row shares the same data as the parent row
        var data = params.node.data;

        var template =
            '<div class="full-width-panel">' +
            '  <div class="full-width-flag">' +
            '    <img border="0" src="https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/images/largeFlags/' +
            data.code +
            '.png">' +
            '  </div>' +
            '  <div class="full-width-summary">' +
            '    <span class="full-width-title">' +
            data.name +
            '</span><br/>' +
            '    <label><b>Population:</b> ' +
            data.population +
            '</label><br/>' +
            '    <label><b>Known For:</b> ' +
            data.summary +
            '</label><br/>' +
            '  </div>' +
            '  <div class="full-width-center">' +
            '<p>Sample Text in a Paragraph</p><p>Lorem ipsum dolor sit amet, his mazim necessitatibus te, mea volutpat intellegebat at. Ea nec perpetua liberavisse, et modo rebum persius pri. Velit recteque reprimique quo at. Vis ex persius oporteat, esse voluptatum moderatius te vis. Ex agam suscipit aliquando eum. Mediocrem molestiae id pri, ei cibo facilisis mel. Ne sale nonumy sea. Et vel lorem omittam vulputate. Ne prima impedit percipitur vis, erat summo an pro. Id urbanitas deterruisset cum, at legere oportere has. No saperet lobortis elaboraret qui, alii zril at vix, nulla soluta ornatus per ad. Feugiat consequuntur vis ad, te sit quodsi persequeris, labore perpetua mei ad. Ex sea affert ullamcorper disputationi, sit nisl elit elaboraret te, quodsi doctus verear ut eam. Eu vel malis nominati, per ex melius delenit incorrupte. Partem complectitur sed in. Vix dicta tincidunt ea. Id nec urbanitas voluptaria, pri no nostro disputationi. Falli graeco salutatus pri ea.</p><p>Quo ad omnesque phaedrum principes, tale urbanitas constituam et ius, pericula consequat ad est. Ius tractatos referrentur deterruisset an, odio consequuntur sed ad. Ea molestie adipiscing adversarium eos, tale veniam sea no. Mutat nullam philosophia sed ad. Pri eu dicta consulatu, te mollis quaerendum sea. Ei doming commodo euismod vis. Cu modus aliquip inermis his, eos et eirmod regione delicata, at odio definiebas vis.</p><p>Lorem ipsum dolor sit amet, his mazim necessitatibus te, mea volutpat intellegebat at. Ea nec perpetua liberavisse, et modo rebum persius pri. Velit recteque reprimique quo at. Vis ex persius oporteat, esse voluptatum moderatius te vis. Ex agam suscipit aliquando eum. Mediocrem molestiae id pri, ei cibo facilisis mel. Ne sale nonumy sea. Et vel lorem omittam vulputate. Ne prima impedit percipitur vis, erat summo an pro. Id urbanitas deterruisset cum, at legere oportere has. No saperet lobortis elaboraret qui, alii zril at vix, nulla soluta ornatus per ad. Feugiat consequuntur vis ad, te sit quodsi persequeris, labore perpetua mei ad. Ex sea affert ullamcorper disputationi, sit nisl elit elaboraret te, quodsi doctus verear ut eam. Eu vel malis nominati, per ex melius delenit incorrupte. Partem complectitur sed in. Vix dicta tincidunt ea. Id nec urbanitas voluptaria, pri no nostro disputationi. Falli graeco salutatus pri ea.</p><p>Quo ad omnesque phaedrum principes, tale urbanitas constituam et ius, pericula consequat ad est. Ius tractatos referrentur deterruisset an, odio consequuntur sed ad. Ea molestie adipiscing adversarium eos, tale veniam sea no. Mutat nullam philosophia sed ad. Pri eu dicta consulatu, te mollis quaerendum sea. Ei doming commodo euismod vis. Cu modus aliquip inermis his, eos et eirmod regione delicata, at odio definiebas vis.</p>' +
            '  </div>' +
            '</div>';

        return template;
    };

    FullWidthCellRenderer.prototype.getGui = function () {
        return this.eGui;
    };

    // if we don't do this, then the mouse wheel will be picked up by the main
    // grid and scroll the main grid and not this component. this ensures that
    // the wheel move is only picked up by the text field
    FullWidthCellRenderer.prototype.consumeMouseWheelOnCenterText = function () {
        var eFullWidthCenter = this.eGui.querySelector('.full-width-center');

        var mouseWheelListener = function (event) {
            event.stopPropagation();
        };

        // event is 'mousewheel' for IE9, Chrome, Safari, Opera
        eFullWidthCenter.addEventListener('mousewheel', mouseWheelListener);
        // event is 'DOMMouseScroll' Firefox
        eFullWidthCenter.addEventListener('DOMMouseScroll', mouseWheelListener);
    };

    return FullWidthCellRenderer;
}

var gridOptions = {
    columnDefs: getColumnDefs(),
    rowData: rowData,
    isFullWidthCell: function (rowNode) {
        var rowIsNestedRow = rowNode.flower;
        return rowIsNestedRow;
    },
    // see ag-Grid docs cellRenderer for details on how to build cellRenderers
    fullWidthCellRenderer: getFullWidthCellRenderer(),
    getRowHeight: function (params) {
        var rowIsNestedRow = params.node.flower;
        // return 100 when nested row, otherwise return 25
        return rowIsNestedRow ? 100 : 25;
    },
    onGridReady: function (params) {
        // when grid is ready, expand Ireland and UK automatically
        params.api.forEachLeafNode(function (rowNode) {
            if (rowNode.data.name === 'Ireland' || rowNode.data.name === 'United Kingdom') {
                rowNode.expanded = true;
            }
        });
        params.api.onGroupExpandedOrCollapsed();
    },
    // return true, meaning all data can flower
    doesDataFlower: function (dataItem) {
        // allow everything to expand except Venezuela, sorry people of Venezuela :(
        return dataItem.name !== 'Venezuela';
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
