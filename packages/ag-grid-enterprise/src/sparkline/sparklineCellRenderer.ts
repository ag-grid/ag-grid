import type {
    AgChartInstance,
    AgChartTheme,
    AgSparklineOptions,
    AgSparklineTooltipRendererParams,
    AgSparklineTooltipRendererResult,
    AgTooltipRendererResult,
} from 'ag-charts-types';

import type { AgColumn, Environment, ICellRenderer, ISparklineCellRendererParams, RowNode } from 'ag-grid-community';
import { Component, RefPlaceholder, _batchCall } from 'ag-grid-community';

import { wrapFn } from './sparklinesUtils';

function tooltipRendererWithXValue(
    params: AgSparklineTooltipRendererParams<unknown>
): AgSparklineTooltipRendererResult {
    return { content: `${params.xValue} ${params.yValue}` };
}

function tooltipRenderer(params: AgSparklineTooltipRendererParams<unknown>): AgSparklineTooltipRendererResult {
    return { content: `${params.yValue}` };
}

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
            cls: 'ag-sparkline-wrapper',
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
        this.initGridObserver();
    }

    public refresh(params: ISparklineCellRendererParams = this.params): boolean {
        this.params = params;

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
                data: this.processData(params.value),
            } as AgSparklineOptions;

            this.sparklineOptions.type ??= 'line';

            if (this.sparklineOptions.tooltip?.renderer) {
                this.wrapTooltipRenderer();
            } else {
                const renderer = this.getDefaultTooltipRenderer();
                this.sparklineOptions.tooltip = {
                    ...this.sparklineOptions.tooltip,
                    renderer,
                };
            }

            // Only bar sparklines have itemStyler
            const theme = this.sparklineOptions?.theme as AgChartTheme;
            if (this.sparklineOptions.type === 'bar' && this.sparklineOptions.itemStyler) {
                this.wrapItemStyler(this.sparklineOptions);
            } else if (theme?.overrides?.bar?.series?.itemStyler) {
                this.wrapItemStyler(theme.overrides.bar.series);
            }

            // create new sparkline
            this.sparklineInstance = params.createSparkline!(this.sparklineOptions);
            return true;
        } else if (this.sparklineInstance) {
            this.sparklineInstance.update({
                ...this.sparklineOptions,
                data: this.processData(params?.value),
                width,
                height,
                ...(styleNonce ? { styleNonce } : {}),
            });

            return true;
        }
        return false;
    }

    private processData(data: any[] = []) {
        if (data.length === 0) {
            return data;
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

    private getDefaultTooltipRenderer(userRendererResult?: AgTooltipRendererResult) {
        const userTitle = userRendererResult?.title;
        const xKeyProvided = this.sparklineOptions.xKey;
        const tupleData = Array.isArray(this.sparklineOptions.data?.[0]);

        const showXValue = !userTitle && (xKeyProvided || tupleData);

        return showXValue ? tooltipRendererWithXValue : tooltipRenderer;
    }

    private wrapItemStyler(container: { itemStyler?: any }) {
        container!.itemStyler = wrapFn(container.itemStyler, (fn, stylerParams: any): any => {
            return fn({
                ...stylerParams,
                context: this.createContext(),
            });
        });
    }

    private wrapTooltipRenderer() {
        this.sparklineOptions.tooltip = {
            ...this.sparklineOptions.tooltip,
            renderer: wrapFn(this.sparklineOptions.tooltip!.renderer!, (fn, tooltipParams: any): any => {
                const userRendererResult = fn({
                    ...tooltipParams,
                    context: this.createContext(),
                });

                if (typeof userRendererResult === 'string') {
                    return userRendererResult;
                }
                return {
                    ...this.getDefaultTooltipRenderer(userRendererResult)(tooltipParams),
                    ...userRendererResult,
                };
            }),
        };
    }

    public override destroy() {
        super.destroy();
        this.sparklineInstance?.destroy();
    }
}
