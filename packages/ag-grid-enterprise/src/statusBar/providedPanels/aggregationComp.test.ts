import { AggregationComp } from './aggregationComp';

type AggregationSnapshot = {
    value: number | bigint | null;
    displayed: boolean;
};

class FakeAgNameValue {
    public value: number | bigint | null = null;
    public displayed = false;
    public totalRows = 0;

    public setValue(value: number | bigint | null, totalRows: number) {
        this.value = value;
        this.totalRows = totalRows;
    }

    public setDisplayed(visible: boolean) {
        this.displayed = visible;
    }
}

const createAggregationSnapshot = (
    values: any[]
): Record<'sum' | 'min' | 'max' | 'avg' | 'count', AggregationSnapshot> => {
    const comp = new AggregationComp();

    const sumAggregationComp = new FakeAgNameValue();
    const minAggregationComp = new FakeAgNameValue();
    const maxAggregationComp = new FakeAgNameValue();
    const avgAggregationComp = new FakeAgNameValue();
    const countAggregationComp = new FakeAgNameValue();

    (comp as any).sumAggregationComp = sumAggregationComp;
    (comp as any).minAggregationComp = minAggregationComp;
    (comp as any).maxAggregationComp = maxAggregationComp;
    (comp as any).avgAggregationComp = avgAggregationComp;
    (comp as any).countAggregationComp = countAggregationComp;

    const column = { getId: () => 'value', colDef: {} };
    const rowNodes = values.map((value, index) => ({ data: { value }, rowIndex: index }));

    const rowModel = {
        getRowCount: () => rowNodes.length,
        getRow: (index: number) => rowNodes[index],
        isRowsToRender: () => rowNodes.length > 0,
        forEachNode: (callback: (rowNode: any) => void) => {
            rowNodes.forEach(callback);
        },
    };

    const pageBounds = {
        getFirstRow: () => 0,
        getLastRow: () => rowNodes.length - 1,
    };

    const range = { columns: [column] };
    const rangeSvc = {
        getCellRanges: () => [range],
        getRangeStartRow: () => ({ rowIndex: 0, rowPinned: null }),
        getRangeEndRow: () => ({ rowIndex: rowNodes.length - 1, rowPinned: null }),
    };

    const valueSvc = {
        getValue: (_col: any, rowNode: any) => rowNode.data.value,
        getValueFromData: (_col: any, rowNode: any) => rowNode.data.value,
    };

    (comp as any).beans = {
        rowModel,
        pageBounds,
        rangeSvc,
        valueSvc,
    };

    (comp as any).params = {
        key: 'agAggregationComponent',
        aggFuncs: ['avg', 'count', 'min', 'max', 'sum'],
    };

    (comp as any).onCellSelectionChanged();

    return {
        sum: { value: sumAggregationComp.value, displayed: sumAggregationComp.displayed },
        min: { value: minAggregationComp.value, displayed: minAggregationComp.displayed },
        max: { value: maxAggregationComp.value, displayed: maxAggregationComp.displayed },
        avg: { value: avgAggregationComp.value, displayed: avgAggregationComp.displayed },
        count: { value: countAggregationComp.value, displayed: countAggregationComp.displayed },
    };
};

const normaliseValue = (value: number | bigint | null): string | null => {
    if (value == null) {
        return null;
    }
    return value.toString();
};

