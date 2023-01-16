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
import { CurrentCellRenderer } from './currentCellRenderer';
import { toCurrency, toTime } from './formatters';
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

const INIT_MAX_NUMBER = 150;
const UPDATE_MAX_NUMBER = 75;
const TIMELINE_SIZE = 20;

const STOCK_NAMES = [
    'Cow Moans',
    'Nasraq 500',
    'Fang Peng',
    'Wiltshire 4500-kbm',
    'DT PI',
    'Footsie MID',
    'Capra ibex',
    'NY composte index',
];

const timelineTooltipRenderer = ({ xValue, yValue }: TooltipRendererParams): TooltipRendererResult => {
    return {
        title: toTime({ value: xValue }),
        content: toCurrency({ value: yValue }),
        color: '#94b2d0',
        backgroundColor: '#07161b',
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
    {
        field: 'stock',
        initialWidth: 180
    },
    {
        field: 'timeline',
        flex: 1,
        cellRenderer: 'agSparklineCellRenderer',
        cellRendererParams: {
            sparklineOptions: {
                type: 'column',
                xKey: 'time',
                yKey: 'value',
                padding: {
                    top: 10,
                    bottom: 10,
                },
                paddingInner: 0.5,
                paddingOuter: 0.5,
                fill: '#65819c',
                highlightStyle: {
                    fill: '#94b2d0',
                    strokeWidth: 0,
                },
                axis: {
                    type: 'category',
                    stroke: '#294056'
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
        cellRenderer: CurrentCellRenderer,
        initialWidth: 120
    },
    {
        headerName: 'Last',
        type: 'numericColumn',
        valueGetter: ({ data }) => {
            return getLastValue(data);
        },
        valueFormatter: toCurrency,
        initialWidth: 120
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
        initialWidth: 150
    },
    // {
    //     field: 'time',
    //     type: 'rightAligned',
    //     filter: 'agDateColumnFilter',
    //     valueFormatter: ({ value }) => toTime({ value, showMs: true }),
    // },
];

function generateRandomStock(stockName: string): Stock {
    const current = randomNumber(INIT_MAX_NUMBER);
    const initialTimelineLength = TIMELINE_SIZE - 1;
    const previousTimeInterval = 1000;
    const timeline = randomNumberList({
        length: initialTimelineLength,
        maxNumber: INIT_MAX_NUMBER,
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
    const current = stock.current + (randomNumber(UPDATE_MAX_NUMBER) * (Math.random() > 0.5 ? 1 : -0.75));
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
