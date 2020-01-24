var options = $OPTIONS$;

document.addEventListener('DOMContentLoaded', function() {
    options.container = document.querySelector('#myChart');

    agCharts.AgChart.create(options);
});
