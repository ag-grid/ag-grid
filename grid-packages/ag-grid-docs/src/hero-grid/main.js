(function () {
    // ------------------------------------------------------------
    // formatters.js
    // ------------------------------------------------------------
    const toPercentage = ({ value, decimalPlaces = 0 }) => `${parseFloat(value).toFixed(decimalPlaces)}%`;

    const toTime = ({ value, showMs = false }) => {
        const date = new Date(value);
        const hour = date.getHours();
        const min = date.getMinutes().toString().padStart(2, '0');
        const sec = date.getSeconds().toString().padStart(2, '0');
        const ms = date.getMilliseconds().toString().padStart(3, '0');

        return showMs ? `${hour}:${min}:${sec}:${ms}` : `${hour}:${min}:${sec}`;
    };

    const toCurrency = ({
        value,
        /**
         * Currency locale for `Intl.NumberFormat()`
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
         */
        locale = 'en-US',
        /**
         * Currency code for `options.currency` in `Intl.NumberFormat()`
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options
         */
        currency = 'USD',
        /**
         * Maximum fraction digits for `options.maximumFractionDigits` in `Intl.NumberFormat()`
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options
         */
        maximumFractionDigits = 0,
    }) => {
        const numberFormatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            maximumFractionDigits,
        });
        return numberFormatter.format(value);
    };

    // ------------------------------------------------------------
    // data.js
    // ------------------------------------------------------------
    const MAX_NUMBER = 1000000;

    const STOCK_NAMES = [
        'Cow Moans',
        'Nasraq 500',
        'Fang Peng',
        'Wiltshire 4500',
        'DecTax PI',
        'Footsie MID',
        'Capra ibex',
        'Dax Jadzia',
    ];

    const timelineTooltipRenderer = ({ xValue, yValue }) => {
        return {
            title: toTime({ value: xValue }),
            content: toCurrency({ value: yValue }),
        };
    };

    const changesTooltipRenderer = ({ xValue, yValue }) => {
        return {
            title: toTime({ value: xValue }),
            content: toCurrency({ value: yValue }),
        };
    };

    const positiveNegativeAreaFormatter = (params) => {
        const { yValue } = params;

        return {
            size: 3,
            fill: yValue < 0 ? 'red' : 'green',
            stroke: yValue < 0 ? 'red' : 'green',
        };
    };

    const positiveNegativeColumnFormatter = (params) => {
        const { yValue } = params;

        return {
            fill: yValue < 0 ? 'red' : 'green',
            stroke: yValue < 0 ? 'red' : 'green',
        };
    };

    const changeValueGetter = ({ data }) => {
        const { timeline } = data;
        const changes = timeline.reduce((acc, value, index, array) => {
            if (index <= 0) {
                return acc;
            }
            const prevValue = array[index - 1];
            const change = value.value - prevValue.value;
            const item = {
                value,
                prevValue,
                change,
            };
            return acc.concat(item);
        }, []);

        const changesOverTime = changes.map(({ value, change }) => {
            return [value.time, change];
        });
        return changesOverTime;
    };

    function getLastValue(data) {
        const { timeline } = data;
        return timeline[timeline.length - 2]?.value;
    }

    const columnDefs = [
        { field: 'stock' },
        {
            field: 'timeline',
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'column',
                    xKey: 'time',
                    yKey: 'value',
                    axis: {
                        type: 'category',
                    },
                    tooltip: {
                        renderer: timelineTooltipRenderer,
                    },
                },
            },
        },
        {
            field: 'current',
            type: 'numericColumn',
            valueFormatter: toCurrency,
        },
        {
            headerName: 'Last',
            type: 'numericColumn',
            valueGetter: ({ data }) => {
                return getLastValue(data);
            },
            valueFormatter: toCurrency,
        },
        {
            headerName: 'Change (area)',
            valueGetter: changeValueGetter,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'area',
                    axis: {
                        type: 'category',
                    },
                    tooltip: {
                        renderer: changesTooltipRenderer,
                    },
                    marker: {
                        formatter: positiveNegativeAreaFormatter,
                    },
                },
            },
        },
        {
            headerName: 'Change (column)',
            valueGetter: changeValueGetter,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: {
                    type: 'column',
                    axis: {
                        type: 'category',
                    },
                    tooltip: {
                        renderer: changesTooltipRenderer,
                    },
                    formatter: positiveNegativeColumnFormatter,
                },
            },
        },
        {
            headerName: '% Change',
            type: 'numericColumn',
            valueGetter: ({ data }) => {
                const last = getLastValue(data);
                return Boolean(data.current) ? ((data.current - last) / data.current) * 100 : 0;
            },
            valueFormatter: ({ value }) => toPercentage({ value, decimalPlaces: 2 }),
        },
        {
            field: 'time',
            filter: 'agDateColumnFilter',
            valueFormatter: ({ value }) => toTime({ value, showMs: true }),
        },
    ];

    function randomValue() {
        return randomNumber(MAX_NUMBER);
    }

    function generateRandomStock(stockName) {
        const current = randomValue();
        const initialTimelineLength = 9;
        const previousTimeInterval = 1000;
        const timeline = randomNumberList({
            length: initialTimelineLength,
            maxNumber: MAX_NUMBER,
        }).map((value, index) => {
            const time = new Date(Date.now() - (initialTimelineLength - index + 1) * previousTimeInterval);
            return {
                value,
                time,
            };
        });
        const time = new Date();

        timeline.push({
            value: current,
            time,
        });

        return {
            stock: stockName,
            current,
            time,
            timeline,
        };
    }

    function generateStockUpdate(stock) {
        const current = randomValue();
        const time = new Date();
        const timeline = stock.timeline.slice(1, stock.timeline.length);
        timeline.push({
            value: current,
            time,
        });

        const newStock = Object.assign({}, stock, {
            current,
            time,
            timeline,
        });

        return newStock;
    }

    function generateStocks() {
        return STOCK_NAMES.map(generateRandomStock);
    }

    // ------------------------------------------------------------
    // generator-utils.js
    // ------------------------------------------------------------
    function randomNumber(maxNumber = 100) {
        return Math.floor(Math.random() * maxNumber);
    }

    function randomNumberList({ length = 10, maxNumber = 100 }) {
        const list = [];
        for (let i = 0; i < length; i++) {
            list.push(randomNumber(maxNumber));
        }

        return list;
    }

    function createGenerator({ interval = 1000, callback }) {
        let currentInterval = interval;
        let state = 'stopped';
        let timeout;

        const createTimeout = () => {
            return setTimeout(() => {
                callback && callback();

                if (state !== 'stopped') {
                    timeout = createTimeout();
                }
            }, currentInterval);
        };

        const start = () => {
            state = 'started';
            timeout = createTimeout();
        };

        const stop = () => {
            state = 'stopped';
            clearTimeout(timeout);
        };

        const updateInterval = (newInterval) => {
            clearTimeout(timeout);
            currentInterval = newInterval;

            if (state !== 'stopped') {
                timeout = createTimeout();
            }
        };

        return {
            start,
            stop,
            updateInterval,
        };
    }

    function randomNumber(maxNumber = 100) {
        return Math.floor(Math.random() * maxNumber);
    }

    function randomNumberList({ length = 10, maxNumber = 100 }) {
        const list = [];
        for (let i = 0; i < length; i++) {
            list.push(randomNumber(maxNumber));
        }

        return list;
    }

    function createGenerator({ interval = 1000, callback }) {
        let currentInterval = interval;
        let state = 'stopped';
        let timeout;

        const createTimeout = () => {
            return setTimeout(() => {
                callback && callback();

                if (state !== 'stopped') {
                    timeout = createTimeout();
                }
            }, currentInterval);
        };

        const start = () => {
            state = 'started';
            timeout = createTimeout();
        };

        const stop = () => {
            state = 'stopped';
            clearTimeout(timeout);
        };

        const updateInterval = (newInterval) => {
            clearTimeout(timeout);
            currentInterval = newInterval;

            if (state !== 'stopped') {
                timeout = createTimeout();
            }
        };

        return {
            start,
            stop,
            updateInterval,
        };
    }

    // ------------------------------------------------------------
    // main.js
    // ------------------------------------------------------------
    const UPDATE_INTERVAL = 100;
    const PLAY_BUTTON_SELECTOR = '#playButton';
    const INTERVAL_SLIDER_SELECTOR = '#intervalSlider';

    const rowData = generateStocks();
    const generator = createGenerator({
        interval: UPDATE_INTERVAL,
        callback: () => {
            const randomIndex = Math.floor(Math.random() * rowData.length);
            const stockToUpdate = rowData[randomIndex];
            const newStock = generateStockUpdate(stockToUpdate);

            rowData[randomIndex] = newStock;
            gridOptions.api.applyTransactionAsync(
                {
                    update: [newStock],
                },
                () => {
                    const rowNode = gridOptions.api.getRowNode(newStock.stock);
                    gridOptions.api.flashCells({
                        rowNodes: [rowNode],
                        columns: ['current'],
                    });
                }
            );
        },
    });

    const gridOptions = {
        columnDefs,
        rowData,
        defaultColDef: {
            resizable: true,
            sortable: true,
            flex: 1,
        },
        getRowId: ({ data }) => {
            return data.stock;
        },
        onGridReady() {
            generator.start();
        },
    };

    function init() {
        const gridDiv = document.querySelector('#heroGrid');
        new agGrid.Grid(gridDiv, gridOptions);

        setupControls({
            buttonSelector: PLAY_BUTTON_SELECTOR,
            onButtonClick: (isPlaying) => {
                if (isPlaying) {
                    generator.start();
                } else {
                    generator.stop();
                }
            },
            sliderSelector: INTERVAL_SLIDER_SELECTOR,
            onSliderChange: (value) => {
                const interval = parseInt(value, 10);
                generator.updateInterval(interval);
            },
        });
    }

    const loadGrid = function () {
        if (document.querySelector("#heroGrid") && window.agGrid) {
            init();
        } else {
            setTimeout(() => loadGrid())
        }
    };

    if (document.readyState === "complete") {
        loadGrid();
    } else {
        document.addEventListener("DOMContentLoaded", loadGrid());
    }
})();
