function createSlider(options) {
    options = options || {};
    var values = options.values;
    var n = values && values.length;
    var id = String(Date.now());
    var sliderId = 'slider-' + id;

    var wrapper = document.createElement('div');
    wrapper.style.display = 'inline-flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.width = (options.width || 400) + 'px';
    wrapper.style.padding = '5px 10px';
    wrapper.style.margin = '5px';
    wrapper.style.border = '1px solid lightgray';
    wrapper.style.borderRadius = '5px';
    wrapper.style.backgroundColor = 'white';

    var container = options.container;
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    (container || document.body).appendChild(wrapper);

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.setAttribute('id', sliderId);
    slider.style.height = '1.8em';
    slider.style.flex = '1';

    var labelHTML = '<strong>' + options.text + '</strong>';

    function updateValue(value) {
        if (options.showValue) {
            if (values) {
                value = values[value];
            }
            label.innerHTML = labelHTML + ': ' + String(value);
        }
        if (action) {
            action(value);
        }
    }

    var label = document.createElement('label');
    label.innerHTML = labelHTML;
    label.setAttribute('for', sliderId);
    label.style.font = '12px Verdana, sans-serif';
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

    var action = options.action;
    if (action) {
        slider.addEventListener('input', function (e) {
            updateValue(+e.target.value);
        });
    }
    return wrapper;
}

function createChartLegendPositionSlider(container, chart) {
    var slider = createSlider({
        container: container,
        text: 'chart.legend.position',
        values: ['right', 'bottom', 'left', 'top'],
        showValue: true,
        action: function (value) {
            chart.legend.position = value;
        }
    });
    slider.style.flex = '1';
}