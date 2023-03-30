export interface UngroupedData<D> {
    type: 'ungrouped';
    data: {
        keys: any[];
        values: any[];
        datum: D;
    }[];
    dataDomain: {
        keys: any[][];
        values: any[][];
    };
}

export interface GroupedData<D> {
    type: 'grouped';
    data: {
        keys: any[];
        values: any[][];
        datum: D[];
    }[];
    dataDomain: {
        keys: any[][];
        values: any[][];
        sumValues?: any[][];
    };
}

export interface AggregatedData<D> {
    type: 'aggregated';
    data: {
        keys: any[];
        values: any[];
        datum: D[];
    }[];
    dataDomain: {
        keys: any[][];
        values: any[][];
    };
}

export type ProcessedData<D> = UngroupedData<D> | GroupedData<D> | AggregatedData<D>;

export type DatumPropertyType = 'range' | 'category';

type ContinuousDomain<T extends number | Date> = [T, T];

function extendDomain<T extends number | Date>(
    values: T[],
    domain: ContinuousDomain<T> = [Infinity as T, -Infinity as T]
) {
    for (const value of values) {
        if (typeof value !== 'number') {
            continue;
        }

        if (value < domain[0]) {
            domain[0] = value;
        }
        if (value > domain[1]) {
            domain[1] = value;
        }
    }

    return domain;
}

function sumValues(values: any[]) {
    const accumulator = [0, 0] as ContinuousDomain<number>;
    for (const value of values) {
        if (typeof value !== 'number') {
            return;
        }
        if (value < 0) {
            accumulator[0] += value;
        }
        if (value > 0) {
            accumulator[1] += value;
        }
    }

    return accumulator;
}

type Options<K> = {
    readonly dimensionKeys: K[];
    readonly valueKeys: K[];
    readonly dimensionKeyTypes: DatumPropertyType[];
    readonly valueKeyTypes: DatumPropertyType[];
    readonly groupByKeys?: boolean;
    readonly sumGroupDataDomains?: K[][];
};

export class DataModel<D extends object, K extends keyof D = keyof D> {
    private readonly opts: Options<K>;

    public constructor(opts: Options<K>) {
        const { dimensionKeys, dimensionKeyTypes, valueKeys, valueKeyTypes } = opts;

        if (dimensionKeys.length !== dimensionKeyTypes.length) {
            throw new Error('AG Charts - dimensionKeys should be same length as dimensionKeyTypes');
        }
        if (valueKeys.length !== valueKeyTypes.length) {
            throw new Error('AG Charts - valueKeys should be same length as valueKeyTypes');
        }

        this.opts = opts;
    }

    processData(data: D[]): ProcessedData<D> {
        const { groupByKeys, sumGroupDataDomains } = this.opts;
        // TODO:
        // Validation.
        // Normalisation.

        let processedData: ProcessedData<D> = this.extractData(data);
        if (groupByKeys) {
            processedData = this.groupData(processedData);
        }
        if (sumGroupDataDomains) {
            processedData = this.sumData(processedData);
        }

        return processedData;
    }

    private extractData(data: D[]): UngroupedData<D> {
        const { dimensionKeys, valueKeys } = this.opts;

        const { dataDomain, processValue } = this.initDataDomainProcessor();

        return {
            type: 'ungrouped',
            data: data.map((datum) => ({
                datum,
                keys: dimensionKeys.map((key) => processValue(key, datum[key])),
                values: valueKeys.map((key) => processValue(key, datum[key])),
            })),
            dataDomain: {
                keys: dimensionKeys.map((key) => [...dataDomain.get(key)!.domain]),
                values: valueKeys.map((key) => [...dataDomain.get(key)!.domain]),
            },
        };
    }

    private groupData(data: UngroupedData<D>): GroupedData<D> {
        const processedData = new Map<string, { keys: D[K][]; values: D[K][][]; datum: D[] }>();

        for (const { keys, values, datum } of data.data) {
            const keyStr = keys.join('-');

            if (processedData.has(keyStr)) {
                const existingData = processedData.get(keyStr)!;
                existingData.values.push(values);
                existingData.datum.push(datum);
            } else {
                processedData.set(keyStr, { keys, values: [values], datum: [datum] });
            }
        }

        // TODO:
        // Validation.
        // Normalisation.
        // Domain calculation.

        const resultData = new Array(processedData.size);
        let dataIndex = 0;
        for (const [, { keys, values, datum }] of processedData.entries()) {
            resultData[dataIndex++] = {
                keys,
                values,
                datum,
            };
        }

        // let resultSumValues = undefined;
        // if (this.sumGroupDataDomains) {
        // }

        return {
            ...data,
            type: 'grouped',
            data: resultData,
        };
    }

