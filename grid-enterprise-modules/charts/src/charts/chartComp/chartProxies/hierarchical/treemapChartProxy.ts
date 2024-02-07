import {ChartProxy, ChartProxyParams, UpdateParams} from '../chartProxy';
import {
    AgCharts,
    AgTreemapSeriesOptions,
    AgHierarchyChartOptions,
} from 'ag-charts-community';

export class TreemapChartProxy extends ChartProxy {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

    public getSeries(params: UpdateParams): AgTreemapSeriesOptions[] {
        const {fields} = params;
        return fields.map(f => ({
            type: this.standaloneChartType as AgTreemapSeriesOptions['type'],
        }));
    }

    public update(params: UpdateParams): void {
        const options: AgHierarchyChartOptions = {
            ...this.getCommonChartOptions(params.updatedOverrides),
            data: this.getData(params),
            series: this.getSeries(params),
        };

        AgCharts.update(this.getChartRef(), options);
    }

    private getData(params: UpdateParams): any[] {
        const categoryKeys = params.categories.map(({ id }) => id);
        return createCategoryHierarchy(params.data, categoryKeys);
    }

    protected override transformData(data: any[], categoryKey: string, categoryAxis?: boolean): any[] {
        // Ignore the base implementation as it assumes only a single category axis
        // (this method is never actually invoked)
        return data;
    }

    public crossFilteringReset(): void {
        // cross filtering is not currently supported in treemap charts
    }
}


interface CategoryGroup<T extends object, K extends keyof T> {
    title: T[K];
    children: Array<CategoryGroup<T, K>> | Array<T>;
};

function createCategoryHierarchy<T extends object, K extends keyof T>(data: T[], keys: Array<K>): Array<CategoryGroup<T, K>> | Array<T> {
    if (keys.length === 0) return data;
    const [key, ...remainingKeys] = keys;
    if (remainingKeys.length === 0) return data.map((item) => ({ title: item[key], ...item }));
    const groupedData = partition(data, (item) => item[key]);
    return Array.from(groupedData.entries()).map(([title, items]) => ({
        title,
        children: createCategoryHierarchy(items, remainingKeys)
    }));
}

function partition<T, K>(items: T[], selector: (item: T) => K): Map<K, T[]> {
    return items.reduce(
        (groupedItems, item) => {
            const key = selector(item);
            const existingItems = groupedItems.get(key);
            return groupedItems.set(key, existingItems ? [...existingItems, item] : [item]);
        },
        new Map<K, T[]>(),
    )
}