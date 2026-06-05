import type { AgChartInstance, AgSparklineOptions } from 'ag-charts-types';
import { RefPlaceholder, _batchCall, _setAriaLabel, _setAriaLabelledBy } from 'ag-stack';

import type { AgColumn, Environment, ICellRenderer, ISparklineCellRendererParams, RowNode } from 'ag-grid-community';
import { Component, _formatNumberCommas } from 'ag-grid-community';

import {
    getChartTypeLabel,
    getSparklineAriaTemplate,
    getSparklineSummary,
    interpolateTemplate,
} from './sparklinesUtils';

const COMPONENT_PREFIX = 'ag-sparkline';

export class SparklineCellRenderer extends Component implements ICellRenderer {
    private readonly eSparkline: HTMLElement = RefPlaceholder;
    private sparklineInstance?: AgChartInstance<any>;
    private sparklineOptions: AgSparklineOptions;
    private params: ISparklineCellRendererParams<any, any>;
    private cachedWidth = 0;
    private cachedHeight = 0;
    private dataRef: any[] = [];
    private processedData: any[] = [];
    private env: Environment;

    constructor() {
        super({
            tag: 'div',
            cls: `${COMPONENT_PREFIX}-wrapper`,
            children: [{ tag: 'span', ref: 'eSparkline' }],
        });
    }

    postConstruct(): void {
        this.env = this.beans.environment;
        this.addManagedPropertyListeners(['chartThemeOverrides', 'chartThemes', 'styleNonce'], () =>
            this.refresh(this.params)
        );
    }

    private createListener(batch = true) {
        return () =>
            this.updateSize(this.params?.column?.getActualWidth() ?? 0, (this.params?.node.rowHeight ?? 0) - 2, batch);
    }

    private initGridObserver() {
        // Use grid APIs to listen for column width and row height changes instead
        // of a ResizeObserver to avoid having to wait for a re-layout before resizing sparklines

        const batchListener = this.createListener();
        const listener = this.createListener(false);

        const column = this.params?.column as AgColumn;
        const rowNode = this.params?.node as RowNode;

        column.__addEventListener('columnStateUpdated', batchListener);
        rowNode.__addEventListener('heightChanged', batchListener);

        this.addDestroyFunc(() => {
            column.__removeEventListener('columnStateUpdated', batchListener);
            rowNode.__removeEventListener('heightChanged', batchListener);
        });

        listener();
    }

    private updateSize(newWidth: number, newHeight: number, batch = true) {
        // account for cell padding
        newWidth -= this.env.getCellPadding();

        if (newWidth !== this.cachedWidth || newHeight !== this.cachedHeight) {
            this.cachedWidth = newWidth;
            this.cachedHeight = newHeight;

            const refresh = this.refresh.bind(this);

            if (batch) {
                _batchCall(() => this.isAlive() && refresh());
            } else {
                refresh();
            }
        }
    }

    public init(params: ISparklineCellRendererParams): void {
        this.params = params;
        const { eParentOfValue } = params;
        const id = `${COMPONENT_PREFIX}-cell-renderer-${this.getCompId()}`;
        this.getGui().setAttribute('id', id);
        _setAriaLabelledBy(eParentOfValue, id);
        this.addDestroyFunc(() => _setAriaLabelledBy(eParentOfValue));
        this.initGridObserver();
    }

    public refresh(params: ISparklineCellRendererParams = this.params): boolean {
        this.params = params;
        const data = this.processData(params?.value);
        this.refreshAriaLabel(data);

        const width = this.cachedWidth;
        const height = this.cachedHeight;
        const styleNonce = this.gos.get('styleNonce');

        if (!this.sparklineInstance && params && width > 0 && height > 0) {
            this.sparklineOptions = {
                container: this.eSparkline,
                width,
                height,
                ...params.sparklineOptions,
                ...(styleNonce ? { styleNonce } : {}),
                data,
                context: this.createContext(),
            } as AgSparklineOptions;

            this.sparklineOptions.type ??= 'line';

            // No default `tooltip.renderer` install — the chart-side sparkline preset
            // supplies one. A function here would poison the structural-options cache.
            this.sparklineInstance = params.createSparkline!(this.sparklineOptions);
            return true;
        } else if (this.sparklineInstance) {
            this.sparklineInstance.update({
                ...this.sparklineOptions,
                data,
                width,
                height,
                context: this.createContext(),
                ...(styleNonce ? { styleNonce } : {}),
            });

            return true;
        }
        return false;
    }

    private refreshAriaLabel(data: any[]): void {
        const translate = this.getLocaleTextFunc();
        const getLocaleText = this.getLocaleTextFunc.bind(this);
        const yKey = (this.params?.sparklineOptions as any)?.yKey ?? (this.sparklineOptions as any)?.yKey ?? 'y';
        const summary = getSparklineSummary(data, yKey);
        const sparklineOptions = this.params?.sparklineOptions ?? this.sparklineOptions;
        const { template, values } = getSparklineAriaTemplate({
            translate,
            chartType: getChartTypeLabel(translate, sparklineOptions),
            summary,
            formatNumber: (value) => _formatNumberCommas(value, getLocaleText),
        });
        _setAriaLabel(this.getGui(), interpolateTemplate(template, values));
    }

    private processData(data: any[] | null | undefined) {
        if (!data?.length) {
            return data ?? []; // same reference if defined
        }

        if (this.dataRef !== data) {
            this.dataRef = data;
            this.processedData = Array.isArray(data[0]) ? data.filter((item) => item != null) : data;
        }

        return this.processedData;
    }

    private createContext() {
        return {
            data: this.params?.data,
            cellData: this.params?.value,
        };
    }

    public override destroy() {
        super.destroy();
        this.sparklineInstance?.destroy();
    }
}