describe('AggregationComp mixed numeric inputs', () => {
    it('parses large integer strings as bigint', () => {
        const results = createAggregationSnapshot(['9007199254740993', 1]);

        expect(results.sum.value).toBe(9007199254740994n);
        expect(results.min.value).toBe(1n);
        expect(results.max.value).toBe(9007199254740993n);
        expect(results.avg.value).toBe(4503599627370497n);
        expect(results.count.value).toBe(2);

        expect(results.sum.displayed).toBe(true);
        expect(results.min.displayed).toBe(true);
        expect(results.max.displayed).toBe(true);
        expect(results.avg.displayed).toBe(true);
    });

    it('keeps decimal strings in number aggregations', () => {
        const results = createAggregationSnapshot(['1.5', '2.5']);

        expect(results.sum.value).toBe(4);
        expect(results.min.value).toBe(1.5);
        expect(results.max.value).toBe(2.5);
        expect(results.avg.value).toBe(2);
        expect(results.count.value).toBe(2);

        expect(results.sum.displayed).toBe(true);
        expect(results.min.displayed).toBe(true);
        expect(results.max.displayed).toBe(true);
        expect(results.avg.displayed).toBe(true);
    });

    it('includes bigint values in number aggregations when mixed with decimals', () => {
        const bigValue = 9007199254740993n;
        const results = createAggregationSnapshot([0.5, bigValue]);

        expect(results.sum.value).toBe(Number(bigValue) + 0.5);
        expect(results.min.value).toBe(0.5);
        expect(results.max.value).toBe(Number(bigValue));
        expect(results.avg.value).toBe((Number(bigValue) + 0.5) / 2);
        expect(results.count.value).toBe(2);

        expect(results.sum.displayed).toBe(true);
        expect(results.min.displayed).toBe(true);
        expect(results.max.displayed).toBe(true);
        expect(results.avg.displayed).toBe(true);
    });

    it('falls back to number aggregation for exponent integer strings', () => {
        const results = createAggregationSnapshot(['1e21', 1]);

        expect(results.sum.value).toBe(1e21 + 1);
        expect(results.min.value).toBe(1);
        expect(results.max.value).toBe(1e21);
        expect(results.avg.value).toBe((1e21 + 1) / 2);
        expect(results.count.value).toBe(2);

        expect(results.sum.displayed).toBe(true);
        expect(results.min.displayed).toBe(true);
        expect(results.max.displayed).toBe(true);
        expect(results.avg.displayed).toBe(true);
    });
    it('matches number and bigint aggregations for mixed integer inputs', () => {
        const numberResults = createAggregationSnapshot([10, '20', { value: 30 }, '', null, { value: '' }, 40]);
        const bigintResults = createAggregationSnapshot([10n, '20', { value: 30n }, '', null, { value: '' }, 40n]);

        expect(normaliseValue(bigintResults.sum.value)).toBe(normaliseValue(numberResults.sum.value));
        expect(normaliseValue(bigintResults.min.value)).toBe(normaliseValue(numberResults.min.value));
        expect(normaliseValue(bigintResults.max.value)).toBe(normaliseValue(numberResults.max.value));
        expect(normaliseValue(bigintResults.avg.value)).toBe(normaliseValue(numberResults.avg.value));
        expect(bigintResults.count.value).toBe(numberResults.count.value);

        expect(bigintResults.sum.displayed).toBe(true);
        expect(bigintResults.min.displayed).toBe(true);
        expect(bigintResults.max.displayed).toBe(true);
        expect(bigintResults.avg.displayed).toBe(true);
    });

    it('falls back to number aggregations when non-integer values are present', () => {
        const numberResults = createAggregationSnapshot([10, '20.5', { value: 30 }, 40.5]);
        const bigintResults = createAggregationSnapshot([10n, '20.5', { value: 30n }, 40.5]);

        expect(bigintResults.sum.value).toBe(numberResults.sum.value);
        expect(bigintResults.min.value).toBe(numberResults.min.value);
        expect(bigintResults.max.value).toBe(numberResults.max.value);
        expect(bigintResults.avg.value).toBe(numberResults.avg.value);
        expect(bigintResults.count.value).toBe(numberResults.count.value);

        expect(bigintResults.sum.displayed).toBe(true);
        expect(bigintResults.min.displayed).toBe(true);
        expect(bigintResults.max.displayed).toBe(true);
        expect(bigintResults.avg.displayed).toBe(true);
    });

    it('uses integer division for bigint avg', () => {
        const bigintResults = createAggregationSnapshot([10n, 20n, 25n]);

        expect(bigintResults.sum.value).toBe(55n);
        expect(bigintResults.min.value).toBe(10n);
        expect(bigintResults.max.value).toBe(25n);
        expect(bigintResults.avg.value).toBe(18n);

        expect(bigintResults.sum.displayed).toBe(true);
        expect(bigintResults.min.displayed).toBe(true);
        expect(bigintResults.max.displayed).toBe(true);
        expect(bigintResults.avg.displayed).toBe(true);
    });
});
