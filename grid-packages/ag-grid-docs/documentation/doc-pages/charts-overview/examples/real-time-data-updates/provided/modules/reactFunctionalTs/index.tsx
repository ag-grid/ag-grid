'use strict';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AgChartsReact } from 'ag-charts-react';
import { AgCartesianChartOptions, time } from 'ag-charts-community';

const ChartExample = () => {
    const chartRef = useRef<AgChartsReact>(null);
    const [options, setOptions] = useState<AgCartesianChartOptions>({

        autoSize: true,
        data: getData(),
        theme: {
            palette: {
                fills: ["#ec4d3d", "#4facf2"],
                strokes: ["#ec4d3d", "#4facf2"],
            },
            overrides: { area: { series: { fillOpacity: 0.5 } } },
        },
        title: {
            text: "Simulated CPU Usage",
            fontSize: 18,
        },
        series: [
            { type: "area", xKey: "time", yKey: "system", stacked: true, yName: "System" },
            { type: "area", xKey: "time", yKey: "user", stacked: true, yName: "User" },
        ],
        axes: [
            {
                type: "time",
                position: "bottom",
                nice: false,
                tick: {
                    interval: time.second.every(5, { snapTo: 0 }),
                  },
            },
            {
                type: "number",
                position: "left",
                title: {
                    text: "Load (%)",
                },
                min: 0,
                max: 100,
            },
        ],
        legend: {
            position: "bottom",
        },
    });


    const updateData = useCallback(() => {
        const clone = { ...options };

        var now = Date.now();
        clone.data = getData();

        setOptions(clone);
    }, [getData, options])

    useEffect(() => {
        setInterval(updateData, refreshRateInMilliseconds);
      }, [])

    return <AgChartsReact
        ref={chartRef}
        options={options}
    />
        ;
}

var systemLoad = 0
var userLoad = 0
var data: any[] = []
var refreshRateInMilliseconds = 50
var millisecondsOfData = 30 * 1000
function calculateRandomDelta(maxChange: number) {
    return maxChange / 2 - Math.floor(Math.random() * Math.floor(maxChange + 1));
}
function ensureBounds(load: number, max: number) {
    if (load > max) {
        return max;
    }
    else if (load < 0) {
        return 0;
    }
    return load;
}
function calculateCpuUsage() {
    systemLoad = ensureBounds(systemLoad + calculateRandomDelta(2), 30);
    userLoad = ensureBounds(userLoad + calculateRandomDelta(4), 70);
}
function getData() {
    var dataCount = millisecondsOfData / refreshRateInMilliseconds;
    data.shift();
    var timeDelta = (dataCount - data.length - 1) * refreshRateInMilliseconds;
    var now = Date.now();
    while (data.length < dataCount) {
        calculateCpuUsage();
        data.push({ time: now - timeDelta, system: systemLoad, user: userLoad });
        timeDelta -= refreshRateInMilliseconds;
    }
    return data;
}

const root = createRoot(document.getElementById('root')!);
root.render(<ChartExample />);