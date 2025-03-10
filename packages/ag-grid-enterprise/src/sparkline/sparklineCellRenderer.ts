import type {
    AgChartInstance,
    AgChartTheme,
    AgSparklineOptions,
    AgSparklineTooltipRendererParams,
    AgSparklineTooltipRendererResult,
    AgTooltipRendererResult,
} from 'ag-charts-types';

import type { AgColumn, Environment, ICellRenderer, ISparklineCellRendererParams, RowNode } from 'ag-grid-community';
import { Component, RefPlaceholder, _executeNextVMTurn, _observeResize } from 'ag-grid-community';

import { wrapFn } from './sparklinesUtils';

export const DEFAULT_THEMES = ['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid'];

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
    private params: ISparklineCellRendererParams<any, any> | undefined;
    private cachedWidth = 0;
    private cachedHeight = 0;
    private env: Environment;

    constructor() {
        super();

        // Manually construct DOM to avoid costly HTML parsing on fast-scrolling.
        const wrapper = document.createElement('div');
        wrapper.classList.add('ag-sparkline-wrapper');
        const eSparkline = document.createElement('span');
        eSparkline.dataset['ref'] = 'eSparkline';
        wrapper.appendChild(eSparkline);

        this.setTemplateFromElement(wrapper);
    }

    postConstruct(): void {
        this.env = this.beans.environment;
        this.addManagedPropertyListeners(['chartThemeOverrides', 'chartThemes'], (_event) => this.refresh(this.params));
    }

    private initResizeObserver() {
        const resizeListener = ([
            {
                contentRect: { width, height },
            },
        ]: ResizeObserverEntry[]) => this.updateSize(width, height);

        const unsubscribeFromResize = _observeResize(this.beans, this.getGui(), resizeListener);
        this.addDestroyFunc(() => unsubscribeFromResize());
    }

    private updateSize(newWidth: number, newHeight: number) {
        // account for cell padding
        newWidth -= this.env.getCellPadding();

        if (newWidth !== this.cachedWidth || newHeight !== this.cachedHeight) {
            this.cachedWidth = newWidth;
            this.cachedHeight = newHeight;
            // Batch updates to force charts resizing at the same time
            _executeNextVMTurn(() => {
                this.refresh(this.params);
            });
        }
    }

    private initGridObserver() {
        const listener = () => {
            this.updateSize(this.params?.column?.getActualWidth() ?? 0, (this.params?.node.rowHeight ?? 0) - 2);
        };

        const column = this.params?.column as AgColumn;
        const rowNode = this.params?.node as RowNode;

        column.__addEventListener('columnStateUpdated', listener);
        rowNode.__addEventListener('heightChanged', listener);

        this.addDestroyFunc(() => column.__removeEventListener('columnStateUpdated', listener));
        this.addDestroyFunc(() => rowNode.__removeEventListener('heightChanged', listener));

        listener();
    }

    public init(params: ISparklineCellRendererParams): void {
        this.params = params;
        this.initResizeObserver();
        // this.initGridObserver();
    }

    public refresh(params?: ISparklineCellRendererParams): boolean {
        this.params = params;

        const width = this.cachedWidth;
        const height = this.cachedHeight;

        if (!this.sparklineInstance && params && width > 0 && height > 0) {
            this.sparklineOptions = {
                container: this.eSparkline,
                width,
                height,
                ...params.sparklineOptions,
                data: this.processData(params.value),
            } as AgSparklineOptions;

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
            });

            return true;
        }
        return false;
    }

    private processData(data: any[] = []) {
        if (data.length === 0) {
            return data;
        }

        return data.filter((item) => item != null);
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
