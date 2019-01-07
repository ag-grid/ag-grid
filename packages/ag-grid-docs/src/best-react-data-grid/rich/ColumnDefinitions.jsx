import ProficiencyCustomCell from './ProficiencyCustomCell.jsx';

// ag-Grid builds columns based on the column definitions returned here
export default class ColumnDefinitionFactory {

    createColDefs() {
        return [
            // first column has the checkboxes
            { headerName: '#', width: 30, checkboxSelection: true,
                suppressMenu: true, pinned: true, resizable: true},

            // the first three columns are grouped in a group called 'Employee'
            { headerName: 'Employee',
                children: [
                    { field: "name", width: 150, pinned: true, editable: true, sortable: true, resizable: true, filter: true },
                    { field: "country", width: 150, pinned: true, filter: 'set', editable: true, resizable: true,
                        // an example of using a non-React cell renderer
                        cellRenderer: countryCellRenderer,
                        cellEditorParams: { values: COUNTRY_LIST, cellRenderer: countryCellRenderer},
                        filterParams: { cellRenderer: countryCellRenderer, cellHeight: 20},
                        cellEditor: 'agRichSelect', sortable: true
                    },
                    { headerName: "Date of Birth", field: "dob", width: 110, filter: 'date', pinned: true,
                        resizable: true,
                        // simple cell formatter for formatting dates
                        valueFormatter: function (params) {
                            return formatDate(params.value);
                        },
                        // only show column when this group is open
                        columnGroupShow: 'open', sortable: true
                    }
                ]
            },

            // the next column is not in a group, just by itself
            { field: "proficiency", width: 135, resizable: true, filter: true,
                // supply a React component for custom cell rendering
                cellRendererFramework: ProficiencyCustomCell, sortable: true
            },

            // then the last group with three columns
            {
                headerName: 'Contact',
                children: [
                    {field: "mobile", width: 150, filter: 'text', sortable: true, resizable: true },
                    {field: "landline", width: 150, filter: 'text', sortable: true, resizable: true },
                    {field: "address", width: 500, filter: 'text', sortable: true, resizable: true }
                ]
            }
        ];
    }
}

var COUNTRY_LIST = ["Argentina", "Brazil", "Colombia", "France", "Germany", "Greece", "Iceland", "Ireland",
    "Italy", "Malta", "Portugal", "Norway", "Peru", "Spain", "Sweden", "United Kingdom",
    "Uruguay", "Venezuela", "Belgium", "Luxembourg"];

// this is a simple cell renderer, putting together static html, no
// need to use React for it.
function countryCellRenderer(params) {
    const COUNTRY_CODES = {
        Ireland: "ie",
        Spain: "es",
        "United Kingdom": "gb",
        France: "fr",
        Germany: "de",
        Sweden: "se",
        Italy: "it",
        Greece: "gr",
        Iceland: "is",
        Portugal: "pt",
        Malta: "mt",
        Norway: "no",
        Brazil: "br",
        Argentina: "ar",
        Colombia: "co",
        Peru: "pe",
        Venezuela: "ve",
        Uruguay: "uy"
    };

    if (params.value) {
        const flag = "<img border='0' width='15' height='10' " +
            "style='margin-bottom: 2px' src='http://flags.fmcdn.net/data/flags/mini/"
            + COUNTRY_CODES[params.value] + ".png'>";
        return flag + " " + params.value;
    } else {
        return null;
    }
}

// utility function to format date
function formatDate(value) {
    return pad(value.getDate(), 2) + '/' +
        pad(value.getMonth() + 1, 2) + '/' +
        value.getFullYear();
}

// utility function used to pad the date formatting.
function pad(num, totalStringSize) {
    let asString = num + "";
    while (asString.length < totalStringSize) asString = "0" + asString;
    return asString;
}
