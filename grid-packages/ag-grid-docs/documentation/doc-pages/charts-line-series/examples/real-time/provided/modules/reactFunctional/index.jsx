'use strict';

import React, { useState, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { AgChartsReact } from 'ag-charts-react';
import { time } from 'ag-charts-community';

const ChartExample = () => {

    const chartRef = useRef(null);
    const [updating, setUpdating] = useState(false);
    const [options, setOptions] = useState({

        autoSize: true,
        data: getData(),
        series: [
            {
                xKey: 'time',
                yKey: 'voltage',
            },
        ],
        axes: [
            {
                type: 'time',
                position: 'bottom',
                nice: false,
                tick: {
                    interval: time.second.every(5),
                },
                label: {
                    format: '%H:%M:%S',
                },
            },
            {
                type: 'number',
                position: 'left',
                label: {
                    format: '#{.2f}V',
                },
            },
        ],
        title: {
            text: 'Core Voltage',
        },
        legend: {
            enabled: false,
        },
    });


    const update = useCallback(() => {
        const clone = { ...options };

        clone.data = getData();

        setOptions(clone);
    }, [getData, options])

    const startUpdates = useCallback(() => {
        if (updating) {
            return;
        }
        setUpdating(true);
        update();
        setInterval(update, 500);
    }, [updating])

    return <div className="wrapper">
        <div id="toolPanel">
            <button onClick={startUpdates}>Start Updates</button>
        </div>
        <AgChartsReact
            ref={chartRef}
            options={options}
        />
    </div>;

}

var lastTime = new Date('07 Jan 2020 13:25:00 GMT').getTime()
var data = []
function getData() {
    data.shift();
    while (data.length < 20) {
        data.push({
            time: new Date((lastTime += 1000)),
            voltage: 1.1 + Math.random() / 2,
        });
    }
    return data;
}

render(
    <ChartExample />,
    document.querySelector('#root')
)
