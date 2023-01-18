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
import { MAX_NUMBER, STOCK_NAMES, TIMELINE_SIZE } from './constants';
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
        filter: 'agSetColumnFilter',
        flex: 1,
        initialWidth: 180,
        minWidth: 180
    },
    {
        field: 'timeline',
        flex: 1,
        minWidth: 150,
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
        flex: 1,
        initialWidth: 130,
        minWidth: 130
    },
    {
        headerName: 'Last',
        colId: 'last',
        type: 'numericColumn',
        valueGetter: ({ data }) => {
            return getLastValue(data);
        },
        valueFormatter: toCurrency,
        initialWidth: 110,
        minWidth: 110
    },
    {
        headerName: '% Change',
        colId: 'percentageChange',
        type: 'numericColumn',
        valueGetter: ({ data }) => {
            const last = getLastValue(data);
            return Boolean(data.current) ? ((data.current - last) / data.current) * 100 : 0;
        },
        cellRenderer: ChangeCellRenderer,
        initialWidth: 150,
        minWidth: 150,
    }
];

function randomValue() {
    return randomNumber(MAX_NUMBER);
}

function generateRandomStock(stockName: string): Stock {
    const current = randomValue();
    const initialTimelineLength = TIMELINE_SIZE - 1;
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
