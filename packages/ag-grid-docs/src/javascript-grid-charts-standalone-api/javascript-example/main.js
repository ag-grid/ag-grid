document.addEventListener('DOMContentLoaded', function() {
    var parent = document.getElementById('charts');
    agCharts.agChart.create(
        {
            parent: parent,
            data: [{
                month: 'Jan',
                revenue: 155000,
                profit: 33000
            }, {
                month: 'Feb',
                revenue: 123000,
                profit: 35500
            }, {
                month: 'Mar',
                revenue: 172500,
                profit: 41000
            }, {
                month: 'Apr',
                revenue: 185000,
                profit: 50000
            }],
            series: [{
                xKey: 'month',
                yKey: 'revenue'
            }],
            legend: {
                markerSize: 25
            }
        }
    )
});