    private sumData<T extends ProcessedData<any>>(data: T): T {
        const { sumGroupDataDomains, valueKeys } = this.opts;

        if (!sumGroupDataDomains) {
            return data;
        }

        const resultSumValues = sumGroupDataDomains.map((): ContinuousDomain<number> => [Infinity, -Infinity]);
        const resultSumValueIndices = sumGroupDataDomains.map((keys) => keys.map((key) => valueKeys.indexOf(key)));

        for (let { values } of data.data) {
            if (data.type === 'ungrouped') {
                values = [values];
            }
            for (const distinctValues of values) {
                let resultIdx = 0;
                for (const indices of resultSumValueIndices) {
                    const valuesToSum = indices.map((valueIdx) => distinctValues[valueIdx] as D[K]);
                    const valuesSummed = sumValues(valuesToSum);

                    if (valuesSummed) {
                        extendDomain(valuesSummed, resultSumValues[resultIdx++]);
                    }
                }
            }
        }

        return {
            ...data,
            dataDomain: {
                ...data.dataDomain,
                sumValues: resultSumValues,
            },
        };
    }

    // private processAggregatedData(): AggregatedData<D> {
    //     const { dataDomain, processValue } = this.initDataDomainProcessor();

    //     const processedData = new Map<string, { keys: D[K][]; values: D[K][]; datum: D[] }>();
    //     for (const datum of this.data) {
    //         const keys = this.dimensionKeys.map((key) => processValue(key, datum[key]));
    //         const values = this.valueKeys.map((key) => processValue(key, datum[key]));
    //         const keyStr = keys.join('-');

    //         if (processedData.has(keyStr)) {
    //             const existingData = processedData.get(keyStr)!;
    //             this.accumulationFns!.forEach((accFn, i) => {
    //                 existingData.values[i] = accFn<D[K]>(existingData.values[i], values[i]);
    //             });
    //         } else {
    //             processedData.set(keyStr, { keys, values, datum: [datum] });
    //         }
    //     }

    //     // TODO:
    //     // Validation.
    //     // Normalisation.
    //     // Domain calculation.

    //     const data = new Array(processedData.size);
    //     let dataIndex = 0;
    //     for (const [, { keys, values }] of processedData.entries()) {
    //         data[dataIndex++] = {
    //             keys,
    //             values,
    //         };
    //     }

    //     return {
    //         type: 'aggregated',
    //         data,
    //         dataDomain: {
    //             keys: this.dimensionKeys.map((key) => [...dataDomain.get(key)!.domain]),
    //             values: this.valueKeys.map((key) => [...dataDomain.get(key)!.domain]),
    //         },
    //     };
    // }

    private initDataDomainProcessor() {
        const { dimensionKeys, dimensionKeyTypes, valueKeys, valueKeyTypes } = this.opts;
        const dataDomain: Map<K, { type: 'range'; domain: [number, number] } | { type: 'category'; domain: Set<any> }> =
            new Map();
        const initDataDomainKey = (key: K, type: DatumPropertyType, updateDataDomain: typeof dataDomain) => {
            if (type === 'category') {
                updateDataDomain.set(key, { type, domain: new Set() });
            } else {
                updateDataDomain.set(key, { type, domain: [Infinity, -Infinity] });
            }
        };
        const initDataDomain = (updateDataDomain = dataDomain) => {
            dimensionKeyTypes.forEach((type, i) => initDataDomainKey(dimensionKeys[i], type, updateDataDomain));
            valueKeyTypes.forEach((type, i) => initDataDomainKey(valueKeys[i], type, updateDataDomain));
            return updateDataDomain;
        };
        initDataDomain();

        const processValue = (key: K, value: any, updateDataDomain = dataDomain) => {
            // TODO: Handle illegal values or non-numeric/comparable types?
            if (!updateDataDomain.has(key)) {
                initDataDomain(updateDataDomain);
            }
            const meta = updateDataDomain.get(key);
            if (meta?.type === 'category') {
                meta.domain.add(value);
            } else if (meta?.type === 'range') {
                if (meta.domain[0] > value) {
                    meta.domain[0] = value;
                }
                if (meta.domain[1] < value) {
                    meta.domain[1] = value;
                }
            }
            return value;
        };

        return { dataDomain, processValue, initDataDomain };
    }
}
