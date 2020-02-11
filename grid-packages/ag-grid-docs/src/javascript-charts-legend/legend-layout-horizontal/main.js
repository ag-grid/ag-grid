var container = document.getElementById('myChart');
var slider = createSlider({
    text: 'chart.width',
    min: 350,
    max: 710,
    value: 710,
    showValue: true,
    action: function (value) {
        chart.width = value;
    }
});
slider.style.position = 'absolute';
container.appendChild(slider);

var chart = agCharts.AgChart.create({
    container: container,
    data: [
        { label: 'USA', value: 56.9 },
        { label: 'UK', value: 22.5 },
        { label: 'China', value: 6.8 },
        { label: 'Russia', value: 8.5 },
        { label: 'India', value: 2.6 },
        { label: 'Germany', value: 18.2 },
        { label: 'France', value: 12.5 },
        { label: 'Canada', value: 3.9 },
        { label: 'Spain', value: 7.9 },
        { label: 'South Africa', value: 21.9 },
        { label: 'Portugal', value: 7.4 },
        { label: 'Netherlands', value: 4.7 },
        { label: 'Finland', value: 3.9 },
        { label: 'Sweden', value: 3.3 },
        { label: 'Norway', value: 3.2 },
        { label: 'Greece', value: 1.9 },
        { label: 'Italy', value: 2.5 }
    ],
    series: [{
        type: 'pie',
        angleKey: 'value',
        labelKey: 'label',
        strokeWidth: 3
    }],
    legend: {
        position: 'bottom'
    }
});

function createSlider(options) {
    option = options || {};
    var values = options.values;
    var n = values && values.length;
    var id = String(Date.now());
    var sliderId = 'slider-' + id;

    var wrapper = document.createElement('div');
    wrapper.style.display = 'inline-flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.width = (options.width || 300) + 'px';
    wrapper.style.padding = '5px 10px';
    wrapper.style.margin = '5px';
    wrapper.style.border = '1px solid lightgray';
    wrapper.style.borderRadius = '5px';
    wrapper.style.backgroundColor = 'white';

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.setAttribute('id', sliderId);
    slider.style.height = '1.8em';
    slider.style.flex = '1';

    function updateValue(value) {
        if (options.showValue) {
            label.innerHTML = options.text + ': ' + String(value);
        }
    }

    var label = document.createElement('label');
    label.setAttribute('for', sliderId);
    label.style.font = '12px sans-serif';
    label.style.marginRight = '5px';

    if (values) {
        values.forEach(function (value, index) {
            var option = document.createElement('option');
            option.setAttribute('value', String(index));
            option.setAttribute('label', String(value));
        });
        slider.min = '0';
        slider.max = String(n - 1);
        slider.step = '1';
        slider.value = '0';
    } else {
        slider.min = String(options.min || 0);
        slider.max = String(options.max || 100);
        slider.step = String(options.step || 1);
        slider.value = String(options.value || 0);
    }
    updateValue(slider.value);

    wrapper.appendChild(label);
    wrapper.appendChild(slider);
    document.body.appendChild(wrapper);

    var action = options.action;
    if (action) {
        slider.addEventListener('input', function (e) {
            var value = +e.target.value;
            if (values) {
                value = values[value];
            }
            action(value);
            if (options.showValue) {
                label.innerHTML = options.text + ': ' + String(value);
            }
        });
    }
    return wrapper;
}
