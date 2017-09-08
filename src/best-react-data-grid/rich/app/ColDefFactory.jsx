import SkillsCellRenderer from './SkillsCellRenderer.jsx';
import ProficiencyCellRenderer from './ProficiencyCellRenderer.jsx';

export default class ColDefFactory {

    createColDefs() {
        return [
            {
                headerName: '#',
                width: 30,
                checkboxSelection: true,
                suppressSorting: true,
                suppressMenu: true,
                pinned: true
            },
            {
                headerName: 'Employee',
                children: [
                    {
                        headerName: "Name",
                        field: "name",
                        width: 150,
                        pinned: true,
                        editable: true,
                    }, {
                        headerName: "Country",
                        field: "country",
                        width: 150,
                        // an example of using a non-React cell renderer
                        cellRenderer: countryCellRenderer,
                        pinned: true,
                        filter: 'set',
                        filterParams: {
                            cellRenderer: countryCellRenderer,
                            cellHeight: 20
                        },
                        cellEditor: 'richSelect',
                        editable: true
                    }, {
                        headerName: "Date of Birth",
                        field: "dob",
                        width: 110,
                        filter: 'date',
                        pinned: true,
                        cellRenderer: function (params) {
                            return pad(params.value.getDate(), 2) + '/' +
                                pad(params.value.getMonth() + 1, 2) + '/' +
                                params.value.getFullYear();
                        },
                        columnGroupShow: 'open'
                    }
                ]
            },
            {
                headerName: 'IT Skills',
                children: [
                    {
                        headerName: "Skills",
                        width: 125,
                        suppressSorting: true,
                        field: 'skills',
                        // supply a React component
                        cellRendererFramework: SkillsCellRenderer,
                    },
                    {
                        headerName: "Proficiency",
                        field: "proficiency",
                        width: 135,
                        // supply a React component
                        cellRendererFramework: ProficiencyCellRenderer,
                    }
                ]
            },
            {
                headerName: 'Contact',
                children: [
                    {headerName: "Mobile", field: "mobile", width: 150, filter: 'text'},
                    {headerName: "Land-line", field: "landline", width: 150, filter: 'text'},
                    {headerName: "Address", field: "address", width: 500, filter: 'text'}
                ]
            }
        ];
    }
}

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

//Utility function used to pad the date formatting.
function pad(num, totalStringSize) {
    let asString = num + "";
    while (asString.length < totalStringSize) asString = "0" + asString;
    return asString;
}
