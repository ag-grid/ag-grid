var options = {
    container: document.getElementById('myChart'),
    autoSize: true,
    title: {
        text: 'Height vs Weight'
    },
    subtitle: {
        text: 'by gender'
    },
    series: [
        {
            type: 'scatter',
            title: 'Male',
            data: maleHeightWeight,
            xKey: 'height',
            xName: 'Height',
            yKey: 'weight',
            yName: 'Weight',
            sizeKey: 'age',
            sizeName: 'Age',
            fill: 'rgba(227,111,106,0.71)',
            stroke: '#9f4e4a',
            marker: {
                shape: 'square',
                minSize: 8,
                size: 30
            }
        },
        {
            type: 'scatter',
            title: 'Female',
            data: femaleHeightWeight,
            xKey: 'height',
            xName: 'Height',
            yKey: 'weight',
            yName: 'Weight',
            sizeKey: 'age',
            sizeName: 'Age',
            fill: 'rgba(123,145,222,0.71)',
            stroke: '#56659b',
            marker: {
                minSize: 8,
                size: 30
            }
        }
    ],
    axes: [
        {
            type: 'number',
            position: 'bottom',
            title: {
                text: 'Height'
            },
            label: {
                rotation: 45,
                formatter: function(params) {
                    return params.value + 'cm';
                }
            }
        },
        {
            type: 'number',
            position: 'left',
            title: {
                text: 'Weight'
            },
            label: {
                formatter: function(params) {
                    return params.value + 'kg';
                }
            }
        }
    ]
};

agCharts.AgChart.create(options);