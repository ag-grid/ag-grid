// @ts-check

async function loadAgCharts() {
    // @ts-ignore
    return await import('./main.js');
}

async function loadExamples() {
    const res = await fetch('./examples.json');
    return await res.json();
}

async function start() {
    const agCharts = await loadAgCharts();


    function getData() {
        return [
            { religion: 'Christian', population: 4159000 },
            { religion: 'Buddhist', population: 97000 },
            { religion: 'Hindu', population: 456000 },
            { religion: 'Jewish', population: 168000 },
            { religion: 'Muslim', population: 1215000 },
            { religion: 'Sikh', population: 123000 },
            { religion: 'Other', population: 174000 },
            { religion: 'None', population: 2274000 }
        ];
    }
    const options = {
        container: document.getElementById('myChart'),
        autoSize: true,
        title: {
          text: 'Religions of London Population (2016)',
          fontSize: 18,
        },
        subtitle: {
          text: 'Source: Office for National Statistics',
        },
        series: [
          {
            data: getData(),
            type: 'pie',
            outerRadiusRatio: 0.5,
            calloutLabelKey: 'religion',
            angleKey: 'population',
            calloutLabel: {
              minAngle: 0,
            },
            calloutLine: {
              strokeWidth: 2,
            },
            fills: [
              '#febe76',
              '#ff7979',
              '#badc58',
              '#f9ca23',
              '#f0932b',
              '#eb4c4b',
              '#6ab04c',
              '#7ed6df',
            ],
            strokes: [
              '#b28553',
              '#b35555',
              '#829a3e',
              '#ae8d19',
              '#a8671e',
              '#a43535',
              '#4a7b35',
              '#58969c',
            ],
          },
          {
            data: getData(),
            type: 'pie',
            innerRadiusRatio: 0.7,
            calloutLabelKey: 'religion',
            angleKey: 'population',
            calloutLabel: {
              minAngle: 0,
            },
            calloutLine: {
              strokeWidth: 2,
            },
            fills: [
              '#febe76',
              '#ff7979',
              '#badc58',
              '#f9ca23',
              '#f0932b',
              '#eb4c4b',
              '#6ab04c',
              '#7ed6df',
            ],
            strokes: [
              '#b28553',
              '#b35555',
              '#829a3e',
              '#ae8d19',
              '#a8671e',
              '#a43535',
              '#4a7b35',
              '#58969c',
            ],
          },
        ],
        legend: {
          enabled: false,
        },
      }
      
      var chart = agCharts.AgChart.create(options)
}

start();
