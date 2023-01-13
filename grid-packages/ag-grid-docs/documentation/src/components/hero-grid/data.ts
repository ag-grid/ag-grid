import {
    AreaSparklineOptions,
    ColDef,
    ColumnSparklineOptions,
    SparklineColumnFormatter,
    SparklineMarkerFormatter,
    TooltipRendererParams,
    TooltipRendererResult,
} from 'ag-grid-community';
import { ChangeCellRenderer } from './changeCellRenderer';
import { toCurrency, toPercentage, toTime } from './formatters';
import { randomNumber, randomNumberList } from './generator-utils';

type Change = {
    value: number;
    time: Date;
};
export interface Stock {
    stock: string;
    current: number;
    time: Date;
    timeline: Change[];
}

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

const timelineTooltipRenderer = ({ xValue, yValue }: TooltipRendererParams): TooltipRendererResult => {
    return {
        title: toTime({ value: xValue }),
        content: toCurrency({ value: yValue }),
    };
};

const changesTooltipRenderer = ({ xValue, yValue }: TooltipRendererParams): TooltipRendererResult => {
    return {
        title: toTime({ value: xValue }),
        content: toCurrency({ value: yValue }),
    };
};

const positiveNegativeAreaFormatter: SparklineMarkerFormatter = (params) => {
    const { yValue } = params;

    return {
        size: 3,
        fill: yValue < 0 ? 'red' : 'green',
        stroke: yValue < 0 ? 'red' : 'green',
    };
};

const positiveNegativeColumnFormatter: SparklineColumnFormatter = (params) => {
    const { yValue } = params;

    return {
        fill: yValue < 0 ? 'red' : 'green',
        stroke: yValue < 0 ? 'red' : 'green',
    };
};

interface ChangeValue {
    value: Change;
    prevValue: Change;
    change: number;
};
const changeValueGetter = ({ data }) => {
    const { timeline } = data as Stock;
    const changes: ChangeValue[] = timeline.reduce((acc: ChangeValue[], value, index, array) => {
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

function getLastValue(data: Stock): number {
    const { timeline } = data;
    return timeline[timeline.length - 2]?.value;
}

export const columnDefs: ColDef[] = [
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
    // {
    //     headerName: 'Change (area)',
    //     valueGetter: changeValueGetter,
    //     cellRenderer: 'agSparklineCellRenderer',
    //     cellRendererParams: {
    //         sparklineOptions: {
    //             type: 'area',
    //             axis: {
    //                 type: 'category',
    //             },
    //             tooltip: {
    //                 renderer: changesTooltipRenderer,
    //             },
    //             marker: {
    //                 formatter: positiveNegativeAreaFormatter,
    //             },
    //         } as AreaSparklineOptions,
    //     },
    // },
    // {
    //     headerName: 'Change (column)',
    //     valueGetter: changeValueGetter,
    //     cellRenderer: 'agSparklineCellRenderer',
    //     cellRendererParams: {
    //         sparklineOptions: {
    //             type: 'column',
    //             axis: {
    //                 type: 'category',
    //             },
    //             tooltip: {
    //                 renderer: changesTooltipRenderer,
    //             },
    //             formatter: positiveNegativeColumnFormatter,
    //         } as ColumnSparklineOptions,
    //     },
    // },

    // Using default `agAnimateShowChangeCellRenderer` renderer
    // {
    //     headerName: '% Change',
    //     type: 'numericColumn',
    //     valueGetter: ({ data }) => {
    //         const last = getLastValue(data);
    //         return Boolean(data.current) ? ((data.current - last) / data.current) * 100 : 0;
    //     },
    //     valueFormatter: ({ value }) => toPercentage({ value, decimalPlaces: 2 }),
    //     cellRenderer: 'agAnimateShowChangeCellRenderer',
    // },
    {
        headerName: '% Change',
        type: 'numericColumn',
        valueGetter: ({ data }) => {
            const last = getLastValue(data);
            return Boolean(data.current) ? ((data.current - last) / data.current) * 100 : 0;
        },
        cellRenderer: ChangeCellRenderer,
    },
    {
        field: 'time',
        type: 'rightAligned',
        filter: 'agDateColumnFilter',
        valueFormatter: ({ value }) => toTime({ value, showMs: true }),
    },
];

function randomValue() {
    return randomNumber(MAX_NUMBER);
}

function generateRandomStock(stockName: string): Stock {
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

export function generateStockUpdate(stock: Stock): Stock {
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

export function generateStocks() {
    return STOCK_NAMES.map(generateRandomStock);
}
