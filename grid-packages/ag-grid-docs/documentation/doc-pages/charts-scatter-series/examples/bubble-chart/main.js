var options = {
    container: document.getElementById('myChart'),
    autoSize: true,
    title: {
        text: 'Weight vs Height'
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
            stroke: '#9f4e4a',
            marker: {
                shape: 'square',
                size: 6,
                maxSize: 30,
                fill: 'rgba(227,111,106,0.71)',
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
            stroke: '#56659b',
            marker: {
                size: 6,
                maxSize: 30,
                fill: 'rgba(123,145,222,0.71)',
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