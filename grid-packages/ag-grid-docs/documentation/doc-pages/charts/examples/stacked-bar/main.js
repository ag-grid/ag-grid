function getTotal(datum) {
    return datum.ownerOccupied + datum.privateRented + datum.localAuthority + datum.housingAssociation;
}

var options = {
    container: document.querySelector('#myChart'),
    autoSize: true,
    data: data.sort(function(a, b) { return getTotal(b) - getTotal(a); }),
    title: {
        text: 'UK Housing Stock (2016)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Ministry of Housing, Communities & Local Government',
    },
    series: [{
        type: 'bar',
        xKey: 'type',
        yKeys: ['ownerOccupied', 'privateRented', 'localAuthority', 'housingAssociation'],
        yNames: ['Owner occupied', 'Private rented', 'Local authority', 'Housing association'],
    }],
    axes: [
        {
            type: 'category',
            position: 'left',
        },
        {
            type: 'number',
            position: 'top',
        }
    ],
    legend: {
        position: 'bottom',
    },
};

var chart = agCharts.AgChart.create(options);
