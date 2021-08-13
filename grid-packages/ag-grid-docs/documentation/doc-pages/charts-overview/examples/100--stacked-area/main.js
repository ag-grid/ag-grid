var options = {
    container: document.querySelector('#myChart'),
    autoSize: true,
    data: data,
    title: {
        text: 'UK Energy Sources (2018)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Department for Business, Energy & Industrial Strategy',
    },
    series: [{
        type: 'area',
        xKey: 'month',
        yKeys: [
            'coal',
            'petroleum',
            'naturalGas',
            'bioenergyWaste',
            'nuclear',
            'windSolarHydro',
            'imported',
        ],
        yNames: [
            'Coal',
            'Petroleum',
            'Natural gas',
            'Bioenergy & waste',
            'Nuclear',
            'Wind, solar & hydro',
            'Imported',
        ],
        normalizedTo: 100,
        highlightStyle: {
            series: {
                enabled: true,
                strokeWidth: 4,
                dimOpacity: 0.3
            }
        }
    }],
    axes: [
        {
            type: 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
            label: {
                format: '#{.0f}%'
            },
        }],
    legend: {
        position: 'top',
    },
};

var chart = agCharts.AgChart.create(options);
