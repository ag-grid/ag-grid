var listOfCountries = ['United States','Russia','Australia','Canada','Norway','China','Zimbabwe',
    'Netherlands','South Korea','Croatia','France','Japan','Hungary','Germany','Poland','South Africa',
    'Sweden','Ukraine','Italy','Czech Republic','Austria','Finland','Romania', 'Great Britain','Jamaica',
    'Singapore','Belarus','Chile','Spain','Tunisia','Brazil','Slovakia','Costa Rica','Bulgaria','Switzerland',
    'New Zealand','Estonia','Kenya','Ethiopia','Trinidad and Tobago','Turkey','Morocco','Bahamas','Slovenia',
    'Armenia','Azerbaijan','India', 'Puerto Rico','Egypt','Kazakhstan','Iran','Georgia','Lithuania','Cuba',
    'Colombia','Mongolia','Uzbekistan','North Korea','Tajikistan', 'Kyrgyzstan','Greece','Macedonia','Moldova',
    'Chinese Taipei','Indonesia','Thailand','Vietnam','Latvia','Venezuela','Mexico','Nigeria', 'Qatar','Serbia',
    'Serbia and Montenegro','Hong Kong','Denmark','Portugal','Argentina','Afghanistan','Gabon','Dominican Republic',
    'Belgium', 'Kuwait','United Arab Emirates','Cyprus','Israel','Algeria','Montenegro','Iceland','Paraguay',
    'Cameroon','Saudi Arabia','Ireland','Malaysia', 'Uruguay','Togo','Mauritius','Syria','Botswana','Guatemala',
    'Bahrain','Grenada','Uganda','Sudan','Ecuador','Panama','Eritrea','Sri Lanka', 'Mozambique','Barbados'];

var columnDefs = [
    {headerName: "Athlete", field: "athlete", enableRowGroup: true, suppressFilter: true},
    {headerName: "Age", field: "age", enablePivot: true, enableRowGroup: true, filter: 'number',
        filterParams: {
            filterOptions: ['equals','lessThan','greaterThan'],
            newRowsAction: 'keep'}
    },
    {headerName: "Country", field: "country", enableRowGroup: true, enablePivot: true, rowGroup: true, hide: true, filter: 'set',
        filterParams: {values: listOfCountries, newRowsAction: 'keep'}
    },
    {headerName: "Year", field: "year", enableRowGroup: true, enablePivot: true, rowGroup: true, hide: true, filter: 'set',
        filterParams: {values: ['2000','2004','2008','2012'], newRowsAction: 'keep'}
    },
    {headerName: "Sport", field: "sport", enableRowGroup: true, enablePivot: true, suppressFilter: true},
    {headerName: "Gold", field: "gold", aggFunc: 'sum', suppressFilter: true, enableValue: true},
    {headerName: "Silver", field: "silver", aggFunc: 'sum', suppressFilter: true, enableValue: true},
    {headerName: "Bronze", field: "bronze", aggFunc: 'sum', suppressFilter: true, enableValue: true}
];
